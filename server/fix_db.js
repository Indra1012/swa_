require('dotenv').config()
const mongoose = require('mongoose')
const HealingTechnique = require('./models/HealingTechnique')
const Content = require('./models/Content')

const snippets = {
  'Discipline vs Flow': "There is a silent war happening inside most of us. On one side Discipline appears - tight, unyielding, full of rules. A steady presence built on order and sharp edges. It tells you: “Wake up early. Push harder. Stay consistent.” On the other side flow sits - smooth, natural, completely in tune. Most folks land right there, caught in the middle. That fuzzy spot? It leaves them unsure. Besides having every planner filled, though, life still spills over. Even with strict schedules in place, somehow things slip. Here you are, yet something keeps pulling you away. Inside, a quiet distance grows.",
  'How to Build Aligned Discipline': "In part 1 we saw focusing too hard on willpower backfires and eventually breaks everything inside you. Here's where things actually get interesting. If not strength... then what? Discipline finds a home at Swa, just not one built on refusal. Because discipline doesn't feel like carrying heavy weights. Aligned discipline is not about controlling yourself. It is about understanding yourself deeply enough that your actions no longer need force. Now effort fades when motion takes its place. Stillness arrives once pushing stops. Each move follows without pressure.",
  'The Identity Shift Behind Consistency': "There is a deeper truth most people miss: Consistency is not built through discipline. It is built through identity. You don't struggle to do things because you lack motivation. You struggle because, somewhere within you, the person you believe you are is not aligned with what you are trying to do."
}

async function fix() {
  await mongoose.connect(process.env.MONGO_URI)
  
  // 1. Fix Headers
  await Content.findOneAndUpdate(
    { section: 'healing', key: 'title' },
    { value: 'Swa Insights' },
    { upsert: true }
  )
  await Content.findOneAndUpdate(
    { section: 'healing', key: 'subtitle' },
    { value: 'Reflections on growth, alignment, and coming home to yourself' },
    { upsert: true }
  )

  // 2. Add Snippets
  const blogs = await HealingTechnique.find({ category: 'healing' })
  for (let b of blogs) {
    if (snippets[b.title]) {
      b.snippet = snippets[b.title]
      await b.save()
    }
  }

  console.log('Fixed Headings and set snippets')
  await mongoose.disconnect()
}
fix().catch(e => { console.error(e); process.exit(1) })
