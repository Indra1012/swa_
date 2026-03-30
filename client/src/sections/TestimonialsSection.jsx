import { useState, useRef, useEffect } from 'react'
import { HR_TESTIMONIALS, EMPLOYEE_TESTIMONIALS } from '../constants/testimonials'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'

function TestimonialCard({ testimonial }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="testimonial-card"
      style={{
        width: 'clamp(280px, 85vw, 420px)',
        flexShrink: 0,
        position: 'relative',
        background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
        border: '1px solid',
        borderColor: hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
        borderRadius: '32px',
        padding: '48px 40px',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
        boxShadow: hovered ? '0 30px 60px rgba(0,0,0,0.3)' : 'none',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Quote Mark Background */}
      <div 
        className="testimonial-quote-mark"
        style={{
        position: 'absolute',
        top: '-10px', right: '10px',
        fontSize: '180px', fontFamily: 'Cormorant Garamond, serif',
        color: 'rgba(255,255,255,0.05)',
        lineHeight: 1, pointerEvents: 'none',
        userSelect: 'none',
        fontWeight: 700
      }}>
        "
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Company / Name */}
        <p 
          className="testimonial-company"
          style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '24px', fontWeight: 600,
          color: 'var(--primary)',
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          {testimonial.company || testimonial.name}
        </p>

        {/* Stars */}
        <div style={{
          display: 'flex', gap: '4px',
          marginBottom: '24px'
        }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{
              color: 'rgba(226,212,186,0.9)',
              fontSize: '16px',
              opacity: 0.9
            }}>★</span>
          ))}
        </div>

        {/* Quote Title */}
        <p 
          className="testimonial-quote"
          style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '22px', fontWeight: 600,
          color: 'var(--white)',
          marginBottom: '16px',
          lineHeight: 1.4,
          letterSpacing: '-0.3px'
        }}>
          "{testimonial.quote}"
        </p>

        {/* Text Body */}
        <p 
          className="testimonial-text"
          style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.8,
          fontFamily: 'DM Sans, sans-serif'
        }}>
          {testimonial.text}
        </p>
      </div>
    </div>
  )
}

function MarqueeTrack({ testimonials }) {
  const scrollRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  
  // Quadruple for an ultra-safe scroll buffer
  const multipled = [...testimonials, ...testimonials, ...testimonials, ...testimonials]

  // Native smooth fluid scroll via JS animation loop, pausing on interaction
  useEffect(() => {
    if (isHovered || !scrollRef.current) return
    
    let animationId
    const step = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += 1.2 /* Slower, smooth speed */
        
        // Endless loop logic: if we've scrolled past exactly HALF the total width, jump back
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft -= scrollRef.current.scrollWidth / 2
        }
      }
      animationId = requestAnimationFrame(step)
    }
    
    animationId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationId)
  }, [isHovered, testimonials])

  return (
    <div 
      ref={scrollRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="hide-scrollbar"
      style={{ 
        overflowX: 'auto', padding: '20px 0 80px',
        msOverflowStyle: 'none', scrollbarWidth: 'none',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        cursor: isHovered ? 'grab' : 'default'
      }}
    >
      <div style={{ display: 'flex', gap: '32px', width: 'max-content', padding: '0 20px' }}>
        {multipled.map((t, i) => (
          <TestimonialCard key={i} testimonial={t} />
        ))}
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const [activeTab, setActiveTab] = useState('hr')
  const sectionRef = useRef(null)

  // EXACT Parallax animation copied from prior sections
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Same parallax hooks
  const headerY = useTransform(scrollYProgress, [0, 1], [80, -80])
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15, 0.7, 1], [0, 1, 1, 0])
  const headerScale = useTransform(scrollYProgress, [0, 0.2, 0.7, 1], [0.92, 1, 1, 0.95])

  const tabBtnStyle = (tab) => ({
    background: activeTab === tab ? 'var(--white)' : 'rgba(255,255,255,0.08)',
    color: activeTab === tab ? 'var(--dark)' : 'rgba(255,255,255,0.65)',
    border: '1px solid',
    borderColor: activeTab === tab ? 'var(--white)' : 'rgba(255,255,255,0.15)',
    borderRadius: '50px',
    padding: '14px 40px',
    fontSize: '15px', fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'DM Sans, sans-serif',
    boxShadow: activeTab === tab ? '0 8px 24px rgba(255,255,255,0.15)' : 'none'
  })

  return (
    <section
      ref={sectionRef}
      className="testimonials-section"
      style={{
        background: 'var(--dark)',
        overflow: 'hidden',
        position: 'relative',
        margin: 0
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* PARALLAX HEADER */}
        <motion.div 
          style={{
            textAlign: 'center',
            maxWidth: '1000px',
            margin: '0 auto 60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            y: headerY,
            opacity: headerOpacity,
            scale: headerScale
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
            <span style={{
              fontSize: '13px', color: 'var(--accent)', letterSpacing: '3px',
              textTransform: 'uppercase', fontWeight: 700
            }}>
              Voices of SWA
            </span>
          </div>

          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 700,
            color: 'var(--white)',
            marginBottom: '32px',
            lineHeight: 1.1,
            letterSpacing: '-0.5px'
          }}>
            Client{' '}
            <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500 }}>
              Testimonials
            </span>
          </h2>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '48px',
            fontWeight: 400,
            maxWidth: '600px'
          }}>
            Hear directly from the organizations and individuals experiencing the profound shifts of a mindful workplace.
          </p>

          {/* Tab switcher */}
          <div 
            className="testimonial-tabs-container hide-scrollbar"
            style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            padding: '4px'
          }}>
            <button
              className="testimonial-tab-btn"
              style={tabBtnStyle('hr')}
              onClick={() => setActiveTab('hr')}
              onMouseEnter={e => {
                if (activeTab !== 'hr') {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                  e.currentTarget.style.color = 'var(--white)'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'hr') {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                }
              }}
            >
              Organizational Impact
            </button>
            <button
              className="testimonial-tab-btn"
              style={tabBtnStyle('employee')}
              onClick={() => setActiveTab('employee')}
              onMouseEnter={e => {
                if (activeTab !== 'employee') {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                  e.currentTarget.style.color = 'var(--white)'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'employee') {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                }
              }}
            >
              Personal Experiences
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scrolling track */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <MarqueeTrack testimonials={activeTab === 'hr' ? HR_TESTIMONIALS : EMPLOYEE_TESTIMONIALS} />
          </motion.div>
        </AnimatePresence>
      </div>
      <style>{`
        .testimonials-section { padding: 80px 0; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .testimonials-section { padding: 60px 0; }
          .testimonial-card { padding: 24px 20px !important; border-radius: 20px !important; }
          .testimonial-company { font-size: 20px !important; margin-bottom: 12px !important; }
          .testimonial-quote { font-size: 18px !important; margin-bottom: 12px !important; line-height: 1.3 !important; }
          .testimonial-text { font-size: 14px !important; line-height: 1.6 !important; }
          .testimonial-quote-mark { font-size: 120px !important; top: -5px !important; right: 5px !important; }
          
          /* Single line tabs container */
          .testimonial-tabs-container { justify-content: center !important; padding-bottom: 8px !important; gap: 8px !important; }
          .testimonial-tab-btn { white-space: nowrap !important; padding: 8px 18px !important; font-size: 13px !important; flex-shrink: 0 !important; }
        }
      `}</style>
    </section>
  )
}
