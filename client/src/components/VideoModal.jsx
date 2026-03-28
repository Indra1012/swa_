import { useEffect } from 'react'

export default function VideoModal({ isOpen, videoUrl, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', width: '90%', maxWidth: '860px' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '-44px', right: 0,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: 'white', width: '36px', height: '36px',
            borderRadius: '50%', cursor: 'pointer', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >✕</button>
        <div style={{
          background: '#000',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
        }}>
          <iframe
            src={isOpen ? `${videoUrl}?autoplay=1` : ''}
            style={{ width: '100%', aspectRatio: '16/9', display: 'block', border: 'none' }}
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>
    </div>
  )
}
