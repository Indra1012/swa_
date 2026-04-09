import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  FiClock, FiSave, FiAlertCircle, FiCheck,
  FiTrash2, FiPlus
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

// Generate next 4 weeks of dates (Mon-Sat only, no Sundays)
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
        date: [
           d.getFullYear(),
           String(d.getMonth() + 1).padStart(2, '0'),
           String(d.getDate()).padStart(2, '0')
        ].join('-'),
        dayName: DAYS[day - 1],
        display: d.toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short'
        }),
        isPast: d < today
      })
    }
  }
  return dates
}

export default function SlotSettingsTab() {
  const [dates] = useState(generateDates)
  const [selectedWeekStart, setSelectedWeekStart] = useState(0)
  const [enabledSlots, setEnabledSlots] = useState({})
  
  const [holidays, setHolidays] = useState([])
  const [holidayDate, setHolidayDate] = useState('')
  const [holidayName, setHolidayName] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Show 6 days at a time (Mon-Sat)
  const weekDates = dates.slice(selectedWeekStart, selectedWeekStart + 6)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [slotsRes, holRes] = await Promise.all([
         axios.get(`${API}/api/slots`),
         axios.get(`${API}/api/holidays`)
      ])
      
      const slotsArr = slotsRes.data.slots || []
      const existing = {}
      
      slotsArr.forEach(slot => {
        const key = `${slot.date}_${slot.time}`
        existing[key] = slot.isAvailable && !slot.isBooked
      })
      setEnabledSlots(existing)
      setHolidays(holRes.data || [])
    } catch {
      setEnabledSlots({})
      setHolidays([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleSlot = useCallback((date, time) => {
    const key = `${date}_${time}`
    setEnabledSlots(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  const handleSaveSlots = async () => {
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const token = localStorage.getItem('swa_token')
      const overridesToUpdate = []
      
      Object.entries(enabledSlots).forEach(([key, enabled]) => {
        const [date, ...timeParts] = key.split('_')
        const time = timeParts.join('_')
        overridesToUpdate.push({ date, time, isAvailable: enabled })
      })

      await axios.post(
        `${API}/api/slots/bulk-update`,
        { overrides: overridesToUpdate },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save slot settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addHoliday = async (e) => {
     e.preventDefault()
     if(!holidayDate) return
     try {
       const token = localStorage.getItem('swa_token')
       await axios.post(`${API}/api/holidays`, { date: holidayDate, name: holidayName }, { headers: { Authorization: `Bearer ${token}` } })
       setHolidayDate('')
       setHolidayName('')
       fetchData()
     } catch (err) {
       setError(err.response?.data?.error || 'Failed to add holiday')
     }
  }

  const deleteHoliday = async (id) => {
     try {
       const token = localStorage.getItem('swa_token')
       await axios.delete(`${API}/api/holidays/${id}`, { headers: { Authorization: `Bearer ${token}` } })
       fetchData()
     } catch (err) {
       setError('Failed to delete holiday')
     }
  }

  const quickToggleHoliday = async (date) => {
    const existing = holidays.find(h => h.date === date)
    if (existing) {
      await deleteHoliday(existing._id)
    } else {
      const token = localStorage.getItem('swa_token')
      try {
        await axios.post(`${API}/api/holidays`, { date, name: 'Unavailable' }, { headers: { Authorization: `Bearer ${token}` } })
        fetchData()
      } catch (err) {
        setError('Failed to add holiday')
      }
    }
  }

  const isEnabled = (date, time) => !!enabledSlots[`${date}_${time}`]
  
  const isHoliday = (date) => !!holidays.find(h => h.date === date)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 700, color: 'var(--dark)' }}>
          Availability & Holidays
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>
          Standard working hours (9 AM - 5 PM) are available by default. Exclude specific days by adding Holidays.
        </p>
      </div>

      {saved && <div style={{ padding: '14px', background: 'rgba(175,122,109,0.08)', borderRadius: '12px', marginBottom: '20px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheck/> Settings saved!</div>}
      {error && <div style={{ padding: '14px', background: 'rgba(175,122,109,0.08)', borderRadius: '12px', marginBottom: '20px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiAlertCircle/> {error}</div>}

      {/* HOLIDAYS SECTION */}
      <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(204,199,185,0.2)', marginBottom: '32px' }}>
         <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', marginBottom: '16px' }}>Manage Holidays</h3>
         
         <form onSubmit={addHoliday} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <input type="date" value={holidayDate} onChange={e=>setHolidayDate(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(204,199,185,0.4)', fontSize: '13px', outline: 'none' }} />
            <input type="text" placeholder="Reason (e.g. Christmas)" value={holidayName} onChange={e=>setHolidayName(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(204,199,185,0.4)', fontSize: '13px', outline: 'none', flex: 1 }} />
            <button type="submit" style={{ padding: '10px 20px', background: 'var(--dark)', color: 'white', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus/> Add Holiday</button>
         </form>

         {holidays.length > 0 ? (
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
             {holidays.map(h => (
               <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(204,199,185,0.15)', padding: '8px 14px', borderRadius: '50px', fontSize: '13px' }}>
                 <strong>{h.date}</strong> <span>{h.name}</span>
                 <button type="button" onClick={() => deleteHoliday(h._id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0 4px' }}><FiTrash2 size={14}/></button>
               </div>
             ))}
           </div>
         ) : <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>No holidays added yet.</p>}
      </div>

      {/* SLOT EXCEPTIONS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
         <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)' }}>Slot Overrides (Exceptions)</h3>
         <button onClick={handleSaveSlots} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--dark)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}><FiSave/> {saving ? 'Saving...' : 'Save Overrides'}</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: 'rgba(204,199,185,0.08)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(204,199,185,0.2)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <button onClick={() => setSelectedWeekStart(Math.max(0, selectedWeekStart - 6))} disabled={selectedWeekStart === 0} style={{ padding: '8px 14px', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '8px', background: 'var(--white)', cursor: selectedWeekStart===0?'not-allowed':'pointer' }}>← Prev Week</button>
           <button onClick={() => setSelectedWeekStart(Math.min(dates.length - 6, selectedWeekStart + 6))} disabled={selectedWeekStart >= dates.length - 6} style={{ padding: '8px 14px', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '8px', background: 'var(--white)', cursor: 'pointer' }}>Next Week →</button>
         </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', fontSize: '14px', color: 'var(--secondary)' }}>Loading...</div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid rgba(204,199,185,0.2)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'rgba(226,212,186,0.1)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--secondary)', borderBottom: '1px solid rgba(204,199,185,0.15)' }}>Time</th>
                  {weekDates.map(({ date, dayName, display }) => {
                    const isHol = isHoliday(date)
                    return (
                      <th key={date} style={{ padding: '14px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--secondary)', borderBottom: '1px solid rgba(204,199,185,0.15)', borderLeft: '1px solid rgba(237,224,212,0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: isHol ? 'var(--primary)' : 'var(--dark)' }}>{dayName.slice(0, 3)}</span>
                          <span style={{ fontWeight: 400 }}>{display}</span>
                          <button 
                            onClick={() => quickToggleHoliday(date)}
                            title={isHol ? "Remove Holiday" : "Mark as Holiday"}
                            style={{ 
                              marginTop: '2px', padding: '4px 8px', fontSize: '10px', 
                              background: isHol ? 'var(--primary)' : 'rgba(204,199,185,0.2)', 
                              color: isHol ? 'white' : 'var(--dark)', border: 'none', 
                              borderRadius: '4px', cursor: 'pointer', fontWeight: 600 
                            }}
                          >
                            {isHol ? 'HOLIDAY' : 'Set Holiday'}
                          </button>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => (
                  <tr key={time} style={{ borderBottom: '1px solid rgba(204,199,185,0.08)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--dark)' }}>{time}</td>
                    {weekDates.map(({ date }) => {
                      const enabled = isEnabled(date, time)
                      const isHol = isHoliday(date)
                      return (
                        <td key={date} style={{ padding: '10px 12px', textAlign: 'center', borderLeft: '1px solid rgba(204,199,185,0.08)' }}>
                          <button
                            disabled={isHol}
                            onClick={() => toggleSlot(date, time)}
                            style={{
                              width: '36px', height: '36px', borderRadius: '8px',
                              border: enabled ? '2px solid rgba(175,122,109,0.4)' : '1.5px solid rgba(204,199,185,0.3)',
                              background: isHol ? 'rgba(204,199,185,0.1)' : enabled ? 'rgba(175,122,109,0.1)' : 'var(--bg)',
                              color: enabled ? 'var(--secondary)' : 'rgba(60,47,47,0.2)',
                              cursor: isHol ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                              opacity: isHol ? 0.3 : 1
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
        </div>
      )}
    </div>
  )
}
