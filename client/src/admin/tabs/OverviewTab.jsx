import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  FiCalendar, FiClock, FiTrendingUp,
  FiImage, FiUsers, FiActivity, FiDownload
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
  const [allBookings, setAllBookings] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

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
        setAllBookings(bookingsRes.data)
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

  const handleDownloadCSV = () => {
    let toExport = allBookings
    if (fromDate) {
      toExport = toExport.filter(b => new Date(b.createdAt) >= new Date(fromDate))
    }
    if (toDate) {
      const end = new Date(toDate)
      end.setHours(23, 59, 59, 999)
      toExport = toExport.filter(b => new Date(b.createdAt) <= end)
    }

    if (toExport.length === 0) {
      alert("No users found in this date range.")
      return
    }

    const headers = ["Registration Date", "Name", "Email", "Phone Number", "Company", "Team Size"]
    const rows = toExport.map(b => {
      const d = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : '—'
      const name = `"${(b.name || '').replace(/"/g, '""')}"`
      const email = `"${(b.email || '').replace(/"/g, '""')}"`
      const phone = `"${(b.phone || '').replace(/"/g, '""')}"`
      const company = `"${(b.company || '').replace(/"/g, '""')}"`
      const teamSize = `"${(b.teamSize || '').replace(/"/g, '""')}"`
      return [d, name, email, phone, company, teamSize].join(",")
    })

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `registered_users_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'var(--white)',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid rgba(204,199,185,0.2)',
          marginBottom: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px',
          boxShadow: '0 2px 12px rgba(101,50,57,0.04)'
        }}
      >
        <div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 700, color: 'var(--dark)', marginBottom: '4px' }}>
            Export Registered Users
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--secondary)', margin: 0 }}>
            Download complete user details (Name, Email, Phone, Company) to CSV.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 500 }}>From:</span>
            <input
              type="date"
              value={fromDate} onChange={e => setFromDate(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '8px', fontSize: '13px', color: 'var(--dark)', fontFamily: 'DM Sans, sans-serif' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 500 }}>To:</span>
            <input
              type="date"
              value={toDate} onChange={e => setToDate(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '8px', fontSize: '13px', color: 'var(--dark)', fontFamily: 'DM Sans, sans-serif' }}
            />
          </div>
          <button
            onClick={handleDownloadCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: 'var(--dark)', color: 'var(--white)',
              border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'DM Sans, sans-serif', textTransform: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--dark2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--dark)'}
          >
            <FiDownload size={16} /> Download CSV
          </button>
        </div>
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
