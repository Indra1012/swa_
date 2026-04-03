import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  FiEdit3, FiCheck, FiX,
  FiAlertCircle, FiChevronDown
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

const SECTIONS = [
  'hero', 'tagline', 'programs', 'techniques',
  'stats', 'services', 'corporate', 'education',
  'community', 'testimonials', 'blogs', 'about', 'faq'
]

const DEFAULT_CONTENT = {
  hero: [
    { key: 'headline', label: 'Main Headline', value: 'Where Self Meets Its True Essence' },
    { key: 'tagline', label: 'Tagline', value: 'Science-backed wellbeing programs for organizations, institutions & communities.' },
    { key: 'videoUrl', label: 'Video URL', value: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
  ],
  tagline: [
    { key: 'heading', label: 'Section Heading', value: 'Bringing lasting wellbeing to your' },
    { key: 'subtext', label: 'Subtext', value: 'We compassionately create wellbeing programs and mindfulness spaces to improve holistic wellbeing.' },
    { key: 'ctaText', label: 'CTA Button Text', value: 'Contact us for a demo' }
  ],
  about: [
    { key: 'founderName', label: 'Founder Name', value: 'Dhruvi Shah' },
    { key: 'founderTitle', label: 'Founder Title', value: 'Founder & Head Coach – SWA Wellbeing' },
    { key: 'founderBio', label: 'Founder Bio', value: 'Dhruvi Shah is the Founder and Head Wellbeing Coach at SWA Wellbeing, where she focuses on building emotionally resilient individuals and conscious leaders.' },
    { key: 'founderQuote', label: 'Founder Quote', value: 'To help individuals understand and master their emotions before those emotions begin to shape their decisions.' }
  ],
  stats: [
    { key: 'organizations', label: 'Organizations Count', value: '450+' },
    { key: 'people', label: 'People Impacted', value: '20L+' },
    { key: 'sessions', label: 'Sessions Conducted', value: '2L+' },
    { key: 'experts', label: 'Global Experts', value: '1000+' },
    { key: 'cities', label: 'Cities Impacted', value: '102+' }
  ],
  corporate: [
    { key: 'headline', label: 'Banner Headline', value: 'Build a Resilient, High-Performing Workforce' },
    { key: 'subheadline', label: 'Banner Subheadline', value: 'Empower your teams with structured wellbeing programs designed to reduce stress, improve focus, and drive sustainable performance.' },
    { key: 'challenge', label: 'The Challenge', value: "Today's workplaces are facing rising stress, burnout, disengagement, and declining focus." },
    { key: 'approach', label: 'Our Approach', value: 'At SWA, we design customized wellbeing programs aligned with your organizational goals.' }
  ],
  education: [
    { key: 'headline', label: 'Banner Headline', value: 'Building Emotionally Strong & Focused Students' },
    { key: 'subheadline', label: 'Banner Subheadline', value: 'Helping students and educators manage stress, improve concentration, and build emotional resilience.' },
    { key: 'challenge', label: 'The Challenge', value: 'Students today face increasing academic pressure, distractions, and emotional stress.' },
    { key: 'approach', label: 'Our Approach', value: 'We deliver simple, practical, and age-appropriate programs that help students understand and manage their thoughts.' }
  ],
  community: [
    { key: 'headline', label: 'Banner Headline', value: 'Creating Healthier, More Resilient Communities' },
    { key: 'subheadline', label: 'Banner Subheadline', value: 'Driving large-scale wellbeing initiatives that help individuals manage stress, build resilience, and live more balanced lives.' },
    { key: 'need', label: 'The Need', value: "In today's fast-changing world, stress and emotional challenges are not limited to workplaces — they impact entire communities." },
    { key: 'approach', label: 'Our Approach', value: 'We partner with organizations, NGOs, and institutions to deliver impactful community wellbeing programs.' }
  ],
  faq: [
    { key: 'heading', label: 'Section Heading', value: 'Frequently Asked Questions' },
    { key: 'subtext', label: 'Subtext', value: "Here are some frequently asked questions. Can't find an answer? Feel free to contact us." }
  ]
}

function ContentField({ field, section, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(field.value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const isLong = field.value.length > 80

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('swa_token')
      await axios.put(
        `${API}/api/content`,
        { section, key: field.key, value },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setValue(field.value)
    setEditing(false)
    setError('')
  }

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: '12px',
      padding: '20px 24px',
      border: `1px solid ${editing
        ? 'rgba(175,122,109,0.4)'
        : 'rgba(204,199,185,0.2)'}`,
      transition: 'border-color 0.25s ease'
    }}>
      {/* Field label row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: editing ? '12px' : '8px'
      }}>
        <div>
          <p style={{
            fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '1px', color: 'var(--secondary)',
            fontWeight: 600, marginBottom: '2px'
          }}>
            {field.label}
          </p>
          <p style={{
            fontSize: '10px', color: 'rgba(60,47,47,0.35)',
            fontFamily: 'monospace'
          }}>
            key: {field.key}
          </p>
        </div>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--bg)',
              border: '1px solid rgba(204,199,185,0.3)',
              borderRadius: '8px', padding: '6px 12px',
              fontSize: '12px', fontWeight: 500,
              color: 'var(--secondary)', cursor: 'pointer',
              transition: 'var(--transition)',
              fontFamily: 'DM Sans, sans-serif'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--secondary)'
              e.currentTarget.style.color = 'var(--dark)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(204,199,185,0.3)'
              e.currentTarget.style.color = 'var(--secondary)'
            }}
          >
            <FiEdit3 size={12} />
            Edit
          </button>
        )}

        {saved && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', color: 'var(--secondary)', fontWeight: 500
          }}>
            <FiCheck size={14} />
            Saved
          </div>
        )}
      </div>

      {/* Value display or editor */}
      {editing ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0 }}
          >
            {isLong ? (
              <textarea
                value={value}
                onChange={e => setValue(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  background: 'var(--bg)',
                  color: 'var(--dark)',
                  resize: 'vertical',
                  lineHeight: 1.7,
                  marginBottom: '12px'
                }}
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: '1.5px solid var(--secondary)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  background: 'var(--bg)',
                  color: 'var(--dark)',
                  marginBottom: '12px'
                }}
              />
            )}

            {/* Character count */}
            <p style={{
              fontSize: '11px', color: 'rgba(60,47,47,0.4)',
              marginBottom: '12px', textAlign: 'right'
            }}>
              {value.length} characters
            </p>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', color: 'var(--secondary)',
                marginBottom: '12px',
                padding: '10px 14px',
                background: 'rgba(175,122,109,0.08)',
                border: '1px solid rgba(175,122,109,0.3)',
                borderRadius: '8px'
              }}>
                <FiAlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: saving ? 'rgba(101,50,57,0.5)' : 'var(--dark)',
                  color: 'var(--white)',
                  border: 'none', borderRadius: '8px',
                  padding: '9px 18px', fontSize: '13px',
                  fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: 'DM Sans, sans-serif'
                }}
                onMouseEnter={e => {
                  if (!saving) e.currentTarget.style.background = 'var(--dark2)'
                }}
                onMouseLeave={e => {
                  if (!saving) e.currentTarget.style.background = 'var(--dark)'
                }}
              >
                <FiCheck size={13} />
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                onClick={handleCancel}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'var(--bg)',
                  border: '1px solid rgba(204,199,185,0.4)',
                  color: 'var(--secondary)',
                  borderRadius: '8px',
                  padding: '9px 16px', fontSize: '13px',
                  fontWeight: 500, cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              >
                <FiX size={13} />
                Cancel
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <p style={{
          fontSize: '14px', color: 'var(--dark)',
          lineHeight: 1.6,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis'
        }}>
          {value}
        </p>
      )}
    </div>
  )
}

export default function ContentEditorTab() {
  const [section, setSection] = useState('hero')
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [sectionOpen, setSectionOpen] = useState(false)

  const loadContent = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/content/${section}`)
      const dbFields = res.data.items || res.data || []

      const defaults = DEFAULT_CONTENT[section] || []

      if (Array.isArray(dbFields) && dbFields.length > 0) {
        const merged = defaults.map(def => {
          const fromDB = dbFields.find(d => d.key === def.key)
          return fromDB ? { ...def, value: fromDB.value } : def
        })
        setFields(merged)
      } else {
        setFields(defaults)
      }
    } catch {
      setFields(DEFAULT_CONTENT[section] || [])
    } finally {
      setLoading(false)
    }
  }, [section])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '28px', fontWeight: 700,
          color: 'var(--dark)', marginBottom: '4px'
        }}>
          Content Editor
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>
          Click any field to edit. Changes save directly to the database.
        </p>
      </div>

      {/* Section selector dropdown */}
      <div style={{ position: 'relative', marginBottom: '28px', maxWidth: '280px' }}>
        <button
          onClick={() => setSectionOpen(!sectionOpen)}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'var(--white)',
            border: '1.5px solid rgba(204,199,185,0.4)',
            borderRadius: '10px',
            fontSize: '14px', fontWeight: 500,
            color: 'var(--dark)', cursor: 'pointer',
            textTransform: 'capitalize',
            fontFamily: 'DM Sans, sans-serif'
          }}
        >
          {section}
          <FiChevronDown
            size={16}
            style={{
              transform: sectionOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s ease',
              color: 'var(--secondary)'
            }}
          />
        </button>

        <AnimatePresence>
          {sectionOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', top: 'calc(100% + 8px)',
                left: 0, right: 0, zIndex: 50,
                background: 'var(--white)',
                borderRadius: '12px',
                border: '1px solid rgba(204,199,185,0.25)',
                boxShadow: '0 12px 40px rgba(60,47,47,0.1)',
                overflow: 'hidden'
              }}
            >
              {SECTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSection(s)
                    setSectionOpen(false)
                  }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '11px 16px',
                    background: section === s
                      ? 'rgba(204,199,185,0.12)'
                      : 'transparent',
                    border: 'none',
                    fontSize: '14px',
                    color: section === s ? 'var(--dark)' : 'var(--secondary)',
                    fontWeight: section === s ? 600 : 400,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    if (section !== s)
                      e.currentTarget.style.background = 'rgba(204,199,185,0.06)'
                  }}
                  onMouseLeave={e => {
                    if (section !== s)
                      e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fields */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              height: '80px', borderRadius: '12px',
              background: 'rgba(204,199,185,0.15)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          ))}
        </div>
      ) : fields.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px',
          background: 'var(--white)',
          borderRadius: '16px',
          border: '1px solid rgba(204,199,185,0.2)'
        }}>
          <FiEdit3 size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
            No editable content fields for this section yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fields.map(field => (
            <ContentField
              key={field.key}
              field={field}
              section={section}
              onSave={loadContent}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
