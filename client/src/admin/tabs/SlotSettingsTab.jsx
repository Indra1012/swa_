import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  FiClock, FiSave, FiRefreshCw,
  FiCheck, FiAlertCircle
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

// Generate next 4 weeks of dates (Mon-Sat only)
function generateDates() {
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 28; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const day = d.getDay()
    if (day !== 0) { // Skip Sunday
      dates.push({
        date: d.toISOString().split('T')[0],
        dayName: DAYS[day === 0 ? 6 : day - 1],
        display: d.toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short'
        })
      })
    }
  }
  return dates
}

export default function SlotSettingsTab() {
  const [dates] = useState(generateDates)
  const [selectedWeekStart, setSelectedWeekStart] = useState(0)
  const [enabledSlots, setEnabledSlots] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Show 6 days at a time (Mon-Sat)
  const weekDates = dates.slice(selectedWeekStart, selectedWeekStart + 6)

  const fetchExistingSlots = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/slots`)
      const slotsArr = res.data.slots || res.data || []
      const existing = {}
      if (Array.isArray(slotsArr)) {
        slotsArr.forEach(slot => {
          const key = `${slot.date}_${slot.time}`
          existing[key] = slot.isAvailable && !slot.isBooked
        })
      }
      setEnabledSlots(existing)
    } catch {
      setEnabledSlots({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchExistingSlots() }, [fetchExistingSlots])

  const toggleSlot = useCallback((date, time) => {
    const key = `${date}_${time}`
    setEnabledSlots(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  const enableAll = useCallback(() => {
    const updated = { ...enabledSlots }
    weekDates.forEach(({ date }) => {
      TIME_SLOTS.forEach(time => {
        updated[`${date}_${time}`] = true
      })
    })
    setEnabledSlots(updated)
  }, [weekDates, enabledSlots])

  const disableAll = useCallback(() => {
    const updated = { ...enabledSlots }
    weekDates.forEach(({ date }) => {
      TIME_SLOTS.forEach(time => {
        updated[`${date}_${time}`] = false
      })
    })
    setEnabledSlots(updated)
  }, [weekDates, enabledSlots])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const token = localStorage.getItem('swa_token')
      const slotsToCreate = []

      Object.entries(enabledSlots).forEach(([key, enabled]) => {
        if (enabled) {
          const [date, ...timeParts] = key.split('_')
          const time = timeParts.join('_')
          slotsToCreate.push({ date, time })
        }
      })

      await axios.post(
        `${API}/api/slots`,
        { slots: slotsToCreate },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save slots. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isEnabled = (date, time) => {
    return !!enabledSlots[`${date}_${time}`]
  }

  const countEnabled = weekDates.reduce((acc, { date }) => {
    return acc + TIME_SLOTS.filter(t => isEnabled(date, t)).length
  }, 0)

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px', fontWeight: 700,
            color: 'var(--dark)', marginBottom: '4px'
          }}>
            Slot Settings
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>
            Toggle available booking slots. Lunch break (1:00 PM) is excluded.
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: saving ? 'rgba(101,50,57,0.4)' : 'var(--dark)',
            color: 'var(--white)',
            border: 'none', borderRadius: '10px',
            padding: '12px 20px', fontSize: '14px',
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
          <FiSave size={15} />
          {saving ? 'Saving...' : 'Save Slots'}
        </button>
      </div>

      {/* Success / Error messages */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px',
            background: 'rgba(175,122,109,0.08)',
            border: '1px solid rgba(175,122,109,0.3)',
            borderRadius: '12px', marginBottom: '20px',
            fontSize: '14px', color: 'var(--secondary)'
          }}
        >
          <FiCheck size={16} />
          Slots saved successfully!
        </motion.div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px',
          background: 'rgba(175,122,109,0.08)',
          border: '1px solid rgba(175,122,109,0.3)',
          borderRadius: '12px', marginBottom: '20px',
          fontSize: '14px', color: 'var(--secondary)'
        }}>
          <FiAlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Week navigation + bulk actions */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
      }}>
        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setSelectedWeekStart(Math.max(0, selectedWeekStart - 6))}
            disabled={selectedWeekStart === 0}
            style={{
              padding: '8px 14px',
              border: '1.5px solid rgba(204,199,185,0.4)',
              borderRadius: '8px', background: 'var(--white)',
              color: selectedWeekStart === 0
                ? 'rgba(101,50,57,0.25)' : 'var(--dark)',
              fontSize: '13px', cursor: selectedWeekStart === 0
                ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'var(--transition)'
            }}
          >
            ← Prev week
          </button>

          <span style={{
            fontSize: '13px', color: 'var(--secondary)',
            fontWeight: 500, padding: '0 4px'
          }}>
            {weekDates[0]?.display} – {weekDates[weekDates.length - 1]?.display}
          </span>

          <button
            onClick={() => setSelectedWeekStart(
              Math.min(dates.length - 6, selectedWeekStart + 6)
            )}
            disabled={selectedWeekStart >= dates.length - 6}
            style={{
              padding: '8px 14px',
              border: '1.5px solid rgba(204,199,185,0.4)',
              borderRadius: '8px', background: 'var(--white)',
              color: selectedWeekStart >= dates.length - 6
                ? 'rgba(101,50,57,0.25)' : 'var(--dark)',
              fontSize: '13px',
              cursor: selectedWeekStart >= dates.length - 6
                ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'var(--transition)'
            }}
          >
            Next week →
          </button>
        </div>

        {/* Bulk actions + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '12px', color: 'var(--secondary)',
            background: 'rgba(204,199,185,0.15)',
            padding: '4px 12px', borderRadius: '50px'
          }}>
            {countEnabled} slots enabled
          </span>

          <button
            onClick={enableAll}
            style={{
              padding: '8px 14px',
              border: '1.5px solid rgba(175,122,109,0.4)',
              borderRadius: '8px',
              background: 'rgba(175,122,109,0.1)',
              color: 'var(--secondary)',
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(175,122,109,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(175,122,109,0.1)'}
          >
            Enable all
          </button>

          <button
            onClick={disableAll}
            style={{
              padding: '8px 14px',
              border: '1.5px solid rgba(204,199,185,0.4)',
              borderRadius: '8px',
              background: 'var(--white)',
              color: 'var(--secondary)',
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,199,185,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}
          >
            Disable all
          </button>
        </div>
      </div>

      {/* Slot grid */}
      {loading ? (
        <div style={{
          padding: '48px', textAlign: 'center',
          fontSize: '14px', color: 'var(--secondary)'
        }}>
          Loading existing slots...
        </div>
      ) : (
        <div style={{
          background: 'var(--white)',
          borderRadius: '16px',
          border: '1px solid rgba(204,199,185,0.2)',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(60,47,47,0.04)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '600px'
            }}>
              {/* Column headers — dates */}
              <thead>
                <tr style={{ background: 'rgba(226,212,186,0.1)' }}>
                  <th style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: '12px', fontWeight: 600,
                    color: 'var(--secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    borderBottom: '1px solid rgba(204,199,185,0.15)',
                    width: '100px'
                  }}>
                    Time
                  </th>
                  {weekDates.map(({ date, dayName, display }) => (
                    <th key={date} style={{
                      padding: '14px 12px',
                      textAlign: 'center',
                      fontSize: '12px', fontWeight: 600,
                      color: 'var(--secondary)',
                      borderBottom: '1px solid rgba(204,199,185,0.15)',
                      borderLeft: '1px solid rgba(237,224,212,0.1)'
                    }}>
                      <div style={{ color: 'var(--dark)', marginBottom: '2px' }}>
                        {dayName.slice(0, 3)}
                      </div>
                      <div style={{ fontWeight: 400, opacity: 0.7 }}>
                        {display}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows — time slots */}
              <tbody>
                {TIME_SLOTS.map((time, ti) => (
                  <tr key={time} style={{
                    borderBottom: ti < TIME_SLOTS.length - 1
                      ? '1px solid rgba(204,199,185,0.08)'
                      : 'none'
                  }}>
                    {/* Time label */}
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '13px', fontWeight: 500,
                      color: 'var(--dark)',
                      display: 'flex', alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      <FiClock size={13} style={{ color: 'var(--primary)' }} />
                      {time}
                    </td>

                    {/* Slot toggles */}
                    {weekDates.map(({ date }) => {
                      const enabled = isEnabled(date, time)
                      return (
                        <td key={date} style={{
                          padding: '10px 12px',
                          textAlign: 'center',
                          borderLeft: '1px solid rgba(204,199,185,0.08)'
                        }}>
                          <button
                            onClick={() => toggleSlot(date, time)}
                            style={{
                              width: '36px', height: '36px',
                              borderRadius: '8px',
                              border: enabled
                                ? '2px solid rgba(175,122,109,0.4)'
                                : '1.5px solid rgba(204,199,185,0.3)',
                              background: enabled
                                ? 'rgba(175,122,109,0.1)'
                                : 'var(--bg)',
                              color: enabled
                                ? 'var(--secondary)'
                                : 'rgba(60,47,47,0.2)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              transition: 'var(--transition)'
                            }}
                            onMouseEnter={e => {
                              if (!enabled) {
                                e.currentTarget.style.borderColor = 'rgba(175,122,109,0.4)'
                                e.currentTarget.style.background = 'rgba(175,122,109,0.1)'
                              }
                            }}
                            onMouseLeave={e => {
                              if (!enabled) {
                                e.currentTarget.style.borderColor = 'rgba(204,199,185,0.3)'
                                e.currentTarget.style.background = 'var(--bg)'
                              }
                            }}
                          >
                            {enabled && <FiCheck size={16} />}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(204,199,185,0.15)',
            display: 'flex', gap: '20px',
            fontSize: '12px', color: 'var(--secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px', height: '20px',
                borderRadius: '6px',
                background: 'rgba(175,122,109,0.1)',
                border: '2px solid rgba(175,122,109,0.4)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiCheck size={11} style={{ color: 'var(--secondary)' }} />
              </div>
              Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px', height: '20px',
                borderRadius: '6px',
                background: 'var(--bg)',
                border: '1.5px solid rgba(204,199,185,0.3)'
              }} />
              Unavailable
            </div>
            <div style={{
              fontSize: '12px', color: 'rgba(101,50,57,0.4)',
              marginLeft: 'auto', fontStyle: 'italic'
            }}>
              Lunch break (1:00 PM) excluded automatically
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
