const cloudinary            = require('cloudinary').v2
const multer                = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// ── CLOUDINARY CONFIG ──
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── CLOUDINARY STORAGE ──
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'swa-website',
    resource_type:   'auto',
    allowed_formats: [
      // images
      'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif',
      // videos
      'mp4', 'mov', 'avi', 'mkv', 'webm',
    ],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
})

// ── FILE FILTER ──
const fileFilter = (req, file, cb) => {
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'mp4', 'mov', 'avi', 'mkv', 'webm']
  const ext = (file.originalname || '').split('.').pop().toLowerCase()
  
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || allowedExts.includes(ext)) {
    cb(null, true)
  } else {
    console.error('❌ File rejected: only images and videos allowed. Got:', file.mimetype, 'Ext:', ext)
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only images and videos are allowed.`), false)
  }
}

// ── MULTER INSTANCE ──
const upload = multer({
  storage:    cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
})

console.log('✅ Cloudinary configured — cloud:', process.env.CLOUDINARY_CLOUD_NAME)

module.exports = { cloudinary, upload }
