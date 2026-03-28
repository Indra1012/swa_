const MediaItem            = require('../models/MediaItem')
const { cloudinary }       = require('../config/cloudinary')

// ── UPLOAD MEDIA ─────────────────────────────────────────────────
// req.file is populated by multer/cloudinary middleware before this runs
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const { section, caption, order } = req.body
    if (!section) return res.status(400).json({ error: 'section is required' })

    const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image'

    const media = await MediaItem.create({
      section,
      url:      req.file.path,       // Cloudinary delivery URL
      publicId: req.file.filename,   // Cloudinary public_id
      type,
      caption:  caption || '',
      order:    order   || 0,
    })

    console.log(`✅ Media uploaded: ${section} | ${type} | ${media.publicId}`)
    res.status(201).json({ message: 'Media uploaded successfully', media })
  } catch (err) {
    console.error('❌ uploadMedia error:', err.message)
    next(err)
  }
}

// ── GET MEDIA BY SECTION ─────────────────────────────────────────
const getMediaBySection = async (req, res, next) => {
  try {
    const { section } = req.params
    const media = await MediaItem.find({ section }).sort({ order: 1, createdAt: -1 })
    res.status(200).json({ count: media.length, media })
  } catch (err) {
    console.error('❌ getMediaBySection error:', err.message)
    next(err)
  }
}

// ── DELETE MEDIA ─────────────────────────────────────────────────
const deleteMedia = async (req, res, next) => {
  try {
    const item = await MediaItem.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Media item not found' })

    // Delete from Cloudinary first
    await cloudinary.uploader.destroy(item.publicId, {
      resource_type: item.type === 'video' ? 'video' : 'image',
    })

    // Delete from DB
    await item.deleteOne()

    console.log(`✅ Media deleted: ${item.publicId}`)
    res.status(200).json({ message: 'Media deleted successfully' })
  } catch (err) {
    console.error('❌ deleteMedia error:', err.message)
    next(err)
  }
}

// ── UPDATE CAPTION / ORDER ───────────────────────────────────────
const updateMediaCaption = async (req, res, next) => {
  try {
    const { caption, order } = req.body
    const update = {}
    if (caption !== undefined) update.caption = caption
    if (order   !== undefined) update.order   = order

    const item = await MediaItem.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!item) return res.status(404).json({ error: 'Media item not found' })

    res.status(200).json({ message: 'Media updated', media: item })
  } catch (err) {
    console.error('❌ updateMediaCaption error:', err.message)
    next(err)
  }
}

module.exports = { uploadMedia, getMediaBySection, deleteMedia, updateMediaCaption }
