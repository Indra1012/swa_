const mongoose = require('mongoose')
require('dotenv').config()
const Testimonial = require('../models/Testimonial')

const BRANDS = [
  {
    name: 'L.D. College of Engineering',
    rating: 5,
    quote: 'Driving Technical Excellence',
    text: 'One of Gujarat’s top government engineering colleges, established in 1948. It is known for strong technical education, placements, and alumni network in core and IT sectors.'
  },
  {
    name: 'Ahmedabad University',
    rating: 5,
    quote: 'Fostering Global Innovation',
    text: 'A private research-focused university offering interdisciplinary programs in engineering, management, and humanities. It emphasizes innovation, global exposure, and liberal education.'
  },
  {
    name: 'MY Bharat',
    rating: 5,
    quote: 'Empowering Next-Gen Leaders',
    text: 'A Government of India initiative aimed at empowering youth through nation-building activities. It provides opportunities for volunteering, skill development, and civic engagement.'
  },
  {
    name: 'Nehru Yuva Kendra Sangathan',
    rating: 5,
    quote: 'Grassroots Youth Development',
    text: 'The world’s largest grassroots youth organization under the Ministry of Youth Affairs & Sports. It focuses on rural youth development through clubs, leadership programs, and social campaigns.'
  },
  {
    name: "Blind People's Association",
    rating: 5,
    quote: 'Championing True Inclusion',
    text: 'A leading NGO in Ahmedabad working for education, training, and rehabilitation of visually impaired individuals. It helps them achieve independence through skill development and inclusive programs.'
  },
  {
    name: 'National Service Scheme',
    rating: 5,
    quote: 'Service to the Nation',
    text: 'A government-backed student volunteer program aimed at personality development through community service. Students participate in social work, environmental activities, and rural development projects.'
  },
  {
    name: 'Gandhinagar Municipal Corporation',
    rating: 5,
    quote: 'Building Sustainable Cities',
    text: 'The governing civic body responsible for infrastructure, sanitation, and public services in Gandhinagar. It manages urban development and ensures smooth functioning of city operations.'
  },
  {
    name: 'Bar Council of Gujarat',
    rating: 5,
    quote: 'Upholding Legal Integrity',
    text: 'A statutory body that regulates legal education and professional conduct of lawyers in Gujarat. It enrolls advocates and ensures ethical standards in the legal profession.'
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to DB...')
    await Testimonial.deleteMany({})
    console.log('Cleared old testimonials...')
    
    // Add position based on index to maintain order if schema has it
    const docs = BRANDS.map((b, i) => ({ ...b, position: i }))
    await Testimonial.insertMany(docs)
    console.log('Inserted 8 Brands successfully!')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
seed()
