const express = require('express')
const router = express.Router()
const controller = require('../controllers/clientLogos.controller')
const protect = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const { uploadSingle } = require('../middleware/upload')

router.get('/', controller.getLogos)
router.post('/', protect, adminOnly, controller.createLogo)
router.put('/:id', protect, adminOnly, controller.updateLogo)
router.delete('/:id', protect, adminOnly, controller.deleteLogo)
router.post('/:id/image', protect, adminOnly, uploadSingle, controller.uploadLogoImage)

module.exports = router
