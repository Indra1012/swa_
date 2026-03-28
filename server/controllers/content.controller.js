const Content = require('../models/Content')

// ── GET CONTENT BY SECTION ───────────────────────────────────────
const getContentBySection = async (req, res, next) => {
  try {
    const { section } = req.params
    const items = await Content.find({ section }).sort({ key: 1 })
    res.status(200).json({ section, count: items.length, items })
  } catch (err) {
    console.error('❌ getContentBySection error:', err.message)
    next(err)
  }
}

// ── UPDATE CONTENT (upsert) ──────────────────────────────────────
const updateContent = async (req, res, next) => {
  try {
    const { section, key, value, type } = req.body

    if (!section || !key || value === undefined) {
      return res.status(400).json({ error: 'section, key, and value are required' })
    }

    const item = await Content.findOneAndUpdate(
      { section, key },
      { section, key, value, ...(type && { type }) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    console.log(`✅ Content updated: [${section}] ${key}`)
    res.status(200).json({ message: 'Content updated', item })
  } catch (err) {
    console.error('❌ updateContent error:', err.message)
    next(err)
  }
}

// ── GET ALL SECTIONS ─────────────────────────────────────────────
const getAllSections = async (req, res, next) => {
  try {
    const sections = await Content.distinct('section')
    res.status(200).json({ count: sections.length, sections })
  } catch (err) {
    console.error('❌ getAllSections error:', err.message)
    next(err)
  }
}

module.exports = { getContentBySection, updateContent, getAllSections }
