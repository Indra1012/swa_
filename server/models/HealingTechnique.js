const mongoose = require('mongoose')

const healingTechniqueSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['healing', 'wellbeing', 'insights'], required: true, index: true },
    title:    { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    snippet:  { type: String, default: '', trim: true },
    mediaMode: { type: String, default: 'image' },    // 'image' or 'video'
    image:    { type: String, default: '' },          // Single image or video url (legacy/fallback)
    publicId: { type: String, default: '' },          // Cloudinary public_id for single image/video
    images: {
      type: [{ url: String, publicId: String }],      // Array of up to 3 images
      default: []
    },
    readMoreText: { type: String, default: '' },
    publishDate: { type: String, default: '' },
    focus: { type: String, default: '' },
    purpose: { type: String, default: '' },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('HealingTechnique', healingTechniqueSchema)
