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

  // Subtle parallax and scale effect
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.92, 1, 1, 0.95])

  const handleCTA = useCallback(() => navigate('/book-demo'), [navigate])

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--white)',
        padding: '60px 60px 80px',
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

        {/* Subtext */}
        <p style={{
          fontSize: '17px', 
          color: 'var(--secondary)',
          maxWidth: '560px', 
          margin: '0 auto 48px',
          lineHeight: 1.7, 
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
    </section>
  )
}
