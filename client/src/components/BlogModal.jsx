import { useEffect } from 'react'

export default function BlogModal({ isOpen, blog, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !blog) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(60,47,47,0.75)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: '24px',
          maxWidth: '680px', width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        <img
          src={blog.image}
          alt={blog.title}
          style={{ width: '100%', height: '260px', objectFit: 'cover',
            borderRadius: '24px 24px 0 0' }}
        />
        <div style={{ padding: '36px' }}>
          <p style={{
            fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '1.5px', color: 'var(--secondary)',
            fontWeight: 600, marginBottom: '12px'
          }}>{blog.category}</p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px', fontWeight: 700,
            color: 'var(--dark)', marginBottom: '20px', lineHeight: 1.3
          }}>{blog.title}</h2>
          <p style={{
            fontSize: '14px', color: 'var(--secondary)',
            lineHeight: 1.9
          }}>{blog.body}</p>
          <button
            onClick={onClose}
            style={{
              marginTop: '28px',
              background: 'var(--dark)', color: 'var(--white)',
              border: 'none', borderRadius: '50px',
              padding: '12px 32px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer'
            }}
          >Close</button>
        </div>
      </div>
    </div>
  )
}
