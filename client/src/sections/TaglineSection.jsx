import { useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

export default function TaglineSection() {
  const sectionRef = useRef(null)
  const navigate = useNavigate()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Scroll-Driven Scale Reveal (kinetic typography)
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.85, 1], [0.6, 1, 1, 0.95])
  const subOpacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0, 1, 1, 0])
  const subScale = useTransform(scrollYProgress, [0, 0.4, 0.85, 1], [0.55, 1, 1, 0.95])
  const subY = useTransform(scrollYProgress, [0, 1], [80, -40])

  const handleCTA = useCallback(() => navigate('/book-demo'), [navigate])

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
      {/* HEADING — Scroll-Driven Scale Reveal */}
      <motion.div 
        style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          y, opacity, scale
        }}
      >
        {/* Decorative Element */}
        <div style={{
          width: '40px', height: '2px',
          background: 'var(--accent)',
          margin: '0 auto 32px',
          borderRadius: '2px',
          opacity: 0.6
        }} />

        {/* Heading */}
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
            color: 'var(--secondary)',
            fontStyle: 'italic',
            fontWeight: 500
          }}>
            community & workplace
          </span>
        </h2>
      </motion.div>

      {/* SUBTEXT + CTA — Delayed Scale Reveal */}
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
        {/* Subtext */}
        <p 
          className="tagline-subtext"
          style={{
          color: 'var(--secondary)',
          maxWidth: '560px', 
          margin: '0 auto 48px',
          opacity: 0.85,
          fontFamily: 'DM Sans, sans-serif'
        }}>
          We compassionately create wellness programs and mindfulness spaces
          to improve holistic wellbeing across every environment.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleCTA}
          style={{
            background: 'var(--dark)', 
            color: 'var(--white)',
            border: 'none', 
            borderRadius: '50px',
            padding: '16px 42px', 
            fontSize: '15px', 
            fontWeight: 600,
            cursor: 'pointer', 
            display: 'inline-flex',
            alignItems: 'center', 
            gap: '12px',
            boxShadow: '0 4px 20px rgba(60,47,47,0.15)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: 'DM Sans, sans-serif'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--dark2)'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(184, 139, 88, 0.25)'
            e.currentTarget.style.color = 'var(--white)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--dark)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(60,47,47,0.15)'
          }}
        >
          Contact us for a demo 
          <FiArrowRight size={16} />
        </button>
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
