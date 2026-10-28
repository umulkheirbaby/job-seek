const fs = require('fs');
const fsPromises = require('fs/promises');
const { PDFDocument } = require('pdf-lib');
const ApiError = require('./ApiError');
const { storedDocumentPath } = require('../config/uploads');
const { cloudinary, isCloudinaryEnabled, publicIdFor } = require('../config/cloudinary');

const PDF_HEADER = Buffer.from('%PDF-');

const looksLikePdf = (buffer) => buffer && buffer.length >= 5 && buffer.subarray(0, 5).equals(PDF_HEADER);

const sanitizeDownloadName = (name) => {
  const cleaned = String(name || '')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned || 'combined-documents'}.pdf`;
};

const combinePdfBuffers = async (files) => {
  if (!files.length) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      documents: 'Upload a combined PDF of your CV, certificates, and supporting documents',
    });
  }

  files.forEach((file) => {
    if (!looksLikePdf(file.buffer)) {
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
        documents: 'Each file must be a valid PDF',
      });
    }
  });

  if (files.length === 1) {
    return {
      buffer: files[0].buffer,
      originalName: sanitizeDownloadName(files[0].originalname),
    };
  }

  const combined = await PDFDocument.create();

  for (const file of files) {
    let source;
    try {
      source = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    } catch {
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
        documents: 'Each file must be a valid PDF',
      });
    }

    const pages = await combined.copyPages(source, source.getPageIndices());
    pages.forEach((page) => combined.addPage(page));
  }

  return {
    buffer: Buffer.from(await combined.save()),
    originalName: 'combined-documents.pdf',
  };
};

const cloudinaryError = (error) =>
  new ApiError(502, error.message || 'Could not store the PDF in Cloudinary', 'UPLOAD_FAILED');

const uploadBufferToCloudinary = (kind, id, buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: publicIdFor(kind, id),
        overwrite: true,
        invalidate: true,
        format: 'pdf',
      },
      (error, result) => {
        if (error) {
          reject(cloudinaryError(error));
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });

const signedDownloadUrl = (storedName) =>
  cloudinary.utils.private_download_url(storedName, 'pdf', {
    resource_type: 'raw',
    type: 'upload',
    expires_at: Math.floor(Date.now() / 1000) + 120,
  });

const downloadFromCloudinary = async (storedName) => {
  const response = await fetch(signedDownloadUrl(storedName));
  if (!response.ok) {
    return null;
  }
  return Buffer.from(await response.arrayBuffer());
};

const saveCombinedDocument = async (kind, id, files) => {
  const { buffer, originalName } = await combinePdfBuffers(files);

  if (isCloudinaryEnabled()) {
    const uploaded = await uploadBufferToCloudinary(kind, id, buffer);
    return {
      storedName: uploaded.public_id,
      originalName,
      size: buffer.length,
      url: uploaded.secure_url,
    };
  }

  const storedName = `${id}.pdf`;
  await fsPromises.writeFile(storedDocumentPath(kind, storedName), buffer);
  return {
    storedName,
    originalName,
    size: buffer.length,
    url: '',
  };
};

const copyCombinedDocument = async ({ fromKind, fromName, toKind, toId }) => {
  if (isCloudinaryEnabled()) {
    const buffer = await downloadFromCloudinary(fromName);
    if (!buffer) {
      throw new ApiError(404, 'No combined document was uploaded for this profile', 'NOT_FOUND');
    }
    const uploaded = await uploadBufferToCloudinary(toKind, toId, buffer);
    return {
      storedName: uploaded.public_id,
      url: uploaded.secure_url,
    };
  }

  const storedName = `${toId}.pdf`;
  await fsPromises.copyFile(storedDocumentPath(fromKind, fromName), storedDocumentPath(toKind, storedName));
  return { storedName, url: '' };
};

const removeStoredDocument = async (kind, storedName) => {
  if (!storedName) {
    return;
  }

  if (isCloudinaryEnabled()) {
    try {
      await cloudinary.uploader.destroy(storedName, { resource_type: 'raw', invalidate: true });
    } catch {
      // Ignore cleanup failures so the caller can still roll back the database row.
    }
    return;
  }

  try {
    await fsPromises.unlink(storedDocumentPath(kind, storedName));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const readStoredDocument = async (kind, storedName) => {
  if (isCloudinaryEnabled()) {
    const buffer = await downloadFromCloudinary(storedName);
    return buffer ? { buffer } : null;
  }

  const filePath = storedDocumentPath(kind, storedName);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return { path: filePath };
};

const sendPdf = (res, file) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${file.downloadName}"`);
  if (file.buffer) {
    res.send(file.buffer);
    return;
  }
  res.sendFile(file.path);
};

module.exports = {
  combinePdfBuffers,
  saveCombinedDocument,
  copyCombinedDocument,
  removeStoredDocument,
  readStoredDocument,
  sanitizeDownloadName,
  sendPdf,
};
