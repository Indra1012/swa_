import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  FiBell, FiMail, FiCheck,
  FiAlertCircle, FiInfo, FiPlus, FiMinus
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

export default function NotificationSettingsTab() {
  const [notificationEmail, setNotificationEmail] = useState('')
  const [ccEmail, setCcEmail] = useState('')
  const [notificationEmail2, setNotificationEmail2] = useState('')
  const [notificationEmail3, setNotificationEmail3] = useState('')
  const [showExtra, setShowExtra] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('swa_token')
        const res = await axios.get(`${API}/api/admin/settings/email`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setNotificationEmail(res.data.notificationEmail || '')
        setCcEmail(res.data.ccEmail || '')
        setNotificationEmail2(res.data.notificationEmail2 || '')
        setNotificationEmail3(res.data.notificationEmail3 || '')
        if (res.data.notificationEmail2 || res.data.notificationEmail3) {
          setShowExtra(true)
        }
      } catch {
        setNotificationEmail('')
        setCcEmail('')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const validateEmail = (email) => {
    if (!email) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSave = async () => {
    setMessage(null)

    if (!notificationEmail) {
      setMessage({ type: 'error', text: 'Primary notification email is required.' })
      return
    }
    if (!validateEmail(notificationEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid primary email address.' })
      return
    }
    if (ccEmail && !validateEmail(ccEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid CC email address.' })
      return
    }
    if (notificationEmail2 && !validateEmail(notificationEmail2)) {
      setMessage({ type: 'error', text: 'Please enter a valid Admin Email 2 address.' })
      return
    }
    if (notificationEmail3 && !validateEmail(notificationEmail3)) {
      setMessage({ type: 'error', text: 'Please enter a valid Admin Email 3 address.' })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('swa_token')
      await axios.put(
        `${API}/api/admin/settings/email`,
        { notificationEmail, ccEmail, notificationEmail2, notificationEmail3 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const [focusedField, setFocusedField] = useState(null)

  const inputStyle = (field) => ({
    width: '100%',
    padding: '13px 16px 13px 44px',
    border: `1.5px solid ${focusedField === field
      ? 'var(--secondary)'
      : 'rgba(204,199,185,0.35)'}`,
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    background: 'var(--bg)',
    color: 'var(--dark)',
    transition: 'border-color 0.25s ease'
  })

  const renderField = (label, value, setter, field, placeholder, required = false, icon = FiMail) => {
    const Icon = icon
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px', fontWeight: 600,
          color: 'var(--dark)', marginBottom: '8px'
        }}>
          {label}
          {required && <span style={{ color: 'var(--secondary)', marginLeft: '4px' }}>*</span>}
          {!required && (
            <span style={{
              fontSize: '11px', fontWeight: 400,
              color: 'var(--secondary)', marginLeft: '8px'
            }}>
              optional
            </span>
          )}
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '14px',
            top: '50%', transform: 'translateY(-50%)',
            color: focusedField === field ? 'var(--secondary)' : 'var(--secondary)',
            display: 'flex', alignItems: 'center',
            transition: 'color 0.25s ease'
          }}>
            <Icon size={16} />
          </span>
          <input
            type="email"
            value={value}
            onChange={e => setter(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            style={inputStyle(field)}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '28px', fontWeight: 700,
          color: 'var(--dark)', marginBottom: '4px'
        }}>
          Notification Settings
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>
          Configure where booking notifications are sent.
          You can add up to 3 admin email addresses.
        </p>
      </div>

      <div style={{ maxWidth: '560px' }}>

        {/* Info card */}
        <div style={{
          display: 'flex', gap: '12px',
          padding: '16px 20px',
          background: 'rgba(175,122,109,0.08)',
          border: '1px solid rgba(175,122,109,0.3)',
          borderRadius: '12px',
          marginBottom: '28px'
        }}>
          <FiInfo size={18} style={{
            color: 'var(--secondary)', flexShrink: 0, marginTop: '1px'
          }} />
          <div>
            <p style={{
              fontSize: '13px', fontWeight: 600,
              color: 'var(--dark)', marginBottom: '4px'
            }}>
              How it works
            </p>
            <p style={{
              fontSize: '13px', color: 'var(--secondary)',
              lineHeight: 1.6
            }}>
              Every time a visitor submits the booking form, an email notification
              is sent to all configured addresses below. You can manage up to 3 admin emails.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                height: '56px', borderRadius: '10px',
                background: 'rgba(204,199,185,0.15)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Primary notification email */}
            {renderField(
              'Primary Admin Email',
              notificationEmail, setNotificationEmail,
              'email1', 'admin@swa-wellbeing.com',
              true, FiMail
            )}

            {/* CC email */}
            {renderField(
              'CC Email',
              ccEmail, setCcEmail,
              'cc', 'founder@swa-wellbeing.com',
              false, FiBell
            )}

            {/* Toggle for additional admins */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => setShowExtra(!showExtra)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'none', border: 'none',
                  fontSize: '13px', fontWeight: 600,
                  color: 'var(--secondary)', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  padding: '8px 0'
                }}
              >
                {showExtra ? <FiMinus size={14} /> : <FiPlus size={14} />}
                {showExtra ? 'Hide' : 'Add'} additional admin emails
              </button>
            </div>

            {/* Extra admin emails */}
            <AnimatePresence>
              {showExtra && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  {renderField(
                    'Admin Email 2',
                    notificationEmail2, setNotificationEmail2,
                    'email2', 'admin2@swa-wellbeing.com',
                    false, FiMail
                  )}
                  {renderField(
                    'Admin Email 3',
                    notificationEmail3, setNotificationEmail3,
                    'email3', 'admin3@swa-wellbeing.com',
                    false, FiMail
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '14px 18px',
                    background: message.type === 'success'
                      ? 'rgba(175,122,109,0.08)'
                      : 'rgba(175,122,109,0.08)',
                    border: `1px solid ${message.type === 'success'
                      ? 'rgba(175,122,109,0.3)'
                      : 'rgba(175,122,109,0.3)'}`,
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    color: 'var(--secondary)'
                  }}
                >
                  {message.type === 'success'
                    ? <FiCheck size={16} />
                    : <FiAlertCircle size={16} />
                  }
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: saving ? 'rgba(101,50,57,0.5)' : 'var(--dark)',
                color: 'var(--white)',
                border: 'none', borderRadius: '10px',
                padding: '14px 32px', fontSize: '15px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
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
              <FiCheck size={15} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
