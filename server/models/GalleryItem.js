const mongoose = require('mongoose')

const galleryItemSchema = new mongoose.Schema(
  {
    url:         { type: String, required: true },
    publicId:    { type: String, default: '' },
    type:        { type: String, enum: ['image', 'video'], default: 'image' },
    sizeVariant: { type: String, enum: ['medium', 'large'], default: 'medium' },
    title:       { type: String, default: '' },
    subtitle:    { type: String, default: '' },
    description: { type: String, default: '' },
    order:       { type: Number, default: 0 },
    rowNumber:   { type: Number, default: 1 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('GalleryItem', galleryItemSchema)
