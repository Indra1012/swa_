import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { FiX, FiPlay, FiEye, FiEyeOff, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const FALLBACK_GALLERY = [
  { _id: '1', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', type: 'image', sizeVariant: 'medium' },
  { _id: '2', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', type: 'image', sizeVariant: 'large' },
  { _id: '3', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', type: 'image', sizeVariant: 'medium' },
  { _id: '4', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80', type: 'image', sizeVariant: 'large' },
  { _id: '5', url: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&q=80', type: 'image', sizeVariant: 'medium' },
  { _id: '6', url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80', type: 'image', sizeVariant: 'large' },
]

const SIZE_MAP = {
  medium:    { width: '300px', height: '240px' },
  large:     { width: '400px', height: '280px' },
}

// ─── Gallery Card ────────────────────────────────────────────────────────────
function GalleryCard({ item, onClick, stagger }) {
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const size = SIZE_MAP[item.sizeVariant] || SIZE_MAP.medium
  const hasDesc = item.description && item.description.trim().length > 0

  const handleReadMore = (e) => {
    e.stopPropagation()
    setExpanded(v => !v)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setExpanded(false) }}
      onClick={() => { if (!expanded) onClick(item) }}
      className="gallery-card"
      style={{
        flexShrink: 0,
        width: `calc(${size.width} * var(--gallery-scale, 1))`,
        height: `calc(${size.height} * var(--gallery-scale, 1))`,
        borderRadius: '20px',
        overflow: 'hidden',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        isolation: 'isolate',
        cursor: expanded ? 'default' : 'pointer',
        position: 'relative',
        transform: `translateY(${stagger ? '20px' : '-20px'}) scale(${hovered ? 1.02 : 1})`,
        transition: 'transform 0.4s ease, box-shadow 0.4s ease',
        boxShadow: hovered ? '0 30px 50px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.15)'
      }}
    >
      {/* Media */}
      {item.type === 'video' ? (
        <>
          <video
            src={item.url}
            muted loop playsInline autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered ? 'rgba(0,0,0,0.1)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s ease'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: hovered ? 'scale(1.12)' : 'scale(1)',
              transition: 'transform 0.3s ease, opacity 0.3s ease',
              opacity: hovered ? 1 : 0.4
            }}>
              <FiPlay size={18} color="var(--dark)" style={{ marginLeft: '3px' }} />
            </div>
          </div>
        </>
      ) : (
        <>
          <img
            src={item.url}
            alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.6s ease'
            }}
          />
          {/* Subtle gradient for image readability, darkens slightly when expanded */}
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered || expanded
              ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
            transition: 'background 0.5s ease',
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* Content Container positioned exactly like WellbeingCard */}
      {(item.title || item.subtitle || hasDesc) && (
        <div style={{
          position: 'absolute', bottom: '20px', left: '20px', right: '20px',
          color: 'var(--white)',
          zIndex: 5,
        }}>
          {/* Title */}
          {item.title && (
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: '24px',
              fontWeight: 600, lineHeight: 1.1, marginBottom: '6px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {item.title}
            </h3>
          )}
          
          {/* Subtitle */}
          {item.subtitle && (
            <p style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.9, marginBottom: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {item.subtitle}
            </p>
          )}

          {/* Inline description (NO modal) */}
          <AnimatePresence initial={false}>
            {expanded && hasDesc && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div className="gallery-desc-scroll" style={{ marginTop: '10px', marginBottom: '16px', maxHeight: '110px', overflowY: 'auto', paddingRight: '4px' }}>
                  <p style={{
                    fontSize: '13px', color: 'rgba(255,255,255,0.95)', lineHeight: 1.6,
                    fontFamily: 'DM Sans, sans-serif', margin: 0,
                    textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                  }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Read More Button */}
          {hasDesc && (hovered || expanded) && (
            <button
              onClick={handleReadMore}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50px', padding: '6px 14px', fontSize: '10px', fontWeight: 700,
                letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--white)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                backdropFilter: 'blur(8px)', transition: 'all 0.3s ease',
                marginTop: expanded ? '0px' : '6px'
              }}
            >
              {expanded ? 'CLOSE' : 'READ MORE'}
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <FiChevronDown size={12} />
              </motion.div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ item, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.93)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '24px', right: '24px',
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <FiX size={20} />
      </button>

      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: '16px', overflow: 'hidden' }}
      >
        {item.type === 'video' ? (
          <video src={item.url} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '88vh', display: 'block' }} />
        ) : (
          <img src={item.url} alt="" style={{ maxWidth: '90vw', maxHeight: '88vh', display: 'block', objectFit: 'contain' }} />
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Scrolling Row ────────────────────────────────────────────────────────────
function ScrollRow({ items, direction, paused, onPause, onResume, staggerFlip }) {
  const containerRef = useRef(null)

  // Auto-scroll loop
  useEffect(() => {
    if (paused) return
    let animationFrameId
    const scrollStep = () => {
      if (containerRef.current) {
        const el = containerRef.current
        if (direction === 'left') {
          if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
            el.scrollLeft = 0 // Instant reset
          } else {
            el.scrollLeft += 1
          }
        } else {
          // Rightward scrolling setup
          if (el.scrollLeft <= 2) {
             el.scrollLeft = el.scrollWidth - el.clientWidth
          } else {
             el.scrollLeft -= 1
          }
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep)
    }
    animationFrameId = requestAnimationFrame(scrollStep)
    return () => cancelAnimationFrame(animationFrameId)
  }, [paused, direction])

  const handleScrollLeft = () => {
    if (containerRef.current) {
       containerRef.current.style.scrollBehavior = 'smooth'
       containerRef.current.scrollBy({ left: -400 })
       setTimeout(() => { if(containerRef.current) containerRef.current.style.scrollBehavior = 'auto' }, 400)
    }
  }
  const handleScrollRight = () => {
    if (containerRef.current) {
       containerRef.current.style.scrollBehavior = 'smooth'
       containerRef.current.scrollBy({ left: 400 })
       setTimeout(() => { if(containerRef.current) containerRef.current.style.scrollBehavior = 'auto' }, 400)
    }
  }

  // Multiply items for smooth illusion
  const loopItems = items.length < 8
    ? [...items, ...items, ...items, ...items, ...items]
    : [...items, ...items, ...items]

  return (
    <div style={{ position: 'relative', width: '100%' }} onMouseEnter={onPause} onMouseLeave={onResume}>
      
      {/* Scroll Left Btn */}
      <button 
        onClick={handleScrollLeft}
        style={{
          position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,1)', color: 'var(--dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(101,50,57,0.15)', cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        className="gallery-nav-btn"
      >
        <FiChevronLeft size={24} />
      </button>

      <div
        ref={containerRef}
        className="hide-scrollbar"
        onTouchStart={onPause}
        onTouchEnd={onResume}
        style={{
          display: 'flex', gap: '24px', padding: '40px 60px',
          overflowX: 'auto', scrollBehavior: 'auto'
        }}
      >
        {loopItems.map((item, i) => (
          <GalleryCard key={`${direction}-${i}`} item={item} onClick={() => {}} stagger={staggerFlip ? i % 2 !== 0 : i % 2 === 0} />
        ))}
      </div>

      {/* Scroll Right Btn */}
      <button 
        onClick={handleScrollRight}
        style={{
          position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,1)', color: 'var(--dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(101,50,57,0.15)', cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        className="gallery-nav-btn"
      >
        <FiChevronRight size={24} />
      </button>
    </div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function MediaGallerySection() {
  const [items, setItems]       = useState([])
  const [lightbox, setLightbox] = useState(null)
  const [paused, setPaused]     = useState(false)
  const [loaded, setLoaded]     = useState(false)
  const [sectionVisible, setSectionVisible] = useState(true)
  const [headings, setHeadings] = useState({ tagline: 'Our World', title: 'Moments of transformation' })
  const sectionRef = useRef(null)
  const headerRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start 95%', 'start 15%'] })
  const headerY       = useTransform(scrollYProgress, [0, 1], [80, 0])
  const headerOpacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const headerScale   = useTransform(scrollYProgress, [0, 1], [0.5, 1])

  useEffect(() => {
    const load = async () => {
      try {
        const [res, contRes] = await Promise.all([
          axios.get(`${API}/api/sections/gallery`),
          axios.get(`${API}/api/content/gallery`).catch(() => ({ data: [] }))
        ])
        const cmap = {}
        ;(contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
        if (Object.keys(cmap).length > 0) {
          setHeadings(h => ({ tagline: cmap.tagline || h.tagline, title: cmap.title || h.title }))
          if (cmap.visible !== undefined) setSectionVisible(cmap.visible !== 'false')
        }
        const fetched = res.data.items || []
        setItems(fetched.length > 0 ? fetched : FALLBACK_GALLERY)
      } catch {
        setItems(FALLBACK_GALLERY)
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [])

  // Don't render anything until data is loaded — prevents hooks-order crash
  if (!loaded) return null
  // Full section hidden from admin toggle
  if (!sectionVisible) return null

  // ≤5 items → single row, >5 → split into 2 rows
  const twoRows = items.length > 5
  const row1 = twoRows ? items.slice(0, Math.ceil(items.length / 2)) : items
  const row2 = twoRows ? items.slice(Math.ceil(items.length / 2)) : []

  return (
    <section
      ref={sectionRef}
      className="media-gallery-section"
      style={{ background: 'transparent', overflow: 'hidden', margin: 0 }}
    >
      {/* Header */}
      <motion.div
        ref={headerRef}
        style={{
          textAlign: 'center', maxWidth: '800px',
          margin: '0 auto 50px',
          y: headerY, opacity: headerOpacity, scale: headerScale, padding: '0 20px',
          transformOrigin: 'center bottom'
        }}
      >
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(32px, 6vw, 76px)',
          fontWeight: 700, color: 'var(--dark)',
          lineHeight: 1.1, letterSpacing: '-0.5px',
          marginBottom: '0', whiteSpace: 'normal'
        }}>
          {headings.title.split(' ').length > 1 ? (
            <>
              {headings.title.split(' ').slice(0, -1).join(' ')}{' '}
              <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--dark2)' }}>
                {headings.title.split(' ').slice(-1)}
              </span>
            </>
          ) : headings.title}
        </h2>
      </motion.div>

      {/* Gallery Rows — hidden/shown by admin toggle */}
      <AnimatePresence>
        {sectionVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Row 1 — always shown, scrolls left */}
            <ScrollRow
              items={row1}
              direction="left"
              paused={paused}
              onPause={() => setPaused(true)}
              onResume={() => setPaused(false)}
              staggerFlip={true}
            />

            {/* Row 2 — only when items > 5, scrolls right */}
            {twoRows && (
              <ScrollRow
                items={row2}
                direction="right"
                paused={paused}
                onPause={() => setPaused(true)}
                onResume={() => setPaused(false)}
                staggerFlip={false}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>

      <style>{`
        :root { --gallery-scale: 1.1; }
        .media-gallery-section { padding: 40px 0 100px 0; }
        .gallery-nav-btn { opacity: 0; }
        .media-gallery-section:hover .gallery-nav-btn { opacity: 1; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .gallery-desc-scroll::-webkit-scrollbar { width: 3px; }
        .gallery-desc-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .gallery-desc-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 4px; }
        @media (max-width: 768px) {
          :root { --gallery-scale: 0.8; }
          .media-gallery-section { padding: 20px 0 60px 0; }
          .gallery-nav-btn { display: none !important; }
        }
      `}</style>
    </section>
  )
}
