import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, children, maxWidth = '680px' }) {
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
          maxWidth, width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'sticky', top: '16px', float: 'right',
            margin: '16px 16px 0 0',
            background: 'var(--bg)', border: 'none',
            width: '36px', height: '36px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--dark)', zIndex: 1
          }}
        >✕</button>
        {children}
      </div>
    </div>
  )
}
