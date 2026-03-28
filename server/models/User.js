const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: null },   // null for Google-only users
    googleId: { type: String, default: null },   // null for email/password users
    role:     { type: String, enum: ['admin', 'user'], default: 'user' },
    avatar:   { type: String, default: '' },
  },
  { timestamps: true }
)

// ── PRE-SAVE: hash password if set and modified ──
userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

// ── METHOD: compare entered password against hash ──
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false
  return bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
