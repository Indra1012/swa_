const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    quote:  { type: String, default: '', trim: true },    // one-line short text
    text:   { type: String, default: '', trim: true },    // detailed experience
    order:  { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Testimonial', testimonialSchema)
