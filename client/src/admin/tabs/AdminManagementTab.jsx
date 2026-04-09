import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiUserPlus, FiTrash2, FiShield, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

export default function AdminManagementTab() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const token = localStorage.getItem('swa_token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/admins`, { headers })
      setAdmins(res.data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleAddAdmin = async () => {
    setError('')
    setSuccess('')
    if (!email) return setError('Email is required.')
    if (!password) return setError('Password is required.')
    if (admins.length >= 5) return setError('Maximum 5 admins allowed.')

    setSaving(true)
    try {
      await axios.post(`${API}/api/admin/admins`, {
        name: name || email.split('@')[0],
        email,
        password
      }, { headers })

      setSuccess(`${email} has been added as admin!`)
      setName('')
      setEmail('')
      setPassword('')
      fetchAdmins()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add admin.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAdmin = async (id, adminEmail) => {
    if (!window.confirm(`Remove admin access for ${adminEmail}?`)) return
    setError('')
    setSuccess('')
    try {
      await axios.delete(`${API}/api/admin/admins/${id}`, { headers })
      setSuccess(`${adminEmail} has been removed from admins.`)
      fetchAdmins()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove admin.')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 42px',
    border: '1.5px solid rgba(204,199,185,0.4)',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    background: 'var(--white)',
    color: 'var(--dark)',
    transition: 'all 0.25s ease'
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'var(--white)',
          borderRadius: '16px',
          padding: '28px 32px',
          border: '1px solid rgba(204,199,185,0.2)',
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(101,50,57,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <FiShield size={22} color="var(--dark)" />
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '24px', fontWeight: 700,
            color: 'var(--dark)', margin: 0
          }}>
            Admin Management
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--secondary)', margin: 0 }}>
          Add or remove admin accounts. Maximum <strong>5 admins</strong> allowed.
          Admins can sign in with email/password or Google Auth.
        </p>
      </motion.div>

      {/* Add Admin Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: 'var(--white)',
          borderRadius: '16px',
          padding: '28px 32px',
          border: '1px solid rgba(204,199,185,0.2)',
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(101,50,57,0.04)'
        }}
      >
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '18px', fontWeight: 700,
          color: 'var(--dark)', marginBottom: '20px'
        }}>
          <FiUserPlus size={16} style={{ marginRight: '8px', verticalAlign: '-2px' }} />
          Add New Admin
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Name */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--secondary)', display: 'flex', alignItems: 'center'
            }}>
              <FiUser size={15} />
            </span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name (optional)"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--secondary)', display: 'flex', alignItems: 'center'
            }}>
              <FiMail size={15} />
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address *"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--secondary)', display: 'flex', alignItems: 'center'
            }}>
              <FiLock size={15} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password *"
              style={{ ...inputStyle, paddingRight: '42px' }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--secondary)', display: 'flex', alignItems: 'center', padding: 0
              }}
            >
              {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <p style={{
            fontSize: '13px', color: '#b44',
            background: 'rgba(180,68,68,0.06)',
            border: '1px solid rgba(180,68,68,0.15)',
            borderRadius: '8px', padding: '10px 16px',
            marginBottom: '16px'
          }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{
            fontSize: '13px', color: '#2a7',
            background: 'rgba(34,170,119,0.06)',
            border: '1px solid rgba(34,170,119,0.15)',
            borderRadius: '8px', padding: '10px 16px',
            marginBottom: '16px'
          }}>
            {success}
          </p>
        )}

        <button
          onClick={handleAddAdmin}
          disabled={saving || admins.length >= 5}
          style={{
            padding: '12px 28px',
            background: admins.length >= 5 ? 'rgba(101,50,57,0.3)' : 'var(--dark)',
            color: 'var(--white)',
            border: 'none', borderRadius: '10px',
            fontSize: '14px', fontWeight: 600,
            cursor: admins.length >= 5 ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s ease'
          }}
        >
          {saving ? 'Adding...' : `Add Admin (${admins.length}/5)`}
        </button>
      </motion.div>

      {/* Current Admins List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'var(--white)',
          borderRadius: '16px',
          padding: '28px 32px',
          border: '1px solid rgba(204,199,185,0.2)',
          boxShadow: '0 2px 12px rgba(101,50,57,0.04)'
        }}
      >
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '18px', fontWeight: 700,
          color: 'var(--dark)', marginBottom: '20px'
        }}>
          Current Admins ({admins.length}/5)
        </h3>

        {loading ? (
          <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>Loading...</p>
        ) : admins.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>No admins found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {admins.map(admin => (
              <div
                key={admin._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(237,224,212,0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(204,199,185,0.15)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--dark)',
                    fontSize: '15px', fontWeight: 700,
                    fontFamily: 'Cormorant Garamond, serif'
                  }}>
                    {(admin.name?.[0] || admin.email?.[0] || 'A').toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px', fontWeight: 600,
                      color: 'var(--dark)'
                    }}>
                      {admin.name || 'Unnamed Admin'}
                    </div>
                    <div style={{
                      fontSize: '12px', color: 'var(--secondary)',
                      marginTop: '2px'
                    }}>
                      {admin.email}
                    </div>
                    <div style={{
                      fontSize: '11px', color: 'var(--secondary)',
                      marginTop: '2px', opacity: 0.7
                    }}>
                      {admin.googleId ? '🔗 Google Auth' : '🔑 Email/Password'}
                      {' · '}
                      Added {new Date(admin.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveAdmin(admin._id, admin.email)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px',
                    background: 'none',
                    border: '1px solid rgba(180,68,68,0.25)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#b44',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#b44'
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.borderColor = '#b44'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = '#b44'
                    e.currentTarget.style.borderColor = 'rgba(180,68,68,0.25)'
                  }}
                >
                  <FiTrash2 size={13} />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
