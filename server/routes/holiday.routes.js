const express = require('express')
const protect = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const { getHolidays, addHoliday, deleteHoliday } = require('../controllers/holiday.controller')

const router = express.Router()

router.get('/', getHolidays)
router.post('/', protect, adminOnly, addHoliday)
router.delete('/:id', protect, adminOnly, deleteHoliday)

module.exports = router
