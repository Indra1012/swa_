const express    = require('express')
const dotenv     = require('dotenv')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const compression = require('compression')
const session    = require('express-session')
const rateLimit  = require('express-rate-limit')
const passport   = require('passport')

dotenv.config()

// ── ENV VALIDATION ──
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
const missingEnvVars  = requiredEnvVars.filter(key => !process.env[key])
if (missingEnvVars.length > 0) {
  console.error('──────────────────────────────────────────────')
  console.error('❌ MISSING REQUIRED ENV VARIABLES:')
  missingEnvVars.forEach(key => console.error(`   - ${key}`))
  console.error('   Add them to your .env file and restart.')
  console.error('──────────────────────────────────────────────')
  process.exit(1)
}

const app = express()

// ── RATE LIMITING ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 5000,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// ── CORE MIDDLEWARE ──
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(compression())

// ── MORGAN: log every request with sanitized body ──
morgan.token('body', (req) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const sanitized = { ...req.body }
    if (sanitized.password) sanitized.password = '***'
    if (sanitized.token)    sanitized.token    = '***'
    return JSON.stringify(sanitized)
  }
  return '-'
})
app.use(morgan('[:date[clf]] :method :url :status :response-time ms — :body'))

// ── SESSION ──
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge:   24 * 60 * 60 * 1000  // 24 hours
  }
}))

// ── PASSPORT ──
try {
  require('./config/passport')(passport)
  app.use(passport.initialize())
  app.use(passport.session())
  console.log('✅ Passport initialized successfully')
} catch (err) {
  console.error('❌ Passport config failed:', err.message)
  console.error('   Fix: check server/config/passport.js')
  process.exit(1)
}

// ── DATABASE ──
const connectDB = require('./config/db')
connectDB()

// ── ROUTES ──
app.use('/api/auth',     require('./routes/auth.routes'))
app.use('/api/bookings', require('./routes/booking.routes'))
app.use('/api/media',    require('./routes/media.routes'))
app.use('/api/content',  require('./routes/content.routes'))
app.use('/api/slots',    require('./routes/slot.routes'))
app.use('/api/admin',    require('./routes/admin.routes'))
app.use('/api/sections', require('./routes/sections.routes'))

// ── HEALTH CHECK ──
app.get('/api/health', (req, res) => {
  res.json({
    status:      'ok',
    message:     'SWA API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString()
  })
})

// ── 404 HANDLER ──
app.use((req, res) => {
  console.warn(`⚠️  404 — ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    error:  'Route not found',
    method: req.method,
    path:   req.originalUrl
  })
})

// ── GLOBAL ERROR HANDLER ──
// Must keep all 4 params — Express identifies error middleware by arity
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('──────────────────────────────────────────────')
  console.error(`❌ ERROR — ${req.method} ${req.originalUrl}`)
  console.error(`   Message : ${err.message}`)
  console.error(`   Status  : ${err.status || 500}`)
  if (process.env.NODE_ENV !== 'production') {
    console.error(`   Stack   :\n${err.stack}`)
  }
  console.error('──────────────────────────────────────────────')

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ error: 'Validation failed', details: messages })
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({ error: `Duplicate value: ${field} already exists`, field })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token. Please log in again.' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Session expired. Please log in again.' })
  }

  // Multer file size exceeded
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum allowed size is 10MB.' })
  }

  // Default
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// ── PROCESS-LEVEL SAFETY NETS ──
process.on('unhandledRejection', (reason) => {
  console.error('──────────────────────────────────────────────')
  console.error('❌ UNHANDLED PROMISE REJECTION')
  console.error('   Reason:', reason)
  console.error('──────────────────────────────────────────────')
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('──────────────────────────────────────────────')
  console.error('❌ UNCAUGHT EXCEPTION')
  console.error('   Message:', err.message)
  console.error('   Stack  :', err.stack)
  console.error('──────────────────────────────────────────────')
  process.exit(1)
})

// ── START SERVER ──
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('──────────────────────────────────────────────')
  console.log(`✅ SWA server running on port ${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
  console.log(`   Client URL  : ${process.env.CLIENT_URL}`)
  console.log('──────────────────────────────────────────────')
})
