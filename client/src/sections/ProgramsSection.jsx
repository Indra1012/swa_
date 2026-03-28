import { useState, useRef, useCallback } from 'react'
import { PROGRAMS } from '../constants/programs'
import Modal from '../components/Modal'
import useScrollFade from '../hooks/useScrollFade'

export default function ProgramsSection() {
  const [selectedProgram, setSelectedProgram] = useState(null)
  const sectionRef = useRef(null)
  useScrollFade(sectionRef)

  const openModal = useCallback((program) => setSelectedProgram(program), [])
  const closeModal = useCallback(() => setSelectedProgram(null), [])

  return (
    <>
      <section
        id="programs"
        ref={sectionRef}
        className="fade-up"
        style={{
          background: 'var(--dark)',
          padding: '80px 60px',
          position: 'relative',
          overflow: 'hidden',
          margin: 0
        }}
      >
        {/* Subtle background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='30' cy='30' r='28' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='18' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
          pointerEvents: 'none'
        }} />

        <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <p style={{
            fontSize: '12px', textTransform: 'uppercase',
            letterSpacing: '2px', color: 'var(--primary)',
            marginBottom: '12px', fontWeight: 500
          }}>
            Discover Our Solutions
          </p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            fontWeight: 700, color: 'var(--white)',
            marginBottom: '12px', lineHeight: 1.2
          }}>
            Discover Our{' '}
            <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500 }}>
              Transformative
            </span>{' '}
            Solutions
          </h2>
          <p style={{
            fontSize: '15px', color: 'rgba(255,255,255,0.6)',
            maxWidth: '500px', lineHeight: 1.7,
            marginBottom: '50px'
          }}>
            Where ancient wisdom meets modern science and mindfulness meets happiness.
          </p>

          {/* Programs grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {PROGRAMS.map(program => (
              <ProgramCard
                key={program.id}
                program={program}
                onOpen={openModal}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <Modal
        isOpen={!!selectedProgram}
        onClose={closeModal}
        maxWidth="620px"
      >
        {selectedProgram && (
          <div>
            <img
              src={selectedProgram.image}
              alt={selectedProgram.title}
              style={{
                width: '100%', height: '260px',
                objectFit: 'cover',
                borderRadius: '24px 24px 0 0'
              }}
            />
            <div style={{ padding: '36px' }}>
              <p style={{
                fontSize: '11px', textTransform: 'uppercase',
                letterSpacing: '1.5px', color: 'var(--secondary)',
                fontWeight: 600, marginBottom: '12px'
              }}>
                Our Programs
              </p>
              <h2 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '28px', fontWeight: 700,
                color: 'var(--dark)', marginBottom: '8px'
              }}>
                {selectedProgram.title}
              </h2>
              <p style={{
                fontSize: '13px', color: 'var(--secondary)',
                marginBottom: '20px', fontStyle: 'italic'
              }}>
                {selectedProgram.description}
              </p>
              <p style={{
                fontSize: '15px', color: 'var(--dark)',
                lineHeight: 1.9
              }}>
                {selectedProgram.detail}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

function ProgramCard({ program, onOpen }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onOpen(program)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '20px', overflow: 'hidden',
        position: 'relative', height: '340px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.3)' : 'none',
        transition: 'transform 0.4s ease, box-shadow 0.4s ease'
      }}
    >
      {/* Image */}
      <img
        src={program.image}
        alt={program.title}
        loading="lazy"
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          transition: 'transform 0.6s ease'
        }}
      />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(60,47,47,0.92) 0%, rgba(60,47,47,0.2) 60%, transparent 100%)'
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0,
        left: 0, right: 0, padding: '28px'
      }}>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '22px', fontWeight: 700,
          color: 'var(--white)', marginBottom: '6px',
          lineHeight: 1.3
        }}>
          {program.title}
        </h3>
        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.5, marginBottom: '16px'
        }}>
          {program.description}
        </p>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'var(--white)', borderRadius: '50px',
          padding: '8px 18px', fontSize: '13px',
          fontWeight: 500, cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'var(--transition)'
        }}>
          Discover more ↗
        </button>
      </div>
    </div>
  )
}
