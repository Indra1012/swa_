

import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import useScrollFade from '../hooks/useScrollFade'
import { TECHNIQUES } from '../constants/techniques'

// Pure Editorial Minimalist Approach (No Cards)
function TechniqueEditorial({ tech, index }) {
  const isReversed = index % 2 !== 0

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
        flexDirection: isReversed ? 'row-reverse' : 'row',
        gap: '60px', 
        width: '100%',
      }}
      className="editorial-row"
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
          width: '360px', 
          height: '480px', 
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.06)',
          position: 'relative'
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
              objectFit: 'cover'
            }}
          />
        )}
      </motion.div>

      {/* 
        Pure Text Column 
        Now linked directly to scroll up/down speed
      */}
      <motion.div 
        style={{
          flex: 1, 
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          y: textY
        }} 
        className="editorial-content"
      >
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          0{index + 1} &mdash; Modality
        </span>
        
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(28px, 3.5vw, 42px)', 
          fontWeight: 500,
          color: 'var(--dark)',
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '20px'
        }}>
          {tech.title} {tech.subtitle}
        </h2>
        
        <p style={{
          fontSize: '16px', color: 'var(--secondary)', fontWeight: 400, lineHeight: 1.6, marginBottom: '28px'
        }}>
          <span style={{ color: 'var(--dark)', fontWeight: 600 }}>Focus:</span> {tech.focus}
        </p>

        <div style={{ marginBottom: '36px' }}>
          <ul style={{
            listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            {tech.techniques.map((t, idx) => (
              <li key={idx} style={{
                position: 'relative', paddingLeft: '24px', fontSize: '15px', color: 'var(--secondary)', lineHeight: 1.4, fontWeight: 500
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: '9px', width: '20px', height: '1px', background: 'var(--accent)', opacity: 0.6
                }} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Minimalist Purpose Block - Italics purely */}
        <div>
          <h5 style={{ 
            fontSize: '11px', color: 'var(--dark)', fontWeight: 700, 
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px',
            opacity: 0.6
          }}>
            Purpose
          </h5>
          <p style={{ 
            margin: 0, fontSize: '22px', color: 'var(--dark)', 
            lineHeight: 1.5, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' 
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
    <main style={{ 
      position: 'relative',
      background: 'var(--bg)', 
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
        style={{ padding: '80px 40px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', marginBottom: '40px' }}
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
            fontSize: '13px', color: 'var(--accent)', letterSpacing: '3px',
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
          The SWA Healing <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Techniques</span>
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
      <div style={{ 
        maxWidth: '960px', /* Much tighter, incredibly sleek and small */
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '120px', /* Large gap between sections for breathing room */
        padding: '0 40px' 
      }}>
        {TECHNIQUES.map((tech, i) => (
          <TechniqueEditorial key={tech.id} tech={tech} index={i} />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .editorial-row { 
            flex-direction: column !important; 
            gap: 40px !important;
          }
          .editorial-image { 
            width: 100% !important; 
            height: 400px !important; 
          }
          .editorial-content { 
            width: 100% !important; 
          }
        }
      `}</style>
      </div>
    </main>
  )
}
