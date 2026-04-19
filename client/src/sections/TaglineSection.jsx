import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const DEFAULT_WORDS = ['home','community', 'workplace', 'institution']

export default function TaglineSection() {
  const sectionRef = useRef(null)
  const [words, setWords] = useState(DEFAULT_WORDS)
  const [intervalMs, setIntervalMs] = useState(2500)
  const [activeIndex, setActiveIndex] = useState(0)
  const [clientLogos, setClientLogos] = useState([])
  const [logoTagline, setLogoTagline] = useState('Loved by leading organizations worldwide')
  const [logoVisible, setLogoVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [60, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.85, 1], [0.4, 1, 1, 0.95])
  const subOpacity = useTransform(scrollYProgress, [0, 0.3, 0.85, 1], [0, 1, 1, 0])
  const subScale = useTransform(scrollYProgress, [0, 0.5, 0.85, 1], [0.35, 1, 1, 0.95])
  const subY = useTransform(scrollYProgress, [0, 1], [80, 0])

  // Fetch animated words and client logos from DB
  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await axios.get(`${API}/api/content/tagline`)
        const items = res.data.items || []
        items.forEach(item => {
          if (item.key === 'animatedWords') {
            try { 
              const parsed = JSON.parse(item.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setWords(parsed);
              }
            } catch { }
          }
          if (item.key === 'animationInterval') {
            const ms = parseInt(item.value)
            if (ms > 0) setIntervalMs(ms)
          }
        })
      } catch { /* use defaults */ }
    }
    const loadLogos = async () => {
      try {
        const res = await axios.get(`${API}/api/client-logos`)
        if (res.data.items && res.data.items.length > 0) {
          setClientLogos(res.data.items)
        }
        const tRes = await axios.get(`${API}/api/content/client-logos`)
        const tItems = tRes.data.items || []
        const tLine = tItems.find(i => i.key === 'tagline')
        if (tLine?.value) setLogoTagline(tLine.value)
        const visItem = tItems.find(i => i.key === 'visible')
        if (visItem && visItem.value === 'false') setLogoVisible(false)
        else setLogoVisible(true)
      } catch { }
    }
    Promise.all([loadContent(), loadLogos()]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  // Cycle through words
  useEffect(() => {
    if (words.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % words.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [words, intervalMs])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <section ref={sectionRef} className="tagline-section" style={{ position: 'relative', background: 'transparent' }}>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', width: '100vw' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(175, 122, 109, 0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
        <>
          <motion.div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '0 20px',
              y, opacity, scale
            }}
          >

            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 700,
              color: 'var(--dark)',
              lineHeight: 1.1,
              marginBottom: '28px',
              letterSpacing: '-0.5px',
              textAlign: 'center'
            }}>
              Bringing lasting wellbeing to your{' '}
              <span style={{
                display: 'inline-block',
                position: 'relative',
                height: 'clamp(44px, 5.5vw, 70px)',
                overflow: 'hidden',
                verticalAlign: 'bottom',
                minWidth: '150px',
                textAlign: 'left'
              }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeIndex}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
              width: '100%',
              maxWidth: '1200px',
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
                color: 'var(--dark)',
                maxWidth: '740px',
                margin: '0 auto',
                fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif'
              }}>
              We compassionately create wellbeing programs and mindfulness spaces
              to improve holistic wellbeing across every environment.
            </p>

            {/* Client Logos Marquee */}
            {logoVisible && clientLogos.length > 0 && (
              <div style={{ marginTop: '60px', width: '100%', overflow: 'hidden' }}>
                <p style={{
                  fontSize: 'clamp(20px, 3vw, 26px)',
                  color: 'var(--dark)',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  marginBottom: '32px',
                  fontFamily: 'Cormorant Garamond, serif'
                }}>
                  {logoTagline}
                </p>

                <div className="logo-marquee-container" style={{
                  position: 'relative',
                  width: '100%',
                  overflow: 'hidden',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                  maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                }}>
                  <div className="logo-marquee-track">
                    {[...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos].map((logo, i) => (
                      <div key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 30px' }}>
                        {logo.link ? (
                          <a href={logo.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                            <img
                              src={logo.url}
                              alt={logo.name}
                              className="client-logo-img"
                              style={{
                                height: logo.name === 'Deloitte' || logo.name === 'Amazon' ? '32px' : '46px',
                                objectFit: 'contain'
                              }}
                            />
                          </a>
                        ) : (
                          <img
                            src={logo.url}
                            alt={logo.name}
                            className="client-logo-img"
                            style={{
                              height: logo.name === 'Deloitte' || logo.name === 'Amazon' ? '32px' : '46px',
                              objectFit: 'contain'
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
        )}

        <style>{`
        .tagline-section { padding: 10px 0 80px; }
        .tagline-subtext { font-size: 17px; line-height: 1.7; padding: 0 20px; }
        .client-logo-img { transition: opacity 0.3s ease; opacity: 0.85; filter: grayscale(20%); border-radius: 12px; }
        .client-logo-img:hover { opacity: 1; filter: grayscale(0%); }
        
        .logo-marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: logo-scroll 30s linear infinite;
        }

        .logo-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes logo-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333333%); }
        }
        
        @media (max-width: 768px) {
          .tagline-section { padding: 10px 0 60px; }
          .tagline-subtext { font-size: 16px; line-height: 1.6; }
        }
      `}</style>
      </section>
    </div>
  )
}

