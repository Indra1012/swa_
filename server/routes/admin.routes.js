const express   = require('express')
const protect   = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const { getSettings, updateEmailSettings, getDashboardStats } = require('../controllers/admin.controller')
const User      = require('../models/User')

const router = express.Router()

// All admin routes require auth + admin role
router.get('/settings/email',  protect, adminOnly, getSettings)
router.put('/settings/email',  protect, adminOnly, updateEmailSettings)
router.get('/stats',           protect, adminOnly, getDashboardStats)

// ── ADMIN MANAGEMENT ────────────────────────────────────────────

// List all admins
router.get('/admins', protect, adminOnly, async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: 1 })
    res.json(admins)
  } catch (err) { next(err) }
})

// Create a new admin (email + password, or just email for Google Auth)
router.post('/admins', protect, adminOnly, async (req, res, next) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount >= 5) {
      return res.status(400).json({ error: 'Maximum 5 admins allowed.' })
    }

    const { name, email, password } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required.' })

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      // If user exists but isn't admin, promote them
      if (existing.role === 'admin') {
        return res.status(400).json({ error: 'This email is already an admin.' })
      }
      existing.role = 'admin'
      if (name) existing.name = name
      if (password) existing.password = password
      await existing.save()
      const safe = existing.toObject()
      delete safe.password
      return res.status(200).json(safe)
    }

    // Create brand new admin
    const user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase().trim(),
      password: password || null,
      role: 'admin'
    })
    const safe = user.toObject()
    delete safe.password
    res.status(201).json(safe)
  } catch (err) { next(err) }
})

// Remove admin (demote to user)
router.delete('/admins/:id', protect, adminOnly, async (req, res, next) => {
  try {
    // Don't let the last admin remove themselves
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot remove the last admin.' })
    }

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    user.role = 'user'
    await user.save()
    res.json({ message: `${user.email} has been removed from admins.` })
  } catch (err) { next(err) }
})

module.exports = router
