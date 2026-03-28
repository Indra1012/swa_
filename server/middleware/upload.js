const multer              = require('multer')
const { upload }          = require('../config/cloudinary')

// ── WRAPPER: catches multer-specific errors and passes them to Express error handler ──
const withErrorHandling = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next()

    // Multer-specific errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(Object.assign(new Error('File too large. Maximum allowed size is 50MB.'), { status: 400 }))
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(Object.assign(new Error('Too many files. Maximum allowed is 10.'), { status: 400 }))
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(Object.assign(new Error(`Unexpected field: "${err.field}". Use "file" or "files".`), { status: 400 }))
      }
      return next(Object.assign(new Error(`Upload error: ${err.message}`), { status: 400 }))
    }

    // fileFilter rejections (e.g. wrong mimetype)
    if (err.message && err.message.includes('Unsupported file type')) {
      return next(Object.assign(err, { status: 400 }))
    }

    // Unknown upload error
    console.error('❌ Upload middleware error:', err.message)
    return next(err)
  })
}

// ── EXPORTS ──
// uploadSingle  → single file under field name "file"
// uploadMultiple → up to 10 files under field name "files"
// uploadAny     → any field name (use sparingly)
const uploadSingle   = withErrorHandling(upload.single('file'))
const uploadMultiple = withErrorHandling(upload.array('files', 10))
const uploadAny      = withErrorHandling(upload.any())

module.exports = { uploadSingle, uploadMultiple, uploadAny }
