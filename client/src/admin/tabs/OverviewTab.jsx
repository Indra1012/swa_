import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  FiCalendar, FiClock, FiTrendingUp,
  FiImage, FiUsers, FiActivity
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } }
}

function StatCard({ icon, label, value, color = 'var(--accent)' }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        background: 'var(--white)',
        borderRadius: '16px',
        padding: '28px 24px',
        border: '1px solid rgba(204,199,185,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 12px rgba(101,50,57,0.04)'
      }}
    >
      <div style={{
        width: '52px', height: '52px',
        borderRadius: '14px',
        background: `rgba(${color === 'var(--accent)' ? '175,122,109' : '175,122,109'}, 0.1)`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        color, flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: '13px', color: 'var(--secondary)',
          fontWeight: 500, marginBottom: '4px'
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '36px', fontWeight: 700,
          color: 'var(--dark)', lineHeight: 1
        }}>
          {value}
        </p>
      </div>
    </motion.div>
  )
}

export default function OverviewTab() {
  const [stats, setStats] = useState({
    totalBookings: '—',
    pendingBookings: '—',
    thisMonth: '—',
    mediaItems: '—'
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('swa_token')
        const headers = { Authorization: `Bearer ${token}` }

        const [statsRes, bookingsRes] = await Promise.all([
          axios.get(`${API}/api/admin/stats`, { headers }),
          axios.get(`${API}/api/bookings`, { headers })
        ])

        setStats(statsRes.data)
        setRecentBookings(bookingsRes.data.slice(0, 5))
      } catch {
        // Backend not connected yet — show placeholder
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statusColor = (status) => {
    if (status === 'confirmed') return 'var(--accent)'
    if (status === 'cancelled') return 'var(--secondary)'
    return 'var(--secondary)'
  }

  const statusBg = (status) => {
    if (status === 'confirmed') return 'rgba(175,122,109,0.08)'
    if (status === 'cancelled') return 'rgba(175,122,109,0.1)'
    return 'rgba(204,199,185,0.15)'
  }

  return (
    <div>
      {/* Stat cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <StatCard
          icon={<FiCalendar size={22} />}
          label="Total Bookings"
          value={stats.totalBookings}
          color="var(--accent)"
        />
        <StatCard
          icon={<FiClock size={22} />}
          label="Pending Bookings"
          value={stats.pendingBookings}
          color="var(--secondary)"
        />
        <StatCard
          icon={<FiTrendingUp size={22} />}
          label="This Month"
          value={stats.thisMonth}
          color="var(--accent)"
        />
        <StatCard
          icon={<FiImage size={22} />}
          label="Media Items"
          value={stats.mediaItems}
          color="var(--secondary)"
        />
      </motion.div>

      {/* Recent bookings table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: 'var(--white)',
          borderRadius: '16px',
          border: '1px solid rgba(204,199,185,0.2)',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(101,50,57,0.04)'
        }}
      >
        {/* Table header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid rgba(204,199,185,0.2)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20px', fontWeight: 700,
            color: 'var(--dark)'
          }}>
            Recent Bookings
          </h3>
          <span style={{
            fontSize: '12px', color: 'var(--secondary)',
            background: 'rgba(204,199,185,0.15)',
            padding: '4px 12px', borderRadius: '50px'
          }}>
            Last 5
          </span>
        </div>

        {loading ? (
          <div style={{
            padding: '48px', textAlign: 'center',
            color: 'var(--secondary)', fontSize: '14px'
          }}>
            Loading...
          </div>
        ) : recentBookings.length === 0 ? (
          <div style={{
            padding: '48px', textAlign: 'center'
          }}>
            <FiActivity size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
              No bookings yet. They will appear here once the backend is connected.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(226,212,186,0.1)' }}>
                  {['Name', 'Company', 'Date', 'Time', 'Status'].map(col => (
                    <th key={col} style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      borderBottom: '1px solid rgba(204,199,185,0.15)'
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking, i) => (
                  <tr
                    key={booking._id}
                    style={{
                      borderBottom: i < recentBookings.length - 1
                        ? '1px solid rgba(204,199,185,0.1)'
                        : 'none'
                    }}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--dark)', fontWeight: 500 }}>{booking.name}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--secondary)' }}>{booking.company}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--secondary)' }}>{booking.date}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--secondary)' }}>{booking.timeSlot}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 600,
                        color: statusColor(booking.status),
                        background: statusBg(booking.status),
                        padding: '4px 12px', borderRadius: '50px',
                        textTransform: 'capitalize'
                      }}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
