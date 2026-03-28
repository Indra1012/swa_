const mongoose = require('mongoose')

const contentSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, trim: true }, // e.g. 'hero', 'tagline'
    key:     { type: String, required: true, trim: true }, // e.g. 'heading', 'subtext'
    value:   { type: String, required: true },
    type:    { type: String, enum: ['text', 'html'], default: 'text' },
  },
  { timestamps: true }
)

// ── COMPOUND UNIQUE INDEX: one value per section+key combination ──
contentSchema.index({ section: 1, key: 1 }, { unique: true })

module.exports = mongoose.model('Content', contentSchema)
