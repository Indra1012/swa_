import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FiArrowUpRight, FiChevronDown } from 'react-icons/fi'
import { TECHNIQUES as FALLBACK_TECHNIQUES } from '../constants/techniques'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function HealingTechniques() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px 0px' })
  const [isHovered, setIsHovered] = useState(false)
  const [techniques, setTechniques] = useState([])

  // Fetch from DB, fall back to constants
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/sections/techniques/healing`)
        const items = res.data.items || []
        if (items.length > 0) {
          setTechniques(items.map(t => ({
            id: t._id,
            title: t.title,
            subtitle: t.subtitle,
            image: t.image,
            readMoreText: t.readMoreText || '',
            images: [t.image]
          })))
        } else {
          setTechniques(FALLBACK_TECHNIQUES)
        }
      } catch {
        setTechniques(FALLBACK_TECHNIQUES)
      }
    }
    load()
  }, [])

  // Auto-scrolling
  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
        const maxScroll = scrollWidth - clientWidth
        if (scrollLeft >= maxScroll - 10) {
          containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
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
        style={{ background: 'transparent', margin: 0 }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div className="healing-header float-subtle" style={{ marginBottom: '60px', textAlign: 'center' }}>
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
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            className="hide-scrollbar healing-scroll-container"
          >
            {techniques.map((technique) => (
              <SimpleCard
                key={technique.id}
                technique={technique}
                onOpen={(t) => navigate('/healing-techniques#' + t.id)}
              />
            ))}
          </motion.div>
        </div>
        
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .healing-section { padding: 20px 0 100px 60px; }
          .healing-header { padding-right: 60px; }
          .healing-scroll-container { padding-right: 60px !important; }
          .healing-card { width: 340px; }
          
          @media (max-width: 768px) {
            .healing-section { padding: 0px 0 60px 20px; }
            .healing-header { padding-right: 20px; }
            .healing-scroll-container { padding-right: 20px !important; }
            .healing-card { width: calc(76vw); min-width: 234px; max-width: 306px; }
          }
        `}</style>
      </section>
    </div>
  )
}

function SimpleCard({ technique, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const validImages = technique.images && technique.images.length > 0
    ? technique.images
    : [technique.image].filter(Boolean)
  const currentImageSrc = validImages[0] || ''

  return (
    <div 
      className="healing-card"
      style={{
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
      {/* Image portion */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onOpen(technique)}
        style={{ height: expanded ? '340px' : '460px', position: 'relative', transition: 'height 0.4s ease' }}
      >
        {currentImageSrc && (
          <img
            src={currentImageSrc}
            alt={technique.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.8s ease'
            }}
          />
        )}

        <div style={{
          position: 'absolute', inset: 0,
          background: hovered 
            ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
          transition: 'background 0.5s ease'
        }} />

        <div style={{
          position: 'absolute', top: '20px', right: '20px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: hovered ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--white)',
          transform: hovered ? 'rotate(0deg)' : 'rotate(-45deg)',
          transition: 'all 0.4s ease'
        }}>
          <FiArrowUpRight size={20} />
        </div>

        <div style={{
          position: 'absolute', bottom: '30px', left: '30px', right: '30px',
          color: 'var(--white)',
        }}>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: '28px',
            fontWeight: 600, lineHeight: 1.1, marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {technique.title}
          </h3>
          <p style={{ fontSize: '14px', fontStyle: 'italic', opacity: 0.9, marginBottom: '12px' }}>
            {technique.subtitle}
          </p>
          {technique.readMoreText && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50px', padding: '6px 16px', fontSize: '11px', fontWeight: 700,
                letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--white)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                backdropFilter: 'blur(8px)', transition: 'all 0.3s ease'
              }}
            >
              {expanded ? 'CLOSE' : 'READ MORE'}
              <FiChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }} />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Read More */}
      {expanded && technique.readMoreText && (
        <div style={{
          padding: '20px 24px', background: 'var(--white)',
          borderTop: '1px solid rgba(204,199,185,0.2)'
        }}>
          <p style={{
            fontSize: '14px', color: 'var(--secondary)', lineHeight: 1.7,
            fontFamily: 'DM Sans, sans-serif', margin: 0
          }}>
            {technique.readMoreText}
          </p>
        </div>
      )}
    </div>
  )
}
