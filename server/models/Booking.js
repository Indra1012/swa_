const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, lowercase: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    company:  { type: String, required: true, trim: true },
    teamSize: {
      type: String,
      enum: ['<10', '10-50', '50-200', '200+'],
      required: true,
    },
    message:  { type: String, default: '' },
    date:     { type: String, required: true },    // YYYY-MM-DD
    timeSlot: { type: String, required: true },    // e.g. "10:00 AM"
    status:   {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    meetLink: { type: String, default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Booking', bookingSchema)
