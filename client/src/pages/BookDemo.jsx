import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  FiUser, FiMail, FiPhone, FiBriefcase,
  FiUsers, FiMessageSquare, FiCalendar,
  FiClock, FiCheckCircle, FiAlertCircle,
  FiChevronLeft, FiChevronRight
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

function CustomCalendar({ onSelect, onClose, minDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))

  const isPast = (day) => {
    if(!day) return true
    const dateToCheck = new Date(year, month, day)
    const minD = new Date(minDate)
    minD.setHours(0,0,0,0)
    return dateToCheck < minD
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'absolute', top: 'calc(100% + 10px)', left: 0,
        background: 'var(--white)', padding: '20px', borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(204,199,185,0.3)',
        width: '280px', zIndex: 100
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={prevMonth} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--dark)', display:'flex', padding:'4px' }}><FiChevronLeft size={18}/></button>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize:'14px', color:'var(--dark)' }}>{monthNames[month]} {year}</span>
        <button onClick={nextMonth} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--dark)', display:'flex', padding:'4px' }}><FiChevronRight size={18}/></button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ fontFamily: 'DM Sans, sans-serif', fontSize:'12px', color:'var(--secondary)', fontWeight: 500 }}>{d}</div>)}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {days.map((day, i) => {
          const past = isPast(day)
          return (
          <button
            key={i}
            disabled={past || !day}
            onClick={() => {
              if(day && !past) {
                const selected = [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-')
                onSelect(selected)
                onClose()
              }
            }}
            style={{
              padding: '8px 0', border: 'none', background: 'transparent',
              borderRadius: '8px', cursor: (past || !day) ? 'default' : 'pointer',
              color: past ? 'rgba(204,199,185,0.4)' : 'var(--dark)',
              fontSize: '13px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.2s', position: 'relative'
            }}
            onMouseEnter={e => { if(day && !past) e.currentTarget.style.background = 'rgba(204,199,185,0.15)' }}
            onMouseLeave={e => { if(day && !past) e.currentTarget.style.background = 'transparent' }}
          >
            {day || ''}
          </button>
        )})}
      </div>
    </motion.div>
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
  const [isVideoExpanded, setIsVideoExpanded] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [content, setContent] = useState({})

  useEffect(() => {
    axios.get(`${API}/api/content/book_demo`).then(res => {
      const cmap = {}
      ;(res.data.items || res.data || []).forEach(i => cmap[i.key] = i.value)
      setContent(cmap)
    }).catch(()=>{})
  }, [])


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
        
        // Filter out dates that have NO available slots natively
        const validDates = [...new Set(slotsArr.filter(s => s.isAvailable && !s.isBooked).map(s => s.date))].sort()
        setAvailableDates(validDates)
        if (validDates.length > 0 && !selectedDate) {
          setSelectedDate(validDates[0])
        }
      } catch {
        setSlots([])
        setAvailableDates([])
      }
    }
    fetchSlots()
  }, [])

  const handleCustomDateChange = async (e) => {
    const date = e.target.value
    if (!date) return
    
    try {
      const res = await axios.get(`${API}/api/slots?date=${date}`)
      const daySlots = res.data.slots || []
      
      setSlots(prev => {
        const filtered = prev.filter(s => s.date !== date)
        return [...filtered, ...daySlots]
      })
      
      setAvailableDates(prev => {
         if (!prev.includes(date)) return [...prev, date].sort()
         return prev
      })

      setSelectedDate(date)
      setSelectedTime(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Determine displayed dates: First 7 available dates, plus the selected date if it's far out
  let baseDisplayed = availableDates.slice(0, 7)
  if (selectedDate && !baseDisplayed.includes(selectedDate)) {
    baseDisplayed.push(selectedDate)
    baseDisplayed.sort()
  }

  // All slots for the selected date (available + booked), for display
  const allTimesForDate = selectedDate
    ? slots.filter(s => s.date === selectedDate)
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
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) // removed year to keep buttons compact
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <main className="bookdemo-page" style={{ margin: 0, padding: 0, paddingTop: '72px', background: 'transparent', minHeight: '100vh' }}>

          {/* ── HEADER & VIDEO SECTION ── */}
          <section style={{
            background: 'transparent',
            padding: '40px 60px 20px',
            margin: 0,
            textAlign: 'center'
          }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ maxWidth: '800px', margin: '0 auto', marginBottom: isVideoExpanded ? '40px' : '0' }}
            >
              <h1 
                dangerouslySetInnerHTML={{
                  __html: (content.title || 'Experience <i>SWA Wellbeing</i>').replace(
                    /<i>(.*?)<\/i>/g, 
                    '<span style="font-style: italic; font-weight: 500; color: var(--dark2)">$1</span>'
                  )
                }}
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  fontWeight: 700, color: 'var(--dark)',
                  lineHeight: 1.1, letterSpacing: '-0.5px',
                  marginBottom: '32px'
                }}
              />

              {content.showVideo !== 'false' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px, 3vw, 24px)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '17px', fontWeight: 500, color: 'var(--dark)', fontFamily: 'DM Sans, sans-serif' }}>
                    {content.subtitle || 'Want a quick preview?'}
                  </span>
                  <button
                    onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                    style={{
                      padding: '12px 28px', background: 'var(--dark)', color: 'var(--white)',
                      borderRadius: '50px', fontSize: '15px', fontWeight: 600, border: 'none',
                      transition: 'all 0.3s ease', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--dark)'}
                  >
                    {isVideoExpanded ? 'Hide Video' : (content.btnText || 'Watch Demo Video')}
                  </button>
                </div>
              )}
            </motion.div>

            {content.showVideo !== 'false' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isVideoExpanded ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    margin: '24px auto 0',
                    position: 'relative',
                  aspectRatio: '16/9',
                  background: '#000',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  opacity: isVideoExpanded ? 1 : 0,
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  transform: isVideoExpanded ? 'translateY(0)' : 'translateY(-10px)'
                }}>
                  {isVideoExpanded && (
                    <iframe
                      src={content.videoUrl ? `${content.videoUrl}?autoplay=1` : "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"}
                      title="SWA Wellbeing Demo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  )}
                </div>
              </div>
            </div>
            )}
          </section>

          {/* ── SECTION 3: Booking Form ── */}
          <section style={{
            background: 'transparent',
            padding: '20px clamp(16px, 4vw, 60px) 80px',
            margin: 0
          }}>
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginBottom: '32px', textAlign: 'center' }}
              >
                <h2 
                  dangerouslySetInnerHTML={{
                    __html: (content.formTitle || 'Book a 30-Min <i>Google Meet</i>').replace(
                      /<i>(.*?)<\/i>/g, 
                      '<span style="font-style: italic; font-weight: 500; color: var(--accent)">$1</span>'
                    )
                  }}
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(24px, 3.5vw, 36px)',
                    fontWeight: 700, color: 'var(--dark)', marginBottom: '12px', letterSpacing: '-0.5px',
                  }}
                />
                <p style={{ fontSize: '15px', color: 'var(--secondary)', lineHeight: 1.6, fontWeight: 500, margin: '0 auto', maxWidth: '680px' }}>
                  {content.formDesc || 'Schedule a focused 1-on-1 video call session. Our team will speak with you directly to understand your needs and demonstrate exactly how SWA can elevate your organization.'}
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
                      justifyContent: 'center', margin: '0 auto 24px', color: 'var(--dark2)'
                    }}>
                      <FiCheckCircle size={32} />
                    </div>
                    <h2 style={{
                      fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 700,
                      color: 'var(--dark)', marginBottom: '16px', letterSpacing: '-0.5px'
                    }}>
                      Booking <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--dark2)' }}>Confirmed!</span>
                    </h2>
                    <p style={{
                      fontSize: '15px', color: 'var(--secondary)', lineHeight: 1.7,
                      maxWidth: '400px', margin: '0 auto 40px'
                    }}>
                      Thank you! Your demo has been securely scheduled. We have sent a comprehensive confirmation to your email and will be in touch shortly.
                    </p>
                    {bookingDetails?.booking?.meetLink && (
                      <div style={{
                        background: '#EDF3FE', borderRadius: '20px',
                        padding: '24px', maxWidth: '400px', margin: '0 auto 24px',
                        textAlign: 'center', border: '1px solid #C5D8FA',
                        boxShadow: '0 8px 24px rgba(26,115,232,0.08)'
                      }}>
                        <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1a73e8' }}>
                          Your Google Meet Link
                        </p>
                        <a href={bookingDetails.booking.meetLink} target="_blank" rel="noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '10px',
                          background: '#1a73e8', color: '#fff', textDecoration: 'none',
                          padding: '14px 28px', borderRadius: '50px', fontSize: '15px', fontWeight: 600,
                          boxShadow: '0 4px 16px rgba(26,115,232,0.3)', fontFamily: 'DM Sans, sans-serif',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,115,232,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,115,232,0.3)'; }}
                        >
                          <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                            <path d="M35 14l9-7v34l-9-7V14z" fill="#ffffff" opacity="0.9"/>
                            <rect x="4" y="10" width="31" height="28" rx="4" fill="#ffffff" opacity="0.9"/>
                            <path d="M35 14l9-7v34l-9-7V14z" fill="none" stroke="#ffffff" strokeWidth="1"/>
                          </svg>
                          Join Meeting Now
                        </a>
                      </div>
                    )}

                    <div style={{
                      background: 'var(--white)', borderRadius: '20px',
                      padding: '24px', maxWidth: '400px', margin: '0 auto',
                      textAlign: 'left', border: '1px solid rgba(204,199,185,0.3)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                    }}>
                      {[
                        { label: 'Name', value: form.name },
                        { label: 'Company', value: form.company },
                        { label: 'Date', value: selectedDate },
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
                    padding: 'clamp(24px, 5vw, 48px)',
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
                          Fetching schedule...
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                          {baseDisplayed.map(date => (
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
                          
                          <div style={{ position: 'relative' }}>
                            <button 
                              onClick={() => setShowCalendar(!showCalendar)}
                              style={{
                                padding: '10px 18px', borderRadius: '12px',
                                border: showCalendar ? '1.5px solid var(--dark)' : '1.5px dashed rgba(204,199,185,0.8)',
                                background: showCalendar ? 'rgba(204,199,185,0.12)' : 'transparent',
                                color: 'var(--dark)',
                                fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'DM Sans, sans-serif',
                                display: 'flex', alignItems: 'center', gap: '6px'
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--dark)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = showCalendar ? 'var(--dark)' : 'rgba(204,199,185,0.8)'}
                            >
                              <FiCalendar/> More Dates
                            </button>
                            
                            {showCalendar && (
                              <>
                                <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, zIndex: 99 }} onClick={() => setShowCalendar(false)} />
                                <CustomCalendar 
                                  minDate={new Date().toISOString().split('T')[0]}
                                  onClose={() => setShowCalendar(false)}
                                  onSelect={(dateStr) => {
                                    handleCustomDateChange({ target: { value: dateStr } });
                                  }}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.4 }} style={{ marginBottom: '40px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--dark)', marginBottom: '16px' }}>
                          <FiClock size={15} /> Select a Time <span style={{ color: 'var(--secondary)' }}>*</span>
                        </label>
                        {allTimesForDate.length === 0 ? (
                          <p style={{ fontSize: '13px', color: 'var(--secondary)', padding: '16px', background: 'rgba(204,199,185,0.15)', borderRadius: '16px', border: '1px dashed rgba(204,199,185,0.4)', textAlign: 'center' }}>
                            No slots available for this date. It may be a holiday or fully booked.
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {allTimesForDate.map((slot, i) => {
                              const isBooked    = slot.isBooked || !slot.isAvailable
                              const isSelected  = selectedTime === slot.time && !isBooked
                              return (
                                <div key={slot._id || i} style={{ position: 'relative' }}>
                                  <button
                                    disabled={isBooked}
                                    onClick={() => !isBooked && setSelectedTime(slot.time)}
                                    title={isBooked ? 'Slot unavailable' : ''}
                                    style={{
                                      padding: '10px 20px', borderRadius: '50px',
                                      border: isBooked
                                        ? '1.5px solid rgba(204,199,185,0.25)'
                                        : isSelected
                                          ? '2px solid var(--dark)'
                                          : '1.5px solid rgba(204,199,185,0.4)',
                                      background: isBooked
                                        ? 'rgba(204,199,185,0.18)'
                                        : isSelected
                                          ? 'var(--dark)'
                                          : 'var(--white)',
                                      color: isBooked
                                        ? 'rgba(101,50,57,0.35)'
                                        : isSelected
                                          ? 'var(--white)'
                                          : 'var(--dark)',
                                      fontSize: '13px', fontWeight: 500,
                                      cursor: isBooked ? 'not-allowed' : 'pointer',
                                      transition: 'var(--transition)',
                                      fontFamily: 'DM Sans, sans-serif',
                                      position: 'relative',
                                      opacity: isBooked ? 0.6 : 1
                                    }}
                                  >
                                    {slot.time}
                                    {isBooked && (
                                      <span style={{
                                        display: 'block',
                                        fontSize: '9px',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        color: 'rgba(101,50,57,0.4)',
                                        marginTop: '2px',
                                        textTransform: 'uppercase'
                                      }}>
                                        Booked
                                      </span>
                                    )}
                                  </button>
                                </div>
                              )
                            })}
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
      </div>
    </div>
  )
}
