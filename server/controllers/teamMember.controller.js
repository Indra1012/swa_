const TeamMember = require('../models/TeamMember')
const { cloudinary } = require('../config/cloudinary')

// Seed defaults so gallery is never empty
const DEFAULTS = [
  { name: 'Alina R.', role: 'Senior Therapist', category: 'team', order: 1, url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80' },
  { name: 'Marcus T.', role: 'Performance Coach', category: 'team', order: 2, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80' },
  { name: 'Sarah M.', role: 'Somatic Healer', category: 'team', order: 3, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80' },
  { name: 'David L.', role: 'Organizational Expert', category: 'team', order: 4, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' },
  { name: 'Dr. Elena V.', role: 'Clinical Psychologist', category: 'expert', order: 1, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80' },
  { name: 'James K.', role: 'Neuroscience Advisor', category: 'expert', order: 2, url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80' },
  { name: 'Maya S.', role: 'Eastern Philosophy Lead', category: 'expert', order: 3, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80' },
  { name: 'Robert C.', role: 'Behavioral Scientist', category: 'expert', order: 4, url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80' }
]

const getMembers = async (req, res, next) => {
  try {
    let items = await TeamMember.find().sort({ category: 1, order: 1, createdAt: 1 })
    if (items.length === 0) {
      await TeamMember.insertMany(DEFAULTS)
      items = await TeamMember.find().sort({ category: 1, order: 1, createdAt: 1 })
    }
    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createMember = async (req, res, next) => {
  try {
    const item = await TeamMember.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateMember = async (req, res, next) => {
  try {
    const item = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteMember = async (req, res, next) => {
  try {
    const item = await TeamMember.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => {})
    }
    await TeamMember.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

const uploadMemberImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const item = await TeamMember.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    // Delete old Cloudinary image if it exists (not a default URL)
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => {})
    }
    item.url = req.file.path
    item.publicId = req.file.filename
    await item.save()
    res.json({ message: 'Image uploaded', item })
  } catch (err) { next(err) }
}

module.exports = { getMembers, createMember, updateMember, deleteMember, uploadMemberImage }
