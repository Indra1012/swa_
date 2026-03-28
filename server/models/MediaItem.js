const mongoose = require('mongoose')

const mediaItemSchema = new mongoose.Schema(
  {
    section:  { type: String, required: true, trim: true }, // e.g. 'hero', 'programs'
    url:      { type: String, required: true },             // Cloudinary delivery URL
    publicId: { type: String, required: true },             // Cloudinary public_id for deletion
    type:     { type: String, enum: ['image', 'video'], default: 'image' },
    caption:  { type: String, default: '' },
    order:    { type: Number, default: 0 },                 // sort order within a section
  },
  { timestamps: true }
)

module.exports = mongoose.model('MediaItem', mediaItemSchema)
