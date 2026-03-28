const jwt = require('jsonwebtoken')

// ── GENERATE: sign a JWT for a given user ──
const generateToken = (userId, role = 'user', email = '') => {
  return jwt.sign(
    { id: userId, role, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

// ── VERIFY: decode and return payload, or throw ──
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    console.error('❌ Token verification failed:', err.message)
    throw err   // let the caller (protect middleware / global handler) decide the response
  }
}

module.exports = { generateToken, verifyToken }
