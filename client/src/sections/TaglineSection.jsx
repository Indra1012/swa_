import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const DEFAULT_WORDS = ['community', 'workplace', 'institution']

export default function TaglineSection() {
  const sectionRef = useRef(null)
  const [words, setWords] = useState(DEFAULT_WORDS)
  const [interval, setIntervalMs] = useState(1500)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.85, 1], [0.6, 1, 1, 0.95])
  const subOpacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0, 1, 1, 0])
  const subScale = useTransform(scrollYProgress, [0, 0.4, 0.85, 1], [0.55, 1, 1, 0.95])
  const subY = useTransform(scrollYProgress, [0, 1], [80, -40])

  // Fetch animated words from DB
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/content/tagline`)
        const items = res.data.items || []
        items.forEach(item => {
          if (item.key === 'animatedWords') {
            try { setWords(JSON.parse(item.value)) } catch {}
          }
          if (item.key === 'animationInterval') {
            const ms = parseInt(item.value)
            if (ms > 0) setIntervalMs(ms)
          }
        })
      } catch { /* use defaults */ }
    }
    load()
  }, [])

  // Cycle through words
  useEffect(() => {
    if (words.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % words.length)
    }, interval)
    return () => clearInterval(timer)
  }, [words, interval])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
    <section
      ref={sectionRef}
      className="tagline-section"
      style={{
        background: 'transparent',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        overflow: 'hidden',
        margin: 0,
        marginTop: -30
      }}
    >
      <motion.div 
        style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          y, opacity, scale
        }}
      >
        <div style={{
          width: '40px', height: '2px',
          background: 'var(--accent)',
          margin: '0 auto 32px',
          borderRadius: '2px',
          opacity: 0.6
        }} />

        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(40px, 5vw, 64px)',
          fontWeight: 700, 
          color: 'var(--dark)',
          lineHeight: 1.1, 
          marginBottom: '28px',
          letterSpacing: '-0.5px'
        }}>
          Bringing lasting wellness to your <br />
          <span style={{
            display: 'inline-block',
            position: 'relative',
            height: 'clamp(44px, 5.5vw, 70px)',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            minWidth: '200px'
          }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-block',
                  color: 'var(--secondary)',
                  fontStyle: 'italic',
                  fontWeight: 500
                }}
              >
                {words[activeIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h2>
      </motion.div>

      <motion.div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          y: subY,
          opacity: subOpacity,
          scale: subScale,
          textAlign: 'center'
        }}
      >
        <p 
          className="tagline-subtext"
          style={{
          color: 'var(--secondary)',
          maxWidth: '560px', 
          margin: '0 auto',
          opacity: 0.85,
          fontFamily: 'DM Sans, sans-serif'
        }}>
          We compassionately create wellness programs and mindfulness spaces
          to improve holistic wellbeing across every environment.
        </p>
      </motion.div>
      <style>{`
        .tagline-section { padding: 60px 60px 20px; }
        .tagline-subtext { font-size: 17px; line-height: 1.7; }
        
        @media (max-width: 768px) {
          .tagline-section { padding: 40px 20px 20px; }
          .tagline-subtext { font-size: 16px; line-height: 1.6; }
        }
      `}</style>
    </section>
    </div>
  )
}
