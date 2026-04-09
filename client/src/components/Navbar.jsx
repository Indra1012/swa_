import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TECHNIQUES } from '../constants/techniques'
import { FiUser, FiChevronDown, FiLogOut } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [healingOpen, setHealingOpen] = useState(false)
  const [drawerServicesOpen, setDrawerServicesOpen] = useState(false)
  const [drawerHealingOpen, setDrawerHealingOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const servicesTimer = useRef(null)
  const healingTimer = useRef(null)
  const profileRef = useRef(null)
  const { user, logout } = useAuth()

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
    setServicesOpen(false)
    setHealingOpen(false)
  }, [location.pathname])

  const goHome = useCallback(() => {
    setDrawerOpen(false)
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }, [navigate, location.pathname])

  const goToService = useCallback((tab) => {
    setDrawerOpen(false)
    setServicesOpen(false)
    navigate(`/services/${tab}`)
  }, [navigate])

  const goToTechnique = useCallback((technique) => {
    setDrawerOpen(false)
    setHealingOpen(false)
    navigate(`/blogs#${technique.id}`)
  }, [navigate])

  const handleServicesEnter = () => {
    clearTimeout(servicesTimer.current)
    setServicesOpen(true)
  }
  const handleServicesLeave = () => {
    servicesTimer.current = setTimeout(() => setServicesOpen(false), 200)
  }
  const handleHealingEnter = () => {
    clearTimeout(healingTimer.current)
    setHealingOpen(true)
  }
  const handleHealingLeave = () => {
    healingTimer.current = setTimeout(() => setHealingOpen(false), 200)
  }

  const navLinkStyle = { // Retained for mobile drawer usage
    color: 'var(--dark)',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 0',
    background: 'none',
    border: 'none',
    fontFamily: 'DM Sans, sans-serif',
    letterSpacing: '0.2px'
  }

  return (
    <>
      <nav
        className="navbar-container"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          height: '76px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 60px',
          background: 'rgba(250,247,242,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(204,199,185,0.3)' : '1px solid transparent',
          boxShadow: scrolled
            ? '0 8px 24px rgba(101,50,57,0.04)'
            : 'none',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>

        {/* LEFT — Logo */}
        <div
          onClick={goHome}
          className="logo-container"
          style={{
            display: 'flex', alignItems: 'center',
            gap: '12px', cursor: 'pointer', flexShrink: 0
          }}
        >
          <img
            src="/swa-logo.png"
            alt="SWA"
            style={{
              width: '44px', height: '44px',
              objectFit: 'cover',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}
          />
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '24px', fontWeight: 700,
            color: 'var(--dark)', lineHeight: 1,
            letterSpacing: '0.5px'
          }}>
            SWA
          </div>
        </div>

        {/* CENTER — Desktop nav */}
        <ul style={{
          display: 'flex', alignItems: 'center',
          gap: '48px', listStyle: 'none',
          margin: 0, padding: 0
        }} className="desktop-nav">

          {/* Home */}
          <li>
            <button
              className="desktop-nav-link"
              onClick={goHome}
            >
              Home
            </button>
          </li>



          {/* Services link (Horizontal Dropdown Mega-style) */}
          <li
            onMouseEnter={handleServicesEnter}
            onMouseLeave={handleServicesLeave}
            style={{ position: 'relative' }}
          >
            <button
              className="desktop-nav-link"
              onClick={() => navigate('/services')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Programs
              <motion.div
                animate={{ rotate: servicesOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}
              >
                <FiChevronDown size={14} opacity={0.6} />
              </motion.div>
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.90, y: -10, x: "-50%", filter: 'blur(5px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: "-50%", filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.90, y: -10, x: "-50%", filter: 'blur(5px)' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    background: 'rgba(250,247,242,0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '8px',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(101, 50, 57, 0.08)',
                    border: '1px solid rgba(204,199,185,0.3)',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '4px',
                    marginTop: '20px',
                    minWidth: 'max-content',
                    transformOrigin: 'top center'
                  }}
                >
                  {/* Invisible bridge to safely cross from nav button to dropdown menu */}
                  <div style={{ position: 'absolute', top: '-25px', left: 0, right: 0, height: '25px' }} />


                  {[
                    { id: 'corporate', name: 'Corporate Solutions' },
                    { id: 'education', name: 'Educational Environments' },
                    { id: 'community', name: 'Community Outreaches' },
                    { id: 'government', name: 'Government Wellness' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate('/services/' + item.id)
                        setServicesOpen(false)
                      }}
                      style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '16px',
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--dark)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--dark)'
                        e.currentTarget.style.color = 'var(--white)'
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(101,50,57,0.15)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--dark)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {/* About Us */}
          <li>
            <button
              className="desktop-nav-link"
              onClick={() => navigate('/about')}
            >
              About Us
            </button>
          </li>

          {/* Blogs */}
          <li>
            <button
              className="desktop-nav-link"
              onClick={() => navigate('/blogs')}
            >
              Blogs
            </button>
          </li>
        </ul>

        {/* RIGHT */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', flexShrink: 0
        }}>
          <button
            onClick={() => navigate('/book-demo')}
            className="desktop-nav"
            style={{
              background: 'var(--dark)', color: 'var(--white)',
              border: 'none', borderRadius: '50px',
              padding: '11px 24px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 20px rgba(101,50,57,0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--dark2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--dark)'}
          >
            Book a Demo
          </button>

          <div ref={profileRef} style={{ position: 'relative' }} className="desktop-nav">
            <button
              onClick={() => {
                if (user) {
                  setProfileOpen(!profileOpen)
                } else {
                  navigate('/admin/login')
                }
              }}
              style={{
                background: user ? 'rgba(101,50,57,0.08)' : 'none',
                border: user ? '1.5px solid var(--secondary)' : '1px solid rgba(204,199,185,0.4)',
                borderRadius: '50%',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: user ? 'var(--dark)' : 'var(--secondary)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--dark)'
                e.currentTarget.style.color = 'var(--white)'
                e.currentTarget.style.borderColor = 'var(--dark)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = user ? 'rgba(101,50,57,0.08)' : 'none'
                e.currentTarget.style.color = user ? 'var(--dark)' : 'var(--secondary)'
                e.currentTarget.style.borderColor = user ? 'var(--secondary)' : 'rgba(204,199,185,0.4)'
              }}
            >
              <FiUser size={15} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    minWidth: '220px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(204,199,185,0.2)',
                    zIndex: 200
                  }}
                >
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '14px',
                    color: 'var(--secondary)',
                    margin: '0 0 4px 0',
                    fontWeight: 500
                  }}>
                    Welcome
                  </p>
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--dark)',
                    margin: '0 0 16px 0',
                    lineHeight: 1.3
                  }}>
                    {user.name || user.email}
                  </p>
                  <div style={{ height: '1px', background: 'rgba(204,199,185,0.25)', marginBottom: '12px' }} />
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      logout()
                      navigate('/')
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      background: 'none',
                      border: '1px solid rgba(204,199,185,0.3)',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--secondary)',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--dark)'
                      e.currentTarget.style.color = 'var(--white)'
                      e.currentTarget.style.borderColor = 'var(--dark)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'none'
                      e.currentTarget.style.color = 'var(--secondary)'
                      e.currentTarget.style.borderColor = 'rgba(204,199,185,0.3)'
                    }}
                  >
                    <FiLogOut size={14} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger */}
          <button
            className="mobile-only"
            onClick={() => setDrawerOpen(true)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '8px',
              display: 'flex', flexDirection: 'column',
              gap: '5px'
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: '22px', height: '2px',
                background: 'var(--dark)', borderRadius: '2px'
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1500
          }}
        />
      )}

      {/* MOBILE DRAWER */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: '300px', height: '100vh',
        background: 'var(--bg)', zIndex: 1600,
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        overflowY: 'auto', padding: '24px',
        boxShadow: '-4px 0 40px rgba(101,50,57,0.15)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '32px'
        }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20px', fontWeight: 700,
            color: 'var(--dark)'
          }}>
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: 'none', border: 'none',
              fontSize: '22px', cursor: 'pointer',
              color: 'var(--dark)', lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '2px'
        }}>
          {/* Home */}
          <button
            style={{
              ...navLinkStyle, textAlign: 'left',
              padding: '14px 0', width: '100%',
              borderBottom: '1px solid rgba(204,199,185,0.25)'
            }}
            onClick={goHome}
          >
            Home
          </button>



          {/* Services (Mobile) Accordion */}
          <div>
            <button
              style={{
                ...navLinkStyle, textAlign: 'left',
                padding: '14px 0', width: '100%',
                borderBottom: drawerServicesOpen ? 'none' : '1px solid rgba(204,199,185,0.25)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
              onClick={() => setDrawerServicesOpen(!drawerServicesOpen)}
            >
              Programs
              <motion.div animate={{ rotate: drawerServicesOpen ? 180 : 0 }}>
                <FiChevronDown size={16} />
              </motion.div>
            </button>
            <AnimatePresence>
              {drawerServicesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', borderBottom: '1px solid rgba(204,199,185,0.25)' }}
                >
                  <div style={{ padding: '0 0 14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { id: 'corporate', name: 'Corporate Solutions' },
                      { id: 'education', name: 'Educational Environments' },
                      { id: 'community', name: 'Community Outreaches' },
                      { id: 'government', name: 'Government Wellness' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate('/services/' + item.id)
                          setDrawerOpen(false)
                        }}
                        style={{
                          textAlign: 'left', background: 'none', border: 'none',
                          fontSize: '15px', color: 'var(--secondary)', cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif',
                          padding: '4px 0'
                        }}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* About */}
          <button
            style={{
              ...navLinkStyle, textAlign: 'left',
              padding: '14px 0', width: '100%',
              borderBottom: '1px solid rgba(204,199,185,0.25)'
            }}
            onClick={() => { navigate('/about'); setDrawerOpen(false) }}
          >
            About Us
          </button>

          {/* Blogs */}
          <button
            style={{
              ...navLinkStyle, textAlign: 'left',
              padding: '14px 0', width: '100%',
              borderBottom: '1px solid rgba(204,199,185,0.25)'
            }}
            onClick={() => { navigate('/blogs'); setDrawerOpen(false) }}
          >
            Blogs
          </button>
        </div>

        <button
          onClick={() => { navigate('/book-demo'); setDrawerOpen(false) }}
          style={{
            marginTop: '28px', width: '100%',
            background: 'var(--dark)', color: 'var(--white)',
            border: 'none', borderRadius: '50px',
            padding: '14px', fontSize: '15px',
            fontWeight: 600, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif'
          }}
        >
          Book a Demo
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: 'var(--secondary)', margin: 0 }}>Welcome</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>{user.name || user.email}</p>
              <button
                onClick={() => { logout(); navigate('/'); setDrawerOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginTop: '8px',
                  padding: '10px 24px',
                  background: 'none',
                  border: '1px solid rgba(204,199,185,0.4)',
                  borderRadius: '50px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--secondary)',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              >
                <FiLogOut size={14} />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { navigate('/admin/login'); setDrawerOpen(false) }}
              style={{
                background: 'none',
                border: '1px solid rgba(204,199,185,0.4)',
                borderRadius: '50%',
                width: '36px', height: '36px',
                display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--secondary)'
              }}
            >
              <FiUser size={15} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-only { display: none !important; }
        
        /* Glass effect clean styles */
        .desktop-nav-link {
          color: var(--dark);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 18px;
          background: transparent;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        
        .desktop-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: var(--secondary);
          border-radius: 2px;
          transition: width 0.3s ease;
          opacity: 0;
        }

        .desktop-nav-link:hover {
          color: var(--secondary);
          background: rgba(101,50,57,0.04);
        }

        .desktop-nav-link:hover::after {
          width: 24px;
          opacity: 1;
        }

        .dropdown-arrow {
          font-size: 10px;
          transition: transform 0.3s ease;
        }

        .desktop-nav-link:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .dropdown-item {
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
          background: transparent;
        }

        .dropdown-item:hover {
          background: rgba(101,50,57,0.04);
          padding-left: 24px;
        }
        
        .logo-container {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .logo-container:hover {
          transform: scale(1.04);
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 24px 0 32px !important; /* Bumped left side in slightly more */
          }
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  )
}
