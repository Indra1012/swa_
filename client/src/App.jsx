import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
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

  return (
    <>
      <ScrollToTop />
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
