import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiChevronDown } from 'react-icons/fi'
import WhyUsSection from '../sections/WhyUsSection'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

// Pure Scroll-Driven Kinetic Typography Wrapper
const KineticWrap = ({ children, yStart = 80, yEnd = -40, scaleStart = 0.90, style }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "end start"]
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })
  const y = useTransform(smooth, [0, 0.4, 1], [yStart, 0, yEnd])
  const scale = useTransform(smooth, [0, 0.3, 1], [scaleStart, 1, 1])
  const opacity = useTransform(smooth, [0, 0.25, 1], [0, 1, 1])

  return (
    <motion.div ref={ref} style={{ ...style, y, scale, opacity }}>
      {children}
    </motion.div>
  )
}

// Floating Expandable Button ported from ServicesPage
const ExpandableCard = ({ title, delay, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      style={{
        background: 'rgba(250, 248, 245, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: isOpen ? '0 20px 40px rgba(0,0,0,0.06)' : '0 10px 20px rgba(0,0,0,0.03)',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
        border: '1px solid rgba(0,0,0,0.02)'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ padding: 'clamp(20px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--dark)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
          {title}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          style={{ color: isOpen ? 'var(--accent)' : 'var(--dark)' }}
        >
          <FiChevronDown size={22} />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 clamp(20px, 4vw, 32px) clamp(20px, 4vw, 32px) clamp(20px, 4vw, 32px)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


export default function About() {
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const [teamList, setTeamList] = useState([])
  const [expertsList, setExpertsList] = useState([])
  const [heroSlides, setHeroSlides] = useState([
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2000'
  ])
  const [heroMediaMode, setHeroMediaMode] = useState('image')
  const [heroVideoUrl, setHeroVideoUrl] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  const [pageData, setPageData] = useState({
    heroTitle: 'The SWA Story',
    heroLine1: 'Master your emotions.',
    heroLine2: 'Lead with clarity.',
    storyTitle: 'Our Story',
    storySubtitle: 'Where It All Began',
    storyQuote: '"SWA was born from one simple, undeniable truth — people are not machines."',
    storyP1: 'In a world obsessed with productivity and performance metrics, something deeply human was being lost. The stress was visible. The burnout was real. And yet, the systems meant to support people kept treating symptoms — never roots.',
    storyP2: 'Every program. Every session. Every technique at SWA carries the same intention: to help people think clearly, feel strongly, and perform consistently — from the inside out.',
    visionTitle: 'OUR VISION',
    visionQuote: '"To build a world where emotional wellbeing and resilience are the foundation of human performance."',
    visionBullets: 'Workplaces that are not just productive, but mentally strong\nInstitutions that nurture intellect and emotional balance\nIndividuals who don\'t just survive — but truly thrive',
    missionTitle: 'OUR MISSION',
    missionQuote: '"To move people beyond awareness — into real, lasting transformation."',
    missionBullets: 'Manage stress before it manages them\nBuild emotional strength that holds under pressure\nSustain high performance without burning out\nCultivate deep self-awareness to lead with unwavering clarity',
    founderName: 'Dhruvi Shah',
    founderTitle: 'Founder & Head Coach',
    founderBio1: 'Dhruvi Shah is the Founder and Head Wellbeing Coach at SWA Wellbeing. With a deeply rooted background in psychology, a diploma in expressive art therapy, and rich experience as an international sound healer, she brings a uniquely holistic and integrative approach to modern mental well-being.',
    founderBio2: 'Her expertise extensively spans mental health wellbeing, Indian psychology, and leadership development—masterfully blending traditional ancient wisdom with structured contemporary practices.',
    founderBioQuote: 'Dhruvi is driven by a clear mission: to help individuals understand and master their emotions before those emotions begin to shape their decisions—enabling more balanced, self-aware, and effective leadership.',
    founderImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80'
  })

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/content/about`),
      axios.get(`${API}/api/content/aboutHero`),
      axios.get(`${API}/api/media/founder`),
      axios.get(`${API}/api/media/aboutHero`),
      axios.get(`${API}/api/team`)
    ])
      .then(([contentRes, heroContentRes, mediaRes, heroMediaRes, teamRes]) => {
        const items = contentRes.data.items || contentRes.data || []
        const mapped = {}
        items.forEach(i => mapped[i.key] = i.value)

        const media = mediaRes.data.media || []
        if (media.length > 0) {
          mapped.founderImage = media[media.length - 1].url
        }

        setPageData(prev => ({ ...prev, ...mapped }))

        const allMembers = teamRes.data.items || []
        setTeamList(allMembers.filter(m => m.category === 'team').sort((a, b) => a.order - b.order))
        setExpertsList(allMembers.filter(m => m.category === 'expert').sort((a, b) => a.order - b.order))

        const heroItems = heroContentRes.data.items || heroContentRes.data || []
        let mMode = 'image'
        heroItems.forEach(i => { if (i.key === 'mediaType') mMode = i.value })
        setHeroMediaMode(mMode)

        const heroMedias = heroMediaRes.data.media || []
        const imgs = heroMedias.filter(m => m.type !== 'video').map(m => m.url)
        const vid = heroMedias.find(m => m.type === 'video')
        if (imgs.length > 0) setHeroSlides(imgs)
        if (vid) setHeroVideoUrl(vid.url)
      }).catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (heroSlides.length > 1 && heroMediaMode === 'image') {
      const timer = setInterval(() => setCurrentSlide(p => (p + 1) % heroSlides.length), 5000)
      return () => clearInterval(timer)
    }
  }, [heroSlides.length, heroMediaMode])

  const formatItalicLastWord = (text) => {
    if (!text) return null
    const words = text.split(' ')
    if (words.length <= 1) return text
    const last = words.pop()
    return <>{words.join(' ')} <span style={{ fontStyle: 'italic', fontWeight: 500, opacity: 0.9 }}>{last}</span></>
  }

  // Scroll bindings specifically for the top Hero parallax where viewport is initially 0
  const { scrollY } = useScroll()
  const smoothY = useSpring(scrollY, { stiffness: 60, damping: 20 })
  const heroY = useTransform(smoothY, [0, 800], [0, 300])
  const heroTextOpacity = useTransform(smoothY, [0, 400], [1, 0])
  const heroTextScale = useTransform(smoothY, [0, 400], [1, 0.95])
  const heroTextY = useTransform(smoothY, [0, 400], [0, 100])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <main ref={pageRef} className="about-page" style={{ margin: 0, padding: 0, paddingTop: '72px', minHeight: '100vh', overflow: 'hidden' }}>

          {/* 1. EPIC LIGHT AESTHETIC HERO BANNER */}
          <section className="about-hero-section" style={{
            position: 'relative', width: '100%',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            overflow: 'hidden', background: '#4A2530', margin: 0
          }}>
            <motion.div style={{ position: 'absolute', inset: -150, zIndex: 0, y: heroY }}>
              {heroMediaMode === 'video' && heroVideoUrl ? (
                <video
                  src={heroVideoUrl}
                  autoPlay loop muted playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(1.05)' }}
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    src={heroSlides[currentSlide]}
                    alt="SWA Wellbeing Team"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(1.05)' }}
                  />
                </AnimatePresence>
              )}
              {/* Full-coverage Brand Color Overlay (like the screenshot) */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(101, 50, 57, 0.45)'
              }} />

              {/* Gradient fade at bottom for text readability */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(85, 58, 61, 0.1) 40%, rgba(161, 96, 103, 0.85) 100%)'
              }} />
            </motion.div>

            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center', width: '100%', padding: '0 20px', zIndex: 1
            }}>
              <motion.div
                style={{ opacity: heroTextOpacity, y: heroTextY }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="hero-float-1">
                    <span style={{
                      display: 'inline-block', fontSize: '13px', fontWeight: 800, color: 'var(--white)',
                      letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '24px',
                      textShadow: '0 2px 10px rgba(0,0,0,0.8)', opacity: 0.9
                    }}>
                      {pageData.heroTitle}
                    </span>
                    <h1 style={{
                      fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 5vw, 64px)',
                      fontWeight: 700, color: 'var(--white)', lineHeight: 1.2, letterSpacing: '0.5px', marginBottom: '10px',
                      textShadow: '0 10px 40px rgba(0,0,0,0.6)'
                    }}>
                      {formatItalicLastWord(pageData.heroLine1)}
                    </h1>
                    <h1 style={{
                      fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 5vw, 64px)',
                      fontWeight: 700, color: 'var(--white)', lineHeight: 1.2, letterSpacing: '0.5px',
                      textShadow: '0 10px 40px rgba(0,0,0,0.6)'
                    }}>
                      {formatItalicLastWord(pageData.heroLine2)}
                    </h1>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              style={{
                position: 'absolute', bottom: '24px', left: '50%',
                x: '-50%',
                color: 'var(--primary)', opacity: heroTextOpacity, fontSize: '20px', zIndex: 1, fontWeight: 700
              }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                ↓
              </motion.div>
            </motion.div>
          </section>

          {/* 1.5. WHERE IT ALL BEGAN (OUR STORY) */}
          <section style={{ background: 'transparent', padding: '100px 0 0px', margin: 0 }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 40px)' }}>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center', marginBottom: '60px' }}
              >
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px, 5vw, 56px)', color: 'var(--dark)', margin: '0 auto 16px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                  {pageData.storyTitle}
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '24px', display: 'block' }}>
                  {pageData.storySubtitle}
                </span>
              </motion.div>

              {/* Light Frosted Hero Card */}
              <KineticWrap yStart={30} style={{
                background: 'rgba(250, 248, 245, 0.95)', backdropFilter: 'blur(20px)',
                padding: 'clamp(40px, 6vw, 60px)', borderRadius: '24px', marginBottom: '40px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(204,199,185,0.25)'
              }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(20px, 3vw, 24px)', color: 'var(--dark)', fontStyle: 'italic', marginBottom: '20px', fontWeight: 600, lineHeight: 1.5 }}>
                  {pageData.storyQuote}
                </h3>
                <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: 'var(--dark)', lineHeight: 1.8, fontWeight: 500, margin: 0 }}>
                  {pageData.storyP1}
                </p>
              </KineticWrap>

              {/* Middle text box - Frosted Hover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ y: -5, boxShadow: '0 30px 60px rgba(0,0,0,0.06)' }}
                style={{
                  padding: 'clamp(32px, 5vw, 40px)', textAlign: 'center', marginBottom: '60px',
                  background: 'rgba(250, 248, 245, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(204,199,185,0.25)',
                  transition: 'all 0.4s ease'
                }}
              >
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(20px, 3vw, 24px)', color: 'var(--dark)', fontStyle: 'italic', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                  {pageData.storyP2}
                </p>
              </motion.div>

              {/* Vision / Mission Light Frosted Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '40px', marginBottom: '0px', alignItems: 'start' }}>
                <ExpandableCard title={pageData.visionTitle} delay={0}>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: 'var(--dark)', fontStyle: 'italic', lineHeight: 1.4, marginBottom: '24px', marginTop: 0 }}>
                    {pageData.visionQuote}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(pageData.visionBullets || '').split('\n').filter(Boolean).map((txt, i) => (
                      <li key={i} style={{ position: 'relative', paddingLeft: '24px', marginBottom: '16px', fontSize: '15px', color: 'var(--dark)', fontWeight: 500, lineHeight: 1.6 }}>
                        <div style={{ position: 'absolute', left: 0, top: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                        {txt.trim()}
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>

                <ExpandableCard title={pageData.missionTitle} delay={0.1}>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: 'var(--dark)', fontStyle: 'italic', lineHeight: 1.4, marginBottom: '24px', marginTop: 0 }}>
                    {pageData.missionQuote}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(pageData.missionBullets || '').split('\n').filter(Boolean).map((txt, i) => (
                      <li key={i} style={{ position: 'relative', paddingLeft: '24px', marginBottom: '16px', fontSize: '15px', color: 'var(--dark)', fontWeight: 500, lineHeight: 1.6 }}>
                        <div style={{ position: 'absolute', left: 0, top: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                        {txt.trim()}
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>
              </div>

            </div>
          </section>

          {/* 4.5. CORE PHILOSOPHY */}
          <WhyUsSection />

          {/* Moved text */}
          <section style={{ background: 'transparent', padding: '0 0 80px', margin: 0 }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 40px)' }}>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                style={{ textAlign: 'center' }}
              >
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(22px, 3vw, 26px)', color: 'var(--secondary)', fontStyle: 'italic', margin: 0 }}>
                  Because lasting success begins from within.
                </p>
              </motion.div>
            </div>
          </section>

          {/* 2. ELEVATED FOUNDER HIGHLIGHT */}
          <section style={{ background: 'transparent', padding: '80px 0', margin: 0 }}>
            <div style={{ padding: '0 clamp(20px, 4vw, 40px)', maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 'clamp(40px, 8vw, 80px)', alignItems: 'center'
              }}>
                {/* Stunning Portrait with floating backdrop */}
                {/* Stunning Portrait with floating backdrop */}
                <KineticWrap yStart={80} style={{ position: 'relative', width: '100%', maxWidth: '420px', aspectRatio: '4/5', margin: '0 auto', borderRadius: '32px' }}>
                  {/* Floating abstract decorative box behind */}
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', top: '-15px', left: '-15px', width: '100%', height: '100%',
                      background: 'rgba(175,122,109,0.1)', borderRadius: '32px', zIndex: 0
                    }}
                  />
                  {/* The Image */}
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '32px', overflow: 'hidden',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.15)', position: 'relative', zIndex: 1
                  }}>
                    <img
                      src={pageData.founderImage}
                      alt={pageData.founderName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                    />
                  </div>
                  {/* Floating name badge - fluid position instead of crashing negative values */}
                  <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', bottom: 'clamp(20px, 5vw, 40px)', left: 'clamp(-10px, -2vw, -30px)',
                      background: 'rgba(250, 248, 245, 0.95)', backdropFilter: 'blur(20px)',
                      padding: 'clamp(16px, 3vw, 20px) clamp(24px, 4vw, 32px)', borderRadius: '20px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)', zIndex: 2
                    }}
                  >
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(22px, 4vw, 26px)', color: 'var(--dark)', marginBottom: '4px' }}>
                      {pageData.founderName}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--dark)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
                      {pageData.founderTitle}
                    </p>
                  </motion.div>
                </KineticWrap>

                {/* Deep Bio Content */}
                <KineticWrap yStart={120}>


                  <div style={{
                    padding: 'clamp(24px, 4vw, 32px)', background: 'rgba(250, 248, 245, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(204,199,185,0.25)',
                    marginBottom: '24px'
                  }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(18px, 3vw, 20px)', color: 'var(--dark)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '20px', marginTop: 0, fontWeight: 600 }}>
                      {pageData.founderBio1}
                    </p>

                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(18px, 3vw, 20px)', color: 'var(--dark)', fontStyle: 'italic', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                      {pageData.founderBio2}
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ y: -5, boxShadow: '0 30px 60px rgba(0,0,0,0.06)' }}
                    style={{
                      padding: 'clamp(24px, 4vw, 32px)', background: 'rgba(250, 248, 245, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', position: 'relative',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(204,199,185,0.25)',
                      transition: 'all 0.4s ease'
                    }}
                  >
                    <span style={{ position: 'absolute', top: -10, left: 30, fontSize: '80px', color: 'var(--accent)', opacity: 0.15, fontFamily: 'serif', lineHeight: 1 }}>"</span>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(18px, 3vw, 20px)', color: 'var(--dark)', fontStyle: 'italic', lineHeight: 1.5, margin: 0, position: 'relative', zIndex: 1, fontWeight: 600
                    }}>
                      {pageData.founderBioQuote}
                    </p>
                  </motion.div>
                </KineticWrap>
              </div>
            </div>
          </section>



          {/* 4. THE TEAM GALLERY WITH CONSTANT FLOATING ANIMATIONS */}
          <section style={{ background: 'transparent', padding: '80px 0 20px 0', margin: 0 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.25 } }
              }}
              style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', textAlign: 'center', marginBottom: '80px' }}
            >

              <motion.h2
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px, 5vw, 56px)', color: 'var(--dark)', margin: '16px 0 24px', fontWeight: 700, letterSpacing: '-0.5px' }}
              >
                Our <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Team</span>
              </motion.h2>
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{ fontSize: '18px', color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto' }}
              >
                The dedicated professionals driving organizational transformation and emotional resilience from within.
              </motion.p>
            </motion.div>

            <div className="team-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '32px', maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 40px)'
            }}>
              {teamList.map((member, i) => (
                <motion.div
                  key={member._id || i}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  animate={{ y: [0, (i % 2 === 0 ? -15 : 15), 0] }}
                  style={{
                    borderRadius: '24px', overflow: 'hidden', position: 'relative', height: i % 2 === 0 ? '320px' : '420px',
                    marginTop: i % 2 !== 0 ? '80px' : '0', boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
                  }}
                >
                  <img src={member.url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)'
                  }} />
                  <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: 'var(--white)' }}>
                    <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', marginBottom: '4px' }}>{member.name}</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, margin: 0 }}>{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 5. THE EXTERNAL EXPERTS GALLERY WITH CONSTANT FLOATING ANIMATIONS */}
          <section style={{ background: 'transparent', padding: '20px 0 20px 0', margin: 0 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.25 } }
              }}
              style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', textAlign: 'center', marginBottom: '80px' }}
            >
              <motion.h2
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px, 5vw, 56px)', color: 'var(--dark)', margin: '16px 0 24px', fontWeight: 700, letterSpacing: '-0.5px' }}
              >
                Our Global <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Experts</span>
              </motion.h2>
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{ fontSize: '18px', color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto' }}
              >
                A meticulously curated network of external psychological professionals, senior advisors, and distinguished healers offering specialized guidance.
              </motion.p>
            </motion.div>

            <div className="team-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '32px', maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 40px)'
            }}>
              {expertsList.map((member, i) => (
                <motion.div
                  key={member._id || i}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  animate={{ y: [0, (i % 2 === 0 ? -15 : 15), 0] }}
                  style={{
                    borderRadius: '24px', overflow: 'hidden', position: 'relative', height: i % 2 === 0 ? '320px' : '420px',
                    marginTop: i % 2 !== 0 ? '80px' : '0', boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
                  }}
                >
                  <img src={member.url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: 'var(--white)' }}>
                    <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', marginBottom: '4px' }}>{member.name}</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, margin: 0 }}>{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>





          {/* 6. CALL TO ACTION */}
          <section style={{ background: 'transparent', padding: '80px 0', margin: 0, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span style={{ fontSize: '11px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px', display: 'block' }}>Let's Collaborate</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px, 5vw, 56px)', color: 'var(--dark)', fontWeight: 700, letterSpacing: '-0.5px' }}>Transform your <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>environment</span> today.</h2>

              <button
                onClick={() => navigate('/book-demo')}
                style={{
                  marginTop: '40px', display: 'inline-flex', alignItems: 'center', gap: '12px',
                  padding: 'clamp(14px, 3vw, 20px) clamp(32px, 6vw, 48px)', background: 'var(--dark)', color: 'var(--white)',
                  borderRadius: '50px', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s ease', boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'
                  e.currentTarget.style.background = 'var(--dark2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)'
                  e.currentTarget.style.background = 'var(--dark)'
                }}
              >
                Work with us <FiArrowRight size={20} />
              </button>
            </motion.div>
          </section>

          <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .hero-float-1 { animation: heroFloat 4s ease-in-out infinite; }
        .about-hero-section { height: 75vh; min-height: 500px; }
        @media (max-width: 768px) {
          .about-hero-section { height: 80vh !important; min-height: 550px !important; }
        }
        @media (max-width: 900px) {
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

        </main>
      </div>
    </div>
  )
}
