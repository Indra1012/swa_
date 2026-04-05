const mongoose = require('mongoose')

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  category: { type: String, enum: ['team', 'expert'], required: true },
  url: { type: String, default: '' },
  publicId: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('TeamMember', teamMemberSchema)
