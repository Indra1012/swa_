import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function HeroSection() {
  const containerRef = useRef(null)
  const [heroImage, setHeroImage] = useState('')
  const [headline, setHeadline] = useState("It's time to bring the SWA Magic")
  const [subline, setSubline] = useState('to your place and people')

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
        // Load hero image from media
        const imgRes = await axios.get(`${API}/api/media/hero`)
        const media = imgRes.data.media || []
        if (media.length > 0) setHeroImage(media[0].url)

        // Load text content
        const txtRes = await axios.get(`${API}/api/content/hero`)
        const items = txtRes.data.items || []
        items.forEach(item => {
          if (item.key === 'headline') setHeadline(item.value)
          if (item.key === 'subline') setSubline(item.value)
        })
      } catch { /* use defaults */ }
    }
    load()
  }, [])

  // If no DB image, use Unsplash fallback
  const imgSrc = heroImage || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80'

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
        <motion.img
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          src={imgSrc}
          alt="SWA Wellness"
          loading="eager"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center', filter: 'brightness(1.05)'
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(101,50,57,0.15) 0%, rgba(101,50,57,0.08) 40%, rgba(101,50,57,0.75) 100%)'
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
                lineHeight: 1.1,
                letterSpacing: '0.5px',
                textShadow: '0 10px 40px rgba(0,0,0,0.6)'
              }}>
                {headline}<br />
                <span style={{ fontStyle: 'italic', fontWeight: 500, opacity: 0.9 }}>{subline}</span>
              </h2>
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
        .hero-section { height: 100vh; min-height: 600px; }
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
