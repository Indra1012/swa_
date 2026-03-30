const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const User                         = require('../models/User')

module.exports = (passport) => {

  // ── THING 1: GOOGLE STRATEGY ──────────────────────────────────
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email      = profile.emails?.[0]?.value || ''
        const name       = profile.displayName         || ''
        const avatar     = profile.photos?.[0]?.value  || ''
        const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
                              .split(',').map(e => e.trim().toLowerCase())
        const role       = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user'

        // Find existing user by googleId first, then fall back to email
        let user = await User.findOne({ googleId: profile.id })

        if (!user) {
          // May exist as an email/password account (e.g. seeded admin) — link the googleId
          user = await User.findOne({ email })
          if (user) {
            user.googleId = profile.id
            if (!user.avatar) user.avatar = avatar
            await user.save()
            console.log(`✅ Google login (linked to existing account): ${user.name}, ${user.email}, ${user.role}`)
            return done(null, user)
          }
        }

        if (user) {
          console.log(`✅ Google login: ${user.name}, ${user.email}, ${user.role}`)
          return done(null, user)
        }

        // Brand-new user — create in DB
        user = await User.create({
          googleId: profile.id,
          name,
          email,
          avatar,
          role,
        })

        console.log(`✅ Google login (new user): ${user.name}, ${user.email}, ${user.role}`)
        return done(null, user)

      } catch (err) {
        console.error('❌ Passport Google Strategy error:', err.message)
        return done(err, null)
      }
    }
  ))

  // ── THING 2: SERIALIZE ────────────────────────────────────────
  // Only store user.id in the session cookie — lightweight
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // ── THING 3: DESERIALIZE ──────────────────────────────────────
  // On each request, load full user from DB using the id in session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (err) {
      console.error('❌ Passport deserializeUser error:', err.message)
      done(err, null)
    }
  })
}
