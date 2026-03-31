import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  FiEdit3, FiCheck, FiX, FiAlertCircle, FiChevronDown,
  FiChevronUp, FiTrash2, FiPlus, FiUpload, FiToggleLeft, FiToggleRight
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('swa_token')}` })

// ─── SHARED UI HELPERS ───────────────────────────────────────────────────────

function SBtn({ onClick, disabled, variant = 'primary', children, style = {} }) {
  const base = {
    display: 'flex', alignItems: 'center', gap: '5px',
    border: 'none', borderRadius: '8px', padding: '8px 16px',
    fontSize: '13px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s ease', opacity: disabled ? 0.5 : 1,
    ...style
  }
  const colors = {
    primary: { background: 'var(--dark)', color: 'var(--white)' },
    danger:  { background: 'rgba(200,50,50,0.1)', color: '#c83232', border: '1px solid rgba(200,50,50,0.2)' },
    ghost:   { background: 'var(--bg)', color: 'var(--secondary)', border: '1px solid rgba(204,199,185,0.4)' },
    accent:  { background: 'var(--secondary)', color: 'var(--white)' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...colors[variant] }}>
      {children}
    </button>
  )
}

function Field({ label, value, onChange, multiline, placeholder }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {label && <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>{label}</p>}
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            width: '100%', padding: '10px 13px', border: '1.5px solid rgba(204,199,185,0.35)',
            borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
            background: 'var(--bg)', color: 'var(--dark)', resize: 'vertical',
            lineHeight: 1.6, boxSizing: 'border-box', outline: 'none'
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 13px', border: '1.5px solid rgba(204,199,185,0.35)',
            borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
            background: 'var(--bg)', color: 'var(--dark)', boxSizing: 'border-box', outline: 'none'
          }}
        />
      )}
    </div>
  )
}

function ErrMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
      color: '#c83232', padding: '8px 12px', background: 'rgba(200,50,50,0.07)',
      borderRadius: '8px', marginBottom: '10px'
    }}>
      <FiAlertCircle size={13} /> {msg}
    </div>
  )
}

function SectionAccordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: '16px', borderRadius: '12px', border: '1px solid rgba(204,199,185,0.25)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: open ? 'rgba(175,122,109,0.06)' : 'var(--white)',
          border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          transition: 'background 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '18px', background: open ? 'var(--secondary)' : 'rgba(204,199,185,0.5)', borderRadius: '2px', transition: 'background 0.2s ease' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', fontWeight: 700, color: 'var(--dark)' }}>{title}</span>
        </div>
        {open ? <FiChevronUp size={16} color="var(--secondary)" /> : <FiChevronDown size={16} color="var(--secondary)" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '20px', borderTop: '1px solid rgba(204,199,185,0.2)', background: 'var(--white)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── 1. HERO MANAGER ─────────────────────────────────────────────────────────
function HeroManager() {
  const [headline, setHeadline] = useState('')
  const [subline, setSubline] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    axios.get(`${API}/api/content/hero`).then(res => {
      const items = res.data.items || res.data || []
      if (Array.isArray(items)) {
        items.forEach(i => {
          if (i.key === 'headline') setHeadline(i.value)
          if (i.key === 'subline') setSubline(i.value)
        })
      }
    }).catch(() => {})
  }, [])

  const saveText = async () => {
    setSaving(true); setErr(''); setMsg('')
    try {
      await Promise.all([
        axios.put(`${API}/api/content`, { section: 'hero', key: 'headline', value: headline }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'hero', key: 'subline', value: subline }, { headers: authH() }),
      ])
      setMsg('Saved!')
      setTimeout(() => setMsg(''), 2500)
    } catch { setErr('Failed to save.') }
    finally { setSaving(false) }
  }

  const uploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr(''); setMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('section', 'hero')
      await axios.post(`${API}/api/media/upload`, fd, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } })
      setMsg('Image uploaded!')
      setTimeout(() => setMsg(''), 2500)
    } catch { setErr('Upload failed.') }
    finally { setUploading(false) }
  }

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '10px', fontWeight: 600 }}>BACKGROUND IMAGE</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage} style={{ display: 'none' }} />
        <SBtn onClick={() => fileRef.current?.click()} disabled={uploading} variant="ghost">
          <FiUpload size={13} /> {uploading ? 'Uploading...' : 'Upload Hero Image'}
        </SBtn>
      </div>
      <Field label="Headline" value={headline} onChange={setHeadline} placeholder="Where Self Meets Its True Essence" />
      <Field label="Subline" value={subline} onChange={setSubline} multiline placeholder="Science-backed wellness programs..." />
      <ErrMsg msg={err} />
      {msg && <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '10px' }}><FiCheck size={12} /> {msg}</p>}
      <SBtn onClick={saveText} disabled={saving}><FiCheck size={12} /> {saving ? 'Saving...' : 'Save Text'}</SBtn>
    </>
  )
}

// ─── 2. TECHNIQUES MANAGER (shared for healing + wellbeing) ──────────────────
function TechniquesManager({ category, label }) {
  const [items, setItems] = useState([])
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', subtitle: '', readMoreText: '' })
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState(null)
  const fileRefs = useRef({})

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/sections/techniques/${category}`)
      setItems(res.data.items || [])
    } catch { setErr('Failed to load.') }
  }, [category])

  useEffect(() => { load() }, [load])

  const save = async (id) => {
    try {
      await axios.put(`${API}/api/sections/techniques/${id}`, draft, { headers: authH() })
      setEditId(null); load()
    } catch { setErr('Save failed.') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await axios.delete(`${API}/api/sections/techniques/${id}`, { headers: authH() })
      load()
    } catch { setErr('Delete failed.') }
  }

  const create = async () => {
    if (!newItem.title) return setErr('Title is required.')
    try {
      await axios.post(`${API}/api/sections/techniques`, { ...newItem, category }, { headers: authH() })
      setNewItem({ title: '', subtitle: '', readMoreText: '' })
      setAdding(false); load()
    } catch { setErr('Create failed.') }
  }

  const uploadImg = async (id, file) => {
    if (!file) return
    setUploading(id)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await axios.post(`${API}/api/sections/techniques/${id}/image`, fd, {
        headers: { ...authH(), 'Content-Type': 'multipart/form-data' }
      })
      load()
    } catch { setErr('Image upload failed.') }
    finally { setUploading(null) }
  }

  return (
    <>
      <ErrMsg msg={err} />
      {items.map(item => (
        <div key={item._id} style={{
          background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px',
          marginBottom: '10px', border: '1px solid rgba(204,199,185,0.25)'
        }}>
          {editId === item._id ? (
            <>
              <Field label="Title" value={draft.title ?? item.title} onChange={v => setDraft(d => ({ ...d, title: v }))} />
              <Field label="Subtitle" value={draft.subtitle ?? item.subtitle} onChange={v => setDraft(d => ({ ...d, subtitle: v }))} />
              <Field label="Read More Text" value={draft.readMoreText ?? item.readMoreText} onChange={v => setDraft(d => ({ ...d, readMoreText: v }))} multiline />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {item.image && (
                <img src={item.image} alt="" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: '120px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: 0 }}>{item.subtitle}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <input
                  type="file" accept="image/*"
                  style={{ display: 'none' }}
                  ref={el => fileRefs.current[item._id] = el}
                  onChange={e => uploadImg(item._id, e.target.files?.[0])}
                />
                <SBtn
                  onClick={() => fileRefs.current[item._id]?.click()}
                  disabled={uploading === item._id}
                  variant="ghost"
                  style={{ padding: '6px 10px' }}
                >
                  <FiUpload size={12} /> {uploading === item._id ? '...' : 'Image'}
                </SBtn>
                <SBtn onClick={() => { setEditId(item._id); setDraft({}) }} variant="ghost" style={{ padding: '6px 10px' }}>
                  <FiEdit3 size={12} />
                </SBtn>
                <SBtn onClick={() => del(item._id)} variant="danger" style={{ padding: '6px 10px' }}>
                  <FiTrash2 size={12} />
                </SBtn>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add New */}
      {adding ? (
        <div style={{ background: 'rgba(175,122,109,0.06)', borderRadius: '10px', padding: '16px', marginTop: '12px', border: '1px dashed rgba(175,122,109,0.3)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>New {label}</p>
          <Field label="Title" value={newItem.title} onChange={v => setNewItem(n => ({ ...n, title: v }))} placeholder={`${label} title`} />
          <Field label="Subtitle" value={newItem.subtitle} onChange={v => setNewItem(n => ({ ...n, subtitle: v }))} placeholder="Short description" />
          <Field label="Read More Text" value={newItem.readMoreText} onChange={v => setNewItem(n => ({ ...n, readMoreText: v }))} multiline placeholder="Expanded description..." />
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create}><FiPlus size={12} /> Add</SBtn>
            <SBtn onClick={() => { setAdding(false); setNewItem({ title: '', subtitle: '', readMoreText: '' }) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAdding(true)} variant="ghost" style={{ marginTop: '8px' }}><FiPlus size={13} /> Add {label}</SBtn>
      )}
    </>
  )
}

// ─── 3. EXPERTISE / SERVICES IMAGES ──────────────────────────────────────────
function ExpertiseManager() {
  const SERVICES_LIST = [
    { key: 'corporate_image', label: 'Corporate Wellness Image URL', placeholder: 'https://...' },
    { key: 'education_image', label: 'Education Sector Image URL', placeholder: 'https://...' },
    { key: 'community_image', label: 'Community Spaces Image URL', placeholder: 'https://...' },
  ]
  const [values, setValues] = useState({ corporate_image: '', education_image: '', community_image: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    axios.get(`${API}/api/content/services`).then(res => {
      const items = res.data.items || res.data || []
      if (Array.isArray(items)) {
        const map = {}
        items.forEach(i => { map[i.key] = i.value })
        setValues(v => ({ ...v, ...map }))
      }
    }).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true); setErr(''); setMsg('')
    try {
      await Promise.all(
        SERVICES_LIST.map(s =>
          axios.put(`${API}/api/content`, { section: 'services', key: s.key, value: values[s.key] || '' }, { headers: authH() })
        )
      )
      setMsg('Saved!')
      setTimeout(() => setMsg(''), 2500)
    } catch { setErr('Save failed.') }
    finally { setSaving(false) }
  }

  return (
    <>
      {SERVICES_LIST.map(s => (
        <Field
          key={s.key}
          label={s.label}
          value={values[s.key]}
          onChange={v => setValues(vals => ({ ...vals, [s.key]: v }))}
          placeholder={s.placeholder}
        />
      ))}
      <ErrMsg msg={err} />
      {msg && <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '10px' }}><FiCheck size={12} /> {msg}</p>}
      <SBtn onClick={save} disabled={saving}><FiCheck size={12} /> {saving ? 'Saving...' : 'Save Images'}</SBtn>
    </>
  )
}

// ─── 4. TESTIMONIALS MANAGER ─────────────────────────────────────────────────
function TestimonialsManager() {
  const [items, setItems] = useState([])
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', rating: 5, quote: '', text: '' })
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/sections/testimonials`)
      setItems(res.data.items || [])
    } catch { setErr('Failed to load.') }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (id) => {
    try {
      await axios.put(`${API}/api/sections/testimonials/${id}`, draft, { headers: authH() })
      setEditId(null); load()
    } catch { setErr('Save failed.') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return
    try {
      await axios.delete(`${API}/api/sections/testimonials/${id}`, { headers: authH() })
      load()
    } catch { setErr('Delete failed.') }
  }

  const create = async () => {
    if (!newItem.name || !newItem.quote) return setErr('Name and quote are required.')
    try {
      await axios.post(`${API}/api/sections/testimonials`, newItem, { headers: authH() })
      setNewItem({ name: '', rating: 5, quote: '', text: '' })
      setAdding(false); load()
    } catch { setErr('Create failed.') }
  }

  const StarPicker = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '20px', color: n <= value ? 'rgba(226,212,186,0.9)' : 'rgba(226,212,186,0.25)',
          padding: '2px', transition: 'color 0.2s ease'
        }}>★</button>
      ))}
    </div>
  )

  return (
    <>
      <ErrMsg msg={err} />
      {items.map(item => (
        <div key={item._id} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', border: '1px solid rgba(204,199,185,0.25)' }}>
          {editId === item._id ? (
            <>
              <Field label="Name / Company" value={draft.name ?? item.name} onChange={v => setDraft(d => ({ ...d, name: v }))} />
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '4px' }}>Rating</p>
              <StarPicker value={draft.rating ?? item.rating ?? 5} onChange={v => setDraft(d => ({ ...d, rating: v }))} />
              <Field label="Quote (short headline)" value={draft.quote ?? item.quote} onChange={v => setDraft(d => ({ ...d, quote: v }))} />
              <Field label="Full Text" value={draft.text ?? item.text} onChange={v => setDraft(d => ({ ...d, text: v }))} multiline />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 2px' }}>{item.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: '0 0 4px', fontStyle: 'italic' }}>"{item.quote}"</p>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ fontSize: '12px', color: n <= (item.rating || 5) ? 'rgba(226,212,186,0.9)' : 'rgba(226,212,186,0.25)' }}>★</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <SBtn onClick={() => { setEditId(item._id); setDraft({}) }} variant="ghost" style={{ padding: '6px 10px' }}>
                  <FiEdit3 size={12} />
                </SBtn>
                <SBtn onClick={() => del(item._id)} variant="danger" style={{ padding: '6px 10px' }}>
                  <FiTrash2 size={12} />
                </SBtn>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div style={{ background: 'rgba(175,122,109,0.06)', borderRadius: '10px', padding: '16px', marginTop: '12px', border: '1px dashed rgba(175,122,109,0.3)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>New Testimonial</p>
          <Field label="Name / Company" value={newItem.name} onChange={v => setNewItem(n => ({ ...n, name: v }))} />
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '4px' }}>Rating</p>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setNewItem(ni => ({ ...ni, rating: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: n <= newItem.rating ? 'rgba(226,212,186,0.9)' : 'rgba(226,212,186,0.25)', padding: '2px' }}>★</button>
            ))}
          </div>
          <Field label="Quote (short headline)" value={newItem.quote} onChange={v => setNewItem(n => ({ ...n, quote: v }))} />
          <Field label="Full Text" value={newItem.text} onChange={v => setNewItem(n => ({ ...n, text: v }))} multiline />
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create}><FiPlus size={12} /> Add</SBtn>
            <SBtn onClick={() => { setAdding(false); setNewItem({ name: '', rating: 5, quote: '', text: '' }) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAdding(true)} variant="ghost" style={{ marginTop: '8px' }}><FiPlus size={13} /> Add Testimonial</SBtn>
      )}
    </>
  )
}

// ─── 5. WELLBEING VISIBILITY TOGGLE (wraps TechniquesManager) ────────────────
function WellbeingManager() {
  const [visible, setVisible] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    axios.get(`${API}/api/sections/settings/wellbeing-visible`).then(res => {
      setVisible(res.data.visible !== false)
    }).catch(() => {})
  }, [])

  const toggle = async () => {
    setToggling(true)
    try {
      const res = await axios.put(
        `${API}/api/sections/settings/wellbeing-visible`,
        { visible: !visible },
        { headers: authH() }
      )
      setVisible(res.data.visible)
    } catch { /* keep state */ }
    finally { setToggling(false) }
  }

  return (
    <>
      {/* Visibility Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: 'var(--bg)', borderRadius: '10px',
        marginBottom: '20px', border: '1px solid rgba(204,199,185,0.25)'
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>Show Section on Homepage</p>
          <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: '2px 0 0' }}>Toggle visibility of the 12 Wellbeing Processes section</p>
        </div>
        <button
          onClick={toggle} disabled={toggling}
          style={{ background: 'none', border: 'none', cursor: toggling ? 'not-allowed' : 'pointer', padding: '4px', opacity: toggling ? 0.6 : 1 }}
        >
          {visible
            ? <FiToggleRight size={36} color="var(--secondary)" />
            : <FiToggleLeft size={36} color="rgba(204,199,185,0.6)" />
          }
        </button>
      </div>
      {/* Cards CRUD */}
      <TechniquesManager category="wellbeing" label="Wellbeing Process" />
    </>
  )
}

// ─── 6. STATS MANAGER ────────────────────────────────────────────────────────
function StatsManager() {
  const [items, setItems] = useState([])
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ value: '', suffix: '', label: '' })
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/sections/stats`)
      setItems(res.data.items || [])
    } catch { setErr('Failed to load.') }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (id) => {
    try {
      await axios.put(`${API}/api/sections/stats/${id}`, draft, { headers: authH() })
      setEditId(null); load()
    } catch { setErr('Save failed.') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this stat?')) return
    try {
      await axios.delete(`${API}/api/sections/stats/${id}`, { headers: authH() })
      load()
    } catch { setErr('Delete failed.') }
  }

  const create = async () => {
    if (!newItem.label) return setErr('Label is required.')
    try {
      await axios.post(`${API}/api/sections/stats`, { ...newItem, value: Number(newItem.value) || 0 }, { headers: authH() })
      setNewItem({ value: '', suffix: '', label: '' })
      setAdding(false); load()
    } catch { setErr('Create failed.') }
  }

  return (
    <>
      <ErrMsg msg={err} />
      {items.map(item => (
        <div key={item._id} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', border: '1px solid rgba(204,199,185,0.25)' }}>
          {editId === item._id ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Value (number)" value={String(draft.value ?? item.value)} onChange={v => setDraft(d => ({ ...d, value: v }))} placeholder="450" />
                <Field label="Suffix" value={draft.suffix ?? item.suffix} onChange={v => setDraft(d => ({ ...d, suffix: v }))} placeholder="+" />
              </div>
              <Field label="Label" value={draft.label ?? item.label} onChange={v => setDraft(d => ({ ...d, label: v }))} placeholder="Organizations\nTransformed" />
              <div style={{ display: 'flex', gap: '8px' }}>
                <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 700, color: 'var(--dark)' }}>{item.value}</span>
                <span style={{ fontSize: '18px', color: 'var(--accent)', fontWeight: 700 }}>{item.suffix}</span>
                <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: '2px 0 0', whiteSpace: 'pre-line' }}>{item.label}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <SBtn onClick={() => { setEditId(item._id); setDraft({}) }} variant="ghost" style={{ padding: '6px 10px' }}><FiEdit3 size={12} /></SBtn>
                <SBtn onClick={() => del(item._id)} variant="danger" style={{ padding: '6px 10px' }}><FiTrash2 size={12} /></SBtn>
              </div>
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <div style={{ background: 'rgba(175,122,109,0.06)', borderRadius: '10px', padding: '16px', marginTop: '12px', border: '1px dashed rgba(175,122,109,0.3)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>New Stat</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Value" value={newItem.value} onChange={v => setNewItem(n => ({ ...n, value: v }))} placeholder="450" />
            <Field label="Suffix" value={newItem.suffix} onChange={v => setNewItem(n => ({ ...n, suffix: v }))} placeholder="+" />
          </div>
          <Field label="Label" value={newItem.label} onChange={v => setNewItem(n => ({ ...n, label: v }))} placeholder="Organizations Transformed" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create}><FiPlus size={12} /> Add</SBtn>
            <SBtn onClick={() => { setAdding(false); setNewItem({ value: '', suffix: '', label: '' }) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAdding(true)} variant="ghost" style={{ marginTop: '8px' }}><FiPlus size={13} /> Add Stat</SBtn>
      )}
    </>
  )
}

// ─── 7. GALLERY MANAGER ──────────────────────────────────────────────────────
const SIZE_VARIANTS = ['small', 'medium', 'large', 'portrait', 'landscape']

function GalleryManager() {
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoSize, setVideoSize] = useState('medium')
  const [imgSize, setImgSize] = useState('medium')
  const [addingVideo, setAddingVideo] = useState(false)
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/sections/gallery`)
      setItems(res.data.items || [])
    } catch { setErr('Failed to load.') }
  }, [])

  useEffect(() => { load() }, [load])

  const uploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('sizeVariant', imgSize)
      fd.append('type', 'image')
      await axios.post(`${API}/api/sections/gallery`, fd, {
        headers: { ...authH(), 'Content-Type': 'multipart/form-data' }
      })
      load()
    } catch { setErr('Upload failed.') }
    finally { setUploading(false) }
  }

  const addVideo = async () => {
    if (!videoUrl) return setErr('Video URL is required.')
    try {
      await axios.post(`${API}/api/sections/gallery`,
        { url: videoUrl, type: 'video', sizeVariant: videoSize },
        { headers: authH() }
      )
      setVideoUrl(''); setAddingVideo(false); load()
    } catch { setErr('Add failed.') }
  }

  const del = async (id) => {
    if (!window.confirm('Remove this item?')) return
    try {
      await axios.delete(`${API}/api/sections/gallery/${id}`, { headers: authH() })
      load()
    } catch { setErr('Delete failed.') }
  }

  return (
    <>
      <ErrMsg msg={err} />

      {/* Upload image */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input type="file" accept="image/*,video/*" style={{ display: 'none' }} ref={fileRef} onChange={uploadImage} />
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Card Size</p>
          <select
            value={imgSize} onChange={e => setImgSize(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.35)', background: 'var(--bg)', fontSize: '13px', cursor: 'pointer' }}
          >
            {SIZE_VARIANTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ paddingTop: '20px' }}>
          <SBtn onClick={() => fileRef.current?.click()} disabled={uploading} variant="accent">
            <FiUpload size={13} /> {uploading ? 'Uploading...' : 'Upload Image / Video'}
          </SBtn>
        </div>
      </div>

      {/* Add video URL */}
      {addingVideo ? (
        <div style={{ background: 'rgba(175,122,109,0.06)', borderRadius: '10px', padding: '16px', marginBottom: '16px', border: '1px dashed rgba(175,122,109,0.3)' }}>
          <Field label="Video URL" value={videoUrl} onChange={setVideoUrl} placeholder="https://..." />
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Card Size</p>
            <select value={videoSize} onChange={e => setVideoSize(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.35)', background: 'var(--bg)', fontSize: '13px' }}>
              {SIZE_VARIANTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={addVideo}><FiPlus size={12} /> Add Video</SBtn>
            <SBtn onClick={() => { setAddingVideo(false); setVideoUrl('') }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAddingVideo(true)} variant="ghost" style={{ marginBottom: '16px' }}><FiPlus size={13} /> Add Video URL</SBtn>
      )}

      {/* Grid of current items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginTop: '8px' }}>
        {items.map(item => (
          <div key={item._id} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1/1', background: '#eee' }}>
            {item.type === 'video' ? (
              <div style={{ width: '100%', height: '100%', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '20px' }}>▶</span>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Video</p>
              </div>
            ) : (
              <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <div style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', background: 'rgba(0,0,0,0.65)', color: 'white', padding: '2px 5px', borderRadius: '4px' }}>{item.sizeVariant}</span>
              <button onClick={() => del(item._id)} style={{ background: 'rgba(200,50,50,0.85)', border: 'none', color: 'white', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FiTrash2 size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── 8. FAQ MANAGER ──────────────────────────────────────────────────────────
function FaqManager() {
  const [items, setItems] = useState([])
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ question: '', answer: '' })
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/sections/faqs`)
      setItems(res.data.items || [])
    } catch { setErr('Failed to load.') }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (id) => {
    try {
      await axios.put(`${API}/api/sections/faqs/${id}`, draft, { headers: authH() })
      setEditId(null); load()
    } catch { setErr('Save failed.') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return
    try {
      await axios.delete(`${API}/api/sections/faqs/${id}`, { headers: authH() })
      load()
    } catch { setErr('Delete failed.') }
  }

  const create = async () => {
    if (!newItem.question || !newItem.answer) return setErr('Question and answer are required.')
    try {
      await axios.post(`${API}/api/sections/faqs`, newItem, { headers: authH() })
      setNewItem({ question: '', answer: '' })
      setAdding(false); load()
    } catch { setErr('Create failed.') }
  }

  return (
    <>
      <ErrMsg msg={err} />
      {items.map((item, i) => (
        <div key={item._id} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', border: '1px solid rgba(204,199,185,0.25)' }}>
          {editId === item._id ? (
            <>
              <Field label="Question" value={draft.question ?? item.question} onChange={v => setDraft(d => ({ ...d, question: v }))} />
              <Field label="Answer" value={draft.answer ?? item.answer} onChange={v => setDraft(d => ({ ...d, answer: v }))} multiline />
              <div style={{ display: 'flex', gap: '8px' }}>
                <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 4px' }}>
                  {i + 1}. {item.question}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: 0, lineHeight: 1.5,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.answer}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <SBtn onClick={() => { setEditId(item._id); setDraft({}) }} variant="ghost" style={{ padding: '6px 10px' }}><FiEdit3 size={12} /></SBtn>
                <SBtn onClick={() => del(item._id)} variant="danger" style={{ padding: '6px 10px' }}><FiTrash2 size={12} /></SBtn>
              </div>
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <div style={{ background: 'rgba(175,122,109,0.06)', borderRadius: '10px', padding: '16px', marginTop: '12px', border: '1px dashed rgba(175,122,109,0.3)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>New FAQ</p>
          <Field label="Question" value={newItem.question} onChange={v => setNewItem(n => ({ ...n, question: v }))} />
          <Field label="Answer" value={newItem.answer} onChange={v => setNewItem(n => ({ ...n, answer: v }))} multiline />
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create}><FiPlus size={12} /> Add</SBtn>
            <SBtn onClick={() => { setAdding(false); setNewItem({ question: '', answer: '' }) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAdding(true)} variant="ghost" style={{ marginTop: '8px' }}><FiPlus size={13} /> Add FAQ</SBtn>
      )}
    </>
  )
}

// ─── LEGACY CONTENT FIELD (for Services / About / Blogs) ─────────────────────
function ContentField({ field, section }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(field.value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const isLong = value.length > 80

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await axios.put(`${API}/api/content`, { section, key: field.key, value }, { headers: authH() })
      setSaved(true); setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch { setError('Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ background: 'var(--white)', borderRadius: '12px', padding: '18px 22px', border: `1.5px solid ${editing ? 'rgba(175,122,109,0.4)' : 'rgba(204,199,185,0.2)'}`, transition: 'border-color 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editing ? '12px' : '6px' }}>
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '2px' }}>{field.label}</p>
          <p style={{ fontSize: '10px', color: 'rgba(60,47,47,0.3)', fontFamily: 'monospace' }}>{section}.{field.key}</p>
        </div>
        {!editing && !saved && (
          <SBtn onClick={() => setEditing(true)} variant="ghost"><FiEdit3 size={11} /> Edit</SBtn>
        )}
        {saved && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--secondary)', fontWeight: 500 }}><FiCheck size={13} /> Saved</div>}
      </div>
      {editing ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {isLong ? (
            <textarea value={value} onChange={e => setValue(e.target.value)} rows={4} autoFocus style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--secondary)', borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none', background: 'var(--bg)', color: 'var(--dark)', resize: 'vertical', lineHeight: 1.7, marginBottom: '10px', boxSizing: 'border-box' }} />
          ) : (
            <input type="text" value={value} onChange={e => setValue(e.target.value)} autoFocus style={{ width: '100%', padding: '10px 13px', border: '1.5px solid var(--secondary)', borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none', background: 'var(--bg)', color: 'var(--dark)', marginBottom: '10px', boxSizing: 'border-box' }} />
          )}
          {error && <ErrMsg msg={error} />}
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={handleSave} disabled={saving}><FiCheck size={12} /> {saving ? 'Saving...' : 'Save'}</SBtn>
            <SBtn onClick={() => { setValue(field.value); setEditing(false); setError('') }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </motion.div>
      ) : (
        <p style={{ fontSize: '14px', color: 'var(--dark)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis' }}>{value}</p>
      )}
    </div>
  )
}

// ─── LEGACY PAGE CONTENT CONFIG ──────────────────────────────────────────────
const PAGE_CONTENT = {
  services: [
    { group: 'Corporate', section: 'corporate', fields: [
      { key: 'headline', label: 'Headline', value: 'Build a Resilient, High-Performing Workforce' },
      { key: 'subheadline', label: 'Subheadline', value: 'Empower your teams with structured wellness programs.' },
      { key: 'challenge', label: 'The Challenge', value: "Today's workplaces are facing rising stress, burnout, and disengagement." },
      { key: 'approach', label: 'Our Approach', value: 'At SWA, we design customized wellness programs aligned with your organizational goals.' },
    ]},
    { group: 'Education', section: 'education', fields: [
      { key: 'headline', label: 'Headline', value: 'Building Emotionally Strong & Focused Students' },
      { key: 'subheadline', label: 'Subheadline', value: 'Helping students and educators manage stress and build emotional resilience.' },
      { key: 'challenge', label: 'The Challenge', value: 'Students today face increasing academic pressure and emotional stress.' },
      { key: 'approach', label: 'Our Approach', value: 'We deliver simple, practical, and age-appropriate programs.' },
    ]},
    { group: 'Community', section: 'community', fields: [
      { key: 'headline', label: 'Headline', value: 'Creating Healthier, More Resilient Communities' },
      { key: 'subheadline', label: 'Subheadline', value: 'Driving large-scale wellbeing initiatives that help individuals live more balanced lives.' },
      { key: 'need', label: 'The Need', value: "Stress and emotional challenges impact entire communities." },
      { key: 'approach', label: 'Our Approach', value: 'We partner with organizations, NGOs, and institutions to deliver impactful programs.' },
    ]},
  ],
  about: [
    { group: 'Founder', section: 'about', fields: [
      { key: 'founderName', label: 'Founder Name', value: 'Dhruvi Shah' },
      { key: 'founderTitle', label: 'Founder Title', value: 'Founder & Head Coach – SWA Wellness' },
      { key: 'founderBio', label: 'Founder Bio', value: 'Dhruvi Shah is the Founder and Head Wellness Coach at SWA Wellness.' },
      { key: 'founderQuote', label: 'Founder Quote', value: 'To help individuals understand and master their emotions.' },
    ]},
  ],
  blogs: [
    { group: 'Blogs Section', section: 'blogs', fields: [
      { key: 'heading', label: 'Section Heading', value: 'Latest Insights' },
      { key: 'subtext', label: 'Subtext', value: 'Explore our latest articles on wellness, mindfulness, and organizational health.' },
      { key: 'ctaText', label: 'CTA Button Text', value: 'Read All Articles' },
    ]},
  ],
}

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'blogs', label: 'Blogs' },
]

// ─── MAIN EDIT TAB ────────────────────────────────────────────────────────────
export default function EditTab() {
  const [activePage, setActivePage] = useState('home')
  const [liveFields, setLiveFields] = useState({})

  const groups = PAGE_CONTENT[activePage] || []

  const loadPageContent = useCallback(async () => {
    if (activePage === 'home') return
    const sections = groups.map(g => g.section)
    const fetched = {}
    await Promise.all(sections.map(async sec => {
      try {
        const res = await axios.get(`${API}/api/content/${sec}`)
        const dbItems = res.data.items || res.data || []
        if (Array.isArray(dbItems)) dbItems.forEach(item => { fetched[`${sec}.${item.key}`] = item.value })
      } catch { /* use defaults */ }
    }))
    setLiveFields(fetched)
  }, [activePage])

  useEffect(() => { loadPageContent() }, [loadPageContent])

  const mergedGroups = groups.map(group => ({
    ...group,
    fields: group.fields.map(f => ({ ...f, value: liveFields[`${group.section}.${f.key}`] ?? f.value }))
  }))

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 700, color: 'var(--dark)', marginBottom: '4px' }}>
          Edit Content
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>
          Manage all website sections, images, and copy directly from here.
        </p>
      </div>

      {/* Page tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {PAGES.map(page => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            style={{
              padding: '9px 22px', borderRadius: '50px',
              border: activePage === page.id ? '2px solid var(--dark)' : '1.5px solid rgba(204,199,185,0.35)',
              background: activePage === page.id ? 'var(--dark)' : 'var(--white)',
              color: activePage === page.id ? 'var(--white)' : 'var(--secondary)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease', fontFamily: 'DM Sans, sans-serif'
            }}
          >
            {page.label}
          </button>
        ))}
      </div>

      <motion.div key={activePage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {activePage === 'home' ? (
          <>
            <SectionAccordion title="Hero Banner" defaultOpen>
              <HeroManager />
            </SectionAccordion>
            <SectionAccordion title="Healing Techniques">
              <TechniquesManager category="healing" label="Technique" />
            </SectionAccordion>
            <SectionAccordion title="Expertise (Service Images)">
              <ExpertiseManager />
            </SectionAccordion>
            <SectionAccordion title="Testimonials">
              <TestimonialsManager />
            </SectionAccordion>
            <SectionAccordion title="12 Wellbeing Processes">
              <WellbeingManager />
            </SectionAccordion>
            <SectionAccordion title="Global Impact (Stats)">
              <StatsManager />
            </SectionAccordion>
            <SectionAccordion title="Media Gallery">
              <GalleryManager />
            </SectionAccordion>
            <SectionAccordion title="FAQ">
              <FaqManager />
            </SectionAccordion>
          </>
        ) : (
          mergedGroups.map(group => (
            <div key={group.section} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '4px', height: '18px', background: 'var(--secondary)', borderRadius: '2px', flexShrink: 0 }} />
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>
                  {group.group}
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {group.fields.map(field => (
                  <ContentField key={`${group.section}-${field.key}`} field={field} section={group.section} />
                ))}
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  )
}
