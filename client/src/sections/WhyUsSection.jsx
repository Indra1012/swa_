import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiAnchor, FiTarget, FiActivity, FiEye } from 'react-icons/fi'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const DEFAULT_PILLARS = [
  { key: 'pillar1', title: "Performance is driven by inner stability, not external pressure.", icon: FiAnchor },
  { key: 'pillar2', title: "Wellbeing is a skill that can be developed.", icon: FiTarget },
  { key: 'pillar3', title: "Transformation happens through consistent experiential learning.", icon: FiActivity },
  { key: 'pillar4', title: "Emotional awareness leads to better decisions and outcomes.", icon: FiEye },
]

/* Each row gets its own scroll-linked parallax so it reacts to scrolling */
function PillarRow({ pillar, index }) {
  const rowRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"]
  })

  // Scroll-Driven Scale Reveal per row — heading scales AND position shift
  const y = useTransform(scrollYProgress, [0, 1], [30 + index * 8, -(20 + index * 8)])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.4, 0.85, 1], [0, 1, 1, 1, 0.3])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.85, 1, 1, 0.97])
  const scaleX = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  const Icon = pillar.icon

  return (
    <motion.div
      ref={rowRef}
      className="pillar-row"
      style={{ y, opacity, scale }}
    >
      {/* Animated divider line that scales in from left on scroll */}
      <div className="pillar-divider-track">
        <motion.div className="pillar-divider-fill" style={{ scaleX, transformOrigin: 'left' }} />
      </div>

      {/* REFINED 2-COLUMN LAYOUT (Left: Icon+Title, Right: Desc) */}
      <div className="pillar-content">

        <div className="pillar-left-group">
          {/* Icon */}
          <div className="pillar-icon">
            <Icon size={20} strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h3 className="pillar-title">{pillar.title}</h3>

        </div>

        {/* Description */}
        {pillar.desc && <p className="pillar-desc">{pillar.desc}</p>}
      </div>
    </motion.div>
  )
}

export default function WhyUsSection() {
  const sectionRef = useRef(null)

  const [phData, setPhData] = useState({
    philosophyTitle: 'Core Philosophy',
    philosophySubtitle: 'We move past quick fixes to provide structured, practical wellbeing programs that create real, lasting changes in your environment.',
    pillar1: DEFAULT_PILLARS[0].title,
    pillar2: DEFAULT_PILLARS[1].title,
    pillar3: DEFAULT_PILLARS[2].title,
    pillar4: DEFAULT_PILLARS[3].title,
  })

  useEffect(() => {
    axios.get(`${API}/api/content/about_philosophy`).then(res => {
      const items = res.data.items || res.data || []
      if (Array.isArray(items) && items.length > 0) {
        const map = {}
        items.forEach(i => { map[i.key] = i.value })
        setPhData(prev => ({ ...prev, ...map }))
      }
    }).catch(() => {})
  }, [])

  const pillars = DEFAULT_PILLARS.map(p => ({ ...p, title: phData[p.key] || p.title }))

  // Subtler, gracefully paced parallax animation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Scroll-Driven Scale Reveal (kinetic typography)
  const headerY = useTransform(scrollYProgress, [0, 1], [40, -40])
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
  const headerScale = useTransform(scrollYProgress, [0, 0.35, 0.85, 1], [0.6, 1, 1, 0.95])
  const subScale = useTransform(scrollYProgress, [0, 0.4, 0.85, 1], [0.55, 1, 1, 0.95])
  const subOpacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0, 1, 1, 0])
  const subY = useTransform(scrollYProgress, [0, 1], [60, -30])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <section
        ref={sectionRef}
        className="why-us-section"
        style={{
          background: 'transparent',
          position: 'relative',
          overflow: 'hidden',
          margin: 0
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>

          {/* HEADING — centered, title on one line */}
          <motion.div style={{
            textAlign: 'center',
            y: headerY, opacity: headerOpacity, scale: headerScale,
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              fontWeight: 700,
              color: 'var(--dark)',
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
              margin: 0,
            }}>
              {(() => {
                const parts = phData.philosophyTitle.split(' ')
                const last = parts.pop()
                return <>{parts.join(' ')} <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>{last}</span></>
              })()}
            </h2>
          </motion.div>

          {/* SUBTITLE — centered, below title */}
          <motion.div style={{
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto 52px',
            y: subY, opacity: subOpacity, scale: subScale
          }}>
            <p style={{ fontSize: '17px', color: 'var(--dark)', lineHeight: 1.8, fontWeight: 500, margin: 0 }}>
              {phData.philosophySubtitle}
            </p>
          </motion.div>

          {/* PILLAR CARDS — 2×2 grid on desktop */}
          <div className="editorial-pillars">
            {pillars.map((pillar, index) => (
              <PillarRow key={index} pillar={pillar} index={index} />
            ))}
          </div>
        </div>

        <style>{`
        /* ── CARDS: 2×2 grid on desktop ── */
        .editorial-pillars {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .pillar-row {
          position: relative;
          cursor: default;
          background: var(--white);
          border: 1px solid rgba(204,199,185,0.25);
          border-radius: 20px;
          overflow: hidden;
          transition: background 0.4s ease, transform 0.4s ease;
          display: flex;
          flex-direction: column;
        }

        .pillar-row:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(101,50,57,0.09);
          border-color: rgba(175,122,109,0.35);
        }

        /* Animated accent line at top of card */
        .pillar-divider-track {
          width: 100%;
          height: 2px;
          background: rgba(204,199,185,0.3);
          position: relative;
          overflow: hidden;
        }
        .pillar-divider-fill {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(175,122,109,0.25);
        }
        .pillar-row:hover .pillar-divider-fill {
          background: var(--accent) !important;
        }

        /* Card body */
        .pillar-content {
          display: flex;
          align-items: flex-start;
          padding: 28px 28px;
          gap: 18px;
          flex: 1;
          transition: padding 0.3s ease;
        }
        .pillar-row:hover .pillar-content { padding: 32px 28px 28px; }

        /* Left group: just holds icon */
        .pillar-left-group {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          width: 100%;
        }

        /* Icon circle */
        .pillar-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(175,122,109,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          flex-shrink: 0;
          margin-top: 2px;
          transition: background 0.4s ease, transform 0.4s ease;
        }
        .pillar-row:hover .pillar-icon {
          background: rgba(175,122,109,0.16);
          transform: scale(1.1) rotate(-5deg);
        }

        /* Title */
        .pillar-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 1.6vw, 21px);
          font-weight: 600;
          color: var(--dark);
          line-height: 1.4;
          position: relative;
          display: inline-block;
          margin: 0;
        }
        .pillar-title::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 2px;
          background: var(--accent);
          transition: width 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .pillar-row:hover .pillar-title::after { width: 100%; }

        .pillar-desc {
          font-size: 15px;
          color: var(--secondary);
          line-height: 1.7;
          margin: 0;
          opacity: 0.85;
          transition: opacity 0.4s ease, color 0.4s ease;
        }
        .pillar-row:hover .pillar-desc { opacity: 1; color: var(--dark); }

        /* === RESPONSIVE === */
        .why-us-section { padding: 80px 40px; }

        @media (max-width: 900px) {
          .philosophy-header {
            grid-template-columns: 1fr;
            gap: 20px;
            text-align: center;
            margin-bottom: 36px;
          }
          .philosophy-header .philosophy-title-col > div { margin: 16px auto 0; }
          .editorial-pillars { grid-template-columns: 1fr; gap: 12px; }
        }
        @media (max-width: 768px) {
          .why-us-section { padding: 60px 20px !important; }
          .pillar-content { padding: 20px 18px !important; }
          .pillar-row:hover .pillar-content { padding: 20px 18px !important; }
          .pillar-icon { width: 34px; height: 34px; }
        }
      `}</style>
      </section>
    </div>
  )
}
