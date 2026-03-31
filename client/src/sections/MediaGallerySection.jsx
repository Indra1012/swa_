import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { FiX, FiPlay } from 'react-icons/fi'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const FALLBACK_GALLERY = [
  { _id: '1', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', type: 'image', sizeVariant: 'landscape' },
  { _id: '2', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', type: 'image', sizeVariant: 'portrait' },
  { _id: '3', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', type: 'image', sizeVariant: 'medium' },
  { _id: '4', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80', type: 'image', sizeVariant: 'small' },
  { _id: '5', url: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&q=80', type: 'image', sizeVariant: 'large' },
  { _id: '6', url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80', type: 'image', sizeVariant: 'small' },
  { _id: '7', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', type: 'image', sizeVariant: 'medium' },
  { _id: '8', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', type: 'image', sizeVariant: 'landscape' },
  { _id: '9', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80', type: 'image', sizeVariant: 'large' },
  { _id: '10', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', type: 'image', sizeVariant: 'portrait' },
]

const SIZE_MAP = {
  small:     { width: '220px', height: '200px' },
  medium:    { width: '300px', height: '240px' },
  large:     { width: '400px', height: '280px' },
  portrait:  { width: '200px', height: '320px' },
  landscape: { width: '460px', height: '230px' },
}

function GalleryCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false)
  const size = SIZE_MAP[item.sizeVariant] || SIZE_MAP.medium

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(item)}
      style={{
        flexShrink: 0,
        width: size.width,
        height: size.height,
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.4s ease, box-shadow 0.4s ease',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.15)'
      }}
    >
      {item.type === 'video' ? (
        <>
          <video
            src={item.url}
            muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: hovered ? 'scale(1.12)' : 'scale(1)',
              transition: 'transform 0.3s ease'
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
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.6s ease'
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered ? 'rgba(101,50,57,0.18)' : 'transparent',
            transition: 'background 0.4s ease'
          }} />
        </>
      )}
    </div>
  )
}

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
        style={{
          maxWidth: '90vw', maxHeight: '88vh',
          borderRadius: '16px', overflow: 'hidden'
        }}
      >
        {item.type === 'video' ? (
          <video
            src={item.url}
            controls autoPlay
            style={{ maxWidth: '90vw', maxHeight: '88vh', display: 'block' }}
          />
        ) : (
          <img
            src={item.url}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '88vh', display: 'block', objectFit: 'contain' }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export default function MediaGallerySection() {
  const [items, setItems] = useState([])
  const [lightbox, setLightbox] = useState(null)
  const [paused, setPaused] = useState(false)
  const sectionRef = useRef(null)
  const row1Ref = useRef(null)
  const row2Ref = useRef(null)
  const anim1Ref = useRef(null)
  const anim2Ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  const headerY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15, 0.7, 1], [0, 1, 1, 0])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/sections/gallery`)
        const fetched = res.data.items || []
        setItems(fetched.length > 0 ? fetched : FALLBACK_GALLERY)
      } catch {
        setItems(FALLBACK_GALLERY)
      }
    }
    load()
  }, [])

  // Initialize row2 at midpoint so reverse-scroll works
  useEffect(() => {
    if (items.length === 0 || !row2Ref.current) return
    const mid = row2Ref.current.scrollWidth / 2
    row2Ref.current.scrollLeft = mid
  }, [items])

  // Auto-scroll animation
  useEffect(() => {
    if (items.length === 0) return

    const step = () => {
      if (!paused) {
        if (row1Ref.current) {
          row1Ref.current.scrollLeft += 0.9
          if (row1Ref.current.scrollLeft >= row1Ref.current.scrollWidth / 2) {
            row1Ref.current.scrollLeft = 0
          }
        }
        if (row2Ref.current) {
          row2Ref.current.scrollLeft -= 0.7
          if (row2Ref.current.scrollLeft <= 0) {
            row2Ref.current.scrollLeft = row2Ref.current.scrollWidth / 2
          }
        }
      }
      anim1Ref.current = requestAnimationFrame(step)
    }

    anim1Ref.current = requestAnimationFrame(step)
    return () => {
      if (anim1Ref.current) cancelAnimationFrame(anim1Ref.current)
    }
  }, [paused, items])

  if (items.length === 0) return null

  // Split into 2 rows
  const half = Math.ceil(items.length / 2)
  const row1 = items.slice(0, half)
  const row2 = items.slice(half).length > 0 ? items.slice(half) : items.slice(0, half)

  // Double for infinite loop
  const row1Items = [...row1, ...row1]
  const row2Items = [...row2, ...row2]

  return (
    <section
      ref={sectionRef}
      className="media-gallery-section"
      style={{ background: 'var(--dark)', overflow: 'hidden', margin: 0 }}
    >
      {/* Header */}
      <motion.div
        style={{
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto 60px',
          y: headerY,
          opacity: headerOpacity,
          padding: '0 20px'
        }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '24px'
        }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
          <span style={{
            fontSize: '13px', color: 'var(--accent)', letterSpacing: '3px',
            textTransform: 'uppercase', fontWeight: 700
          }}>
            Our World
          </span>
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: 700, color: 'var(--white)',
          lineHeight: 1.1, letterSpacing: '-0.5px'
        }}>
          Moments of <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>transformation</span>
        </h2>
      </motion.div>

      {/* Row 1 — scrolls left */}
      <div
        ref={row1Ref}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="gallery-row hide-scrollbar"
        style={{
          display: 'flex', gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
        }}
      >
        {row1Items.map((item, i) => (
          <GalleryCard key={`r1-${i}`} item={item} onClick={setLightbox} />
        ))}
      </div>

      {/* Row 2 — scrolls right */}
      <div
        ref={row2Ref}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="gallery-row hide-scrollbar"
        style={{
          display: 'flex', gap: '16px',
          overflowX: 'auto',
          paddingTop: '16px',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
        }}
      >
        {row2Items.map((item, i) => (
          <GalleryCard key={`r2-${i}`} item={item} onClick={setLightbox} />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>

      <style>{`
        .media-gallery-section { padding: 80px 0; }
        .gallery-row { padding-left: 40px; padding-right: 40px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .media-gallery-section { padding: 60px 0; }
          .gallery-row { padding-left: 20px; padding-right: 20px; gap: 10px !important; }
        }
      `}</style>
    </section>
  )
}
