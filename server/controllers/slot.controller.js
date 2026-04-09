const Slot = require('../models/Slot')
const Holiday = require('../models/Holiday')

const STANDARD_TIMES = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

const isPassed = (date, time) => {
  const now = new Date();
  const nowIstStr = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const nowIst = new Date(nowIstStr);
  
  const todayIstIso = [
    nowIst.getFullYear(),
    String(nowIst.getMonth() + 1).padStart(2, '0'),
    String(nowIst.getDate()).padStart(2, '0')
  ].join('-');
  
  if (date > todayIstIso) return false;
  if (date < todayIstIso) return true;
  
  const [hourStr, minPeriod] = time.split(':')
  const [minStr, period] = minPeriod.split(' ')
  let hour = parseInt(hourStr, 10)
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  
  const slotTimeInMin = hour * 60 + parseInt(minStr, 10);
  const nowTimeInMin = nowIst.getHours() * 60 + nowIst.getMinutes();
  
  return slotTimeInMin <= nowTimeInMin;
}

// ── GET SLOTS (Dynamically Generated) ──
const getAvailableSlots = async (req, res, next) => {
  try {
    const { fromDate, toDate, date } = req.query
    
    const now = new Date()
    const nowIstStr = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    const nowIst = new Date(nowIstStr)
    nowIst.setHours(0, 0, 0, 0)
    
    let startD = new Date(nowIst)
    let endD = new Date(nowIst)
    endD.setDate(nowIst.getDate() + 90) // default 90 days
    
    if (date) {
      startD = new Date(date)
      endD = new Date(date)
    } else if (fromDate && toDate) {
      startD = new Date(fromDate)
      endD = new Date(toDate)
    }

    const startIso = [
      startD.getFullYear(),
      String(startD.getMonth() + 1).padStart(2, '0'),
      String(startD.getDate()).padStart(2, '0')
    ].join('-')
    
    const endPlusOne = new Date(endD)
    endPlusOne.setDate(endD.getDate() + 1)
    const endIso = [
      endPlusOne.getFullYear(),
      String(endPlusOne.getMonth() + 1).padStart(2, '0'),
      String(endPlusOne.getDate()).padStart(2, '0')
    ].join('-')

    const overrides = await Slot.find({
      date: { $gte: startIso, $lt: endIso }
    })
    
    const holidays = await Holiday.find({
      date: { $gte: startIso, $lt: endIso }
    })
    const holidaySet = new Set(holidays.map(h => h.date))
    
    const generatedSlots = []
    
    for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
      ].join('-')
      const dayOfWeek = d.getDay()
      
      // Block Sundays automatically
      if (dayOfWeek === 0) continue;
      
      // Block specific Holidays
      if (holidaySet.has(dateStr)) continue;
      
      for (const time of STANDARD_TIMES) {
        if (isPassed(dateStr, time)) continue;
        
        const override = overrides.find(o => o.date === dateStr && o.time === time)
        
        if (override) {
          generatedSlots.push({
            _id: override._id,
            date: dateStr,
            time: time,
            isBooked: override.isBooked,
            isAvailable: override.isAvailable
          })
        } else {
          generatedSlots.push({
            _id: `${dateStr}_${time}`,
            date: dateStr,
            time: time,
            isBooked: false,
            isAvailable: true
          })
        }
      }
    }
    
    res.status(200).json({ count: generatedSlots.length, slots: generatedSlots })
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

// ── BULK UPDATE OVERRIDES (admin) ──────────────────────────
const bulkUpdateSlots = async (req, res, next) => {
  try {
    const { overrides } = req.body // array of { date, time, isAvailable }
    if (!Array.isArray(overrides)) return res.status(400).json({ error: 'overrides must be an array' })

    const bulkOps = overrides.map(o => {
      if (o.isAvailable) {
        // If it's available, we can just remove the override (fallback to dynamic default)
        // Note: we shouldn't delete if it's booked, but booked slots shouldn't be affected here anyway
        return {
          deleteOne: {
            filter: { date: o.date, time: o.time, isBooked: false }
          }
        }
      } else {
        // Upsert standard override to false
        return {
          updateOne: {
            filter: { date: o.date, time: o.time },
            update: { $set: { isAvailable: false } },
            upsert: true
          }
        }
      }
    })

    if (bulkOps.length > 0) {
      await Slot.bulkWrite(bulkOps)
    }

    res.status(200).json({ message: 'Overrides updated successfully' })
  } catch (err) {
    console.error('❌ bulkUpdateSlots error:', err.message)
    next(err)
  }
}

module.exports = { getAvailableSlots, createSlots, toggleSlotAvailability, deleteSlot, deletePassedSlots, bulkUpdateSlots }
