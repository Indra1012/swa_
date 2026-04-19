import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useScrollFade from '../hooks/useScrollFade'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL



export default function CTABanner() {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  
  const [slides, setSlides] = useState([])
  const [mediaMode, setMediaMode] = useState('image')
  const [videoUrl, setVideoUrl] = useState('')
  const [hasData, setHasData] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const sectionRef = useRef(null)
  useScrollFade(sectionRef)

  useEffect(() => {
    const load = async () => {
      try {
        const [contentRes, mediaRes] = await Promise.all([
          axios.get(`${API}/api/content/cta`),
          axios.get(`${API}/api/media/cta`)
        ])
        
        const items = contentRes.data.items || contentRes.data || []
        let texts = [null, null, null]
        let type = 'image'
        items.forEach(i => {
           if (i.key === 'slide0') texts[0] = i.value
           if (i.key === 'slide1') texts[1] = i.value
           if (i.key === 'slide2') texts[2] = i.value
           if (i.key === 'mediaType') type = i.value
        })
        setMediaMode(type)
        
        const media = mediaRes.data.media || []
        const imgs = media.filter(m => m.type !== 'video').map(m => m.url)
        const vid = media.find(m => m.type === 'video')

        if (vid) setVideoUrl(vid.url)

        const finalSlides = []
        if(texts[0] && imgs[0]) finalSlides.push({ title: texts[0], image: imgs[0] })
        if(texts[1] && imgs[1]) finalSlides.push({ title: texts[1], image: imgs[1] })
        if(texts[2] && imgs[2]) finalSlides.push({ title: texts[2], image: imgs[2] })
        setSlides(finalSlides)
        setHasData(finalSlides.length > 0)
      } catch {
        console.error('Failed to load CTA slides')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = useCallback((i) => setCurrent(i), [])

  if (isLoading) return (
    <section ref={sectionRef} className="cta-section" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(175, 122, 109, 0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </section>
  )

  if (slides.length === 0 && mediaMode === 'image') return null

  return (
    <section
      ref={sectionRef}
      className="fade-up cta-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: 0
      }}
    >
      {mediaMode === 'video' && videoUrl ? (
        <video
           src={videoUrl}
           autoPlay loop muted playsInline
           style={{
             position: 'absolute', inset: 0,
             width: '100%', height: '100%',
             objectFit: 'cover', zIndex: 0
           }}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={slides[current].image}
            alt=""
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover'
            }}
          />
        </AnimatePresence>
      )}

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(101,50,57,0.58)'
      }} />

      {/* Content */}
      <div
        className="cta-content"
        style={{
          position: 'relative', zIndex: 2,
          maxWidth: '860px'
        }}>
        <AnimatePresence mode="wait">
          <motion.h2
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 700,
              color: 'var(--white)',
              lineHeight: 1.25,
              marginBottom: '32px',
              textShadow: '0 2px 20px rgba(0,0,0,0.2)'
            }}
          >
            {slides[current].title}
          </motion.h2>
        </AnimatePresence>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/book-demo')}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? 'rgba(242,228,213,0.3)' : 'rgba(242,228,213,0.15)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(242,228,213,0.7)',
            color: 'var(--white)',
            borderRadius: '50px',
            padding: '14px 40px',
            fontSize: '16px', fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center', gap: '8px',
            transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'var(--transition)',
            fontFamily: 'DM Sans, sans-serif'
          }}
        >
          Connect for wellbeing &nbsp;→
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px'
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                width: current === i ? '24px' : '8px',
                height: '8px',
                borderRadius: current === i ? '4px' : '50%',
                background: current === i ? 'var(--white)' : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        .cta-section { height: 480px; }
        .cta-content { padding: 0 40px; }
        @media (max-width: 768px) {
          .cta-section { height: 540px; }
          .cta-content { padding: 0 20px; }
        }
      `}</style>
    </section>
  )
}
