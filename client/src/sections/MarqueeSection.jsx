import { useRef } from 'react'

const BRANDS = [
  'Licious', 'AngelOne', 'Blue Star', 'Narayana Health', 'Yes Bank',
  'Amazon', 'PayPal', 'Flipkart', 'Edelweiss', 'Zenoti',
  'LinkedIn', 'HCL Tech', 'Manhattan', 'Ralph Lauren'
]

// Duplicate for seamless loop
const DOUBLED = [...BRANDS, ...BRANDS]

export default function MarqueeSection() {
  const trackRef = useRef(null)

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
