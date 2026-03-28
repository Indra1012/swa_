import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  FiUser, FiMail, FiPhone, FiBriefcase,
  FiUsers, FiMessageSquare, FiCalendar,
  FiClock, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

const TEAM_SIZES = ['<10', '10-50', '50-200', '200+']

const inputStyle = {
  width: '100%',
  padding: '13px 16px 13px 44px',
  border: '1.5px solid rgba(204,199,185,0.35)',
  borderRadius: '12px',
  fontSize: '14px',
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  background: 'var(--bg)',
  color: 'var(--dark)',
  transition: 'border-color 0.25s ease'
}

function InputField({ icon, label, type = 'text', value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '13px', fontWeight: 600,
        color: 'var(--dark)', marginBottom: '8px'
      }}>
        {label} {required && <span style={{ color: 'var(--secondary)' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '14px',
          top: '50%', transform: 'translateY(-50%)',
          color: focused ? 'var(--secondary)' : 'var(--primary)',
          transition: 'color 0.25s ease',
          display: 'flex', alignItems: 'center'
        }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            borderColor: focused
              ? 'var(--secondary)'
              : 'rgba(204,199,185,0.35)'
          }}
        />
      </div>
    </div>
  )
}

export default function BookDemo() {
  const [slots, setSlots] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [bookingDetails, setBookingDetails] = useState(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    teamSize: '',
    message: ''
  })

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await axios.get(`${API}/api/slots`)
        const data = res.data.slots || res.data || []
        setSlots(Array.isArray(data) ? data : [])
        const slotsArr = Array.isArray(data) ? data : []
        const dates = [...new Set(slotsArr.map(s => s.date))].sort()
        setAvailableDates(dates)
      } catch {
        setSlots([])
        setAvailableDates([])
      }
    }
    fetchSlots()
  }, [])

  const timesForDate = selectedDate
    ? slots.filter(s => s.date === selectedDate && s.isAvailable && !s.isBooked).map(s => s.time)
    : []

  const handleFormChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = async () => {
    setError('')
    if (!form.name || !form.email || !form.phone || !form.company || !form.teamSize) {
      setError('Please fill in all required fields.')
      return
    }
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time slot.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/bookings`, {
        ...form,
        date: selectedDate,
        timeSlot: selectedTime
      })
      setBookingDetails(res.data)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <main className="bookdemo-page" style={{ margin: 0, padding: 0, paddingTop: '72px', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── SECTION 1: Dark Header ── */}
      <section style={{
        background: 'var(--dark)',
        padding: '60px 60px 50px',
        margin: 0,
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '680px', margin: '0 auto' }}
        >
          <p style={{
            fontSize: '12px', textTransform: 'uppercase',
            letterSpacing: '3px', color: 'var(--primary)',
            fontWeight: 600, marginBottom: '20px'
          }}>
            Begin Your Journey
          </p>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(36px, 4vw, 56px)',
            fontWeight: 700, color: 'var(--white)',
            marginBottom: '20px', lineHeight: 1.05, letterSpacing: '-0.5px'
          }}>
            Discover <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>SWA Wellness</span>
          </h1>
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7, fontWeight: 400
          }}>
            Watch how our science-backed wellness programs can transform the performance, cohesion, and emotional resilience of your core organization.
          </p>
        </motion.div>
      </section>

      {/* ── SECTION 2: Video ── */}
      <section style={{
        background: 'var(--bg)',
        padding: '48px 60px 0',
        margin: 0
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            aspectRatio: '16/9',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            border: '1px solid rgba(204,199,185,0.25)',
            background: '#000'
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="SWA Wellness Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </motion.div>
      </section>

      {/* ── SECTION 3: Booking Form ── */}
      <section style={{
        background: 'var(--bg)',
        padding: '40px 60px 80px',
        margin: 0
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '40px' }}
          >
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(28px, 3vw, 42px)',
              fontWeight: 700, color: 'var(--dark)', marginBottom: '12px', letterSpacing: '-0.5px'
            }}>
              Schedule Your <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Consultation</span>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--secondary)', lineHeight: 1.6 }}>
              Fill out your exact details below, and securely reserve a priority integration time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {submitted ? (
              <div style={{
                background: 'var(--white)',
                borderRadius: '32px', padding: '60px 40px', textAlign: 'center',
                border: '1px solid rgba(204,199,185,0.2)', boxShadow: '0 30px 60px rgba(0,0,0,0.03)'
              }}>
                <div style={{
                  width: '64px', height: '64px', background: 'rgba(175,122,109,0.1)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent)'
                }}>
                  <FiCheckCircle size={32} />
                </div>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 700,
                  color: 'var(--dark)', marginBottom: '16px', letterSpacing: '-0.5px'
                }}>
                  Booking <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>Confirmed!</span>
                </h2>
                <p style={{
                  fontSize: '15px', color: 'var(--secondary)', lineHeight: 1.7,
                  maxWidth: '400px', margin: '0 auto 40px'
                }}>
                  Thank you! Your demo has been securely scheduled. We have sent a comprehensive confirmation to your email and will be in touch shortly.
                </p>
                <div style={{
                  background: 'var(--white)', borderRadius: '20px',
                  padding: '24px', maxWidth: '400px', margin: '0 auto',
                  textAlign: 'left', border: '1px solid rgba(204,199,185,0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}>
                  {[
                    { label: 'Name', value: form.name },
                    { label: 'Company', value: form.company },
                    { label: 'Date', value: formatDate(selectedDate) },
                    { label: 'Time', value: selectedTime }
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: '1px solid rgba(204,199,185,0.2)',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: 'var(--secondary)', fontWeight: 500 }}>{label}</span>
                      <span style={{ color: 'var(--dark)', fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--white)',
                borderRadius: '24px',
                padding: '48px',
                border: '1px solid rgba(204,199,185,0.2)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.02)'
              }}>
                <div className="form-grid" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px'
                }}>
                  <InputField icon={<FiUser size={16} />} label="Full Name" value={form.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="Dhruvi Shah" required />
                  <InputField icon={<FiMail size={16} />} label="Work Email" type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="dhruvi@company.com" required />
                  <InputField icon={<FiPhone size={16} />} label="Phone Number" type="tel" value={form.phone} onChange={e => handleFormChange('phone', e.target.value)} placeholder="+91 98765 43210" required />
                  <InputField icon={<FiBriefcase size={16} />} label="Company Name" value={form.company} onChange={e => handleFormChange('company', e.target.value)} placeholder="Your Organization" required />
                </div>

                <div style={{ marginBottom: '24px', marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dark)', marginBottom: '12px' }}>
                    Team Size <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {TEAM_SIZES.map(size => (
                      <button
                        key={size} onClick={() => handleFormChange('teamSize', size)}
                        style={{
                          padding: '10px 20px', borderRadius: '50px',
                          border: form.teamSize === size ? '2px solid var(--dark)' : '1.5px solid rgba(204,199,185,0.4)',
                          background: form.teamSize === size ? 'var(--dark)' : 'transparent',
                          color: form.teamSize === size ? 'var(--white)' : 'var(--dark)',
                          fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'DM Sans, sans-serif'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dark)', marginBottom: '12px' }}>Message</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}><FiMessageSquare size={16} /></span>
                    <textarea value={form.message} onChange={e => handleFormChange('message', e.target.value)} placeholder="Tell us about your organization and what you are looking for..." rows={4} style={{ ...inputStyle, resize: 'none', lineHeight: 1.7 }} />
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--dark)', marginBottom: '16px' }}>
                    <FiCalendar size={15} /> Select a Date <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  {availableDates.length === 0 ? (
                    <div style={{ padding: '20px', background: 'rgba(204,199,185,0.15)', borderRadius: '16px', border: '1px dashed rgba(204,199,185,0.4)', fontSize: '13px', color: 'var(--secondary)', textAlign: 'center' }}>
                      No available dates currently. Please check back soon or reach out via email.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {availableDates.map(date => (
                        <button
                          key={date} onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                          style={{
                            padding: '10px 18px', borderRadius: '12px',
                            border: selectedDate === date ? '2px solid var(--dark)' : '1.5px solid rgba(204,199,185,0.4)',
                            background: selectedDate === date ? 'var(--dark)' : 'var(--white)',
                            color: selectedDate === date ? 'var(--white)' : 'var(--dark)',
                            fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'DM Sans, sans-serif'
                          }}
                        >
                          {formatDate(date)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedDate && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.4 }} style={{ marginBottom: '40px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--dark)', marginBottom: '16px' }}>
                      <FiClock size={15} /> Select a Time <span style={{ color: 'var(--secondary)' }}>*</span>
                    </label>
                    {timesForDate.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--secondary)', padding: '16px', background: 'rgba(204,199,185,0.15)', borderRadius: '16px', border: '1px dashed rgba(204,199,185,0.4)' }}>
                        No available times for this date.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {timesForDate.map(time => (
                          <button
                            key={time} onClick={() => setSelectedTime(time)}
                            style={{
                              padding: '10px 20px', borderRadius: '50px',
                              border: selectedTime === time ? '2px solid var(--dark)' : '1.5px solid rgba(204,199,185,0.4)',
                              background: selectedTime === time ? 'var(--dark)' : 'var(--white)',
                              color: selectedTime === time ? 'var(--white)' : 'var(--dark)',
                              fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'DM Sans, sans-serif'
                            }}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(175,122,109,0.08)', border: '1px solid rgba(175,122,109,0.3)', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', color: 'var(--secondary)', fontWeight: 500 }}>
                    <FiAlertCircle size={16} /> {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit} disabled={loading}
                  style={{
                    width: '100%', background: loading ? 'rgba(101,50,57,0.5)' : 'var(--dark)', color: 'var(--white)',
                    border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer', transition: 'var(--transition)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.5px'
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--dark2)' }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--dark)' }}
                >
                  {loading ? 'Submitting Request...' : 'Secure Your Demo →'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
