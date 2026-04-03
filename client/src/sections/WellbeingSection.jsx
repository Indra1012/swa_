import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const FALLBACK_WELLBEING = [
  { id: '1', title: 'Breath Awareness', subtitle: 'Foundation of calm', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', readMoreText: 'Breath awareness is the foundation of all mindfulness practices. By simply noticing the natural rhythm of your breath, you create a powerful anchor to the present moment.' },
  { id: '2', title: 'Body Scan', subtitle: 'Deep somatic release', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', readMoreText: 'A systematic practice of bringing attention to each part of the body, releasing tension and cultivating deep body awareness.' },
  { id: '3', title: 'Mindful Movement', subtitle: 'Flow in awareness', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', readMoreText: 'Integrating mindfulness with gentle movement to enhance body-mind connection and reduce physical tension.' },
  { id: '4', title: 'Emotional Mapping', subtitle: 'Inner landscape', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80', readMoreText: 'Learning to identify, name, and understand your emotional states with compassion and clarity.' },
  { id: '5', title: 'Gratitude Practice', subtitle: 'Shift in perspective', image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&q=80', readMoreText: 'Systematic cultivation of appreciation for life\'s gifts, proven to elevate mood and overall wellbeing.' },
  { id: '6', title: 'Stress Release', subtitle: 'Tension dissolving', image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&q=80', readMoreText: 'Evidence-based techniques to identify stress triggers and systematically release their hold on your nervous system.' },
  { id: '7', title: 'Sleep Hygiene', subtitle: 'Restorative rest', image: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=400&q=80', readMoreText: 'Building healthy sleep rituals and routines that support deep, restorative rest and waking vitality.' },
  { id: '8', title: 'Mindful Nutrition', subtitle: 'Conscious eating', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', readMoreText: 'Developing a healthy relationship with food through awareness, presence, and intuitive eating principles.' },
  { id: '9', title: 'Digital Detox', subtitle: 'Reclaim presence', image: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&q=80', readMoreText: 'Intentional practices for creating healthy boundaries with technology to restore attention and inner peace.' },
  { id: '10', title: 'Social Wellbeing', subtitle: 'Authentic connection', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80', readMoreText: 'Cultivating meaningful relationships and community bonds that nourish the soul and support resilience.' },
  { id: '11', title: 'Purpose Clarity', subtitle: 'Your inner compass', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', readMoreText: 'Deep inquiry practices to uncover your authentic values and align daily actions with deeper purpose.' },
  { id: '12', title: 'Inner Resilience', subtitle: 'Bouncing forward', image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&q=80', readMoreText: 'Building the psychological flexibility and inner strength to navigate life\'s challenges with grace.' },
]

export default function WellbeingSection() {
  const [items, setItems] = useState([])
  const [headings, setHeadings] = useState({
    title: '12 Wellbeing Processes',
    subtitle: 'A comprehensive framework for holistic transformation — mind, body and soul.'
  })
  const [visible, setVisible] = useState(true)
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ["start 95%", "start 15%"] })
  const headerY = useTransform(scrollYProgress, [0, 1], [80, 0])
  const headerScale = useTransform(scrollYProgress, [0, 1], [0.5, 1])
  const headerOpacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const isInView = useInView(sectionRef, { once: true, margin: '-100px 0px' })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [visRes, itemsRes, contRes] = await Promise.all([
          axios.get(`${API}/api/sections/settings/wellbeing-visible`),
          axios.get(`${API}/api/sections/techniques/wellbeing`),
          axios.get(`${API}/api/content/wellbeing`).catch(() => ({ data: [] }))
        ])
        if (visRes.data.visible === false) setVisible(false)

        const cmap = {}
        ;(contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
        if (Object.keys(cmap).length > 0) {
          setHeadings(h => ({
            title: cmap.title || h.title,
            subtitle: cmap.subtitle || h.subtitle
          }))
        }

        const fetched = itemsRes.data.items || []
        setItems(fetched.length > 0
          ? fetched.map(t => ({ id: t._id, title: t.title, subtitle: t.subtitle, image: t.image, readMoreText: t.readMoreText || '' }))
          : FALLBACK_WELLBEING
        )
      } catch {
        setItems(FALLBACK_WELLBEING)
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
          const firstRow = containerRef.current.children[0]
          const firstCard = firstRow ? firstRow.children[0] : null
          const scrollAmount = firstCard ? firstCard.clientWidth + 32 : 372
          containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [isHovered])

  if (!visible) return null

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <section
        ref={sectionRef}
        className="healing-section wellbeing-section"
        style={{ background: 'var(--bg)', margin: 0 }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Header */}
          <motion.div 
            ref={headerRef}
            className="healing-header" 
            style={{ 
              textAlign: 'center', 
              marginBottom: '60px',
              y: headerY,
              scale: headerScale,
              opacity: headerOpacity,
              transformOrigin: 'center bottom'
            }}
          >
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontWeight: 700, color: 'var(--dark)',
                marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.5px'
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
            <p
              style={{
                fontSize: '18px', color: 'var(--dark)', lineHeight: 1.7,
                maxWidth: '600px', margin: '0 auto', fontWeight: 500
              }}
            >
              {headings.subtitle}
            </p>
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
              flexDirection: 'column',
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
            <div style={{ display: 'flex', gap: '32px', width: 'max-content', minHeight: '460px', flexShrink: 0 }}>
              {items.slice(0, 6).map((item) => (
                <WellbeingCard key={item.id} item={item} />
              ))}
            </div>
            {items.length > 6 && (
              <div style={{ display: 'flex', gap: '32px', width: 'max-content', minHeight: '460px', flexShrink: 0 }}>
                {items.slice(6).map((item) => (
                  <WellbeingCard key={item.id} item={item} />
                ))}
              </div>
            )}
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

function WellbeingCard({ item }) {
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const currentImageSrc = item.image || ''

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
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ height: '460px', position: 'relative' }}
      >
        {currentImageSrc && (
          <img
            src={currentImageSrc}
            alt={item.title}
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
          position: 'absolute', bottom: '30px', left: '30px', right: '30px',
          color: 'var(--white)',
        }}>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: '28px',
            fontWeight: 600, lineHeight: 1.1, marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {item.title}
          </h3>
          <p style={{ fontSize: '14px', fontStyle: 'italic', opacity: 0.9, marginBottom: '12px' }}>
            {item.subtitle}
          </p>
          {expanded && item.readMoreText && (
            <div style={{ 
               marginTop: '12px', marginBottom: '16px'
            }}>
               <p style={{
                  fontSize: '14px', color: 'rgba(255,255,255,0.95)', lineHeight: 1.6,
                  fontFamily: 'DM Sans, sans-serif', margin: 0,
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)'
               }}>
                  {item.readMoreText}
               </p>
            </div>
          )}

          {item.readMoreText && (
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
