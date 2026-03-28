const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true, trim: true },
    value: { type: String, default: '' },
  },
  { timestamps: true }
)

// ── STATIC: get value by key ──
settingsSchema.statics.get = async function (key) {
  const doc = await this.findOne({ key })
  return doc ? doc.value : null
}

// ── STATIC: upsert a key/value pair ──
settingsSchema.statics.set = async function (key, value) {
  return this.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, returnDocument: 'after' }
  )
}

module.exports = mongoose.model('Settings', settingsSchema)
