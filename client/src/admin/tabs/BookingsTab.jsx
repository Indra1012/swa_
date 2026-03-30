import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  FiCalendar, FiTrash2, FiRefreshCw,
  FiSearch, FiChevronDown, FiAlertCircle, FiVideo
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled']

const statusStyle = (status) => {
  const map = {
    confirmed: {
      color: 'var(--accent)',
      bg: 'rgba(175,122,109,0.08)',
      border: 'rgba(175,122,109,0.3)'
    },
    cancelled: {
      color: 'var(--secondary)',
      bg: 'rgba(175,122,109,0.1)',
      border: 'rgba(175,122,109,0.3)'
    },
    pending: {
      color: 'var(--secondary)',
      bg: 'rgba(204,199,185,0.15)',
      border: 'rgba(204,199,185,0.4)'
    }
  }
  return map[status] || map.pending
}

function StatusDropdown({ bookingId, current, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const style = statusStyle(current)

  const handleSelect = async (status) => {
    if (status === current) { setOpen(false); return }
    setUpdating(true)
    setOpen(false)
    try {
      const token = localStorage.getItem('swa_token')
      await axios.patch(
        `${API}/api/bookings/${bookingId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onUpdate(bookingId, status)
    } catch {
      alert('Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={updating}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px',
          borderRadius: '50px',
          border: `1px solid ${style.border}`,
          background: style.bg,
          color: style.color,
          fontSize: '12px', fontWeight: 600,
          cursor: updating ? 'not-allowed' : 'pointer',
          textTransform: 'capitalize',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'var(--transition)'
        }}
      >
        {updating ? 'Updating...' : current}
        <FiChevronDown
          size={12}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)',
          left: 0, zIndex: 50,
          background: 'var(--white)',
          borderRadius: '10px',
          border: '1px solid rgba(204,199,185,0.25)',
          boxShadow: '0 12px 40px rgba(60,47,47,0.1)',
          overflow: 'hidden',
          minWidth: '130px'
        }}>
          {STATUS_OPTIONS.map(s => {
            const st = statusStyle(s)
            return (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 14px',
                  background: s === current
                    ? 'rgba(204,199,185,0.1)'
                    : 'transparent',
                  border: 'none',
                  fontSize: '13px',
                  color: st.color,
                  fontWeight: s === current ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (s !== current)
                    e.currentTarget.style.background = 'rgba(226,212,186,0.1)'
                }}
                onMouseLeave={e => {
                  if (s !== current)
                    e.currentTarget.style.background = 'transparent'
                }}
              >
                {s}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('swa_token')
      const res = await axios.get(`${API}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data)
    } catch {
      setError('Failed to load bookings. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const handleStatusUpdate = useCallback((id, status) => {
    setBookings(prev =>
      prev.map(b => b._id === id ? { ...b, status } : b)
    )
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return
    setDeletingId(id)
    try {
      const token = localStorage.getItem('swa_token')
      await axios.delete(`${API}/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(prev => prev.filter(b => b._id !== id))
    } catch {
      alert('Failed to delete booking.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const filtered = bookings.filter(b => {
    const matchSearch =
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.company?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || b.status === filterStatus
    return matchSearch && matchStatus
  })

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
            Bookings
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={fetchBookings}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--white)',
            border: '1px solid rgba(204,199,185,0.3)',
            borderRadius: '10px', padding: '10px 16px',
            fontSize: '13px', fontWeight: 500,
            color: 'var(--secondary)', cursor: 'pointer',
            transition: 'var(--transition)',
            fontFamily: 'DM Sans, sans-serif'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(204,199,185,0.3)'}
        >
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters row */}
      <div style={{
        display: 'flex', gap: '12px',
        marginBottom: '20px', flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <FiSearch size={15} style={{
            position: 'absolute', left: '12px',
            top: '50%', transform: 'translateY(-50%)',
            color: 'var(--primary)'
          }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or company..."
            style={{
              width: '100%',
              padding: '11px 16px 11px 38px',
              border: '1.5px solid rgba(204,199,185,0.3)',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              outline: 'none',
              background: 'var(--white)',
              color: 'var(--dark)'
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '8px 16px',
                borderRadius: '50px',
                border: filterStatus === s
                  ? '2px solid var(--dark)'
                  : '1.5px solid rgba(204,199,185,0.3)',
                background: filterStatus === s ? 'var(--dark)' : 'var(--white)',
                color: filterStatus === s ? 'var(--white)' : 'var(--secondary)',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--transition)',
                textTransform: 'capitalize',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
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

      {/* Table */}
      <div style={{
        background: 'var(--white)',
        borderRadius: '16px',
        border: '1px solid rgba(204,199,185,0.2)',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(101,50,57,0.04)'
      }}>
        {loading ? (
          <div style={{
            padding: '48px', textAlign: 'center',
            fontSize: '14px', color: 'var(--secondary)'
          }}>
            Loading bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: '60px', textAlign: 'center'
          }}>
            <FiCalendar size={36} style={{
              color: 'var(--primary)', marginBottom: '16px'
            }} />
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '22px', color: 'var(--dark)',
              marginBottom: '8px'
            }}>
              No bookings found
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
              {search || filterStatus !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Bookings will appear here once visitors submit the form.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(226,212,186,0.1)' }}>
                  {['Name', 'Email', 'Company', 'Team Size', 'Date', 'Time', 'Meet', 'Status', ''].map((col, i) => (
                    <th key={i} style={{
                      padding: '13px 16px',
                      textAlign: 'left',
                      fontSize: '11px', fontWeight: 600,
                      color: 'var(--secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      borderBottom: '1px solid rgba(204,199,185,0.15)',
                      whiteSpace: 'nowrap'
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking, i) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      borderBottom: i < filtered.length - 1
                        ? '1px solid rgba(204,199,185,0.1)'
                        : 'none'
                    }}
                  >
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '14px', color: 'var(--dark)',
                      fontWeight: 600, whiteSpace: 'nowrap'
                    }}>
                      {booking.name}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '13px', color: 'var(--secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {booking.email}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '13px', color: 'var(--secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {booking.company}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '13px', color: 'var(--secondary)'
                    }}>
                      {booking.teamSize}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '13px', color: 'var(--secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatDate(booking.date)}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '13px', color: 'var(--secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {booking.timeSlot}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {booking.meetLink ? (
                        <a
                          href={booking.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          title="Join Google Meet"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '5px 12px',
                            borderRadius: '50px',
                            background: 'rgba(26,115,232,0.08)',
                            border: '1px solid rgba(26,115,232,0.25)',
                            color: '#1a73e8',
                            fontSize: '12px', fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'background 0.2s ease',
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,115,232,0.14)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,115,232,0.08)'}
                        >
                          <FiVideo size={12} />
                          Meet
                        </a>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'rgba(204,199,185,0.6)', fontFamily: 'DM Sans, sans-serif' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusDropdown
                        bookingId={booking._id}
                        current={booking.status}
                        onUpdate={handleStatusUpdate}
                      />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleDelete(booking._id)}
                        disabled={deletingId === booking._id}
                        style={{
                          background: 'none', border: 'none',
                          cursor: deletingId === booking._id
                            ? 'not-allowed' : 'pointer',
                          color: 'rgba(175,122,109,0.5)',
                          display: 'flex', alignItems: 'center',
                          padding: '4px',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={e => {
                          if (deletingId !== booking._id)
                            e.currentTarget.style.color = 'var(--secondary)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'rgba(175,122,109,0.5)'
                        }}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
