const Slot = require('../models/Slot')

// ── GET SLOTS (available + booked, so frontend can show booked state) ──
const getAvailableSlots = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]  // YYYY-MM-DD

    // Return all future slots that are either available or booked
    // (admin-disabled slots with isAvailable=false AND isBooked=false are hidden)
    const slots = await Slot.find({
      date: { $gte: today },
      $or: [
        { isAvailable: true },
        { isBooked: true },
      ],
    }).sort({ date: 1, time: 1 })

    res.status(200).json({ count: slots.length, slots })
  } catch (err) {
    console.error('❌ getAvailableSlots error:', err.message)
    next(err)
  }
}

// ── CREATE SLOTS (admin, bulk) ───────────────────────────────────
// Accepts: { slots: [{ date: 'YYYY-MM-DD', time: '10:00 AM' }, ...] }
// ordered: false → skips duplicates without failing the whole batch
const createSlots = async (req, res, next) => {
  try {
    const { slots } = req.body
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: 'slots must be a non-empty array of { date, time } objects' })
    }

    const docs   = slots.map(s => ({ date: s.date, time: s.time }))
    const result = await Slot.insertMany(docs, { ordered: false })

    console.log(`✅ Slots created: ${result.length} of ${docs.length} (duplicates skipped)`)
    res.status(201).json({
      message:  `${result.length} slot(s) created, duplicates skipped`,
      created:  result.length,
      skipped:  docs.length - result.length,
    })
  } catch (err) {
    // insertMany with ordered:false throws even on partial success — handle gracefully
    if (err.code === 11000 && err.insertedDocs) {
      console.log(`✅ Slots partial insert: ${err.insertedDocs.length} created, rest were duplicates`)
      return res.status(201).json({
        message: `${err.insertedDocs.length} slot(s) created, duplicates skipped`,
        created: err.insertedDocs.length,
      })
    }
    console.error('❌ createSlots error:', err.message)
    next(err)
  }
}

// ── TOGGLE SLOT AVAILABILITY (admin) ─────────────────────────────
const toggleSlotAvailability = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.id)
    if (!slot) return res.status(404).json({ error: 'Slot not found' })

    slot.isAvailable = !slot.isAvailable
    await slot.save()

    console.log(`✅ Slot ${slot._id}: isAvailable → ${slot.isAvailable}`)
    res.status(200).json({ message: 'Slot availability toggled', slot })
  } catch (err) {
    console.error('❌ toggleSlotAvailability error:', err.message)
    next(err)
  }
}

// ── DELETE SLOT (admin) ──────────────────────────────────────────
const deleteSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id)
    if (!slot) return res.status(404).json({ error: 'Slot not found' })

    console.log(`✅ Slot deleted: ${slot.date} ${slot.time}`)
    res.status(200).json({ message: 'Slot deleted successfully' })
  } catch (err) {
    console.error('❌ deleteSlot error:', err.message)
    next(err)
  }
}

// ── DELETE PAST SLOTS (admin, cleanup utility) ───────────────────
const deletePassedSlots = async (req, res, next) => {
  try {
    const today  = new Date().toISOString().split('T')[0]
    const result = await Slot.deleteMany({ date: { $lt: today } })

    console.log(`✅ Past slots cleaned up: ${result.deletedCount} removed`)
    res.status(200).json({
      message: `${result.deletedCount} past slot(s) deleted`,
      deleted: result.deletedCount,
    })
  } catch (err) {
    console.error('❌ deletePassedSlots error:', err.message)
    next(err)
  }
}

module.exports = { getAvailableSlots, createSlots, toggleSlotAvailability, deleteSlot, deletePassedSlots }
