const mongoose = require('mongoose')

const statSchema = new mongoose.Schema(
  {
    value:  { type: Number, required: true },             // e.g. 450, 2, 1000
    suffix: { type: String, default: '+', trim: true },   // e.g. '+', 'L+', '%'
    label:  { type: String, required: true, trim: true }, // e.g. 'Organizations\nTransformed'
    order:  { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Stat', statSchema)
