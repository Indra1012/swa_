import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useScrollFade from '../hooks/useScrollFade'

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80',
    title: "It's time to bring the SWA Magic to your place and people"
  },
  {
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1400&q=80',
    title: 'Transform your organization with the power of wellbeing'
  },
  {
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1400&q=80',
    title: 'Join forward-thinking organizations on the journey to lasting wellbeing'
  }
]

export default function CTABanner() {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  const sectionRef = useRef(null)
  useScrollFade(sectionRef)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = useCallback((i) => setCurrent(i), [])

  return (
    <section
      ref={sectionRef}
      className="fade-up cta-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: 0
      }}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={SLIDES[current].image}
          alt=""
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover'
          }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(101,50,57,0.58)'
      }} />

      {/* Content */}
      <div
        className="cta-content"
        style={{
          position: 'relative', zIndex: 2,
          maxWidth: '860px'
        }}>
        <AnimatePresence mode="wait">
          <motion.h2
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 700,
              color: 'var(--white)',
              lineHeight: 1.25,
              marginBottom: '32px',
              textShadow: '0 2px 20px rgba(0,0,0,0.2)'
            }}
          >
            {SLIDES[current].title}
          </motion.h2>
        </AnimatePresence>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/book-demo')}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? 'rgba(242,228,213,0.3)' : 'rgba(242,228,213,0.15)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(242,228,213,0.7)',
            color: 'var(--white)',
            borderRadius: '50px',
            padding: '14px 40px',
            fontSize: '16px', fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center', gap: '8px',
            transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'var(--transition)',
            fontFamily: 'DM Sans, sans-serif'
          }}
        >
          Connect for happiness &nbsp;→
        </button>

        {/* Dot navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px'
        }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                width: current === i ? '24px' : '8px',
                height: '8px',
                borderRadius: current === i ? '4px' : '50%',
                background: current === i ? 'var(--white)' : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        .cta-section { height: 480px; }
        .cta-content { padding: 0 40px; }
        @media (max-width: 768px) {
          .cta-section { height: 540px; }
          .cta-content { padding: 0 20px; }
        }
      `}</style>
    </section>
  )
}
