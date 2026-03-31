const HealingTechnique = require('../models/HealingTechnique')
const Testimonial      = require('../models/Testimonial')
const Stat             = require('../models/Stat')
const FAQ              = require('../models/FAQ')
const GalleryItem      = require('../models/GalleryItem')
const Settings         = require('../models/Settings')
const { cloudinary }   = require('../config/cloudinary')

// =====================================================================
//  HEALING TECHNIQUES  &  WELLBEING PROCESSES
// =====================================================================
const getTechniques = async (req, res, next) => {
  try {
    const { category } = req.params
    const items = await HealingTechnique.find({ category }).sort({ order: 1, createdAt: 1 })
    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createTechnique = async (req, res, next) => {
  try {
    const item = await HealingTechnique.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateTechnique = async (req, res, next) => {
  try {
    const item = await HealingTechnique.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteTechnique = async (req, res, next) => {
  try {
    const item = await HealingTechnique.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => {})
    }
    await item.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

const uploadTechniqueImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const item = await HealingTechnique.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    // Delete old image from Cloudinary if exists
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => {})
    }
    item.image = req.file.path
    item.publicId = req.file.filename
    await item.save()
    res.json({ message: 'Image uploaded', item })
  } catch (err) { next(err) }
}

// =====================================================================
//  TESTIMONIALS
// =====================================================================
const getTestimonials = async (req, res, next) => {
  try {
    const items = await Testimonial.find().sort({ order: 1, createdAt: -1 })
    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// =====================================================================
//  STATS
// =====================================================================
const getStats = async (req, res, next) => {
  try {
    const items = await Stat.find().sort({ order: 1 })
    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createStat = async (req, res, next) => {
  try {
    const item = await Stat.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateStat = async (req, res, next) => {
  try {
    const item = await Stat.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteStat = async (req, res, next) => {
  try {
    const item = await Stat.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// =====================================================================
//  FAQS
// =====================================================================
const getFaqs = async (req, res, next) => {
  try {
    const items = await FAQ.find().sort({ order: 1 })
    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createFaq = async (req, res, next) => {
  try {
    const item = await FAQ.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateFaq = async (req, res, next) => {
  try {
    const item = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteFaq = async (req, res, next) => {
  try {
    const item = await FAQ.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// =====================================================================
//  GALLERY
// =====================================================================
const getGallery = async (req, res, next) => {
  try {
    const items = await GalleryItem.find().sort({ order: 1, createdAt: -1 })
    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createGalleryItem = async (req, res, next) => {
  try {
    const data = { ...req.body }
    // If file was uploaded via Cloudinary
    if (req.file) {
      data.url = req.file.path
      data.publicId = req.file.filename
      data.type = req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    }
    const item = await GalleryItem.create(data)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (item.publicId) {
      const rType = item.type === 'video' ? 'video' : 'image'
      await cloudinary.uploader.destroy(item.publicId, { resource_type: rType }).catch(() => {})
    }
    await item.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// =====================================================================
//  SETTINGS — Wellbeing Section Toggle
// =====================================================================
const getWellbeingVisible = async (req, res, next) => {
  try {
    const val = await Settings.get('wellbeingVisible')
    res.json({ visible: val === 'true' })
  } catch (err) { next(err) }
}

const setWellbeingVisible = async (req, res, next) => {
  try {
    const { visible } = req.body
    await Settings.set('wellbeingVisible', String(!!visible))
    res.json({ message: 'Updated', visible: !!visible })
  } catch (err) { next(err) }
}

module.exports = {
  getTechniques, createTechnique, updateTechnique, deleteTechnique, uploadTechniqueImage,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getStats, createStat, updateStat, deleteStat,
  getFaqs, createFaq, updateFaq, deleteFaq,
  getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
  getWellbeingVisible, setWellbeingVisible,
}
