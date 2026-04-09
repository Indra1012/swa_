const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const Slot = require('../models/Slot.js')

const MONGODB_URI = process.env.MONGO_URI

const cleanSlots = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to DB')

    const result = await Slot.deleteMany({ isBooked: false })
    
    console.log(`Successfully deleted ${result.deletedCount} legacy unbooked slots!`)
    process.exit(0)
  } catch (error) {
    console.error('Error cleaning slots:', error)
    process.exit(1)
  }
}

cleanSlots()
