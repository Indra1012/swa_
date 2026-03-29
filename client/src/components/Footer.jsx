import { useNavigate } from 'react-router-dom'
import { FiLinkedin, FiInstagram, FiYoutube, FiFacebook } from 'react-icons/fi'

export default function Footer() {
  const navigate = useNavigate()

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
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 2fr',
        gap: '60px', paddingBottom: '48px',
        borderBottom: '1px solid rgba(204,199,185,0.2)'
      }}>

        {/* LEFT — Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/swa-logo.png" alt="SWA" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 700, color: 'var(--dark)' }}>SWA™</div>
              <div style={{ fontSize: '10px', color: 'var(--secondary)', fontStyle: 'italic', letterSpacing: '0.5px' }}>Where Self Meets Its True Essence</div>
            </div>
          </div>

          <p style={{
            fontSize: '13px', color: 'var(--secondary)',
            lineHeight: 1.8, maxWidth: '260px', marginBottom: '24px'
          }}>
            We compassionately create wellness programs and mindfulness spaces to improve holistic wellbeing for organizations, institutions, and individuals.
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {[
              { icon: <FiLinkedin />, label: 'LinkedIn' },
              { icon: <FiInstagram />, label: 'Instagram' },
              { icon: <FiYoutube />, label: 'YouTube' },
              { icon: <FiFacebook />, label: 'Facebook' }
            ].map(({ icon, label }) => (
              <button
                key={label}
                title={label}
                style={socialStyle}
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
              </button>
            ))}
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--secondary)' }}>
            ✉ &nbsp;hello@swa-wellness.com
          </div>
        </div>

        {/* RIGHT — Link columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px'
        }}>
          {/* Services */}
          <div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 700, color: 'var(--dark)', marginBottom: '18px' }}>Services</h4>
            {[
              { label: 'Corporate Wellness', path: '/services/corporate' },
              { label: 'Education Programs', path: '/services/education' },
              { label: 'Community Wellness', path: '/services/community' }
            ].map(item => (
              <button key={item.label} style={linkStyle} onClick={() => navigate(item.path)}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--dark2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
              >{item.label}</button>
            ))}
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 700, color: 'var(--dark)', marginBottom: '18px' }}>Company</h4>
            <button style={linkStyle} onClick={() => navigate('/about')}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--dark2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
            >About Us</button>
            <button style={linkStyle} onClick={() => navigate('/book-demo')}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--dark2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
            >Book a Demo</button>
            {['Careers','Our Experts'].map(item => (
              <button key={item} style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--dark2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
              >{item}</button>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 700, color: 'var(--dark)', marginBottom: '18px' }}>Legal</h4>
            {['Terms and Conditions','Privacy Policy','Cookie Policy'].map(item => (
              <button key={item} style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--dark2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
              >{item}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '20px 0', textAlign: 'center',
        fontSize: '12px', color: 'rgba(101,50,57,0.45)'
      }}>
        Copyright © 2025 SWA Wellness. All rights reserved.
      </div>
    </footer>
  )
}
