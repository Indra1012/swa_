const express   = require('express')
const protect   = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const { getSettings, updateEmailSettings, getDashboardStats } = require('../controllers/admin.controller')

const router = express.Router()

// All admin routes require auth + admin role
router.get('/settings/email',  protect, adminOnly, getSettings)
router.put('/settings/email',  protect, adminOnly, updateEmailSettings)
router.get('/stats',           protect, adminOnly, getDashboardStats)

module.exports = router
