const mongoose = require('mongoose')

const healingTechniqueSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['healing', 'wellbeing'], required: true, index: true },
    title:    { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    image:    { type: String, default: '' },          // Cloudinary URL or pasted URL
    publicId: { type: String, default: '' },          // Cloudinary public_id (empty if pasted URL)
    readMoreText: { type: String, default: '' },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('HealingTechnique', healingTechniqueSchema)
