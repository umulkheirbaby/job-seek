const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { MAX_FILES, MAX_FILE_SIZE } = require('../config/uploads');

const isPdfFile = (file) => {
  const name = String(file.originalname || '').toLowerCase();
  return file.mimetype === 'application/pdf' || name.endsWith('.pdf');
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (!isPdfFile(file)) {
      cb(
        new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
          documents: 'Upload PDF files only',
        })
      );
      return;
    }
    cb(null, true);
  },
}).array('documents', MAX_FILES);

const uploadApplicationDocuments = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
            documents: 'Each PDF must be 5 MB or smaller',
          })
        );
      }

      return next(
        new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
          documents: 'Upload up to 8 PDF files',
        })
      );
    }

    return next(err);
  });
};

module.exports = uploadApplicationDocuments;
