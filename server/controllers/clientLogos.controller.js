const ClientLogo = require('../models/ClientLogo')
const { cloudinary } = require('../config/cloudinary')

const getLogos = async (req, res, next) => {
  try {
    let items = await ClientLogo.find().sort({ order: 1, createdAt: 1 })

    if (items.length === 0) {
      const defaults = [
        { name: 'Narayana Health', url: 'https://logo.clearbit.com/narayanahealth.org', order: 1 },
        { name: 'Yes Bank', url: 'https://logo.clearbit.com/yesbank.in', order: 2 },
        { name: 'Amazon', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', order: 3 },
        { name: 'Aditya Birla Group', url: 'https://logo.clearbit.com/adityabirla.com', order: 4 },
        { name: 'Deloitte', url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg', order: 5 },
        { name: 'Bharat Petroleum', url: 'https://logo.clearbit.com/bharatpetroleum.in', order: 6 }
      ]
      await ClientLogo.insertMany(defaults)
      items = await ClientLogo.find().sort({ order: 1, createdAt: 1 })
    }

    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createLogo = async (req, res, next) => {
  try {
    const item = await ClientLogo.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateLogo = async (req, res, next) => {
  try {
    const item = await ClientLogo.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteLogo = async (req, res, next) => {
  try {
    const item = await ClientLogo.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => { })
    }
    await ClientLogo.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

const uploadLogoImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const item = await ClientLogo.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    
    // Delete old image from Cloudinary if exists
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => { })
    }
    
    item.url = req.file.path
    item.publicId = req.file.filename
    await item.save()
    res.json({ message: 'Image uploaded', item })
  } catch (err) { next(err) }
}

module.exports = {
  getLogos,
  createLogo,
  updateLogo,
  deleteLogo,
  uploadLogoImage
}
