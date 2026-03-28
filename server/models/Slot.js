const mongoose = require('mongoose')

const slotSchema = new mongoose.Schema(
  {
    date:        { type: String, required: true },  // YYYY-MM-DD
    time:        { type: String, required: true },  // e.g. "10:00 AM"
    isAvailable: { type: Boolean, default: true },
    isBooked:    { type: Boolean, default: false },
  },
  { timestamps: true }
)

// ── COMPOUND UNIQUE INDEX: one slot per date+time combination ──
slotSchema.index({ date: 1, time: 1 }, { unique: true })

module.exports = mongoose.model('Slot', slotSchema)
