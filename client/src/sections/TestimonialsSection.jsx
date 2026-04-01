import { useState, useRef, useEffect } from 'react'
import { HR_TESTIMONIALS, EMPLOYEE_TESTIMONIALS } from '../constants/testimonials'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
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
        <p
          className="testimonial-company"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '24px', fontWeight: 600,
            color: 'var(--primary)',
            marginBottom: '16px',
            letterSpacing: '0.5px'
          }}>
          {testimonial.name}
        </p>

        <div style={{
          display: 'flex', gap: '4px',
          marginBottom: '24px'
        }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{
              color: i < (testimonial.rating || 5) ? 'rgba(226,212,186,0.9)' : 'rgba(226,212,186,0.3)',
              fontSize: '16px',
              opacity: 0.9
            }}>★</span>
          ))}
        </div>

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
  const sectionRef = useRef(null)
  const [testimonials, setTestimonials] = useState([])
  const [headings, setHeadings] = useState({
    tagline: 'Voices of SWA',
    title: 'Client Testimonials',
    subtitle: 'Hear directly from the organizations and individuals experiencing the profound shifts of a mindful workplace.'
  })

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const [testRes, contRes] = await Promise.all([
          axios.get(`${API}/api/sections/testimonials`),
          axios.get(`${API}/api/content/testimonials`).catch(() => ({ data: [] }))
        ])

        // Map Headings
        const cmap = {}
          ; (contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
        if (Object.keys(cmap).length > 0) {
          setHeadings(h => ({
            tagline: cmap.tagline || h.tagline,
            title: cmap.title || h.title,
            subtitle: cmap.subtitle || h.subtitle
          }))
        }

        if (testRes.data.items && testRes.data.items.length > 0) {
          setTestimonials(testRes.data.items)
        } else {
          // Fallback to constants mapped to match DB model structure
          const combined = [...HR_TESTIMONIALS, ...EMPLOYEE_TESTIMONIALS].map(t => ({
            name: t.company, // maps company to name
            rating: 5,
            quote: t.quote,
            text: t.text
          }))
          setTestimonials(combined)
        }
      } catch (err) {
        const combined = [...HR_TESTIMONIALS, ...EMPLOYEE_TESTIMONIALS].map(t => ({
          name: t.company,
          rating: 5,
          quote: t.quote,
          text: t.text
        }))
        setTestimonials(combined)
      }
    }
    fetchTestimonials()
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const headerY = useTransform(scrollYProgress, [0, 1], [80, -80])
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15, 0.7, 1], [0, 1, 1, 0])
  const headerScale = useTransform(scrollYProgress, [0, 0.2, 0.7, 1], [0.92, 1, 1, 0.95])

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
              {headings.tagline}
            </span>
          </div>

          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 700,
            color: 'var(--white)',
            marginBottom: '32px',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            whiteSpace: 'pre-wrap'
          }}>
            {headings.title}
          </h2>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '48px',
            fontWeight: 400,
            maxWidth: '600px',
            whiteSpace: 'pre-line'
          }}>
            {headings.subtitle}
          </p>
        </motion.div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {testimonials.length > 0 && (
          <MarqueeTrack testimonials={testimonials} />
        )}
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
        }
      `}</style>
    </section>
  )
}
