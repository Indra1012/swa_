import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TECHNIQUES } from '../constants/techniques'
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'

export default function HealingTechniques() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px 0px' })

  // Global scroll tracker for the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const goToTechnique = (technique) => {
    navigate('/healing-techniques#' + technique.id)
  }

  return (
    <section
      id="healing"
      ref={sectionRef}
      style={{
        background: 'var(--bg2)',
        padding: '80px 60px',
        overflow: 'hidden',
        margin: 0
      }}
    >
      <motion.div 
        className="section-inner" 
        style={{ maxWidth: '1400px', margin: '0 auto' }}
        initial={{ opacity: 0, y: 120 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div style={{ marginBottom: '80px', textAlign: 'center' }}>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: '13px', color: 'var(--accent)', letterSpacing: '3px',
              textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600
            }}
          >
             Our Modalities
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(48px, 6vw, 76px)',
              fontWeight: 700,
              color: 'var(--dark)',
              marginBottom: '16px',
              lineHeight: 1.1,
              letterSpacing: '-0.5px'
            }}
          >
            Healing <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Techniques</span>
          </motion.h2>
        </div>

        {/* Centered Flex Layout for strict 322x400 Card Sizes */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '32px'
        }}>
          {TECHNIQUES.map((technique, index) => (
            <SlideshowCard
              key={technique.id}
              technique={technique}
              index={index}
              onOpen={goToTechnique}
              isInView={isInView}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function SlideshowCard({ technique, index, onOpen, isInView, scrollYProgress }) {
  const [hovered, setHovered] = useState(false)

  // Stagger the parallax so every card moves at a slightly different speed
  const parallaxOffset = useTransform(
    scrollYProgress, 
    [0, 1], 
    [index % 2 === 0 ? 50 : 100, index % 2 === 0 ? -50 : -100]
  )

  // Bulletproof fallback in case Vite cached the old object format
  const validImages = technique.images && technique.images.length > 0 
    ? technique.images 
    : [technique.image].filter(Boolean)

  const currentImageSrc = validImages[0] || ''

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ opacity: { duration: 0.8, delay: index * 0.15 } }}
      onClick={() => onOpen(technique)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        width: '360px',
        height: '480px', /* Uniform Strict Sizes */
        cursor: 'pointer',
        boxShadow: hovered ? '0 30px 60px rgba(0,0,0,0.15)' : 'none',
        y: hovered ? '0px' : parallaxOffset, /* Scroll-linked parallax */
        scale: hovered ? 1.02 : 1, /* Smooth hover pop overriding parallax y slightly */
        transition: 'box-shadow 0.6s ease, scale 0.6s ease'
      }}
    >
      {/* Single Static Image with Hover Scale */}
      {currentImageSrc && (
        <motion.img
          src={currentImageSrc}
          alt={technique.title}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Dynamic Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered
          ? 'linear-gradient(to top, rgba(101,50,57,0.95) 0%, rgba(101,50,57,0.4) 50%, rgba(101,50,57,0.1) 100%)'
          : 'linear-gradient(to top, rgba(101,50,57,0.85) 0%, rgba(101,50,57,0.2) 60%, transparent 100%)',
        transition: 'background 0.5s ease'
      }} />

      {/* Decorative Top Arrow */}
      <div style={{
        position: 'absolute',
        top: '32px', right: '32px',
        width: '48px', height: '48px',
        borderRadius: '50%',
        background: hovered ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--white)',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-45deg)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        border: hovered ? 'none' : '1px solid rgba(255,255,255,0.2)'
      }}>
        <FiArrowUpRight size={22} />
      </div>

      {/* Typography block */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '40px',
        transform: hovered ? 'translateY(0)' : 'translateY(16px)',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '32px', fontWeight: 600,
          color: 'var(--white)', 
          lineHeight: 1.1,
          marginBottom: '12px',
          letterSpacing: '0.2px'
        }}>
          {technique.title}
        </h3>
        
        <div style={{
          height: hovered ? 'auto' : '20px',
          overflow: 'hidden'
        }}>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.85)',
            fontStyle: 'italic',
            transform: 'translateY(0)',
            transition: 'opacity 0.3s ease'
          }}>
            {technique.subtitle}
          </p>
          
          <p style={{
            fontSize: '14px',
            color: hovered ? 'var(--white)' : 'var(--accent)',
            marginTop: '16px',
            fontWeight: 600,
            letterSpacing: '1px',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
          }}>
            EXPLORE MODALITY <span style={{ marginLeft: '4px' }}>→</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
