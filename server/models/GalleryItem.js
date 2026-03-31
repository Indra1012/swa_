const mongoose = require('mongoose')

const galleryItemSchema = new mongoose.Schema(
  {
    url:         { type: String, required: true },
    publicId:    { type: String, default: '' },
    type:        { type: String, enum: ['image', 'video'], default: 'image' },
    sizeVariant: { type: String, enum: ['small', 'medium', 'large', 'portrait', 'landscape'], default: 'medium' },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('GalleryItem', galleryItemSchema)
