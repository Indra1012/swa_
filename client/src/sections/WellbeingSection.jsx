import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
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
  { id: '10', title: 'Social Wellness', subtitle: 'Authentic connection', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80', readMoreText: 'Cultivating meaningful relationships and community bonds that nourish the soul and support resilience.' },
  { id: '11', title: 'Purpose Clarity', subtitle: 'Your inner compass', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', readMoreText: 'Deep inquiry practices to uncover your authentic values and align daily actions with deeper purpose.' },
  { id: '12', title: 'Inner Resilience', subtitle: 'Bouncing forward', image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&q=80', readMoreText: 'Building the psychological flexibility and inner strength to navigate life\'s challenges with grace.' },
]

function WellbeingCard({ item, index }) {
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="wellbeing-card"
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hovered ? '0 20px 40px rgba(101,50,57,0.2)' : '0 8px 24px rgba(101,50,57,0.08)',
        transition: 'all 0.4s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        isolation: 'isolate'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ height: expanded ? '180px' : '280px', position: 'relative', transition: 'height 0.4s ease' }}>
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.7s ease'
            }}
          />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: hovered
            ? 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 60%)',
          transition: 'background 0.5s ease'
        }} />
        <div style={{
          position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: 'var(--white)'
        }}>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(16px, 1.4vw, 20px)',
            fontWeight: 600, lineHeight: 1.15, marginBottom: '4px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {item.title}
          </h3>
          <p style={{ fontSize: '11px', fontStyle: 'italic', opacity: 0.85, marginBottom: '8px' }}>
            {item.subtitle}
          </p>
          {item.readMoreText && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50px', padding: '4px 11px', fontSize: '10px', fontWeight: 700,
                letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--white)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                backdropFilter: 'blur(8px)', transition: 'all 0.3s ease'
              }}
            >
              {expanded ? 'CLOSE' : 'READ MORE'}
              <FiChevronDown size={10} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }} />
            </button>
          )}
        </div>
      </div>

      {/* Expandable read more panel */}
      {expanded && item.readMoreText && (
        <div style={{
          padding: '14px 16px', background: 'var(--white)',
          borderTop: '1px solid rgba(204,199,185,0.2)'
        }}>
          <p style={{
            fontSize: '13px', color: 'var(--secondary)', lineHeight: 1.7,
            fontFamily: 'DM Sans, sans-serif', margin: 0
          }}>
            {item.readMoreText}
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default function WellbeingSection() {
  const [items, setItems] = useState([])
  const [visible, setVisible] = useState(true)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px 0px' })

  useEffect(() => {
    const load = async () => {
      try {
        const [visRes, itemsRes] = await Promise.all([
          axios.get(`${API}/api/sections/settings/wellbeing-visible`),
          axios.get(`${API}/api/sections/techniques/wellbeing`)
        ])
        // Only hide if explicitly set to false
        if (visRes.data.visible === false) setVisible(false)
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

  if (!visible) return null

  return (
    <section
      ref={sectionRef}
      className="wellbeing-section"
      style={{ background: 'var(--bg)', margin: 0 }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: '13px', color: 'var(--accent)', letterSpacing: '3px',
              textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600
            }}
          >
            Our Methodology
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 700, color: 'var(--dark)',
              marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.5px'
            }}
          >
            12 Wellbeing <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Processes</span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: '18px', color: 'var(--secondary)', lineHeight: 1.7,
              maxWidth: '600px', margin: '0 auto', fontWeight: 400
            }}
          >
            A comprehensive framework for holistic transformation — mind, body and soul.
          </motion.p>
        </div>

        {/* Grid — 6 per row on desktop */}
        <div className="wellbeing-grid">
          {items.map((item, i) => (
            <WellbeingCard key={item.id || i} item={item} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        .wellbeing-section { padding: 80px 60px; }
        .wellbeing-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
        }
        @media (max-width: 1200px) {
          .wellbeing-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 900px) {
          .wellbeing-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
        }
        @media (max-width: 768px) {
          .wellbeing-section { padding: 60px 20px; }
          .wellbeing-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
    </section>
  )
}
