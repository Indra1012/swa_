import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { FiLayers, FiTarget, FiHeart, FiShield } from 'react-icons/fi'

const PILLARS = [
  {
    title: "Rooted in Real Connection",
    desc: "We go beyond surface-level wellness. Our programs are experiential, tapping directly into the heart of human connection to foster environments where emotional intelligence thrives organically.",
    icon: FiLayers
  },
  {
    title: "Science Meets Wisdom",
    desc: "By blending the practical rigor of modern psychology with the grounded depth of eastern philosophies, we deliver tools that are both immediately actionable and deeply profound.",
    icon: FiTarget
  },
  {
    title: "Tailored to Your Ecosystem",
    desc: "No two cultures are the same. We take time to understand the unique emotional and psychological landscape of your workplace or community, designing solutions that feel native to your people.",
    icon: FiHeart
  },
  {
    title: "Sustainable Transformation",
    desc: "We don't do quick fixes. Our entire methodology is designed to create lasting, compounding ripples of wellbeing that protect against burnout and elevate life satisfaction long-term.",
    icon: FiShield
  }
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
        <p className="pillar-desc">{pillar.desc}</p>
      </div>
    </motion.div>
  )
}

export default function WhyUsSection() {
  const sectionRef = useRef(null)

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
        
        {/* HEADING — Scroll-Driven Scale Reveal, Kinetic Typography, ALL viewports */}
        <motion.div
           style={{
             textAlign: 'center',
             maxWidth: '1000px',
             margin: '0 auto 40px',
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
              fontSize: '13px', color: 'var(--dark)', letterSpacing: '3px',
              textTransform: 'uppercase', fontWeight: 700
            }}>
              Our Core Philosophy
            </span>
          </div>
          
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 700,
            color: 'var(--dark)',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            marginBottom: '0',
            whiteSpace: 'nowrap'
          }}>
            True wellness is a <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--dark2)' }}>continuous journey.</span>
          </h2>
        </motion.div>

        {/* SUBTEXT — Delayed Scale Reveal, slightly slower */}
        <motion.div
          style={{
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto 80px',
            y: subY,
            opacity: subOpacity,
            scale: subScale
          }}
        >
          <p style={{
            fontSize: '18px', color: 'var(--secondary)', lineHeight: 1.7, fontWeight: 400, margin: 0
          }}>
            We move past quick fixes to provide structured, practical wellness programs that create real, lasting changes in your environment.
          </p>
        </motion.div>


        {/* EDITORIAL ROWS */}
        <div className="editorial-pillars">
          {PILLARS.map((pillar, index) => (
            <PillarRow key={index} pillar={pillar} index={index} />
          ))}
          {/* Final bottom border */}
          <div style={{ width: '100%', height: '1px', background: 'rgba(204,199,185,0.4)' }} />
        </div>
      </div>

      <style>{`
        .editorial-pillars {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .pillar-row {
          position: relative;
          cursor: default;
          background: var(--white);
          border: 1px solid rgba(204,199,185,0.25);
          border-radius: 20px;
          overflow: hidden;
          transition: background 0.4s ease, transform 0.4s ease;
        }

        .pillar-row:hover {
          background: var(--white);
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(101,50,57,0.08);
          border-color: rgba(175,122,109,0.3);
        }

        /* Divider track (warm bone on light) */
        .pillar-divider-track {
          width: 100%;
          height: 1px;
          background: rgba(204,199,185,0.4);
          position: relative;
          overflow: hidden;
        }

        /* Animated fill that scales in on scroll */
        .pillar-divider-fill {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: rgba(175,122,109,0.3);
        }

        .pillar-row:hover .pillar-divider-fill {
          background: var(--accent) !important;
        }

        /* NEW 2-COLUMN BALANCED LAYOUT */
        .pillar-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 60px;
          padding: 40px 32px;
          text-align: center;
          transition: padding 0.4s ease;
        }

        .pillar-row:hover .pillar-content {
          padding: 48px 32px;
        }

        /* Left side container holding Icon + Title */
        .pillar-left-group {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        /* Icon circle */
        .pillar-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(175,122,109,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          flex-shrink: 0;
          transition: background 0.4s ease, transform 0.4s ease;
        }

        .pillar-row:hover .pillar-icon {
          background: rgba(175,122,109,0.18);
          transform: scale(1.1) rotate(-5deg);
        }

        /* Title */
        .pillar-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 600;
          color: var(--dark);
          line-height: 1.1;
          position: relative;
          display: inline-block;
          margin: 0;
        }

        .pillar-title::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent);
          transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pillar-row:hover .pillar-title::after {
          width: 100%;
        }

        /* Description — clearly visible by default, enhanced on hover */
        .pillar-desc {
          font-size: 16px;
          color: var(--secondary);
          line-height: 1.7;
          font-weight: 400;
          margin: 0;
          opacity: 0.85;
          transform: translateX(0);
          transition: opacity 0.4s ease, transform 0.4s ease, color 0.4s ease;
        }

        .pillar-row:hover .pillar-desc {
          opacity: 1;
          transform: translateX(6px);
          color: var(--dark);
        }

        /* === RESPONSIVE === */
        .why-us-section { padding: 80px 40px; }
        @media (max-width: 1024px) {
          .pillar-content { gap: 32px; }
          .pillar-left-group { gap: 20px; }
        }
        @media (max-width: 768px) {
          .why-us-section { padding: 60px 20px !important; }
          .pillar-content {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 32px 20px !important;
          }
          .pillar-row:hover .pillar-content {
            padding: 32px 20px !important;
          }
          .pillar-desc { opacity: 0.9; }
          .pillar-icon { width: 40px; height: 40px; }
          h2 { white-space: normal !important; }
        }
      `}</style>
    </section>
    </div>
  )
}
