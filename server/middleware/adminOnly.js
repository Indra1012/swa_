// Always runs AFTER protect.js — req.user is guaranteed to exist here
const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next()
  }
  console.warn(`⚠️  Admin access denied — user: ${req.user?.email}, role: ${req.user?.role}`)
  return res.status(403).json({ error: 'Access denied. Admin only.' })
}

module.exports = adminOnly
