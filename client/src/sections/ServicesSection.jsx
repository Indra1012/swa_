import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

const SERVICES = [
  {
    type: 'corporate',
    title: 'Corporate Wellness', // Restored full title
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
    headline: 'Build a Resilient, High-Performing Workforce',
    description: 'Empower teams with structured wellness programs to reduce stress and drive performance.',
    linkParams: '/corporate'
  },
  {
    type: 'education',
    title: 'Education Sector', // Restored full title
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    headline: 'Emotionally Strong & Focused Students',
    description: 'Helping students and educators build emotional resilience for long-term success.',
    linkParams: '/education'
  },
  {
    type: 'community',
    title: 'Community Spaces', // Restored full title
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    headline: 'Healthier, More Resilient Communities',
    description: 'Driving wellbeing initiatives that help individuals manage stress and live balanced lives.',
    linkParams: '/community'
  }
]

export default function ServicesSection() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Implement the requested scroll-linked parallax animation for the header
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Scroll-Driven Scale Reveal (kinetic typography)
  const headerY = useTransform(scrollYProgress, [0, 1], [80, -80])
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15, 0.7, 1], [0, 1, 1, 0])
  const headerScale = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.6, 1, 1, 0.95])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
    <section
      ref={sectionRef}
      className="services-section"
      style={{
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* ULTRA-PREMIUM CENTERED HEADER with scroll-linked parallax */}
        <motion.div
           style={{
             textAlign: 'center',
             maxWidth: '1000px',
             margin: '0 auto 80px',
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             y: headerY,
             opacity: headerOpacity,
             scale: headerScale,
             position: 'relative',
             zIndex: 5,
             pointerEvents: 'none' /* FIX: Prevents parallax bounding box from overlapping and stealing clicks on mobile */
           }}
        >
          {/* Raw minimal text replacing the pill badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
            <span style={{
              fontSize: '13px', color: 'var(--dark)', letterSpacing: '3px',
              textTransform: 'uppercase', fontWeight: 700
            }}>
              Our Expertise & The Core Challenge
            </span>
          </div>
          
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(40px, 6vw, 76px)', 
            fontWeight: 700,
            color: 'var(--dark)',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            marginBottom: '32px',
            whiteSpace: 'nowrap'
          }}>
            Wellness <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--dark2)' }}>for every</span> environment.
          </h2>
        </motion.div>


        {/* REDUCED SCALE HIGHLY INTERACTIVE EXPANDING ACCORDION */}
        <motion.div 
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="services-accordion-container"
          style={{
            display: 'flex',
            gap: '16px',
            height: '400px',
            width: '100%',
            cursor: 'pointer'
          }}
        >
          {SERVICES.map((service, index) => {
            const isActive = activeIndex === index
            
            return (
              <motion.div
                key={index}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                animate={{
                  flex: isActive ? 4 : 1
                }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.7 }}
                style={{
                  position: 'relative',
                  borderRadius: '32px',
                  overflow: 'hidden',
                  background: 'var(--dark3)'
                }}
              >
                {/* Background Image slowly zooms if active */}
                <motion.img
                  src={service.image}
                  alt={service.title}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    opacity: isActive ? 0.95 : 0.85 /* Inactive image is now completely visible per user request */
                  }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Highly transparent Glassmorphic Overlay for inactive cards */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isActive 
                    ? 'linear-gradient(to top, rgba(101,50,57,0.95) 0%, rgba(101,50,57,0.1) 65%, transparent 100%)'
                    : 'rgba(101,50,57,0.4)', /* Very sheer dark overlay purely for text contrast */
                  backdropFilter: isActive ? 'blur(0px)' : 'blur(2px)', /* Almost zero blur so image is crystal clear */
                  WebkitBackdropFilter: isActive ? 'blur(0px)' : 'blur(2px)',
                  transition: 'all 0.6s ease'
                }} />

                {/* Collapsed Title (Vertical on Desktop, Horizontal on Mobile) */}
                <AnimatePresence>
                  {!isActive && (
                    <motion.div
                      className="accordion-collapsed-title"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}
                    >
                      <div className="accordion-title-vertical">
                        {service.title.split('').map((char, charIdx) => (
                          <div key={charIdx} style={{
                            color: 'var(--white)',
                            fontSize: '15px',
                            fontFamily: 'Cormorant Garamond, serif',
                            fontWeight: 700,
                            lineHeight: '1',
                            textTransform: 'uppercase'
                          }}>
                            {char === ' ' ? '\u00A0' : char}
                          </div>
                        ))}
                      </div>
                      <div className="accordion-title-horizontal">
                        {service.title}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Full Content (Shown ONLY when expanded) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        padding: '40px', /* Reduced padding */
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: '100%'
                      }}
                    >
                      <div style={{
                        padding: '6px 20px',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: '50px',
                        color: 'var(--white)',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        fontWeight: 600,
                        alignSelf: 'flex-start',
                        marginBottom: '20px',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}>
                        {service.title}
                      </div>

                      <h3 
                        className="accordion-headline"
                        style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: 'clamp(32px, 3.5vw, 48px)',
                        fontWeight: 600,
                        color: 'var(--white)',
                        lineHeight: 1.05,
                        letterSpacing: '-1px',
                        marginBottom: '16px',
                        maxWidth: '700px'
                      }}>
                        {service.headline}
                      </h3>

                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: '24px',
                        flexWrap: 'wrap'
                      }}>
                        <p style={{
                          fontSize: '16px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontWeight: 400,
                          maxWidth: '450px', margin: 0
                        }}>
                          {service.description}
                        </p>

                        <button style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '16px 36px',
                          background: 'var(--accent)', color: 'var(--white)',
                          borderRadius: '50px', fontSize: '14px', fontWeight: 600,
                          border: 'none', transition: 'all 0.4s ease',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'auto'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate('/services/' + service.type)
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = '0 15px 30px rgba(184, 139, 88, 0.4)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                        >
                          Explore Programs <FiArrowRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )
          })}
        </motion.div>

      </div>

      <style>{`
        .services-section { padding: 80px 40px; }
        .accordion-title-horizontal { display: none; }
        .accordion-title-vertical { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        @media (max-width: 1000px) {
          .services-section { padding: 80px 30px; }
          .services-accordion-container {
            flex-direction: column !important;
            height: 900px !important;
          }
          .accordion-title-horizontal { 
            display: block; 
            color: var(--white);
            font-size: 22px;
            font-family: 'Cormorant Garamond', serif;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-shadow: 0 4px 12px rgba(0,0,0,0.6);
          }
          .accordion-title-vertical { display: none; }
        }
        @media (max-width: 768px) {
          .services-section { padding: 60px 20px; }
          .services-accordion-container {
            height: 850px !important;
          }
          .accordion-title-horizontal { font-size: 18px; letter-spacing: 2px; }
          .accordion-headline { font-size: 26px !important; letter-spacing: -0.5px !important; }
        }
      `}</style>
    </section>
    </div>
  )
}
