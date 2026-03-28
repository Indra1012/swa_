const jwt                   = require('jsonwebtoken')
const User                  = require('../models/User')
const { generateToken }     = require('../utils/generateToken')
const { sendEmail }         = require('../utils/sendEmail')

// ── EMAIL / PASSWORD LOGIN ────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user._id, user.role, user.email)
    console.log(`✅ Admin login: ${user.email}`)
    res.status(200).json({ token, user: { email: user.email, role: user.role } })
  } catch (err) {
    console.error('❌ login error:', err.message)
    next(err)
  }
}

// ── GOOGLE CALLBACK ──────────────────────────────────────────────
// Called by passport after successful Google OAuth
// req.user is attached by passport deserializeUser
const googleCallback = (req, res) => {
  try {
    if (!req.user) {
      console.error('❌ googleCallback: no user on request')
      return res.redirect(`${process.env.CLIENT_URL}/admin/login?error=auth_failed`)
    }
    if (req.user.role !== 'admin') {
      console.warn(`⚠️  Google login rejected — not an admin: ${req.user.email}`)
      return res.redirect(`${process.env.CLIENT_URL}/admin/login?error=not_admin`)
    }
    const token = generateToken(req.user._id, req.user.role, req.user.email)
    console.log(`✅ Google OAuth complete — redirecting: ${req.user.email} (${req.user.role})`)
    res.redirect(`${process.env.CLIENT_URL}/admin/dashboard?token=${token}`)
  } catch (err) {
    console.error('❌ googleCallback error:', err.message)
    res.redirect(`${process.env.CLIENT_URL}/admin/login?error=server_error`)
  }
}

// ── LOGOUT ──────────────────────────────────────────────────────
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('❌ Session destroy error:', err.message)
    res.status(200).json({ message: 'Logged out successfully' })
  })
}

// ── FORGOT PASSWORD ──────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    // Always respond 200 — don't leak whether the email exists
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' })
    }

    // Short-lived reset token (15 min)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' })
    const resetUrl   = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`

    await sendEmail({
      to:      user.email,
      subject: 'SWA — Password Reset Request',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#FAF5EF;border-radius:12px;">
          <h2 style="font-family:Georgia,serif;color:#42311F;">Password Reset</h2>
          <p style="color:#9E664B;line-height:1.7;">
            Hi <strong>${user.name}</strong>,<br/>
            Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;margin-top:16px;padding:12px 28px;background:#42311F;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;">
            Reset Password
          </a>
          <p style="margin-top:24px;font-size:12px;color:rgba(66,49,31,0.5);">
            If you didn't request this, ignore this email — your password won't change.
          </p>
        </div>
      `,
    })

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    console.error('❌ forgotPassword error:', err.message)
    next(err)
  }
}

// ── RESET PASSWORD ───────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    user.password = password   // pre-save hook will hash it
    await user.save()

    console.log(`✅ Password reset successful: ${user.email}`)
    res.status(200).json({ message: 'Password reset successful. You can now log in.' })
  } catch (err) {
    console.error('❌ resetPassword error:', err.message)
    next(err)
  }
}

module.exports = { login, googleCallback, logout, forgotPassword, resetPassword }
