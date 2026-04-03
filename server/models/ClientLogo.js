const mongoose = require('mongoose')

const clientLogoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true }, // Cloudinary URL
  publicId: { type: String }, // Cloudinary public_id
  link: { type: String, default: '' }, // Optional URL to redirect to
  order: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('ClientLogo', clientLogoSchema)
