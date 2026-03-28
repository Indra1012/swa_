const express   = require('express')
const protect   = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const { getContentBySection, updateContent, getAllSections } = require('../controllers/content.controller')

const router = express.Router()

// PUBLIC — must register /sections before /:section to avoid route shadowing
router.get('/sections',   getAllSections)
router.get('/:section',   getContentBySection)

// ADMIN ONLY
router.put('/',           protect, adminOnly, updateContent)

module.exports = router
