import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function HeroSection() {
  const containerRef = useRef(null)
  const [mediaUrls, setMediaUrls] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mediaType, setMediaType] = useState('image') // 'image' | 'video'
  const [headline, setHeadline] = useState("It's time to bring the SWA Magic")
  const [subline, setSubline] = useState('to your place and people')
  const [btnHovered, setBtnHovered] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  const textDriftY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const scrollFade = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  useEffect(() => {
    const load = async () => {
      try {
        const now = Date.now()
        const [mediaRes, txtRes] = await Promise.all([
          axios.get(`${API}/api/media/hero?t=${now}`),
          axios.get(`${API}/api/content/hero?t=${now}`)
        ])

        const media = mediaRes.data.media || []
        const items = txtRes.data.items || []

        let savedMediaType = 'image'
        let savedMediaUrls = []

        items.forEach(item => {
          if (item.key === 'headline' && item.value?.trim()) setHeadline(item.value.trim())
          if (item.key === 'subline' && item.value?.trim()) setSubline(item.value.trim())
          if (item.key === 'mediaType') savedMediaType = item.value
          if (item.key === 'mediaUrl') {
            try {
              const parsed = JSON.parse(item.value)
              if (Array.isArray(parsed)) {
                savedMediaUrls = parsed.filter(u => u)
              } else {
                savedMediaUrls = [item.value]
              }
            } catch {
              savedMediaUrls = [item.value]
            }
          }
        })

        if (savedMediaType === 'link' && savedMediaUrls.length > 0) {
          const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(savedMediaUrls[0])
          setMediaType(isVideo ? 'video' : 'image')
          setMediaUrls(savedMediaUrls)

        } else if (savedMediaType === 'video') {
          const videoItem = media.find(m => m.type === 'video') || media[0]
          if (videoItem) {
            setMediaUrls([videoItem.url])
            setMediaType('video')
          } else {
            setMediaType('image')
            setMediaUrls(['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80'])
          }

        } else if (media.length > 0) {
          const imgItems = media.filter(m => m.type !== 'video')
          if (imgItems.length > 0) {
            setMediaUrls(imgItems.map(m => m.url).slice(0, 3))
            setMediaType('image')
          } else {
            setMediaType('image')
            setMediaUrls(['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80'])
          }
        } else {
          setMediaType('image')
          setMediaUrls(['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80'])
        }
      } catch {
        setMediaType('image')
        setMediaUrls(['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80'])
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (mediaType !== 'image' || mediaUrls.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % mediaUrls.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [mediaUrls, mediaType])

  // Render text with newline support (admin can press Enter in admin textarea)
  const renderLines = (text) =>
    text.split('\n').map((line, i, arr) => (
      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
    ))

  const fallbackImg = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80'

  return (
    <section
      id="hero"
      ref={containerRef}
      className="hero-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        background: '#4A2530'
      }}
    >
      <motion.div style={{ position: 'absolute', inset: -150, zIndex: 0, y: bgY }}>

        {/* VIDEO background (uploaded or link) */}
        {mediaType === 'video' && mediaUrls.length > 0 ? (
          <video
            key={mediaUrls[0]}
            src={mediaUrls[0]}
            autoPlay muted loop playsInline
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center'
            }}
          />
        ) : (
          /* IMAGE background carousel */
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
              src={mediaUrls[currentSlide] || fallbackImg}
              alt="SWA Wellbeing"
              loading="eager"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center', filter: 'brightness(1.05)'
              }}
            />
          </AnimatePresence>
        )}

        {/* Full-coverage Brand Color Overlay (like the screenshot) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(101, 50, 57, 0.45)' // Beautiful maroon tint over the whole image
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
        <motion.div style={{ y: textDriftY, opacity: scrollFade }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="hero-float-1">
              <h2 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(32px, 5vw, 64px)',
                fontWeight: 700,
                color: 'var(--white)',
                lineHeight: 1.2,
                letterSpacing: '0.5px',
                textShadow: '0 10px 40px rgba(0,0,0,0.6)',
                marginBottom: '32px'
              }}>
                {renderLines(headline)}
                <br />
                <span style={{ fontStyle: 'italic', fontWeight: 500, opacity: 0.9 }}>
                  {renderLines(subline)}
                </span>
              </h2>

              {/* Connect for happiness button — same style as CTABanner */}
              <button
                onClick={() => window.location.href = '/book-demo'}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                style={{
                  background: btnHovered ? 'rgba(242,228,213,0.3)' : 'rgba(242,228,213,0.15)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '2px solid rgba(242,228,213,0.7)',
                  color: 'var(--white)',
                  borderRadius: '50px',
                  padding: '14px 40px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transform: btnHovered ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.3s ease',
                  fontFamily: 'DM Sans, sans-serif',
                  textShadow: 'none'
                }}
              >
                Connect for happiness &nbsp;→
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .hero-float-1 { animation: heroFloat 4s ease-in-out infinite; }
        .hero-section { height: 75vh; min-height: 500px; }
        @media (max-width: 768px) {
          .hero-section { height: 80vh !important; min-height: 550px !important; }
        }
      `}</style>

      <motion.div
        style={{
          position: 'absolute', bottom: '24px', left: '50%',
          x: '-50%',
          color: 'var(--primary)', opacity: scrollFade, fontSize: '20px', zIndex: 1, fontWeight: 700
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
  )
}
