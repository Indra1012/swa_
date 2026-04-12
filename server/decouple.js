require('dotenv').config()
const mongoose = require('mongoose')
const HealingTechnique = require('./models/HealingTechnique')
const Content = require('./models/Content')

const healingDefaults = [
  { order: 1, title: 'Physical & Somatic', subtitle: 'Wellbeing', focus: 'Body awareness and stress release', readMoreText: 'Movement therapy\nBreathwork and grounding\nBody-scan meditation\nDietary and sleep regulation', purpose: 'Addresses physical symptoms of stress and promotes cellular recovery.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', mediaMode: 'image', images: [{url:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80'}], category: 'healing' },
  { order: 2, title: 'Emotional & Psychological', subtitle: 'Wellbeing', focus: 'Emotional regulation and resilience building', readMoreText: 'Cognitive reframing\nExpressive arts therapy\nMindfulness-based stress reduction (MBSR)\nJournaling and self-reflection', purpose: 'Helps navigate difficult emotions and fosters long-term emotional stability.', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80', mediaMode: 'image', images: [{url:'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80'}], category: 'healing' },
  { order: 3, title: 'Mental & Cognitive', subtitle: 'Wellbeing', focus: 'Clarity, focus, and mental reprogramming', readMoreText: 'Neuro-linguistic programming (NLP)\nGrowth mindset training\nFocus and attention exercises\nCognitive behavioral techniques', purpose: 'Enhances cognitive performance and breaks negative thought patterns.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', mediaMode: 'image', images: [{url:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80'}], category: 'healing' },
  { order: 4, title: 'Energy & Relaxation', subtitle: 'Practices', focus: 'Stress reduction and nervous system regulation', readMoreText: 'Sound & vibration healing\nGuided relaxation practices\nBreathwork and grounding techniques\nLifestyle stress-management practices', purpose: 'Supports relaxation, emotional balance, and recovery from daily stress.', image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80', mediaMode: 'image', images: [{url:'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80'}], category: 'healing' },
  { order: 5, title: 'Social & Community', subtitle: 'Wellbeing', focus: 'Relationships, belonging, and social connection', readMoreText: 'Peer support circles\nGroup reflection activities\nCommunication & relationship exercises\nCommunity engagement experiences', purpose: 'Strengthens social bonds and builds supportive environments for wellbeing.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', mediaMode: 'image', images: [{url:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'}], category: 'healing' },
  { order: 6, title: 'Nature & Environmental', subtitle: 'Wellbeing', focus: 'Connection with environment and sensory awareness', readMoreText: 'Nature-based therapy\nOutdoor mindfulness experiences\nSensory awareness activities\nEnvironmental reflection practices', purpose: 'Encourages grounding, creativity, and emotional restoration through nature.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80', mediaMode: 'image', images: [{url:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80'}], category: 'healing' }
]

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  
  // 1. Move existing 3 blogs from 'healing' to 'insights'
  const blogsToMove = ['Discipline vs Flow', 'How to Build Aligned Discipline', 'The Identity Shift Behind Consistency']
  await HealingTechnique.updateMany(
    { category: 'healing', title: { $in: blogsToMove } },
    { $set: { category: 'insights' } }
  )

  // 2. Restore the original 6 healing techniques ONLY if they don't exist
  const existingHealing = await HealingTechnique.countDocuments({ category: 'healing' })
  if (existingHealing === 0) {
    await HealingTechnique.insertMany(healingDefaults)
    console.log('Restored 6 original healing techniques.')
  }

  // 3. Setup insights headings in Content (copy from current healing or create new)
  await Content.findOneAndUpdate(
    { section: 'insights', key: 'title' },
    { value: 'Swa Insights' },
    { upsert: true }
  )
  await Content.findOneAndUpdate(
    { section: 'insights', key: 'subtitle' },
    { value: 'Reflections on growth, alignment, and coming home to yourself' },
    { upsert: true }
  )

  // 4. Reset original healing headings
  await Content.findOneAndUpdate(
    { section: 'healing', key: 'title' },
    { value: 'Healing Techniques...' },
    { upsert: true }
  )
  await Content.findOneAndUpdate(
    { section: 'healing', key: 'subtitle' },
    { value: 'Honest insights on stress, resilience, and the inner work behind lasting performance...' },
    { upsert: true }
  )

  console.log('Decoupled healing from insights gracefully.')
  await mongoose.disconnect()
}

run().catch(console.error)
