import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroSection() {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Deep Parallax Math
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]) // Image pulls down deeply mapping the scroll
  const textDriftY = useTransform(scrollYProgress, [0, 1], [0, 200]) // Texts violently pull downwards
  const scrollFade = useTransform(scrollYProgress, [0, 0.4], [1, 0]) // Texts vanish completely cleanly before the section is even half gone

  return (
    <section
      id="hero"
      ref={containerRef}
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '600px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        background: '#4A2530' // Solid dark underneath to kill any white flashes
      }}
    >
      {/* 
        ----------------------
        MASSIVE HERO IMAGE BACKGROUND
        Contains a massive negative inset so that sliding the image Y-axis doesn't reveal the background 
        ---------------------- 
      */}
      <motion.div style={{ position: 'absolute', inset: -150, zIndex: 0, y: bgY }}>
        <motion.img
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80"
          alt="SWA Wellness"
          loading="eager"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center', filter: 'brightness(1.05)'
          }}
        />
        {/* Cinematic Under-Glow Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(101,50,57,0.15) 0%, rgba(101,50,57,0.08) 40%, rgba(101,50,57,0.75) 100%)'
        }} />
      </motion.div>

      {/* 
        ----------------------
        CENTER FOCUS TYPOGRAPHY
        ---------------------- 
      */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', width: '100%', padding: '0 20px', zIndex: 1
      }}>
        <motion.div style={{ y: textDriftY, opacity: scrollFade }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* CSS Hardware-Accelerated Floating Effect */}
            <div className="hero-float-1">
              <h2 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(32px, 5vw, 64px)',
                fontWeight: 700,
                color: 'var(--white)',
                lineHeight: 1.1,
                letterSpacing: '0.5px',
                textShadow: '0 10px 40px rgba(0,0,0,0.6)'
              }}>
                It's time to bring the SWA Magic<br />
                <span style={{ fontStyle: 'italic', fontWeight: 500, opacity: 0.9 }}>to your place and people</span>
              </h2>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 
        ----------------------
        BOTTOM ENTRANCE TYPOGRAPHY
        ---------------------- 
      */}
      <motion.div 
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', padding: '0 60px 60px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end',
          y: textDriftY, opacity: scrollFade
        }}
      >
        {/* Left Focus Headline */}
        <motion.div
           initial={{ opacity: 0, x: -40 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* CSS Hardware-Accelerated Floating Effect */}
          <div className="hero-float-2">
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(40px, 6vw, 84px)',
              fontWeight: 700, color: 'white',
              lineHeight: 1.05, maxWidth: '700px',
              textShadow: '0 4px 30px rgba(0,0,0,0.6)'
            }}>
              Where Self Meets<br /><span style={{ fontStyle: 'italic', fontWeight: 500 }}>Its True Essence</span>
            </h1>
          </div>
        </motion.div>

        {/* Right Descriptive Tagline */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* CSS Hardware-Accelerated Floating Effect */}
          <div className="hero-float-3">
            <p style={{
              fontSize: '17px', color: 'white',
              fontWeight: 500, opacity: 0.9, lineHeight: 1.7,
              maxWidth: '320px', textAlign: 'right',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              Science-backed wellness programs for organizations, institutions & communities.
            </p>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes heroFloat {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .hero-float-1 { animation: heroFloat 7s ease-in-out infinite; }
        .hero-float-2 { animation: heroFloat 6s ease-in-out infinite 1s; }
        .hero-float-3 { animation: heroFloat 8s ease-in-out infinite 0.5s; }
      `}</style>

      {/* 
        ----------------------
        SCROLL INDICATOR
        ---------------------- 
      */}
      <motion.div 
        style={{
          position: 'absolute', bottom: '24px', left: '50%',
          x: '-50%',
          color: 'var(--primary)', opacity: scrollFade, fontSize: '20px', zIndex: 1, fontWeight: 700
        }}
      >
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  )
}
