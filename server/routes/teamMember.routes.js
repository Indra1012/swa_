const express = require('express')
const router = express.Router()
const controller = require('../controllers/teamMember.controller')
const protect = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const { uploadSingle } = require('../middleware/upload')

router.get('/', controller.getMembers)
router.post('/', protect, adminOnly, controller.createMember)
router.put('/:id', protect, adminOnly, controller.updateMember)
router.delete('/:id', protect, adminOnly, controller.deleteMember)
router.post('/:id/image', protect, adminOnly, uploadSingle, controller.uploadMemberImage)

module.exports = router
