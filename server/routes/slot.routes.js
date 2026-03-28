const express   = require('express')
const protect   = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const { getAvailableSlots, createSlots, toggleSlotAvailability, deleteSlot, deletePassedSlots } = require('../controllers/slot.controller')

const router = express.Router()

// PUBLIC
router.get('/',            getAvailableSlots)

// ADMIN ONLY
// NOTE: /cleanup must be registered BEFORE /:id — otherwise Express matches
// the literal string "cleanup" as the :id param and calls deleteSlot instead
router.delete('/cleanup',  protect, adminOnly, deletePassedSlots)
router.post('/',           protect, adminOnly, createSlots)
router.patch('/:id',       protect, adminOnly, toggleSlotAvailability)
router.delete('/:id',      protect, adminOnly, deleteSlot)

module.exports = router
