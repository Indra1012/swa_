import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { value: 450, suffix: '+', label: 'Organizations\nTransformed' },
  { value: 2, suffix: 'L+', label: "People's Lives\nEmpowered" }, // Reverted to 2L+ as it was originally
  { value: 2, suffix: 'L+', label: 'Sessions\nConducted' },
  { value: 1000, suffix: '+', label: 'Global Experts\n& Healers' },
  { value: 102, suffix: '+', label: 'Cities\nImpacted' }
]

function StatItem({ stat, index, isInView }) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = stat.value
    const duration = 2000
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        clearInterval(timer)
        setCurrentValue(end)
      } else {
        setCurrentValue(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, stat.value])

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '32px 24px'
      }}
    >
      <h3 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(48px, 5vw, 64px)',
        fontWeight: 600,
        color: 'var(--white)',
        lineHeight: 1,
        marginBottom: '12px',
        letterSpacing: '-1px'
      }}>
        {currentValue}
        <span style={{ color: 'var(--accent)', fontStyle: 'italic', marginLeft: '2px' }}>
          {stat.suffix}
        </span>
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.65)',
        fontWeight: 600,
        lineHeight: 1.5,
        whiteSpace: 'pre-line',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        {stat.label}
      </p>

      {/* Elegant Vertical Divider for all but the last item */}
      {index !== STATS.length - 1 && (
        <div
          className="stat-divider"
          style={{
            position: 'absolute',
            right: '-30px', /* Half of gap */
            top: '20%',
            height: '60%',
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)'
          }}
        />
      )}
    </motion.div>
  )
}

export default function StatsSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px 0px' })

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--dark3)',
        padding: '60px 60px 80px 60px',
        position: 'relative',
        overflow: 'hidden',
        margin: 0
      }}
    >
      {/* Ambient center glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at center, rgba(101, 50, 57, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <motion.div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
        {/* Compact Title - Animation removed as requested */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(36px, 4vw, 52px)',
            fontWeight: 700,
            color: 'var(--white)',
            letterSpacing: '-0.5px'
          }}>
            Our global <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>impact</span>
          </h2>
        </div>

        {/* Horizontal flex layout */}
        <div 
          className="stats-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '60px',
            flexWrap: 'wrap'
          }}
        >
          {STATS.map((stat, i) => (
            <StatItem key={i} stat={stat} index={i} isInView={isInView} />
          ))}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 900px) {
          .stats-row { justify-content: center !important; gap: 40px !important; }
          .stat-divider { display: none !important; }
        }
      `}</style>
    </section>
  )
}
