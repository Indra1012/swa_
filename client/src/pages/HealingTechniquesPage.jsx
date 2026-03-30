

import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import useScrollFade from '../hooks/useScrollFade'
import { TECHNIQUES } from '../constants/techniques'

// Pure Editorial Minimalist Approach (No Cards)
function TechniqueEditorial({ tech, index }) {
  const isReversed = index % 2 !== 0
  const [cardHovered, setCardHovered] = useState(false)

  const validImages = tech.images && tech.images.length > 0 ? tech.images : [tech.image].filter(Boolean)
  const blockRef = useRef(null)

  // Parallax Scroll Animation for the Text
  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ["start end", "end start"]
  })

  // Text floats up significantly as you scroll down
  const textY = useTransform(scrollYProgress, [0, 1], [80, -80])

  const currentImageSrc = validImages[0] || ''

  return (
    <motion.div
      id={tech.id}
      ref={blockRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: isReversed ? 'row-reverse' : 'row',
        width: '100%',
        cursor: 'default' // Add a cursor so it feels interactive
      }}
      className="editorial-row"
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      {/* 
        Smaller, Portrait Image Block
        Features Infinite Floating Animation
      */}
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
        style={{
          flexShrink: 0,
          width: '320px',
          height: '450px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: cardHovered ? '0 40px 80px rgba(0,0,0,0.25)' : '0 30px 60px rgba(0,0,0,0.15)',
          position: 'relative',
          zIndex: 10,
          transition: 'box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          // Fixes the sharp corner bleeding on hover zoom in webkit browsers
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          isolation: 'isolate'
        }}
        className="editorial-image"
      >
        {currentImageSrc && (
          <img
            src={currentImageSrc}
            alt={tech.title}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transform: cardHovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        )}
      </motion.div>

      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 40px 80px rgba(101, 50, 57, 0.25)'
        }}
        style={{
          width: '340px',
          maxWidth: '100%',
          height: '470px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: 'rgba(250, 248, 245, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px',
          padding: '32px',
          paddingLeft: isReversed ? '28px' : '82px',
          paddingRight: isReversed ? '82px' : '28px',
          marginLeft: isReversed ? '0' : '-60px',
          marginRight: isReversed ? '-60px' : '0',
          marginTop: '60px',
          boxShadow: '0 20px 60px rgba(101, 50, 57, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          position: 'relative',
          zIndex: 1,
          transition: 'box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="editorial-content"
      >
        <span style={{
          display: 'inline-block',
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--dark)',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          0{index + 1} &mdash; Modality
        </span>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(20px, 2.5vw, 30px)',
          fontWeight: 500,
          color: 'var(--dark)',
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '12px'
        }}>
          {tech.title} {tech.subtitle}
        </h2>

        <p style={{
          fontSize: '14px', color: 'var(--secondary)', fontWeight: 400, lineHeight: 1.5, marginBottom: '16px', marginTop: 0
        }}>
          <span style={{ color: 'var(--dark)', fontWeight: 600 }}>Focus:</span> {tech.focus}
        </p>

        <div style={{ marginBottom: '20px' }}>
          <ul style={{
            listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            {tech.techniques.map((t, idx) => (
              <li key={idx} style={{
                position: 'relative', paddingLeft: '18px', fontSize: '13px', color: 'var(--secondary)', lineHeight: 1.4, fontWeight: 500
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: '8px', width: '12px', height: '1px', background: 'var(--accent)', opacity: 0.6
                }} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Minimalist Purpose Block - Italics purely */}
        <div>
          <h5 style={{
            fontSize: '10px', color: 'var(--dark)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px',
            opacity: 0.6
          }}>
            Purpose
          </h5>
          <p style={{
            margin: 0, fontSize: '18px', color: 'var(--dark)',
            lineHeight: 1.3, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif'
          }}>
            "{tech.purpose}"
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function HealingTechniquesPage() {
  const { hash } = useLocation()
  // Hash scrolling logic, highly precise with setTimeout
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          // Adjust for navbar height
          const y = element.getBoundingClientRect().top + window.scrollY - 100
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 300)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [hash])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <main style={{
          position: 'relative',
          background: 'transparent',
          minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', overflow: 'hidden'
        }}>

          {/* Ambient Luxury Lighting Gradients */}
          <motion.div
            animate={{ y: [0, -60, 0], x: [0, 40, 0], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
              background: 'radial-gradient(circle, rgba(220, 150, 100, 0.08) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none'
            }}
          />
          <motion.div
            animate={{ y: [0, 50, 0], x: [0, -40, 0], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{
              position: 'fixed', bottom: '-10%', right: '-5%', width: '60vw', height: '60vw',
              background: 'radial-gradient(circle, rgba(150, 170, 140, 0.07) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none'
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            style={{
              position: 'fixed', top: '40%', left: '30%', width: '40vw', height: '40vw',
              background: 'radial-gradient(circle, rgba(200, 180, 160, 0.06) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
            }}
          />

          {/* Foreground Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Page Intro Hero */}
            <motion.section
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                }
              }}
              style={{ paddingTop: '40px', paddingBottom: '20px', paddingLeft: '40px', paddingRight: '40px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', marginBottom: '40px' }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '32px'
                }}
              >
                <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
                <span style={{
                  fontSize: '13px', color: 'var(--dark)', letterSpacing: '3px',
                  textTransform: 'uppercase', fontWeight: 700
                }}>
                  Our Core Modalities
                </span>
              </motion.div>

              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: -40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(26px, 5vw, 72px)',
                  fontWeight: 700,
                  color: 'var(--dark)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.5px',
                  marginBottom: '32px',
                  whiteSpace: 'nowrap'
                }}
              >
                The SWA Healing <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--dark2)' }}>Techniques</span>
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: -40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{
                  fontSize: '18px', color: 'var(--secondary)', lineHeight: 1.8, fontWeight: 400
                }}
              >
                Scientifically-curated holistic modalities designed for complete mind, body, and space restoration.
              </motion.p>
            </motion.section>

            {/* Techniques Scrolling Blocks */}
            <div className="techniques-grid">
              {TECHNIQUES.map((tech, i) => (
                <TechniqueEditorial key={tech.id} tech={tech} index={i} />
              ))}
            </div>

            <style>{`
        .techniques-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px 40px;
          padding: 0 40px;
        }

        @media (max-width: 1360px) {
          .techniques-grid {
            grid-template-columns: 1fr;
            max-width: 800px;
            gap: 80px;
          }
        }

        @media (max-width: 900px) {
          .techniques-grid {
            padding: 0 16px;
            gap: 60px;
          }
          
          .editorial-row { 
            /* Let the inline style handle the row vs row-reverse alternating pattern */
            align-items: center !important;
            gap: 0 !important;
          }
          
          .editorial-image { 
            width: 44% !important; 
            height: auto !important; 
            aspect-ratio: 0.6 !important; /* Force a consistent tall portrait rectangle (width/height ratio) */
            border-radius: 12px !important;
          }
          
          .editorial-content { 
            width: 64% !important; 
            height: auto !important;
            min-height: 280px !important; /* Ensure it never shrinks too small vertically */
            aspect-ratio: 0.6 !important; /* Force the exact same tall portrait rectangle shape */
            margin: 0 !important;
            margin-top: 15px !important; /* Visual offset */
            padding: 20px 16px !important;
            border-radius: 16px !important;
            /* Recenter content vertically inside the forced aspect-ratio box */
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          
          /* Handle horizontal overlap dynamically for both orientations */
          .editorial-row:not([style*="row-reverse"]) .editorial-content {
             margin-left: -12% !important;
             margin-right: 0 !important;
             padding-left: 18% !important; /* Text clearance over image */
             padding-right: 12px !important;
          }
          .editorial-row[style*="row-reverse"] .editorial-content {
             margin-right: -12% !important;
             margin-left: 0 !important;
             padding-right: 18% !important;
             padding-left: 12px !important;
          }

          /* Downscale Text Intelligently for the small mobile cards */
          .editorial-content > span:first-of-type {
             font-size: 8px !important;
             margin-bottom: 6px !important;
             letter-spacing: 1.5px !important;
          }
          .editorial-content > h2 {
             font-size: clamp(16px, 4vw, 22px) !important;
             margin-bottom: 8px !important;
             line-height: 1.15 !important;
          }
          .editorial-content > p {
             font-size: 11px !important;
             margin-bottom: 12px !important;
             line-height: 1.4 !important;
          }
          .editorial-content ul {
             gap: 4px !important;
          }
          .editorial-content li {
             font-size: 10px !important;
             padding-left: 12px !important;
             line-height: 1.3 !important;
          }
          .editorial-content li div {
             width: 8px !important;
             top: 5px !important;
          }
          .editorial-content h5 {
             font-size: 8px !important;
             margin-bottom: 4px !important;
             margin-top: 12px !important;
          }
          .editorial-content > div:last-child > p {
             font-size: 13px !important;
             line-height: 1.25 !important;
          }
        }
      `}</style>
          </div>
        </main>
      </div>
    </div>
  )
}
