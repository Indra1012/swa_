import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const DIFFERENCES = [
  {
    offerTitle: "Awareness",
    offerDesc: "Telling people what's wrong",
    deliverTitle: "Experience",
    deliverDesc: "Making people feel and live it"
  },
  {
    offerTitle: "Motivation",
    offerDesc: "Temporary highs that fade fast",
    deliverTitle: "Behavior",
    deliverDesc: "Lasting change in how people act"
  },
  {
    offerTitle: "Feel-good",
    offerDesc: "Sessions that feel nice, go nowhere",
    deliverTitle: "Performance",
    deliverDesc: "Measurable results that hold"
  }
]

function DiffRow({ diff, index, totalLength, progress }) {
  // Desktop Stacking Cards scrolling effect
  const startAt = index * (1 / totalLength);
  const targetScale = 1 - ((totalLength - index) * 0.05);
  const scale = useTransform(progress, [startAt, 1], [1, targetScale]);

  return (
    <motion.div  
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      style={{ 
        scale,
        '--idx': index,
        position: 'sticky',
        top: `calc(15vh + ${index * 20}px)`,
        transformOrigin: "top center"
      }} 
      className="diff-row-motion"
    >
      <div className="diff-row">
        <div>
          <p className="diff-label" style={{ color: 'var(--secondary)' }}>
            Others offer
          </p>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '4px' }}>
            <h3 className="diff-title" style={{ color: 'var(--dark)' }}>
              {diff.offerTitle}
            </h3>
            <div style={{
              position: 'absolute',
              top: '55%', left: 0, right: 0,
              height: '1px',
              background: 'var(--dark)',
              opacity: 0.85,
              transform: 'translateY(-50%)'
            }} />
          </div>
          <p className="diff-desc" style={{ color: 'var(--dark)' }}>
            {diff.offerDesc}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="diff-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </div>

        <div className="diff-right-col" style={{ paddingLeft: '6px' }}>
          <p className="diff-label" style={{ color: 'var(--dark)' }}>
            SWA delivers
          </p>
          <h3 className="diff-title diff-deliver-title" style={{ color: 'var(--dark)', display: 'inline-block', position: 'relative' }}>
            {diff.deliverTitle}
          </h3>
          <p className="diff-desc diff-deliver-desc" style={{ color: 'var(--dark)' }}>
            {diff.deliverDesc}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function JourneyStepMobile({ diff, index }) {
  const stepRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: stepRef,
    offset: ["start 70%", "start 45%"] 
  })

  const nodeScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const swaOpacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const swaY = useTransform(scrollYProgress, [0, 1], [20, 0])
  
  // They wanted "Others" to look dark on mobile! So we remove the dramatic opacity fade.
  // Instead of fading to 0.4, we keep it fully solid 1 or slightly 0.85.
  const othersOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.85])

  return (
    <div ref={stepRef} className="journey-step">
      
      {/* LEFT: The "Others" branch */}
      <div className="journey-others">
        <motion.div style={{ opacity: othersOpacity }} className="journey-others-content">
          <p className="diff-label">Others offer</p>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '6px' }}>
            <h3 className="diff-title" style={{ color: 'var(--dark)', fontWeight: 600, margin: 0 }}>
              {diff.offerTitle}
            </h3>
            {/* Strikethrough animates smoothly */}
            <motion.div 
               style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
               className="journey-strikethrough"
            />
          </div>
          <p className="diff-desc" style={{ color: 'var(--dark)', fontWeight: 500 }}>{diff.offerDesc}</p>
        </motion.div>
        
        {/* Dead-end line branch */}
        <div className="journey-branch-line" />
      </div>

      {/* CENTER: The Node */}
      <div className="journey-node-wrap">
         <div className="journey-node-bg" />
         <motion.div className="journey-node-active" style={{ scale: nodeScale }} />
      </div>

      {/* RIGHT: SWA Delivery */}
      <div className="journey-swa">
         <motion.div 
           className="journey-swa-card"
           style={{ opacity: swaOpacity, y: swaY }}
         >
           <p className="diff-label" style={{ color: 'var(--accent)' }}>SWA delivers</p>
           <h3 className="diff-title" style={{ color: 'var(--dark)', fontWeight: 600 }}>{diff.deliverTitle}</h3>
           <p className="diff-desc" style={{ color: 'var(--dark)', fontWeight: 500 }}>{diff.deliverDesc}</p>
         </motion.div>
      </div>

    </div>
  )
}


export default function SwaDifferenceSection() {
  const sectionRef = useRef(null)
  const containerRef = useRef(null)

  // Track the entire section for the glowing main line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 60%"]
  })
  
  // Mobile Journey scroll trackers for geometric pathing
  const glowHeight = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"])
  const cornerOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1])
  const glowWidth = useTransform(scrollYProgress, [0.85, 1], ["0%", "100%"])

  return (
    <section 
      ref={sectionRef}
      className="swa-difference-section"
      style={{
        padding: '60px 20px 100px',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}
          >
            <div style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dark)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              The SWA Path
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 700,
              color: 'var(--dark)',
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
              marginBottom: '16px'
            }}
          >
            True wellbeing is a <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--dark2)' }}>continuous journey.</span>
          </motion.h2>
        </div>

        {/* Container for Desktop (Stacking Cards) and Mobile (Journey SCroller) */}
        <div className="swa-difference-content-wrapper">
          
          {/* DESKTOP LAYOUT: Stacking Cards */}
          <div 
            ref={containerRef}
            className="diff-rows-container desktop-only-layout"
            style={{ 
               display: 'flex', 
               flexDirection: 'column', 
               gap: '24px', 
               position: 'relative'
            }}
          >
            {DIFFERENCES.map((diff, idx) => (
              <DiffRow 
                key={idx} 
                diff={diff} 
                index={idx} 
                totalLength={DIFFERENCES.length}
                progress={scrollYProgress}
              />
            ))}
          </div>

          {/* MOBILE LAYOUT: Continuous Journey */}
          <div className="journey-container mobile-only-layout">
            <div className="journey-main-track" />
            
            <div className="journey-glow-vertical-wrap">
               <motion.div className="journey-glow-line" style={{ height: glowHeight }} />
            </div>

            <motion.div className="journey-glow-corner" style={{ opacity: cornerOpacity }} />

            <div className="journey-glow-horizontal-wrap">
               <motion.div className="journey-glow-horizontal" style={{ width: glowWidth }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative', zIndex: 5 }}>
              {DIFFERENCES.map((diff, idx) => (
                <JourneyStepMobile 
                  key={idx} 
                  diff={diff} 
                  index={idx} 
                />
              ))}
            </div>
          </div>
          
        </div>

        {/* Footer Banner */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="diff-footer-banner"
           style={{
             background: 'var(--dark)',
             borderRadius: '12px',
             padding: '32px 30px',
             textAlign: 'center',
             color: 'var(--bg)',
             position: 'relative',
             zIndex: 10,
             marginTop: '100px'
           }}
        >
          <h4 className="diff-footer-title" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(20px, 2.5vw, 24px)',
            fontWeight: 500,
            fontStyle: 'italic',
            marginBottom: '12px',
            color: 'var(--bg)',
            lineHeight: 1.3
          }}>
            SWA is not a wellness service — it is a structured transformation system.
          </h4>
          <p className="diff-footer-text" style={{
            fontSize: '15px',
            fontFamily: 'Cormorant Garamond, serif',
            color: 'var(--bg2)',
            opacity: 0.85,
            margin: 0,
            lineHeight: 1.5
          }}>
            Because real change shows up in how you think, act, and lead. Every day.
          </p>
        </motion.div>

      </div>

      <style>{`
        /* Typography */
        .diff-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--secondary);
          margin-bottom: 8px;
        }
        
        .diff-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(24px, 2.5vw, 32px);
          font-weight: 500;
          margin: 0 0 6px 0;
        }
        
        .diff-desc {
          font-size: 15px;
          color: var(--dark);
          margin: 0;
          line-height: 1.5;
        }

        /* Responsive Flow Toggle */
        .desktop-only-layout { display: flex; }
        .mobile-only-layout { display: none; }

        /* -------------- DESKTOP STACKING CARDS CSS -------------- */
        .diff-row-motion {
          position: sticky;
          width: 100%;
          z-index: calc(var(--idx) + 1);
          transform-origin: top center;
        }

        .diff-row {
          background: #F9F6F3;
          border-radius: 12px;
          padding: 24px 30px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 20px;
          border: 1px solid rgba(204,199,185,0.25);
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          transition: background 0.4s ease, filter 0.4s ease;
          cursor: pointer;
        }

        .diff-row:hover {
          background: var(--white);
          border-color: rgba(175,122,109,0.3);
        }
        .diff-row-motion:hover {
          z-index: 10;
        }

        .diff-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(175,122,109,0.18);
          color: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.4s ease, transform 0.4s ease, color 0.4s ease;
        }
        .diff-row:hover .diff-icon {
          background: var(--accent);
          color: var(--white);
          transform: scale(1.15) rotate(-5deg);
        }

        .diff-deliver-desc {
          transform: translateX(0);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .diff-row:hover .diff-deliver-desc {
          opacity: 1 !important;
          transform: translateX(4px);
        }

        .diff-deliver-title::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; width: 0; height: 1px;
          background: var(--accent);
          transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .diff-row:hover .diff-deliver-title::after {
          width: 100%;
        }


        /* -------------- MOBILE JOURNEY TIMELINE CSS -------------- */
        .journey-container {
          position: relative;
          padding: 20px 0 50px 0; /* Extended padding for the curved finish */
        }

        .journey-main-track {
          position: absolute;
          top: 0; bottom: 0; left: 20px; right: 20px;
          border-left: 3px solid rgba(204,199,185,0.4);
          border-bottom: 3px solid rgba(204,199,185,0.4);
          border-bottom-left-radius: 24px;
        }

        .journey-glow-vertical-wrap {
          position: absolute;
          top: 0; bottom: 23px; left: 20px; width: 3px; /* bottom overlaps by 1px to prevent seam */
        }
        .journey-glow-line {
          width: 100%;
          background: var(--accent);
          border-radius: 4px;
          filter: drop-shadow(0 0 6px rgba(175,122,109,0.5));
        }

        .journey-glow-corner {
          position: absolute;
          bottom: 0; left: 20px;
          width: 24px; height: 24px;
          border-left: 3px solid var(--accent);
          border-bottom: 3px solid var(--accent);
          border-bottom-left-radius: 24px;
          /* Only cast shadow on the border curve, not the bounding box, to prevent patches */
          filter: drop-shadow(-2px 2px 6px rgba(175,122,109,0.4));
        }

        .journey-glow-horizontal-wrap {
          position: absolute;
          bottom: 0; left: 43px; right: 20px; height: 3px; /* left overlaps by 1px */
        }
        .journey-glow-horizontal {
          height: 100%;
          background: var(--accent);
          border-radius: 4px;
          filter: drop-shadow(0 0 6px rgba(175,122,109,0.5));
        }

        .journey-step {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          position: relative;
        }

        .journey-others {
          width: 100%;
          justify-content: flex-start;
          text-align: left;
          padding-left: 60px;
          margin-bottom: 24px;
          position: relative;
        }
        .journey-others-content {
           max-width: 300px;
        }

        .journey-branch-line {
          position: absolute;
          left: 20px;
          width: 30px;
          top: 40px;
          height: 2px;
          background: rgba(204,199,185,0.6);
        }

        .journey-strikethrough {
          position: absolute;
          top: 55%; left: 0; right: 0;
          height: 2px;
          background: rgba(101, 50, 57, 0.7);
          transform: translateY(-50%);
        }

        .journey-node-wrap {
          width: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          left: 20px;
          top: 40px;
          transform: translate(-12px, -50%);
          z-index: 10;
        }
        .journey-node-bg {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg);
          border: 3px solid rgba(204,199,185,0.8);
          position: absolute;
        }
        .journey-node-active {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 20px rgba(175,122,109,0.6);
          position: relative;
        }

        .journey-swa {
          width: 100%;
          padding-left: 60px;
          display: flex;
          align-items: center;
        }

        .journey-swa-card {
          background: rgba(249, 246, 243, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(204,199,185,0.3);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 12px 40px rgba(101,50,57,0.06);
          max-width: 100%;
          border-left: 4px solid var(--accent);
        }

        /* Mobile Layout Toggles & Tweaks */
        @media (max-width: 768px) {
          .desktop-only-layout { display: none !important; }
          .mobile-only-layout { display: block !important; }
          
          .diff-title { font-size: 26px; }
          .diff-desc { font-size: 15px; }

          .diff-footer-title { font-size: 24px !important; }
          .diff-footer-text { font-size: 18px !important; opacity: 0.9 !important; }
          .diff-footer-banner { padding: 40px 24px !important; }
        }
      `}</style>
    </section>
  )
}
