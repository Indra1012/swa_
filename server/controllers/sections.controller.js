const HealingTechnique = require('../models/HealingTechnique')
const Testimonial = require('../models/Testimonial')
const Stat = require('../models/Stat')
const FAQ = require('../models/FAQ')
const GalleryItem = require('../models/GalleryItem')
const Settings = require('../models/Settings')
const { cloudinary } = require('../config/cloudinary')

// =====================================================================
//  HEALING TECHNIQUES  &  WELLBEING PROCESSES
// =====================================================================
const getTechniques = async (req, res, next) => {
  try {
    const { category } = req.params
    let items = await HealingTechnique.find({ category }).sort({ order: 1, createdAt: 1 })

    if (items.length === 0) {
      if (category === 'wellbeing') {
        const defaults = [
          { order: 1, title: 'Body Scan Meditation', subtitle: 'Focus', readMoreText: 'Mentally scan your entire body, releasing tension at every point.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', category: 'wellbeing' },
          { order: 2, title: 'Gratitude Reflection', subtitle: 'Mindset', readMoreText: 'A daily habit of listing what you are grateful for.', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80', category: 'wellbeing' },
          { order: 3, title: 'Deep Breathing', subtitle: 'Calm', readMoreText: 'Structured breathing exercises designed to lower heart rate.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', category: 'wellbeing' }
        ]
        await HealingTechnique.insertMany(defaults)
      }
      items = await HealingTechnique.find({ category }).sort({ order: 1, createdAt: 1 })
    }

    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createTechnique = async (req, res, next) => {
  try {
    const item = await HealingTechnique.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateTechnique = async (req, res, next) => {
  try {
    const item = await HealingTechnique.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteTechnique = async (req, res, next) => {
  try {
    const item = await HealingTechnique.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => { })
    }
    await HealingTechnique.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

const uploadTechniqueImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const item = await HealingTechnique.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    // Delete old image from Cloudinary if exists
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => { })
    }
    item.image = req.file.path
    item.publicId = req.file.filename
    await item.save()
    res.json({ message: 'Image uploaded', item })
  } catch (err) { next(err) }
}

const uploadTechniqueImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' })
    const item = await HealingTechnique.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    
    const isVideoUpload = req.files[0].mimetype && req.files[0].mimetype.startsWith('video/')
    
    if (isVideoUpload) {
      // Clear all existing images for video upload
      if (item.images && item.images.length > 0) {
        for (const img of item.images) {
          if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => { })
        }
      } else if (item.publicId) {
        const oldIsVideo = item.mediaMode === 'video'
        await cloudinary.uploader.destroy(item.publicId, { resource_type: oldIsVideo ? 'video' : 'image' }).catch(() => { })
      }

      item.mediaMode = 'video'
      item.images = []
      item.image = req.files[0].path
      item.publicId = req.files[0].filename
    } else {
      item.mediaMode = 'image'
      
      if (item.category === 'healing') {
        // Enforce max 1 editable image: delete any old ones when adding a new one
        if (item.images && item.images.length > 0) {
          for (const img of item.images) {
            if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => { })
          }
        }
        const newImages = req.files.map(file => ({
          url: file.path,
          publicId: file.filename
        }))
        item.images = newImages.slice(0, 1)
      } else {
        // Keep old images for other categories
        if (!Array.isArray(item.images)) item.images = []
        const newImages = req.files.map(file => ({
          url: file.path,
          publicId: file.filename
        }))
        item.images = [...item.images, ...newImages].slice(0, 3) // Protect max 3
      }
      if (item.images.length > 0) {
        item.image = item.images[0].url;
        item.publicId = item.images[0].publicId;
      }
    }

    await item.save()
    res.json({ message: 'Media uploaded', item })
  } catch (err) { next(err) }
}

const deleteTechniqueSpecificImage = async (req, res, next) => {
  try {
    const item = await HealingTechnique.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ error: 'publicId required' });

    // Delete from cloudinary
    const isVideo = item.mediaMode === 'video';
    await cloudinary.uploader.destroy(publicId, { resource_type: isVideo ? 'video' : 'image' }).catch(() => {});

    // Remove from array tracking
    item.images = (item.images || []).filter(img => img.publicId !== publicId);
    
    // Fallbacks
    if (item.publicId === publicId) {
      if (item.images.length > 0) {
        item.image = item.images[0].url;
        item.publicId = item.images[0].publicId;
      } else {
        item.image = '';
        item.publicId = '';
        item.mediaMode = 'image';
      }
    }
    
    await item.save();
    res.json({ message: 'Image removed', item });
  } catch (err) { next(err) }
}

// =====================================================================
//  TESTIMONIALS
// =====================================================================
const getTestimonials = async (req, res, next) => {
  try {
    let items = await Testimonial.find().sort({ order: 1, createdAt: -1 })

    if (items.length === 0) {
      const defaults = [
        { order: 1, name: 'PayPal', rating: 5, quote: "SWA Didn't Just Support Us, They Transformed Us", text: "When we partnered with SWA, we had no idea just how transformative it would be. From the first session, it was clear they weren't just offering wellbeing — they were creating a space where our team could truly thrive." },
        { order: 2, name: 'Edelweiss', rating: 5, quote: "What Began as Wellbeing Became a Cultural Shift", text: "We were looking for something fresh and meaningful. What we got was a complete transformation of how our organization thinks about wellbeing and happiness." },
        { order: 3, name: 'LinkedIn', rating: 5, quote: "A Powerhouse of Professional Creativity", text: "SWA did an incredible job. The team's professionalism, dedication, and collaboration was noticed and greatly appreciated by employees across the board." },
        { order: 4, name: 'Amazon', rating: 5, quote: "Wellbeing at Scale, Done Right", text: "Implementing SWA across thousands of employees was seamless, impactful, and deeply human. A remarkable achievement we are proud of." },
        { order: 5, name: 'Flipkart', rating: 5, quote: "I Finally Feel Like I Matter at Work", text: "The sessions helped me understand my emotions and communicate better with my team. I feel genuinely supported for the first time in my career." },
        { order: 6, name: 'BPCL', rating: 5, quote: "This Changed How I See Myself", text: "I was skeptical at first, but the mindfulness and NLP tools gave me clarity I never had before. My anxiety has reduced significantly." },
        { order: 7, name: 'Blue Star', rating: 5, quote: "More Energy, More Joy, Every Day", text: "The wellbeing festivals and daily check-ins have completely changed my morning routine. I'm more productive and honestly, just happier." },
        { order: 8, name: 'Narayana Health', rating: 5, quote: "Real Tools for Real Life", text: "What I loved most was how practical everything was. These aren't just concepts — they're habits I now use daily both at work and home." }
      ]
      await Testimonial.insertMany(defaults)
      items = await Testimonial.find().sort({ order: 1, createdAt: -1 })
    }

    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// =====================================================================
//  STATS
// =====================================================================
const getStats = async (req, res, next) => {
  try {
    let items = await Stat.find().sort({ order: 1 })

    if (items.length === 0) {
      const defaults = [
        { order: 1, value: 450, suffix: '+', label: 'Organizations\nTransformed' },
        { order: 2, value: 2, suffix: 'L+', label: "People's Lives\nEmpowered" },
        { order: 3, value: 2, suffix: 'L+', label: 'Sessions\nConducted' },
        { order: 4, value: 1000, suffix: '+', label: 'Global Experts\n& Healers' },
        { order: 5, value: 102, suffix: '+', label: 'Cities\nImpacted' }
      ]
      await Stat.insertMany(defaults)
      items = await Stat.find().sort({ order: 1 })
    }

    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createStat = async (req, res, next) => {
  try {
    const item = await Stat.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateStat = async (req, res, next) => {
  try {
    const item = await Stat.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteStat = async (req, res, next) => {
  try {
    const item = await Stat.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// =====================================================================
//  FAQS
// =====================================================================
const getFaqs = async (req, res, next) => {
  try {
    let items = await FAQ.find().sort({ order: 1 })

    if (items.length === 0) {
      const defaults = [
        { question: 'What is SWA?', answer: 'SWA (Where Self Meets Its True Essence) is a holistic mental health and wellbeing company that brings science-backed programs to organizations, institutions, and communities. We blend ancient wisdom with modern psychology to create lasting wellbeing.', order: 1 },
        { question: 'How can we get started with SWA?', answer: "Getting started is simple. Click 'Book a Demo' and our team will schedule a discovery call to understand your needs and recommend the right program for you.", order: 2 },
        { question: 'What kind of wellbeing programs do you offer?', answer: "We offer Wellbeing Festivals, Zen Space design, Employee Happiness Programs, Wellbeing Retreats, Self-Experiential Programs, and 1-on-1 counselling — all customizable to your team.", order: 3 },
        { question: 'Who can benefit from SWA programs?', answer: 'Our programs are designed for corporate teams, educational institutions, healthcare organizations, and individuals. If you have people, we have a program for them.', order: 4 },
        { question: 'Do you work with remote or hybrid teams?', answer: 'Absolutely. We have robust virtual programs designed for remote and hybrid workforces, ensuring no one is left out of the wellbeing journey regardless of location.', order: 5 },
        { question: 'How do you measure program impact?', answer: 'We use pre and post assessments, employee feedback surveys, and engagement metrics. We share detailed impact reports with organizational partners after each engagement.', order: 6 }
      ]
      await FAQ.insertMany(defaults)
      items = await FAQ.find().sort({ order: 1 })
    }

    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createFaq = async (req, res, next) => {
  try {
    const item = await FAQ.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateFaq = async (req, res, next) => {
  try {
    const item = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteFaq = async (req, res, next) => {
  try {
    const item = await FAQ.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// =====================================================================
//  GALLERY
// =====================================================================
const getGallery = async (req, res, next) => {
  try {
    let items = await GalleryItem.find().sort({ order: 1, createdAt: -1 })

    if (items.length === 0) {
      const defaults = [
        { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', type: 'image', sizeVariant: 'landscape' },
        { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', type: 'image', sizeVariant: 'portrait' },
        { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', type: 'image', sizeVariant: 'medium' },
        { url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80', type: 'image', sizeVariant: 'small' },
        { url: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&q=80', type: 'image', sizeVariant: 'large' },
        { url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80', type: 'image', sizeVariant: 'small' },
        { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', type: 'image', sizeVariant: 'medium' },
        { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', type: 'image', sizeVariant: 'landscape' },
        { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80', type: 'image', sizeVariant: 'large' },
        { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', type: 'image', sizeVariant: 'portrait' }
      ]
      await GalleryItem.insertMany(defaults)
      items = await GalleryItem.find().sort({ order: 1, createdAt: -1 })
    }

    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createGalleryItem = async (req, res, next) => {
  try {
    const data = { ...req.body }
    // If file was uploaded via Cloudinary
    if (req.file) {
      data.url = req.file.path
      data.publicId = req.file.filename
      data.type = req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    }
    const item = await GalleryItem.create(data)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (item.publicId) {
      const rType = item.type === 'video' ? 'video' : 'image'
      await cloudinary.uploader.destroy(item.publicId, { resource_type: rType }).catch(() => { })
    }
    await GalleryItem.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// =====================================================================
//  SETTINGS — Wellbeing Section Toggle
// =====================================================================
const getWellbeingVisible = async (req, res, next) => {
  try {
    const val = await Settings.get('wellbeingVisible')
    res.json({ visible: val === 'true' })
  } catch (err) { next(err) }
}

const setWellbeingVisible = async (req, res, next) => {
  try {
    const { visible } = req.body
    await Settings.set('wellbeingVisible', String(!!visible))
    res.json({ message: 'Updated', visible: !!visible })
  } catch (err) { next(err) }
}

// =====================================================================
//  SERVICE CARDS (Our Expertise)
// =====================================================================
const ServiceCard = require('../models/ServiceCard')

const getServiceCards = async (req, res, next) => {
  try {
    let items = await ServiceCard.find().sort({ order: 1, createdAt: 1 })

    // Seed default cards if DB is entirely empty
    if (items.length === 0) {
      const defaults = [
        { typeSlug: 'corporate', title: 'Corporate Wellbeing', headline: 'Build a Resilient, High-Performing Workforce', description: 'Empower teams with structured wellbeing programs to reduce stress and drive performance.', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80', order: 1 },
        { typeSlug: 'education', title: 'Education Sector', headline: 'Emotionally Strong & Focused Students', description: 'Helping students and educators build emotional resilience for long-term success.', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80', order: 2 },
        { typeSlug: 'community', title: 'Community Spaces', headline: 'Healthier, More Resilient Communities', description: 'Driving wellbeing initiatives that help individuals manage stress and live balanced lives.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80', order: 3 },
        { typeSlug: 'government', title: 'Government Wellness', headline: 'Empowering Public Servants', description: 'Equipping government teams with the mental resilience needed to serve effectively.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80', order: 4 }
      ]
      await ServiceCard.insertMany(defaults)
      items = await ServiceCard.find().sort({ order: 1, createdAt: 1 })
    }

    res.json({ count: items.length, items })
  } catch (err) { next(err) }
}

const createServiceCard = async (req, res, next) => {
  try {
    const item = await ServiceCard.create(req.body)
    res.status(201).json({ message: 'Created', item })
  } catch (err) { next(err) }
}

const updateServiceCard = async (req, res, next) => {
  try {
    const item = await ServiceCard.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Updated', item })
  } catch (err) { next(err) }
}

const deleteServiceCard = async (req, res, next) => {
  try {
    const item = await ServiceCard.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => { })
    }
    await ServiceCard.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

const uploadServiceImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const item = await ServiceCard.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => { })
    }
    item.image = req.file.path
    item.publicId = req.file.filename
    item.mediaMode = req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    await item.save()
    res.json({ message: 'Media uploaded', item })
  } catch (err) { next(err) }
}



module.exports = {
  getTechniques, createTechnique, updateTechnique, deleteTechnique, uploadTechniqueImage, uploadTechniqueImages, deleteTechniqueSpecificImage,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getStats, createStat, updateStat, deleteStat,
  getFaqs, createFaq, updateFaq, deleteFaq,
  getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
  getWellbeingVisible, setWellbeingVisible,
  getServiceCards, createServiceCard, updateServiceCard, deleteServiceCard, uploadServiceImage
}
