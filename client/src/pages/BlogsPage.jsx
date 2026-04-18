

import { useEffect, useRef, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import axios from 'axios'
import useScrollFade from '../hooks/useScrollFade'
import { TECHNIQUES } from '../constants/techniques'
import BlogModal from '../components/BlogModal'

// Pure Editorial Minimalist Approach (Blank Card Layout)
function TechniqueEditorial({ tech, index, onReadMore }) {
  const [cardHovered, setCardHovered] = useState(false)

  const validImages = tech.images && tech.images.length > 0 ? tech.images : [tech.image].filter(Boolean)
  const blockRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ["start end", "end start"]
  })

  // Float animation on scroll
  const containerY = useTransform(scrollYProgress, [0, 1], [40, -40])

  const currentImageSrc = validImages[0] || ''

  return (
    <motion.div
      id={tech.id}
      ref={blockRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        flexDirection: 'row', // Image Left, Card Right
        width: '100%',
        cursor: 'pointer',
        y: containerY
      }}
      className="editorial-row"
      onClick={() => onReadMore && onReadMore(tech)}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      {/* 
        Image Block (Top-Left)
        Sits in front (z-index: 10), casts shadow on the white card.
      */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
        style={{
          flexShrink: 0,
          width: '220px',
          height: '330px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: cardHovered ? '20px 20px 60px rgba(0,0,0,0.25)' : '10px 10px 40px rgba(0,0,0,0.15)',
          position: 'relative',
          zIndex: 10,
          transition: 'box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          isolation: 'isolate'
        }}
        className="editorial-image"
      >
        {currentImageSrc && (
          <img
            src={currentImageSrc}
            alt={tech.title}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transform: cardHovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        )}
      </motion.div>

      {/* 
        White Card Block (Bottom-Right)
        Sits behind image (z-index: 1), shifted down and left.
        Completely blank as requested.
      */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 + 0.5 }}
        style={{
          width: '260px',
          height: '360px',
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-start', alignItems: 'flex-start',
          background: 'rgba(252, 250, 248, 0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '20px',
          marginLeft: '-50px', // Precise horizontal overlap
          marginTop: '40px', // Push card down relative to image top
          padding: '30px',
          paddingLeft: '74px', // Extra padding to clear the 50px overlap
          boxShadow: cardHovered ? '0 20px 60px rgba(101, 50, 57, 0.12)' : '0 10px 40px rgba(101, 50, 57, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="editorial-content"
      >
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', height: '100%'
        }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '22px',
            color: 'var(--dark)',
            lineHeight: 1.25,
            marginTop: 0,
            marginBottom: '16px',
            fontWeight: 500,
            letterSpacing: '0'
          }}>
            {tech.title}
          </h2>

          {tech.snippet && (
            <p className="editorial-snippet" style={{
              fontSize: '11px',
              color: 'var(--secondary)',
              lineHeight: 1.5,
              flex: 1, // Pushes Read More all the way down
              whiteSpace: 'pre-line',
              margin: 0
            }}>
              {tech.snippet}
            </p>
          )}

          <div
            onClick={(e) => { e.stopPropagation(); onReadMore && onReadMore(tech) }}
            style={{
              marginTop: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              borderBottom: '1px solid var(--accent)',
              paddingBottom: '2px',
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}>
            Read More
          </div>
          {(tech.publishDate || tech.createdAt) && (
            <div style={{ marginTop: '8px', fontSize: '9px', color: 'var(--secondary)', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
              {tech.publishDate 
                ? tech.publishDate 
                : `Published: ${new Date(tech.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function BlogsPage() {
  const { hash } = useLocation()
  const { blogId } = useParams()
  const navigate = useNavigate()

  const [blogs, setBlogs] = useState(TECHNIQUES)
  const [selectedTech, setSelectedTech] = useState(null)
  const [headings, setHeadings] = useState({
    title: 'Swa Insights',
    subtitle: 'Reflections on growth, alignment, and coming home to yourself'
  })

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || ''
    const now = Date.now()

    // Fetch blogs from API (insights = Swa Insights)
    axios.get(`${API}/api/sections/techniques/insights?t=${now}`)
      .then(res => {
        const apiBlogs = res.data.items || []
        if (apiBlogs.length > 0) {
          setBlogs(apiBlogs
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(b => ({
              id: b._id,
              title: b.title,
              subtitle: b.subtitle || b.focus || '',
              snippet: b.snippet || b.subtitle || b.focus || '',
              readMoreText: b.readMoreText || '',
              createdAt: b.createdAt,
              publishDate: b.publishDate,
              images: b.images?.length > 0 ? b.images.map(img => typeof img === 'string' ? img : img.url) : b.image ? [b.image] : [],
              image: b.image || (b.images?.[0] ? (typeof b.images[0] === 'string' ? b.images[0] : b.images[0].url) : '')
            })))
        }
        // else: keep TECHNIQUES static fallback
      })
      .catch(() => {})

    // Fetch page headings from API
    axios.get(`${API}/api/content/insights?t=${now}`)
      .then(res => {
        const cmap = {}
        const arr = res.data.items || res.data || []
        arr.forEach(i => cmap[i.key] = i.value)
        if (cmap.title || cmap.subtitle) {
          setHeadings(prev => ({
            title: cmap.title || prev.title,
            subtitle: cmap.subtitle || prev.subtitle
          }))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (blogs.length > 0 && blogId) {
      const found = blogs.find(b => b.id === blogId)
      if (found) setSelectedTech(found)
      else setSelectedTech(null)
    } else {
      setSelectedTech(null)
    }
  }, [blogId, blogs])

  // Hash scrolling logic, highly precise with setTimeout
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          // Adjust for navbar height
          const y = element.getBoundingClientRect().top + window.scrollY - 100
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 300)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [hash])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <main style={{
          position: 'relative',
          background: 'transparent',
          minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', overflow: 'hidden'
        }}>

          {/* Ambient Luxury Lighting Gradients */}
          <motion.div
            animate={{ y: [0, -60, 0], x: [0, 40, 0], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
              background: 'radial-gradient(circle, rgba(220, 150, 100, 0.08) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none'
            }}
          />
          <motion.div
            animate={{ y: [0, 50, 0], x: [0, -40, 0], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{
              position: 'fixed', bottom: '-10%', right: '-5%', width: '60vw', height: '60vw',
              background: 'radial-gradient(circle, rgba(150, 170, 140, 0.07) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none'
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            style={{
              position: 'fixed', top: '40%', left: '30%', width: '40vw', height: '40vw',
              background: 'radial-gradient(circle, rgba(200, 180, 160, 0.06) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
            }}
          />

          {/* Foreground Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Page Intro Hero */}
            <motion.section
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                }
              }}
              style={{ paddingTop: '40px', paddingBottom: '20px', paddingLeft: '40px', paddingRight: '40px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', marginBottom: '40px' }}
            >
              {/* Subheading removed as requested */}

              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: -40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(26px, 5vw, 72px)',
                  fontWeight: 700,
                  color: 'var(--dark)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.5px',
                  marginBottom: '32px',
                }}
              >
                {headings.title.split(' ').map((word, idx) => (
                  <span key={idx} style={idx > 0 ? { fontStyle: 'italic', fontWeight: 500, color: 'var(--dark2)' } : { marginRight: '14px' }}>
                    {word}{' '}
                  </span>
                ))}
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: -40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
                }}
                style={{
                  fontSize: '18px', color: 'var(--secondary)', lineHeight: 1.8, fontWeight: 500
                }}
              >
                {headings.subtitle}
              </motion.p>
            </motion.section>

            {/* Techniques Scrolling Blocks */}
            <div className="techniques-grid">
              {blogs.map((tech, i) => (
                <TechniqueEditorial
                  key={tech.id}
                  tech={tech}
                  index={i}
                  onReadMore={(t) => navigate(`/blogs/${t.id}`)}
                />
              ))}
            </div>

            <AnimatePresence>
              {selectedTech && (
                <BlogModal
                  isOpen={!!selectedTech}
                  blog={selectedTech}
                  onClose={() => navigate('/blogs')}
                />
              )}
            </AnimatePresence>

            <style>{`
        .techniques-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 100px 30px;
          padding: 0 40px;
        }

        @media (max-width: 1360px) {
          .techniques-grid {
            grid-template-columns: 1fr;
            max-width: 700px;
            gap: 120px;
          }
        }

        /* Tablet Scaling */
        @media (max-width: 1360px) and (min-width: 769px) {
          .editorial-row {
            align-items: flex-start !important;
          }
          .editorial-image {
            width: 300px !important;
            height: 450px !important;
          }
          .editorial-content {
            width: 340px !important;
            height: 480px !important;
            margin-left: -80px !important;
            margin-top: 50px !important;
          }
        }

        /* Mobile Responsive Scaling */
        @media (max-width: 768px) {
          .techniques-grid {
            grid-template-columns: 1fr;
            padding: 0 16px;
            gap: 100px;
          }
          
          .editorial-row { 
            align-items: center !important;
            width: 100% !important;
            gap: 0 !important;
            flex-direction: row !important; /* Stack horizontally */
          }
          
          .editorial-image { 
            width: 44% !important; 
            max-width: none !important;
            height: auto !important; 
            aspect-ratio: 0.65 !important; /* Distinct vertical rectangle */
            border-radius: 12px !important;
            margin: 0 !important;
            z-index: 10 !important;
          }
          
          .editorial-content { 
            width: 68% !important; 
            max-width: none !important;
            height: auto !important;
            aspect-ratio: auto !important; /* Allow the height to naturally hug the content */
            margin: 0 !important;
            margin-left: -12% !important; /* Horizontal overlap inwards */
            margin-top: 0 !important; 
            padding: 36px 16px 36px 17% !important; /* Clever padding to clear the 12% overlap with larger top/bottom clearance! */
            border-radius: 16px !important;
            min-height: 280px !important; /* Keep it as a moderate vertical rectangle but don't artificially blow it up */
            z-index: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          
          .editorial-snippet {
            -webkit-line-clamp: 14 !important; /* Allow snippet to vastly expand on phone, organically building the tall vertical card! */
          }
        }
        
        .editorial-snippet {
          display: -webkit-box;
          -webkit-line-clamp: 10;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
          </div>
        </main>
      </div>
    </div>
  )
}
