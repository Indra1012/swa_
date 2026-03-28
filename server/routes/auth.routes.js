const express  = require('express')
const passport = require('passport')
const { login, googleCallback, logout, forgotPassword, resetPassword } = require('../controllers/auth.controller')

const router = express.Router()

// ── EMAIL / PASSWORD ─────────────────────────────────────────────
router.post('/login', login)

// ── GOOGLE OAUTH ─────────────────────────────────────────────────
// Step 1: redirect user to Google consent screen
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
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
router.post('/reset-password',  resetPassword)

module.exports = router
