import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { FiAlertCircle, FiZap, FiTarget, FiActivity } from 'react-icons/fi'

const PAIN_POINTS = [
  {
    title: "Burnout",
    icon: FiAlertCircle
  },
  {
    title: "Stress",
    icon: FiZap
  },
  {
    title: "Lack of focus",
    icon: FiTarget
  },
  {
    title: "Emotional imbalance",
    icon: FiActivity
  }
]

export default function WhySwaExistsSection() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)

  const { scrollYProgress: slideProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] })
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ["start 95%", "start 15%"] })

  // Subtle parallax for the inner content
  const contentY = useTransform(slideProgress, [0, 1], [60, -60])
  const opacity = useTransform(slideProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const headerScale = useTransform(scrollYProgress, [0, 1], [0.5, 1])

  return (
    <section 
      ref={sectionRef}
      className="why-swa-exists"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '80px 20px 0px'
      }}
    >


      {/* Main Content */}
      <motion.div 
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          y: contentY,
          opacity: opacity
        }}
        className="swa-exists-content"
      >
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            ref={headerRef}
            style={{ scale: headerScale, transformOrigin: 'center bottom' }}
          >
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(44px, 6vw, 76px)',
              fontWeight: 600,
              color: 'var(--dark)',
              lineHeight: 1.1,
              marginBottom: '32px'
            }}>
              Why SWA
            </h2>

            <p style={{
              fontSize: '18px',
              color: 'var(--dark3)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.7,
              fontWeight: 400,
            }}>
              <strong style={{ color: 'var(--dark)', fontWeight: 600 }}>People are not machines.</strong> They feel, break, heal, and grow.<br/>
              Today’s environments demand performance but ignore emotional foundations, leading to:
            </p>
          </motion.div>
        </div>

        {/* Grid Section */}
        <div className="pain-points-grid">
          {PAIN_POINTS.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div 
                key={index}
                className="pain-point-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
              >
                <div className="pain-point-icon">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="pain-point-title">{point.title}</h3>
              </motion.div>
            )
          })}
        </div>

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          style={{
            textAlign: 'center',
            marginTop: '32px',
            padding: '0 20px'
          }}
        >
          <h4 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(24px, 3vw, 36px)',
            color: 'var(--dark)',
            fontWeight: 500,
            fontStyle: 'italic',
            lineHeight: 1.3,
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            "SWA exists to bring emotional wellbeing back to the center of performance."
          </h4>
        </motion.div>

      </motion.div>

      <style>{`
        .pain-points-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .pain-point-card {
          background: var(--bg);
          border: 1px solid rgba(175, 122, 109, 0.1);
          border-radius: 20px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(101, 50, 57, 0.03);
          transform: translateY(0) scale(1);
          cursor: pointer;
        }

        .pain-point-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          box-shadow: inset 0 0 0 1px rgba(175, 122, 109, 0);
          transition: box-shadow 0.5s ease;
          pointer-events: none;
        }

        .pain-point-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: var(--white);
          border-color: rgba(175, 122, 109, 0.2);
          box-shadow: 0 20px 40px rgba(101, 50, 57, 0.08);
        }

        .pain-point-card:hover::after {
          box-shadow: inset 0 0 0 2px rgba(175, 122, 109, 0.1);
        }

        .pain-point-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(175, 122, 109, 0.08);
          border: 1px solid rgba(175, 122, 109, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          margin-bottom: 20px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pain-point-card:hover .pain-point-icon {
          transform: scale(1.15) rotate(8deg);
          background: var(--accent);
          border-color: var(--accent);
          color: var(--white);
          box-shadow: 0 8px 24px rgba(175, 122, 109, 0.25);
        }

        .pain-point-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: var(--dark);
          letter-spacing: 0.5px;
          margin: 0;
          transition: color 0.4s ease;
        }

        .pain-point-card:hover .pain-point-title {
          color: var(--accent);
        }

        @media (max-width: 1024px) {
          .pain-points-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        
        @media (max-width: 768px) {
          .why-swa-exists {
            padding: 60px 20px 20px !important;
          }
          .pain-points-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .pain-point-card {
            padding: 24px 16px;
          }
          .pain-point-title {
            font-size: 16px;
          }
          .pain-point-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
          }
        }
      `}</style>
    </section>
  )
}
