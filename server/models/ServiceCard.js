const mongoose = require('mongoose')

const serviceCardSchema = new mongoose.Schema(
  {
    typeSlug:    { type: String, required: true, trim: true }, // e.g., 'corporate', 'education'
    title:       { type: String, required: true, trim: true }, // e.g., 'Corporate Wellbeing'
    headline:    { type: String, default: '', trim: true },    // e.g., 'Build a Resilient Workforce'
    description: { type: String, default: '', trim: true },    // e.g., 'Empower teams with...'
    image:       { type: String, default: '' },                // Cloudinary URL or external link
    publicId:    { type: String, default: '' },                // Cloudinary public_id
    mediaMode:   { type: String, enum: ['image', 'video', 'link'], default: 'image' },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ServiceCard', serviceCardSchema)
