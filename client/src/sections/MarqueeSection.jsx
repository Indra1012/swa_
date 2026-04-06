import { useRef, useState, useEffect } from 'react'
import axios from 'axios'

const BRANDS = [
  'Licious', 'AngelOne', 'Blue Star', 'Narayana Health', 'Yes Bank',
  'Amazon', 'PayPal', 'Flipkart', 'Edelweiss', 'Zenoti',
  'LinkedIn', 'HCL Tech', 'Manhattan', 'Ralph Lauren'
]

// Duplicate for seamless loop
const DOUBLED = [...BRANDS, ...BRANDS]

const API = import.meta.env.VITE_API_URL

export default function MarqueeSection() {
  const trackRef = useRef(null)
  const [tagline, setTagline] = useState('Loved by leading organizations worldwide')
  const [sectionVisible, setSectionVisible] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/content/client-logos`)
      .then(res => {
        const items = res.data.items || []
        const tLine = items.find(i => i.key === 'tagline')
        if (tLine?.value) setTagline(tLine.value)
        const vLine = items.find(i => i.key === 'visible')
        if (vLine && vLine.value === 'false') setSectionVisible(false)
        else setSectionVisible(true)
      })
      .catch(() => {})
  }, [])

  if (!sectionVisible) return null

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
    <section style={{
      background: 'transparent',
      padding: '60px 0 70px',
      borderTop: '1px solid rgba(204,199,185,0.4)',
      borderBottom: '1px solid rgba(204,199,185,0.4)',
      position: 'relative',
      overflow: 'hidden',
      margin: 0
    }}>
      {/* Tagline */}
      <p style={{
        textAlign: 'center',
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '18px',
        fontWeight: 600,
        color: 'rgba(101,50,57,0.55)',
        letterSpacing: '0.5px',
        marginBottom: '32px',
        fontStyle: 'italic'
      }}>
        {tagline}
      </p>

      {/* Marquee track with Gradient Mask for fading edges */}
      <div style={{
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
      }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '80px', /* Increased gap for breathing room */
            alignItems: 'center',
            width: 'max-content',
            animation: 'marquee 35s linear infinite' /* Slower, more elegant scroll */
          }}
          onMouseEnter={() => {
            if (trackRef.current)
              trackRef.current.style.animationPlayState = 'paused'
          }}
          onMouseLeave={() => {
            if (trackRef.current)
              trackRef.current.style.animationPlayState = 'running'
          }}
        >
          {DOUBLED.map((brand, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '26px', /* Larger */
                fontWeight: 600,
                color: 'rgba(101,50,57,0.4)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.5px',
                cursor: 'default',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--secondary)'
                e.currentTarget.style.opacity = 1
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(101,50,57,0.4)'
                e.currentTarget.style.opacity = 1
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
    </div>
  )
}
