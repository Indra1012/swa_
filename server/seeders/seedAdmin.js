require('dotenv').config()

const connectDB = require('../config/db')
const User      = require('../models/User')

const seedAdmin = async () => {
  try {
    await connectDB()

    const email    = process.env.ADMIN_EMAIL || 'admin@swa-wellness.com'
    const password = 'SWA@admin2025'
    const name     = 'SWA Admin'

    const existing = await User.findOne({ email })
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin'
        await existing.save()
        console.log(`✅ Existing user promoted to admin: ${email}`)
      } else {
        console.log(`ℹ️  Admin already exists: ${email}`)
      }
      process.exit(0)
    }

    await User.create({ name, email, password, role: 'admin' })
    console.log(`✅ Admin created: ${email}  |  password: ${password}`)
    process.exit(0)
  } catch (err) {
    console.error('❌ seedAdmin failed:', err.message)
    process.exit(1)
  }
}

seedAdmin()
