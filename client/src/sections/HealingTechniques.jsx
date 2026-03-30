import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TECHNIQUES } from '../constants/techniques'
import { motion, useInView } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'

export default function HealingTechniques() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px 0px' })
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scrolling logic (every 2 seconds)
  useEffect(() => {
    if (isHovered) return // Pause on hover
    const timer = setInterval(() => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
        const maxScroll = scrollWidth - clientWidth
        
        // If we hit the end, smoothly scroll back to the start
        if (scrollLeft >= maxScroll - 10) {
           containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
           // Scroll dynamically by the width of the first card + gap
           const firstCard = containerRef.current.children[0]
           const scrollAmount = firstCard ? firstCard.clientWidth + 32 : 372
           containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [isHovered])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <section
        id="healing"
        ref={sectionRef}
        className="healing-section"
        style={{
          background: 'transparent',
          margin: 0
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Header */}
          <div className="healing-header" style={{ marginBottom: '60px', textAlign: 'center' }}>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: '13px', color: 'var(--accent)', letterSpacing: '3px',
                textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600
              }}
            >
               Our Modalities
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(48px, 6vw, 76px)',
                fontWeight: 700,
                color: 'var(--dark)',
                marginBottom: '16px',
                lineHeight: 1.1,
                letterSpacing: '-0.5px'
              }}
            >
              Healing <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Techniques</span>
            </motion.h2>
          </div>

          {/* Auto-scrolling Card Container */}
          <motion.div 
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              display: 'flex',
              gap: '32px',
              overflowX: 'auto',
              paddingBottom: '60px',
              scrollbarWidth: 'none', // Hide scrollbar in Firefox
              msOverflowStyle: 'none' // Hide scrollbar in IE/Edge
            }}
            className="hide-scrollbar healing-scroll-container"
          >
            {TECHNIQUES.map((technique) => (
              <SimpleCard
                key={technique.id}
                technique={technique}
                onOpen={(t) => navigate('/healing-techniques#' + t.id)}
              />
            ))}
          </motion.div>
        </div>
        
        {/* Hide default scrollbars for an elegant swiper look */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .healing-section { padding: 100px 0 100px 60px; }
          .healing-header { padding-right: 60px; }
          .healing-scroll-container { padding-right: 60px !important; }
          .healing-card { width: 340px; }
          
          @media (max-width: 768px) {
            .healing-section { padding: 60px 0 60px 20px; }
            .healing-header { padding-right: 20px; }
            .healing-scroll-container { padding-right: 20px !important; }
            .healing-card { width: calc(85vw); min-width: 260px; max-width: 340px; }
          }
        `}</style>
      </section>
    </div>
  )
}

function SimpleCard({ technique, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const validImages = technique.images && technique.images.length > 0
    ? technique.images
    : [technique.image].filter(Boolean)
  const currentImageSrc = validImages[0] || ''

  return (
    <div 
      onClick={() => onOpen(technique)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="healing-card"
      style={{
        height: '460px',
        flexShrink: 0,
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hovered ? '0 30px 60px rgba(101, 50, 57, 0.2)' : '0 20px 40px rgba(101, 50, 57, 0.1)',
        transition: 'all 0.4s ease',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        isolation: 'isolate'
      }}
    >
      {/* Background Image */}
      {currentImageSrc && (
        <img
          src={currentImageSrc}
          alt={technique.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.8s ease'
          }}
        />
      )}

      {/* Persistent Bottom Gradient for precise text readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: hovered 
          ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
          : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
        transition: 'background 0.5s ease'
      }} />

      {/* Top Right Arrow */}
      <div style={{
        position: 'absolute',
        top: '20px', right: '20px',
        width: '40px', height: '40px',
        borderRadius: '50%',
        background: hovered ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--white)',
        transform: hovered ? 'rotate(0deg)' : 'rotate(-45deg)',
        transition: 'all 0.4s ease'
      }}>
        <FiArrowUpRight size={20} />
      </div>

      {/* Bottom Text Content */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '30px',
        right: '30px',
        color: 'var(--white)',
      }}>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '28px',
          fontWeight: 600,
          lineHeight: 1.1,
          marginBottom: '8px',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {technique.title}
        </h3>
        
        <p style={{
          fontSize: '14px',
          fontStyle: 'italic',
          opacity: 0.9,
          marginBottom: hovered ? '16px' : '0',
          transition: 'all 0.4s ease'
        }}>
          {technique.subtitle}
        </p>

        <div style={{
          height: hovered ? '20px' : '0',
          opacity: hovered ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.4s ease'
        }}>
          <span style={{
             fontSize: '12px',
             fontWeight: 700,
             letterSpacing: '1px',
             textTransform: 'uppercase'
          }}>
            EXPLORE MODALITY →
          </span>
        </div>
      </div>
    </div>
  )
}
