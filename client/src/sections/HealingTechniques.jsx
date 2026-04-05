import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { FiArrowUpRight, FiChevronDown } from 'react-icons/fi'
import { TECHNIQUES as FALLBACK_TECHNIQUES } from '../constants/techniques'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function HealingTechniques() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ["start 95%", "start 20%"] })
  const headerY = useTransform(scrollYProgress, [0, 1], [80, 0])
  const headerScale = useTransform(scrollYProgress, [0, 1], [0.5, 1])
  const headerOpacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const isInView = useInView(sectionRef, { once: true, margin: '-100px 0px' })
  const [isHovered, setIsHovered] = useState(false)
  const [techniques, setTechniques] = useState([])
  const [headings, setHeadings] = useState({
    title: 'Healing Techniques',
    subtitle: ''
  })

  // Fetch from DB, fall back to constants
  useEffect(() => {
    const load = async () => {
      try {
        const now = Date.now()
        const [res, contRes] = await Promise.all([
          axios.get(`${API}/api/sections/techniques/healing?t=${now}`),
          axios.get(`${API}/api/content/healing?t=${now}`).catch(() => ({ data: [] }))
        ])

        const cmap = {}
        ;(contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
        if (Object.keys(cmap).length > 0) {
          setHeadings(h => ({
            title: cmap.title || h.title,
            subtitle: cmap.subtitle || h.subtitle
          }))
        }

        const items = res.data.items || []
        if (items.length > 0) {
          setTechniques(items.map(t => ({
            id: t._id,
            title: t.title,
            subtitle: t.subtitle,
            image: t.image,
            mediaMode: t.mediaMode || 'image',
            readMoreText: t.readMoreText || '',
            images: t.images && t.images.length > 0 ? t.images.map(img => img.url) : [t.image].filter(Boolean)
          })))
        } else {
          setTechniques(FALLBACK_TECHNIQUES.map(t => ({ ...t, readMoreText: t.purpose || t.readMoreText || '' })))
        }
      } catch {
        setTechniques(FALLBACK_TECHNIQUES.map(t => ({ ...t, readMoreText: t.purpose || t.readMoreText || '' })))
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
          <motion.div 
            ref={headerRef}
            className="healing-header float-subtle" 
            style={{ 
              marginBottom: '60px', 
              textAlign: 'center',
              y: headerY,
              scale: headerScale,
              opacity: headerOpacity,
              transformOrigin: 'center bottom'
            }}
          >

            <h2
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
              {headings.title.split(' ').length > 1 ? (
                <>
                  {headings.title.split(' ').slice(0, -1).join(' ')}{' '}
                  <span style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--dark)' }}>
                    {headings.title.split(' ').slice(-1)}
                  </span>
                </>
              ) : (
                headings.title
              )}
            </h2>
            {headings.subtitle && (
              <p
                style={{
                  fontSize: '18px', color: 'var(--secondary)', lineHeight: 1.7,
                  maxWidth: '600px', margin: '0 auto', fontWeight: 400
                }}
              >
                {headings.subtitle}
              </p>
            )}
          </motion.div>

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
              marginTop: '-40px',
              paddingTop: '40px',
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
                onOpen={(t) => navigate('/blogs#' + t.id)}
              />
            ))}
          </motion.div>
        </div>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .healing-section { padding: 40px 0 100px 60px; }
          .healing-header { padding-right: 60px; }
          .healing-scroll-container { padding-right: 60px !important; }
          .healing-card { width: 340px; }
          
          @media (max-width: 768px) {
            .healing-section { padding: 40px 0 60px 20px; }
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const validImages = technique.images && technique.images.length > 0
    ? technique.images
    : [technique.image].filter(Boolean)

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [validImages.length])

  return (
    <div
      className="healing-card"
      style={{
        flexShrink: 0,
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
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
        style={{ height: '460px', position: 'relative' }}
      >
        {technique.mediaMode === 'video' ? (
          <video
            src={technique.image}
            autoPlay loop muted playsInline
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.8s ease'
            }}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {validImages.length > 0 && (
              <motion.img
                key={currentImageIndex}
                src={validImages[currentImageIndex]}
                alt={technique.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.8s ease'
                }}
              />
            )}
          </AnimatePresence>
        )}

        <div style={{
          position: 'absolute', inset: 0,
          background: hovered
            ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
          transition: 'background 0.5s ease'
        }} />



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
          {expanded && technique.readMoreText && (
            <div style={{
              marginTop: '12px', marginBottom: '16px'
            }}>
              <p style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.95)', lineHeight: 1.6,
                fontFamily: 'DM Sans, sans-serif', margin: 0,
                textShadow: '0 1px 3px rgba(0,0,0,0.6)'
              }}>
                {technique.readMoreText}
              </p>
            </div>
          )}

          {technique.readMoreText && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50px', padding: '6px 16px', fontSize: '11px', fontWeight: 700,
                letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--white)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                backdropFilter: 'blur(8px)', transition: 'all 0.3s ease',
                marginTop: expanded ? '0px' : '10px'
              }}
            >
              {expanded ? 'CLOSE' : 'READ MORE'}
              <FiChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
