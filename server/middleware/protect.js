const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    // ── 1. Extract token from Authorization header ──
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided, access denied' })
    }
    const token = authHeader.split(' ')[1]

    // ── 2. Verify token ──
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // ── 3. Find user in DB ──
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' })
    }

    // ── 4. Attach user to request ──
    req.user = user
    next()

  } catch (err) {
    console.error('❌ Auth middleware error:', err.message)
    next(err)   // passes to global error handler (handles JWT errors by name)
  }
}

module.exports = protect
