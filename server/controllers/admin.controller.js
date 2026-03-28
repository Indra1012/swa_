const Settings   = require('../models/Settings')
const Booking    = require('../models/Booking')
const MediaItem  = require('../models/MediaItem')

// ── GET EMAIL SETTINGS ───────────────────────────────────────────
const getSettings = async (req, res, next) => {
  try {
    const notificationEmail  = await Settings.get('notificationEmail')
    const ccEmail            = await Settings.get('ccEmail')
    const notificationEmail2 = await Settings.get('notificationEmail2')
    const notificationEmail3 = await Settings.get('notificationEmail3')
    res.status(200).json({
      notificationEmail:  notificationEmail || '',
      ccEmail:            ccEmail || '',
      notificationEmail2: notificationEmail2 || '',
      notificationEmail3: notificationEmail3 || ''
    })
  } catch (err) {
    console.error('❌ getSettings error:', err.message)
    next(err)
  }
}

// ── UPDATE EMAIL SETTINGS ────────────────────────────────────────
const updateEmailSettings = async (req, res, next) => {
  try {
    const { notificationEmail, ccEmail, notificationEmail2, notificationEmail3 } = req.body
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!notificationEmail) {
      return res.status(400).json({ error: 'notificationEmail is required' })
    }
    if (!emailRegex.test(notificationEmail)) {
      return res.status(400).json({ error: 'notificationEmail is not a valid email address' })
    }
    if (ccEmail && !emailRegex.test(ccEmail)) {
      return res.status(400).json({ error: 'ccEmail is not a valid email address' })
    }
    if (notificationEmail2 && !emailRegex.test(notificationEmail2)) {
      return res.status(400).json({ error: 'Admin Email 2 is not a valid email address' })
    }
    if (notificationEmail3 && !emailRegex.test(notificationEmail3)) {
      return res.status(400).json({ error: 'Admin Email 3 is not a valid email address' })
    }

    await Settings.set('notificationEmail', notificationEmail)
    await Settings.set('ccEmail', ccEmail || '')
    await Settings.set('notificationEmail2', notificationEmail2 || '')
    await Settings.set('notificationEmail3', notificationEmail3 || '')

    console.log(`✅ Email settings updated — to: ${notificationEmail}`)
    res.status(200).json({
      message: 'Email settings saved successfully',
      notificationEmail,
      ccEmail: ccEmail || '',
      notificationEmail2: notificationEmail2 || '',
      notificationEmail3: notificationEmail3 || ''
    })
  } catch (err) {
    console.error('❌ updateEmailSettings error:', err.message)
    next(err)
  }
}

// ── DASHBOARD STATS ──────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const now              = new Date()
    const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalBookings, pendingBookings, thisMonthBookings, totalMedia] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      MediaItem.countDocuments(),
    ])

    res.status(200).json({
      totalBookings,
      pendingBookings,
      thisMonth: thisMonthBookings,
      mediaItems: totalMedia,
    })
  } catch (err) {
    console.error('❌ getDashboardStats error:', err.message)
    next(err)
  }
}

module.exports = { getSettings, updateEmailSettings, getDashboardStats }
