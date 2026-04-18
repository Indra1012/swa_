import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

function TestimonialCard({ testimonial }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="testimonial-card"
      style={{
        width: 'clamp(240px, 80vw, 300px)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        background: hovered ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: hovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '48px 32px',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
        boxShadow: hovered ? '0 30px 60px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}
    >
      <div
        className="testimonial-quote-mark"
        style={{
          position: 'absolute',
          top: '-5px', right: '10px',
          fontSize: '140px', fontFamily: 'Cormorant Garamond, serif',
          color: 'rgba(255,255,255,0.05)',
          lineHeight: 1, pointerEvents: 'none',
          userSelect: 'none',
          fontWeight: 700
        }}>
        "
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p
          className="testimonial-company"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20px', fontWeight: 600,
            color: 'var(--white)',
            marginBottom: '12px',
            letterSpacing: '0.5px'
          }}>
          {testimonial.name}
        </p>

        <div style={{
          display: 'flex', gap: '4px',
          marginBottom: '20px'
        }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{
              color: i < (testimonial.rating || 5) ? 'rgba(226,212,186,0.9)' : 'rgba(226,212,186,0.3)',
              fontSize: '14px',
              opacity: 0.9
            }}>★</span>
          ))}
        </div>

        {testimonial.quote && (
          <p
            className="testimonial-quote"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '19px', fontWeight: 600,
              color: 'var(--white)',
              marginBottom: '14px',
              lineHeight: 1.4,
              letterSpacing: '-0.3px',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
            "{testimonial.quote}"
          </p>
        )}

        <p
          className="testimonial-text"
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.8,
            fontFamily: 'DM Sans, sans-serif',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
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

  const multipled = [...testimonials, ...testimonials, ...testimonials, ...testimonials]

  useEffect(() => {
    if (isHovered || !scrollRef.current) return

    let animationId
    const step = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += 1.2
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft -= scrollRef.current.scrollWidth / 2
        }
      }
      animationId = requestAnimationFrame(step)
    }

    animationId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationId)
  }, [isHovered, testimonials])

  if (testimonials.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="hide-scrollbar marquee-track-container"
      style={{
        overflowX: 'auto', padding: '20px 0 80px',
        msOverflowStyle: 'none', scrollbarWidth: 'none',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
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
  const sectionRef = useRef(null)
  const [testimonials, setTestimonials] = useState([])
  const [headings, setHeadings] = useState({
    title: 'Our Network & Impact',
    subtitle: 'We are honored to have collaborated with and empowered these prestigious institutions, organizations, and civic bodies.'
  })

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const [testRes, contRes] = await Promise.all([
          axios.get(`${API}/api/sections/testimonials`),
          axios.get(`${API}/api/content/testimonials`).catch(() => ({ data: [] }))
        ])

        const cmap = {}
          ; (contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
        if (Object.keys(cmap).length > 0) {
          setHeadings(h => ({
            title: cmap.title !== undefined ? cmap.title : h.title,
            subtitle: cmap.subtitle !== undefined ? cmap.subtitle : h.subtitle
          }))
        }

        if (testRes.data.items && testRes.data.items.length > 0) {
          setTestimonials(testRes.data.items)
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err)
      }
    }
    fetchTestimonials()
  }, [])

  const headerRef = useRef(null)
  const { scrollYProgress: slideProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] })
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ["start 95%", "start 15%"] })

  const headerY = useTransform(scrollYProgress, [0, 1], [80, 0])
  const headerOpacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const headerScale = useTransform(scrollYProgress, [0, 1], [0.5, 1])
  const cardsY = useTransform(slideProgress, [0, 1], [60, -60])

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
        <motion.div
          ref={headerRef}
          style={{
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            y: headerY,
            opacity: headerOpacity,
            scale: headerScale,
            transformOrigin: 'center bottom',
            padding: '0 20px'
          }}
        >
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            color: 'var(--white)',
            marginBottom: '20px',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            whiteSpace: 'pre-wrap'
          }}>
            {headings.title}
          </h2>

          <p style={{
            fontSize: '17px',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '32px',
            fontWeight: 400,
            maxWidth: '640px',
            whiteSpace: 'pre-line'
          }}>
            {headings.subtitle}
          </p>
        </motion.div>
      </div>

      <motion.div style={{ position: 'relative', zIndex: 1, y: cardsY }}>
        {testimonials.length > 0 && (
          <MarqueeTrack testimonials={testimonials} />
        )}
      </motion.div>
      <style>{`
        .testimonials-section { padding: 60px 0; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .testimonials-section { padding: 40px 0; }
          .testimonial-card { 
            width: clamp(200px, 75vw, 240px) !important;
            min-height: 320px !important; 
            padding: 32px 24px !important; 
            border-radius: 16px !important; 
          }
          .testimonial-company { font-size: 16px !important; margin-bottom: 8px !important; }
          .testimonial-quote { font-size: 15px !important; margin-bottom: 10px !important; line-height: 1.3 !important; }
          .testimonial-text { font-size: 11px !important; line-height: 1.6 !important; }
          .testimonial-quote-mark { font-size: 100px !important; top: -2px !important; right: 5px !important; }
        }
      `}</style>
    </section>
  )
}
