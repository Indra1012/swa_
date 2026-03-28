import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiGrid, FiImage, FiEdit3, FiCalendar,
  FiClock, FiBell, FiLogOut, FiMenu, FiX,
  FiExternalLink
} from 'react-icons/fi'

import OverviewTab from './tabs/OverviewTab'
import MediaManagerTab from './tabs/MediaManagerTab'
import ContentEditorTab from './tabs/ContentEditorTab'
import BookingsTab from './tabs/BookingsTab'
import SlotSettingsTab from './tabs/SlotSettingsTab'
import NotificationSettingsTab from './tabs/NotificationSettingsTab'

const TABS = [
  { id: 'overview',      label: 'Overview',              icon: <FiGrid size={18} /> },
  { id: 'media',         label: 'Media Manager',         icon: <FiImage size={18} /> },
  { id: 'content',       label: 'Content Editor',        icon: <FiEdit3 size={18} /> },
  { id: 'bookings',      label: 'Bookings',              icon: <FiCalendar size={18} /> },
  { id: 'slots',         label: 'Slot Settings',         icon: <FiClock size={18} /> },
  { id: 'notifications', label: 'Notification Settings', icon: <FiBell size={18} /> }
]

const SIDEBAR_WIDTH = 260

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const currentTab = TABS.find(t => t.id === activeTab)

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewTab />
      case 'media':         return <MediaManagerTab />
      case 'content':       return <ContentEditorTab />
      case 'bookings':      return <BookingsTab />
      case 'slots':         return <SlotSettingsTab />
      case 'notifications': return <NotificationSettingsTab />
      default:              return <OverviewTab />
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'DM Sans, sans-serif'
    }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0px',
        minWidth: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0px',
        background: 'var(--dark)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0,
        height: '100vh',
        zIndex: 100,
        overflow: 'hidden',
        transition: 'min-width 0.3s ease, width 0.3s ease',
        boxShadow: '4px 0 24px rgba(101,50,57,0.15)'
      }}>

        {/* Sidebar top — Logo */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/swa-logo.png"
              alt="SWA"
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
            />
            <div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '20px', fontWeight: 700,
                color: 'var(--white)', lineHeight: 1
              }}>
                SWA™
              </div>
              <div style={{
                fontSize: '10px', color: 'rgba(237,224,212,0.6)',
                letterSpacing: '0.5px', marginTop: '2px'
              }}>
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{
          flex: 1,
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto'
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? 'var(--white)' : 'rgba(255,255,255,0.55)',
                  fontSize: '14px', fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  fontFamily: 'DM Sans, sans-serif',
                  borderLeft: isActive
                    ? '3px solid var(--primary)'
                    : '3px solid transparent'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                  }
                }}
              >
                <span style={{ flexShrink: 0 }}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Sidebar bottom — Visit site + Logout */}
        <div style={{
          padding: '16px 12px 24px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center',
              gap: '10px', width: '100%',
              padding: '10px 16px', borderRadius: '10px',
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px', cursor: 'pointer',
              transition: 'var(--transition)',
              marginBottom: '4px',
              fontFamily: 'DM Sans, sans-serif',
              textAlign: 'left'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <FiExternalLink size={15} />
            Visit Website
          </button>

          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center',
              gap: '10px', width: '100%',
              padding: '10px 16px', borderRadius: '10px',
              border: 'none', background: 'transparent',
              color: 'rgba(237,224,212,0.6)',
              fontSize: '13px', cursor: 'pointer',
              transition: 'var(--transition)',
              fontFamily: 'DM Sans, sans-serif',
              textAlign: 'left'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--primary)'
              e.currentTarget.style.background = 'rgba(237,224,212,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(237,224,212,0.6)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <FiLogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0px',
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>

        {/* Top header bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'var(--white)',
          borderBottom: '1px solid rgba(204,199,185,0.2)',
          padding: '0 32px',
          height: '64px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left — Hamburger + Page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--dark)',
                display: 'flex', alignItems: 'center',
                padding: '6px', borderRadius: '8px',
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,199,185,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div>
              <h1 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '22px', fontWeight: 700,
                color: 'var(--dark)', lineHeight: 1
              }}>
                {currentTab?.label}
              </h1>
            </div>
          </div>

          {/* Right — User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '13px', fontWeight: 600,
                color: 'var(--dark)'
              }}>
                {user?.email || 'Admin'}
              </div>
              <div style={{
                fontSize: '11px', color: 'var(--secondary)',
                textTransform: 'capitalize'
              }}>
                {user?.role || 'admin'}
              </div>
            </div>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--dark)',
              fontSize: '14px', fontWeight: 700,
              fontFamily: 'Cormorant Garamond, serif'
            }}>
              {(user?.email?.[0] || 'A').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Tab content */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {renderTab()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
