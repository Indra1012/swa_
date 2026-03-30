import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'

// Lazy load everything except Home
const About          = lazy(() => import('./pages/About'))
const BookDemo       = lazy(() => import('./pages/BookDemo'))
const ServicesPage   = lazy(() => import('./pages/ServicesPage'))
const HealingTechniquesPage = lazy(() => import('./pages/HealingTechniquesPage'))
const AdminLogin     = lazy(() => import('./admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))

// Suspense fallback
function SWALoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      <h2 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '32px',
        color: 'var(--dark)',
        opacity: 0.6,
        letterSpacing: '2px'
      }}>
        SWA
      </h2>
    </div>
  )
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Layout wrapper — hides Navbar/Footer on admin routes
function Layout() {
  const location = useLocation()
  const isAdminDashboard = location.pathname === '/admin/dashboard'
  const videoRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.defaultPlaybackRate = 1
    video.playbackRate = 1

    const forcePlay = () => {
      if (video.paused) {
        video.play().catch(() => {})
      }
    }

    const maintainRate = () => {
      video.playbackRate = 1
    }

    forcePlay()
    
    // Force playback if paused by browser (e.g. power saving)
    video.addEventListener('pause', forcePlay)
    video.addEventListener('suspend', forcePlay)
    video.addEventListener('ratechange', maintainRate)

    return () => {
      video.removeEventListener('pause', forcePlay)
      video.removeEventListener('suspend', forcePlay)
      video.removeEventListener('ratechange', maintainRate)
    }
  }, [isAdminDashboard, location.pathname])

  return (
    <>
      <ScrollToTop />
      {!isAdminDashboard && (
        <video
          key={isMobile ? 'mobile-bg' : 'desktop-bg'}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="global-bg-video"
          onEnded={(e) => e.target.play()}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1, pointerEvents: 'none' }}
        >
          <source src={isMobile ? "/video1.mp4" : "/video.mp4"} type="video/mp4" />
        </video>
      )}
      {!isAdminDashboard && <Navbar />}
      <Suspense fallback={<SWALoader />}>
        <Routes>
          <Route path="/"                        element={<Home />} />
          <Route path="/about"                   element={<About />} />
          <Route path="/book-demo"               element={<BookDemo />} />
          <Route path="/services"                element={<ServicesPage />} />
          <Route path="/healing-techniques"      element={<HealingTechniquesPage />} />
          <Route path="/admin/login"             element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      {!isAdminDashboard && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}
