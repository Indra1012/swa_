require('dotenv').config()

const connectDB = require('../config/db')
const Settings  = require('../models/Settings')

const seed = async () => {
  try {
    await connectDB()

    await Settings.set('notificationEmail',   process.env.COMPANY_EMAIL)
    await Settings.set('ccEmail',             '')
    await Settings.set('bookingSlotDuration', '60')
    await Settings.set('officeStartTime',     '09:00')
    await Settings.set('lunchStartTime',      '13:00')
    await Settings.set('lunchEndTime',        '14:00')
    await Settings.set('officeEndTime',       '18:00')

    console.log('✅ Seeding complete')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

seed()
