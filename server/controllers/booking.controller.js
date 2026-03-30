const Booking         = require('../models/Booking')
const Slot            = require('../models/Slot')
const Settings        = require('../models/Settings')
const createMeetEvent = require('../utils/createMeetEvent')
const { sendEmail, bookingConfirmationTemplate, bookingNotificationTemplate } = require('../utils/sendEmail')

// ── CREATE BOOKING ───────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { name, email, phone, company, teamSize, message, date, timeSlot } = req.body

    // Validate required fields
    const missing = ['name','email','phone','company','teamSize','date','timeSlot']
      .filter(f => !req.body[f])
    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', fields: missing })
    }

    // Check slot exists and is available
    const slot = await Slot.findOne({ date, time: timeSlot })
    if (!slot) {
      return res.status(400).json({ error: 'Selected slot does not exist' })
    }
    if (!slot.isAvailable || slot.isBooked) {
      return res.status(400).json({ error: 'Selected slot is no longer available' })
    }

    // Create Google Meet event (non-blocking — returns null if not configured)
    const meetLink = await createMeetEvent({ name, email, company, date, timeSlot })

    // Create booking (with Meet link if generated)
    const booking = await Booking.create({
      name, email, phone, company, teamSize, message, date, timeSlot,
      ...(meetLink && { meetLink })
    })

    // Mark slot as booked
    slot.isBooked    = true
    slot.isAvailable = false
    await slot.save()

    // Fetch all notification emails from Settings
    const notificationEmail  = await Settings.get('notificationEmail')  || process.env.COMPANY_EMAIL
    const ccEmail            = await Settings.get('ccEmail')            || null
    const notificationEmail2 = await Settings.get('notificationEmail2') || null
    const notificationEmail3 = await Settings.get('notificationEmail3') || null

    // Build recipients list
    const recipients = [notificationEmail, notificationEmail2, notificationEmail3]
      .filter(Boolean)
      .join(', ')

    // Send emails (fire-and-forget — don't block the response)
    sendEmail({
      to:      email,
      subject: '✅ Your SWA Demo is Confirmed — Google Meet Link Inside',
      html:    bookingConfirmationTemplate(booking),
    }).catch(err => console.error('❌ Confirmation email failed:', err.message))

    sendEmail({
      to:      recipients,
      ...(ccEmail && { cc: ccEmail }),
      subject: `🔔 New Booking — ${name} (${company})`,
      html:    bookingNotificationTemplate(booking),
    }).catch(err => console.error('❌ Notification email failed:', err.message))

    console.log(`✅ Booking created: ${name} | ${company} | ${date} ${timeSlot} | Meet: ${meetLink || 'none'}`)
    res.status(201).json({ message: 'Booking created successfully', booking })
  } catch (err) {
    console.error('❌ createBooking error:', err.message)
    next(err)
  }
}

// ── GET ALL BOOKINGS (admin) ─────────────────────────────────────
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 })
    res.status(200).json(bookings)
  } catch (err) {
    console.error('❌ getAllBookings error:', err.message)
    next(err)
  }
}

// ── UPDATE BOOKING STATUS (admin) ────────────────────────────────
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id }     = req.params
    const { status } = req.body
    const allowed    = ['pending', 'confirmed', 'cancelled']

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` })
    }

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    console.log(`✅ Booking ${id} status → ${status}`)
    res.status(200).json({ message: 'Status updated', booking })
  } catch (err) {
    console.error('❌ updateBookingStatus error:', err.message)
    next(err)
  }
}

// ── DELETE BOOKING (admin) ───────────────────────────────────────
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id)
    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    console.log(`✅ Booking deleted: ${booking._id}`)
    res.status(200).json({ message: 'Booking deleted successfully' })
  } catch (err) {
    console.error('❌ deleteBooking error:', err.message)
    next(err)
  }
}

module.exports = { createBooking, getAllBookings, updateBookingStatus, deleteBooking }
