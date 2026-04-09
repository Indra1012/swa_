
// server/routes/auth.routes.js
const express = require('express')
const passport = require('passport')
const { login, registerUser, googleCallback, logout, forgotPassword, resetPassword } = require('../controllers/auth.controller')

const router = express.Router()

// ── EMAIL / PASSWORD ─────────────────────────────────────────────
router.post('/login', login)
router.post('/register', registerUser)

// ── GOOGLE OAUTH ─────────────────────────────────────────────────
// Step 1: redirect user to Google consent screen (prompt: select_account forces account picker)
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
)

// Step 2: Google redirects back here — on success hand off to controller
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/admin/login?error=auth_failed` }),
  googleCallback
)

// ── SESSION ──────────────────────────────────────────────────────
router.post('/logout', logout)

// ── PASSWORD RESET ───────────────────────────────────────────────
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

module.exports = router
