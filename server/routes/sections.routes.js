const express = require('express')
const protect = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const { uploadSingle, uploadMultiple } = require('../middleware/upload')
const {
  getTechniques, createTechnique, updateTechnique, deleteTechnique, uploadTechniqueImage, uploadTechniqueImages, deleteTechniqueSpecificImage,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getStats, createStat, updateStat, deleteStat,
  getFaqs, createFaq, updateFaq, deleteFaq,
  getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
  getWellbeingVisible, setWellbeingVisible,
  getServiceCards, createServiceCard, updateServiceCard, deleteServiceCard, uploadServiceImage
} = require('../controllers/sections.controller')

const router = express.Router()

// ── SERVICES (Our Expertise) ─────────────────────────────────────
router.get('/services', getServiceCards)
router.post('/services', protect, adminOnly, createServiceCard)
router.put('/services/:id', protect, adminOnly, updateServiceCard)
router.delete('/services/:id', protect, adminOnly, deleteServiceCard)
router.post('/services/:id/image', protect, adminOnly, uploadSingle, uploadServiceImage)

// ── TECHNIQUES (healing + wellbeing) ─────────────────────────────
router.get('/techniques/:category', getTechniques)
router.post('/techniques', protect, adminOnly, createTechnique)
router.put('/techniques/:id', protect, adminOnly, updateTechnique)
router.delete('/techniques/:id', protect, adminOnly, deleteTechnique)
router.post('/techniques/:id/image', protect, adminOnly, uploadSingle, uploadTechniqueImage)
router.post('/techniques/:id/images', protect, adminOnly, uploadMultiple, uploadTechniqueImages)
router.put('/techniques/:id/image/delete', protect, adminOnly, deleteTechniqueSpecificImage)

// ── TESTIMONIALS ─────────────────────────────────────────────────
router.get('/testimonials', getTestimonials)
router.post('/testimonials', protect, adminOnly, createTestimonial)
router.put('/testimonials/:id', protect, adminOnly, updateTestimonial)
router.delete('/testimonials/:id', protect, adminOnly, deleteTestimonial)

// ── STATS ────────────────────────────────────────────────────────
router.get('/stats', getStats)
router.post('/stats', protect, adminOnly, createStat)
router.put('/stats/:id', protect, adminOnly, updateStat)
router.delete('/stats/:id', protect, adminOnly, deleteStat)

// ── FAQS ─────────────────────────────────────────────────────────
router.get('/faqs', getFaqs)
router.post('/faqs', protect, adminOnly, createFaq)
router.put('/faqs/:id', protect, adminOnly, updateFaq)
router.delete('/faqs/:id', protect, adminOnly, deleteFaq)

// ── GALLERY ──────────────────────────────────────────────────────
router.get('/gallery', getGallery)
router.post('/gallery', protect, adminOnly, uploadSingle, createGalleryItem)
router.put('/gallery/:id', protect, adminOnly, updateGalleryItem)
router.delete('/gallery/:id', protect, adminOnly, deleteGalleryItem)

// ── SETTINGS ─────────────────────────────────────────────────────
router.get('/settings/wellbeing-visible', getWellbeingVisible)
router.put('/settings/wellbeing-visible', protect, adminOnly, setWellbeingVisible)

module.exports = router
