const express    = require('express')
const protect    = require('../middleware/protect')
const adminOnly  = require('../middleware/adminOnly')
const { uploadSingle } = require('../middleware/upload')
const { uploadMedia, getMediaBySection, deleteMedia, updateMediaCaption } = require('../controllers/media.controller')

const router = express.Router()

// ADMIN ONLY — upload runs before controller so req.file is ready
router.post('/upload',      protect, adminOnly, uploadSingle, uploadMedia)
router.delete('/:id',       protect, adminOnly, deleteMedia)
router.patch('/:id',        protect, adminOnly, updateMediaCaption)

// PUBLIC
router.get('/:section',     getMediaBySection)

module.exports = router
