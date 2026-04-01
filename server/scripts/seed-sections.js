/**
 * Seed script — populates MongoDB with existing hardcoded data
 * Run once: node scripts/seed-sections.js
 */
require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')

const HealingTechnique = require('../models/HealingTechnique')
const Testimonial      = require('../models/Testimonial')
const Stat             = require('../models/Stat')
const FAQ              = require('../models/FAQ')
const Settings         = require('../models/Settings')

// ── EXISTING HARDCODED DATA ──────────────────────────────────────

const TECHNIQUES = [
  { category: 'healing', title: 'Psychological Wellness', subtitle: 'Mind', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', readMoreText: 'Helps individuals understand their thoughts, build resilience, and develop healthier mental patterns through Eastern & Western Psychology, CBT, Psychotherapy, Positive Psychology, and NLP.', order: 0 },
  { category: 'healing', title: 'Emotional Expression', subtitle: '& Healing', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', readMoreText: 'Allows individuals to process emotions safely and develop emotional intelligence through Expressive Art Therapies, Play-based therapies, Storytelling, and Inner child healing.', order: 1 },
  { category: 'healing', title: 'Body & Somatic', subtitle: 'Wellness', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', readMoreText: 'Helps release stored stress, regulate the nervous system, and reconnect with the body through Somatic awareness, Body-mind therapies, Movement practices, Zumba and yoga.', order: 2 },
  { category: 'healing', title: 'Energy & Relaxation', subtitle: 'Practices', image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80', readMoreText: 'Supports relaxation, emotional balance, and recovery from daily stress through Sound & vibration healing, Guided relaxation, Breathwork, and Lifestyle stress-management.', order: 3 },
  { category: 'healing', title: 'Social & Community', subtitle: 'Wellness', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', readMoreText: 'Strengthens social bonds and builds supportive environments through Peer support circles, Group reflection, Communication exercises, and Community engagement.', order: 4 },
  { category: 'healing', title: 'Nature & Environmental', subtitle: 'Wellness', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80', readMoreText: 'Encourages grounding, creativity, and emotional restoration through Nature-based therapy, Outdoor mindfulness, Sensory awareness, and Environmental reflection.', order: 5 },
]

const TESTIMONIALS = [
  { name: 'PayPal', rating: 5, quote: "SWA Didn't Just Support Us, They Transformed Us", text: "When we partnered with SWA, we had no idea just how transformative it would be. From the first session, it was clear they weren't just offering wellbeing — they were creating a space where our team could truly thrive.", order: 0 },
  { name: 'Edelweiss', rating: 5, quote: "What Began as Wellness Became a Cultural Shift", text: "We were looking for something fresh and meaningful. What we got was a complete transformation of how our organization thinks about wellness and happiness.", order: 1 },
  { name: 'LinkedIn', rating: 5, quote: "A Powerhouse of Professional Creativity", text: "SWA did an incredible job. The team's professionalism, dedication, and collaboration was noticed and greatly appreciated by employees across the board.", order: 2 },
  { name: 'Amazon', rating: 5, quote: "Wellness at Scale, Done Right", text: "Implementing SWA across thousands of employees was seamless, impactful, and deeply human. A remarkable achievement we are proud of.", order: 3 },
  { name: 'Flipkart', rating: 5, quote: "I Finally Feel Like I Matter at Work", text: "The sessions helped me understand my emotions and communicate better with my team. I feel genuinely supported for the first time in my career.", order: 4 },
  { name: 'BPCL', rating: 5, quote: "This Changed How I See Myself", text: "I was skeptical at first, but the mindfulness and NLP tools gave me clarity I never had before. My anxiety has reduced significantly.", order: 5 },
  { name: 'Blue Star', rating: 5, quote: "More Energy, More Joy, Every Day", text: "The wellness festivals and daily check-ins have completely changed my morning routine. I'm more productive and honestly, just happier.", order: 6 },
  { name: 'Narayana Health', rating: 5, quote: "Real Tools for Real Life", text: "What I loved most was how practical everything was. These aren't just concepts — they're habits I now use daily both at work and home.", order: 7 },
]

const STATS = [
  { value: 450, suffix: '+', label: 'Organizations\nTransformed', order: 0 },
  { value: 2, suffix: 'L+', label: "People's Lives\nEmpowered", order: 1 },
  { value: 2, suffix: 'L+', label: 'Sessions\nConducted', order: 2 },
  { value: 1000, suffix: '+', label: 'Global Experts\n& Healers', order: 3 },
  { value: 102, suffix: '+', label: 'Cities\nImpacted', order: 4 },
]

const FAQS = [
  { question: 'What is SWA?', answer: 'SWA (Where Self Meets Its True Essence) is a holistic mental health and wellness company that brings science-backed programs to organizations, institutions, and communities. We blend ancient wisdom with modern psychology to create lasting wellbeing.', order: 0 },
  { question: 'How can we get started with SWA?', answer: "Getting started is simple. Click 'Book a Demo' and our team will schedule a discovery call to understand your needs and recommend the right program for you.", order: 1 },
  { question: 'What kind of wellness programs do you offer?', answer: "We offer Wellness Festivals, Zen Space design, Employee Happiness Programs, Wellness Retreats, Self-Experiential Programs, and 1-on-1 counselling — all customizable to your team.", order: 2 },
  { question: 'Who can benefit from SWA programs?', answer: 'Our programs are designed for corporate teams, educational institutions, healthcare organizations, and individuals. If you have people, we have a program for them.', order: 3 },
  { question: 'Do you work with remote or hybrid teams?', answer: 'Absolutely. We have robust virtual programs designed for remote and hybrid workforces, ensuring no one is left out of the wellness journey regardless of location.', order: 4 },
  { question: 'How do you measure program impact?', answer: 'We use pre and post assessments, employee feedback surveys, and engagement metrics. We share detailed impact reports with organizational partners after each engagement.', order: 5 },
]

async function seed() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    // Only seed if collections are empty (don't overwrite existing data)
    const techCount = await HealingTechnique.countDocuments()
    if (techCount === 0) {
      await HealingTechnique.insertMany(TECHNIQUES)
      console.log('Seeded', TECHNIQUES.length, 'healing techniques')
    } else {
      console.log('Healing techniques already exist, skipping')
    }

    const testCount = await Testimonial.countDocuments()
    if (testCount === 0) {
      await Testimonial.insertMany(TESTIMONIALS)
      console.log('Seeded', TESTIMONIALS.length, 'testimonials')
    } else {
      console.log('Testimonials already exist, skipping')
    }

    const statCount = await Stat.countDocuments()
    if (statCount === 0) {
      await Stat.insertMany(STATS)
      console.log('Seeded', STATS.length, 'stats')
    } else {
      console.log('Stats already exist, skipping')
    }

    const faqCount = await FAQ.countDocuments()
    if (faqCount === 0) {
      await FAQ.insertMany(FAQS)
      console.log('Seeded', FAQS.length, 'FAQs')
    } else {
      console.log('FAQs already exist, skipping')
    }

    // Set wellbeing toggle to false by default
    const existing = await Settings.get('wellbeingVisible')
    if (existing === null) {
      await Settings.set('wellbeingVisible', 'false')
      console.log('Set wellbeingVisible = false')
    }

    console.log('Seed complete!')
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seed()
