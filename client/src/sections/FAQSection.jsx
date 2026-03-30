import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { FAQS } from '../constants/faqs'
import useScrollFade from '../hooks/useScrollFade'

function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: isOpen ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.2)' : 'none'
      }}
    >
      {/* Question row */}
      <button
        onClick={() => onToggle(index)}
        className="faq-button"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: '20px',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'none'
        }}
      >
        <span style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--white)',
          lineHeight: 1.5,
          fontFamily: 'DM Sans, sans-serif'
        }}>
          {faq.q}
        </span>

        {/* Icon */}
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          background: isOpen ? 'var(--secondary)' : 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.3s ease, color 0.3s ease',
          color: isOpen ? 'var(--white)' : 'var(--primary)'
        }}>
          {isOpen
            ? <FiMinus size={14} />
            : <FiPlus size={14} />
          }
        </div>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div 
              className="faq-answer"
              style={{
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
              <p style={{
                paddingTop: '16px',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.85
              }}>
                {faq.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)
  const sectionRef = useRef(null)
  useScrollFade(sectionRef)

  const handleToggle = (index) => {
    setOpenIndex(prev => prev === index ? null : index)
  }

  return (
    <section
      ref={sectionRef}
      className="fade-up faq-section"
      style={{
        background: 'var(--dark3)',
        margin: 0
      }}
    >
      <div className="section-inner">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            fontWeight: 700,
            color: 'var(--white)',
            marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            Frequently Asked <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Questions</span>
          </h2>
        </div>

        {/* FAQ list */}
        <div style={{
          maxWidth: '860px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
      <style>{`
        .faq-section { padding: 80px 60px; }
        .faq-button { padding: 22px 28px; }
        .faq-answer { padding: 0 28px 24px; }
        
        @media (max-width: 768px) {
          .faq-section { padding: 60px 20px; }
          .faq-button { padding: 20px 16px; gap: 12px !important; }
          .faq-button span { font-size: 14px !important; }
          .faq-answer { padding: 0 16px 20px; }
        }
      `}</style>
    </section>
  )
}
