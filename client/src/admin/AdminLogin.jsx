import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // On mount: check if Google OAuth redirected back with token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      login(token)
      navigate('/admin/dashboard', { replace: true })
    }
  }, [login, navigate])

  const handleGoogleLogin = () => {
    window.location.href = `${API}/api/auth/google`
  }

  const handleEmailLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      login(data.token)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    try {
      await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      setForgotSent(true)
      setError('')
    } catch {
      setError('Failed to send reset email. Please try again.')
    }
  }

  const inputStyle = (focused) => ({
    width: '100%',
    padding: '13px 16px 13px 44px',
    border: `1.5px solid ${focused ? 'var(--dark)' : 'rgba(204,199,185,0.4)'}`,
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.8)',
    color: 'var(--dark)',
    transition: 'all 0.25s ease'
  })

  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 20px 40px', // Added extra top padding to push it safely below the navbar
      margin: 0
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '36px',
          padding: '36px 40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      >
        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src="/swa-logo.png"
            alt="SWA"
            style={{
              width: '60px', height: '60px',
              objectFit: 'contain',
              margin: '0 auto 12px',
              display: 'block'
            }}
          />
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px', fontWeight: 700,
            color: 'var(--dark)', lineHeight: 1
          }}>
            SWA™
          </h1>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'rgba(204,199,185,0.25)',
          marginBottom: '20px'
        }} />

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            padding: '14px 24px',
            background: 'var(--white)',
            border: '2px solid rgba(204,199,185,0.4)',
            borderRadius: '12px',
            fontSize: '15px', fontWeight: 500,
            color: 'var(--dark)', cursor: 'pointer',
            transition: 'var(--transition)',
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: '16px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--secondary)'
            e.currentTarget.style.background = 'rgba(237,224,212,0.05)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(204,199,185,0.4)'
            e.currentTarget.style.background = 'var(--white)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        {/* OR separator */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', marginBottom: '16px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(204,199,185,0.25)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(101,50,57,0.4)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(204,199,185,0.25)' }} />
        </div>

        {/* Email field */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block', fontSize: '13px',
            fontWeight: 600, color: 'var(--dark)',
            marginBottom: '8px'
          }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px',
              top: '50%', transform: 'translateY(-50%)',
              color: emailFocused ? 'var(--secondary)' : 'var(--secondary)',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.25s ease'
            }}>
              <FiMail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@swa-wellbeing.com"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
              style={inputStyle(emailFocused)}
            />
          </div>
        </div>

        {/* Password field */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{
            display: 'block', fontSize: '13px',
            fontWeight: 600, color: 'var(--dark)',
            marginBottom: '8px'
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px',
              top: '50%', transform: 'translateY(-50%)',
              color: passFocused ? 'var(--secondary)' : 'var(--secondary)',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.25s ease'
            }}>
              <FiLock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
              style={{ ...inputStyle(passFocused), paddingRight: '44px' }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '14px',
                top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--secondary)',
                display: 'flex', alignItems: 'center',
                padding: '0'
              }}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <button
            onClick={handleForgotPassword}
            style={{
              background: 'none', border: 'none',
              fontSize: '12px', color: 'var(--secondary)',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
            }}
          >
            Forgot password?
          </button>
        </div>

        {/* Forgot password success */}
        {forgotSent && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: '13px', color: 'var(--accent)',
              background: 'rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(204,199,185,0.2)',
              borderRadius: '8px', padding: '12px 16px',
              marginBottom: '16px', lineHeight: 1.5
            }}
          >
            A password reset link has been sent to {email}. Please check your inbox.
          </motion.p>
        )}

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: '13px', color: 'var(--secondary)',
              background: 'rgba(107,82,82,0.08)',
              border: '1px solid rgba(107,82,82,0.2)',
              borderRadius: '8px', padding: '12px 16px',
              marginBottom: '16px', lineHeight: 1.5
            }}
          >
            {error}
          </motion.p>
        )}

        {/* Sign In button */}
        <button
          onClick={handleEmailLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'rgba(101,50,57,0.5)' : 'var(--dark)',
            color: 'var(--white)',
            border: 'none', borderRadius: '10px',
            padding: '14px', fontSize: '15px',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'var(--transition)',
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: '16px'
          }}
          onMouseEnter={e => {
            if (!loading) e.currentTarget.style.background = 'var(--dark2)'
          }}
          onMouseLeave={e => {
            if (!loading) e.currentTarget.style.background = 'var(--dark)'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Back to website */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none',
              fontSize: '13px', color: 'var(--secondary)',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--dark)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
          >
            <FiArrowLeft size={14} />
            Back to website
          </button>
        </div>
      </motion.div>
    </div>
  )
}
