import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLinkedin, FiInstagram, FiYoutube, FiFacebook, FiChevronDown, FiPhone } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const FOOTER_SECTIONS = [
  {
    title: 'Programs',
    links: [
      { label: 'Corporate Wellbeing', path: '/services/corporate' },
      { label: 'Education Programs', path: '/services/education' },
      { label: 'Community Wellbeing', path: '/services/community' },
      { label: 'Government Wellness', path: '/services/government' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Book a Demo', path: '/book-demo' },
      { label: 'Careers', path: null },
      { label: 'Our Experts', path: null }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms and Conditions', path: null },
      { label: 'Privacy Policy', path: null },
      { label: 'Cookie Policy', path: null }
    ]
  }
]

export default function Footer() {
  const navigate = useNavigate()
  const [expandedSection, setExpandedSection] = useState(null)

  const linkStyle = {
    fontSize: '13px', color: 'var(--secondary)',
    cursor: 'pointer', display: 'block',
    padding: '5px 0', transition: 'var(--transition)',
    background: 'none', border: 'none',
    fontFamily: 'DM Sans, sans-serif', textAlign: 'left'
  }

  const socialStyle = {
    width: '38px', height: '38px', borderRadius: '50%',
    background: 'rgba(204,199,185,0.2)',
    border: '1px solid rgba(204,199,185,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'var(--transition)',
    color: 'var(--dark)', fontSize: '16px'
  }

  return (
    <footer style={{
      background: 'transparent',
      borderTop: '1px solid rgba(204,199,185,0.2)',
      padding: '60px 60px 0',
      margin: 0,
      marginTop: 0
    }}>
      <div 
        className="footer-grid-container"
        style={{
        maxWidth: '1200px', margin: '0 auto',
        gap: '60px', paddingBottom: '48px',
        borderBottom: '1px solid rgba(204,199,185,0.2)'
      }}>

        {/* LEFT — Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/swa-logo.png" alt="SWA" className="footer-logo" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '12px' }} />
            <div>
              <div className="footer-brand-name" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 700, color: 'var(--dark)' }}>SWA</div>
              <div className="footer-brand-tagline" style={{ fontSize: '10px', color: 'var(--secondary)', fontStyle: 'italic', letterSpacing: '0.5px' }}>Where Self Meets Its True Essence</div>
            </div>
          </div>

          <p 
            className="footer-brand-desc"
            style={{
            fontSize: '13px', color: 'var(--secondary)',
            lineHeight: 1.8, maxWidth: '260px', marginBottom: '24px'
          }}>
            We compassionately create wellbeing programs and mindfulness spaces to improve holistic wellbeing for organizations, institutions, and individuals.
          </p>

          {/* Social / Contact icons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {[
              { icon: <FiPhone />, label: 'Phone', url: 'tel:+919998310041' },
              { icon: <FiLinkedin />, label: 'LinkedIn', url: 'https://www.linkedin.com/company/swa-wellbeing890/' },
              { icon: <FiInstagram />, label: 'Instagram', url: 'https://www.instagram.com/swa.spaces?igsh=ZXpvOHI2eGE4cDVq' }
            ].map(({ icon, label, url }) => (
              <a
                key={label}
                title={label}
                href={url}
                target={label === 'Phone' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                style={{ ...socialStyle, textDecoration: 'none' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--secondary)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = 'var(--secondary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(204,199,185,0.2)'
                  e.currentTarget.style.color = 'var(--dark)'
                  e.currentTarget.style.borderColor = 'rgba(204,199,185,0.35)'
                }}
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="mailto:dhruvi@swaspaces.com" className="footer-email" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--secondary)', fontWeight: 500 }}>
              <span>✉</span> dhruvi@swaspaces.com
            </a>
            <a href="mailto:well-begin@swaspaces.com" className="footer-email" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--secondary)', fontWeight: 500 }}>
              <span>✉</span> well-begin@swaspaces.com
            </a>
          </div>
        </div>

        {/* RIGHT — Link columns with Mobile Accordion */}
        <div className="footer-links-grid">
          {FOOTER_SECTIONS.map((section) => {
            const isExpanded = expandedSection === section.title
            
            return (
              <div key={section.title} className={`footer-nav-section ${isExpanded ? 'expanded' : ''}`}>
                
                {/* Accordion Header (Toggles on Mobile) */}
                <div 
                  className={`footer-nav-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => setExpandedSection(isExpanded ? null : section.title)}
                >
                  <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 700, color: 'var(--dark)' }}>
                    {section.title}
                  </h4>
                  <motion.div
                    className="footer-accordion-icon"
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: 'var(--secondary)' }}
                  >
                    <FiChevronDown size={18} />
                  </motion.div>
                </div>

                {/* Animated Links Container */}
                <AnimatePresence initial={false}>
                  {(isExpanded || window.innerWidth >= 769) && (
                    <motion.div
                      className="footer-nav-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="footer-nav-inner" style={{ paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {section.links.map((item) => (
                          <button 
                            key={item.label} 
                            style={linkStyle} 
                            onClick={() => item.path && navigate(item.path)}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--dark2)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '20px 0', textAlign: 'center',
        fontSize: '12px', color: 'rgba(101,50,57,0.45)'
      }}>
        Copyright © 2025 SWA Wellbeing. All rights reserved.
      </div>
      
      <style>{`
        /* Desktop base styles */
        .footer-grid-container {
          display: grid;
          grid-template-columns: 1fr 2fr;
        }
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }
        .footer-accordion-icon {
          display: none;
        }
        .footer-nav-header h4 {
          margin-bottom: 18px;
        }
        .footer-nav-content {
          height: auto !important;
          opacity: 1 !important;
          display: block !important;
        }

        /* Mobile accordion refactor with absolute premium glassmorphism */
        @media (max-width: 768px) {
          .footer-grid-container {
            grid-template-columns: 1fr;
            gap: 32px !important;
          }
          .footer-links-grid {
            grid-template-columns: 1fr;
            gap: 0;
            margin-top: 16px;
          }
          .footer-nav-section {
            background: rgba(255, 255, 255, 0.45) !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            border: 1px solid rgba(255, 255, 255, 0.7) !important;
            box-shadow: 0 4px 20px rgba(101, 50, 57, 0.04) !important;
            border-radius: 20px !important;
            overflow: hidden !important;
            margin-bottom: 16px !important;
            transition: all 0.3s ease !important;
          }
          .footer-nav-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 14px 20px !important; /* Reduces vertical height overhead significantly */
            cursor: pointer;
            border-bottom: 1px solid transparent !important;
            transition: all 0.3s ease !important;
          }
          .footer-nav-header.expanded {
            border-bottom: 1px solid rgba(255, 255, 255, 0.5) !important;
            background: rgba(255, 255, 255, 0.2) !important;
          }
          .footer-nav-header h4 {
            margin-bottom: 0 !important;
          }
          .footer-accordion-icon {
            display: block !important;
          }
          .footer-nav-content {
            /* allow JS animation */
            height: unset;
            opacity: unset;
            display: unset;
          }
          .footer-nav-inner {
            padding: 8px 24px !important;
          }
          
          .footer-logo { width: 64px !important; height: 64px !important; }
          .footer-brand-name { font-size: 32px !important; }
          .footer-brand-tagline { font-size: 13px !important; }
          .footer-brand-desc { font-size: 16px !important; line-height: 1.6 !important; max-width: 100% !important; margin-bottom: 32px !important; }
          .footer-email { font-size: 16px !important; margin-bottom: 12px !important; }
        }
      `}</style>
    </footer>
  )
}
