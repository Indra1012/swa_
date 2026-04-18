const mongoose = require('mongoose')
require('dotenv').config()
const Content = require('../models/Content')

async function updateTitle() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to DB...')
    
    await Content.findOneAndUpdate(
      { section: 'testimonials', key: 'title' },
      { value: 'Our Network & Impact' },
      { upsert: true }
    )
    
    await Content.findOneAndUpdate(
      { section: 'testimonials', key: 'subtitle' },
      { value: 'We are honored to have collaborated with and empowered these prestigious institutions, organizations, and civic bodies.' },
      { upsert: true }
    )

    console.log('Testimonials title and subtitle updated!')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
updateTitle()
