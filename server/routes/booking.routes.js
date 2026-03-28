const express    = require('express')
const protect    = require('../middleware/protect')
const adminOnly  = require('../middleware/adminOnly')
const { createBooking, getAllBookings, updateBookingStatus, deleteBooking } = require('../controllers/booking.controller')

const router = express.Router()

// PUBLIC
router.post('/',    createBooking)

// ADMIN ONLY
router.get('/',     protect, adminOnly, getAllBookings)
router.patch('/:id', protect, adminOnly, updateBookingStatus)
router.delete('/:id', protect, adminOnly, deleteBooking)

module.exports = router
