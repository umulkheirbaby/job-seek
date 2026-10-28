const {
  combinePdfBuffers,
  saveCombinedDocument,
  copyCombinedDocument,
  removeStoredDocument,
  readStoredDocument,
  sanitizeDownloadName,
  sendPdf,
} = require('../../utils/combinedPdf');

module.exports = {
  combinePdfBuffers,
  saveCombinedDocument: (applicationId, files) => saveCombinedDocument('applications', applicationId, files),
  copyCombinedDocument,
  removeStoredDocument: (storedName) => removeStoredDocument('applications', storedName),
  readStoredDocument,
  sanitizeDownloadName,
  sendPdf,
};

