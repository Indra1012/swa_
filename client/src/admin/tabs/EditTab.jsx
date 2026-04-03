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
    danger: { background: 'rgba(200,50,50,0.1)', color: '#c83232', border: '1px solid rgba(200,50,50,0.2)' },
    ghost: { background: 'var(--bg)', color: 'var(--secondary)', border: '1px solid rgba(204,199,185,0.4)' },
    accent: { background: 'var(--secondary)', color: 'var(--white)' },
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
  const [mediaMode, setMediaMode] = useState('image') // 'image' | 'video' | 'link'
  const [linkUrls, setLinkUrls] = useState(['', '', ''])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const [uploadedImgs, setUploadedImgs] = useState([])
  const [uploadedVid, setUploadedVid] = useState('')

  const imgRef = useRef(null)
  const vidRef = useRef(null)

  const loadData = async () => {
    try {
      const now = Date.now()
      const [contentRes, mediaRes] = await Promise.all([
        axios.get(`${API}/api/content/hero?t=${now}`),
        axios.get(`${API}/api/media/hero?t=${now}`) // Get uploaded files
      ])

      const items = contentRes.data.items || contentRes.data || []
      if (Array.isArray(items)) {
        items.forEach(i => {
          if (i.key === 'headline') setHeadline(i.value)
          if (i.key === 'subline') setSubline(i.value)
          if (i.key === 'mediaType') setMediaMode(i.value)
          if (i.key === 'mediaUrl') {
            try {
              const parsed = JSON.parse(i.value)
              if (Array.isArray(parsed)) {
                setLinkUrls([parsed[0] || '', parsed[1] || '', parsed[2] || ''])
              } else {
                setLinkUrls([i.value, '', ''])
              }
            } catch {
              setLinkUrls([i.value, '', ''])
            }
          }
        })
      }

      const media = mediaRes.data.media || []
      const imgItems = media.filter(m => m.type !== 'video')
      const vidItem = media.find(m => m.type === 'video')

      setUploadedImgs(imgItems)
      if (vidItem) setUploadedVid(vidItem.url)
    } catch { }
  }

  useEffect(() => { loadData() }, [])

  const saveAll = async () => {
    setSaving(true); setErr(''); setMsg('')
    try {
      const updates = [
        axios.put(`${API}/api/content`, { section: 'hero', key: 'headline', value: headline }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'hero', key: 'subline', value: subline }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'hero', key: 'mediaType', value: mediaMode }, { headers: authH() }),
      ]

      const validLinks = linkUrls.filter(l => l.trim().length > 0)
      updates.push(axios.put(`${API}/api/content`, { section: 'hero', key: 'mediaUrl', value: JSON.stringify(validLinks) }, { headers: authH() }))

      await Promise.all(updates)
      setMsg('Saved successfully!')
      setTimeout(() => setMsg(''), 2500)
    } catch (error) {
      const errorText = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error'
      setErr(`Failed to save: ${errorText}`)
    }
    finally { setSaving(false) }
  }

  const uploadFile = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr(''); setMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('section', 'hero')

      const res = await axios.post(`${API}/api/media/upload`, fd, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } })

      if (res.data?.media) {
        if (type === 'image') setUploadedImgs(prev => [...prev, res.data.media])
        if (type === 'video') setUploadedVid(res.data.media.url)
      }

      await axios.put(`${API}/api/content`, { section: 'hero', key: 'mediaType', value: type }, { headers: authH() })

      setMsg(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`)
      setTimeout(() => setMsg(''), 3000)
    } catch (error) {
      const errorText = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error'
      setErr(`Upload failed: ${errorText}`)
    }
    finally {
      setUploading(false)
      e.target.value = null // Reset input to allow re-uploading the same file
    }
  }

  const deleteUploadedImage = async (id) => {
    try {
      await axios.delete(`${API}/api/media/${id}`, { headers: authH() })
      setUploadedImgs(prev => prev.filter(m => m._id !== id))
    } catch { setErr('Failed to delete image') }
  }

  const modeBtnStyle = (active) => ({
    padding: '8px 18px', borderRadius: '8px', border: 'none',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease',
    background: active ? 'var(--dark)' : 'transparent',
    color: active ? 'var(--white)' : 'var(--secondary)',
  })

  return (
    <>
      {/* ── BACKGROUND MEDIA ── */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Background Media
        </p>

        {/* Mode selector tabs */}
        <div style={{
          display: 'inline-flex', gap: '4px', background: 'var(--bg)',
          borderRadius: '10px', padding: '4px',
          border: '1px solid rgba(204,199,185,0.35)', marginBottom: '16px'
        }}>
          <button style={modeBtnStyle(mediaMode === 'image')} onClick={() => setMediaMode('image')}>📷 Upload Image</button>
          <button style={modeBtnStyle(mediaMode === 'video')} onClick={() => setMediaMode('video')}>🎬 Upload Video</button>
          <button style={modeBtnStyle(mediaMode === 'link')} onClick={() => setMediaMode('link')}>🔗 Paste Link</button>
        </div>

        {/* Image upload */}
        {mediaMode === 'image' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {uploadedImgs.map(img => (
                <div key={img._id} style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(204,199,185,0.4)' }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => deleteUploadedImage(img._id)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}><FiX size={12} /></button>
                </div>
              ))}
              {uploadedImgs.length < 3 && (
                <div style={{ width: '120px', height: '80px', borderRadius: '8px', border: '1px dashed rgba(204,199,185,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(250,248,245,0.5)' }}>
                  <input ref={imgRef} type="file" accept="image/*" onChange={e => uploadFile(e, 'image')} style={{ display: 'none' }} />
                  <button onClick={() => imgRef.current?.click()} disabled={uploading} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <FiUpload size={16} />
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>{uploading ? '...' : 'Upload'}</span>
                  </button>
                </div>
              )}
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.5)', marginTop: '8px' }}>
              Accepts JPG, PNG, WebP. Upload up to 3 images which will automatically crossfade like a slideshow.
            </p>
          </div>
        )}

        {/* Video upload */}
        {mediaMode === 'video' && (
          <div>
            <input ref={vidRef} type="file" accept="video/*" onChange={e => uploadFile(e, 'video')} style={{ display: 'none' }} />
            <SBtn onClick={() => vidRef.current?.click()} disabled={uploading} variant="ghost">
              <FiUpload size={13} /> {uploading ? 'Uploading...' : 'Upload Hero Video'}
            </SBtn>
            <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.5)', marginTop: '8px' }}>
              Accepts MP4, WebM. Video will autoplay silently as the hero background.
            </p>
          </div>
        )}

        {/* Link / URL input */}
        {mediaMode === 'link' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[0, 1, 2].map(idx => (
              <Field
                key={idx}
                label={`Image / Video URL ${idx + 1}`}
                value={linkUrls[idx]}
                onChange={v => { const n = [...linkUrls]; n[idx] = v; setLinkUrls(n) }}
                placeholder="https://example.com/your-background.jpg"
              />
            ))}
            <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.5)', marginTop: '-4px' }}>
              Paste up to 3 direct image URLs for a slideshow, or 1 Video URL. (If any link is a .mp4/.webm video, others are ignored).
            </p>
          </div>
        )}
      </div>

      {/* ── HEADLINE — multiline so admin can press Enter for new lines ── */}
      <Field
        label="Headline"
        value={headline}
        onChange={setHeadline}
        multiline
        placeholder={"It's time to bring the SWA Magic"}
      />
      <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.45)', marginTop: '-8px', marginBottom: '14px' }}>
        Press Enter to add a new line in the headline.
      </p>

      {/* ── SUBLINE — already multiline ── */}
      <Field
        label="Subline"
        value={subline}
        onChange={setSubline}
        multiline
        placeholder="to your place and people"
      />
      <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.45)', marginTop: '-8px', marginBottom: '16px' }}>
        Press Enter to add a new line in the subline.
      </p>

      <ErrMsg msg={err} />
      {msg && <p style={{ fontSize: '12px', color: 'green', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck size={13} /> {msg}</p>}
      <SBtn onClick={saveAll} disabled={saving}><FiCheck size={12} /> {saving ? 'Saving...' : 'Save All Changes'}</SBtn>
    </>
  )
}

// ─── 2. TECHNIQUES MANAGER (shared for healing + wellbeing) ──────────────────
function TechniquesManager({ category, label }) {
  const [items, setItems] = useState([])
  const [headings, setHeadings] = useState({
    title: category === 'wellbeing' ? '12 Wellbeing Processes' : 'Healing Techniques',
    subtitle: category === 'wellbeing' ? 'A comprehensive framework for holistic transformation — mind, body and soul.' : ''
  })
  const [savingGlobal, setSavingGlobal] = useState(false)
  const [globalSaved, setGlobalSaved] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', subtitle: '', readMoreText: '', order: 0 })
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState(null)
  const fileRefs = useRef({})

  const load = useCallback(async () => {
    try {
      const now = Date.now()
      const [res, contRes] = await Promise.all([
        axios.get(`${API}/api/sections/techniques/${category}?t=${now}`),
        axios.get(`${API}/api/content/${category}?t=${now}`).catch(() => ({ data: [] }))
      ])
      setItems(res.data.items || [])

      const cmap = {}
        ; (contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
      if (Object.keys(cmap).length > 0) {
        setHeadings(h => ({
          title: cmap.title || h.title,
          subtitle: cmap.subtitle || h.subtitle
        }))
      }
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
    } catch (err) { setErr(err.response?.data?.error || err.message || 'Delete failed.') }
  }

  const create = async () => {
    if (!newItem.title) return setErr('Title is required.')
    try {
      await axios.post(`${API}/api/sections/techniques`, { ...newItem, category }, { headers: authH() })
      setNewItem({ title: '', subtitle: '', readMoreText: '', order: 0 })
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

  const saveGlobal = async () => {
    setSavingGlobal(true); setErr('')
    try {
      await Promise.all([
        axios.put(`${API}/api/content`, { section: category, key: 'title', value: headings.title }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: category, key: 'subtitle', value: headings.subtitle }, { headers: authH() })
      ])
      setGlobalSaved(true); setTimeout(() => setGlobalSaved(false), 2000)
    } catch { setErr('Save headings failed.') }
    finally { setSavingGlobal(false) }
  }

  return (
    <>
      <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(204,199,185,0.3)', marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Section Headings</p>
        <Field label="Main Title" value={headings.title} onChange={v => setHeadings(h => ({ ...h, title: v }))} placeholder="e.g. 12 Wellbeing Processes" />
        <Field label="Subtitle / Description" value={headings.subtitle} onChange={v => setHeadings(h => ({ ...h, subtitle: v }))} multiline placeholder="A comprehensive framework..." />
        <SBtn onClick={saveGlobal} disabled={savingGlobal}><FiCheck size={12} /> {globalSaved ? 'Saved!' : 'Save Headings'}</SBtn>
      </div>

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
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Display Order</p>
                <input type="text" value={draft.order !== undefined ? draft.order : (item.order ?? '')} onChange={e => setDraft(d => ({ ...d, order: e.target.value }))} placeholder="0" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(204,199,185,0.2)', borderRadius: '6px', color: 'var(--secondary)', fontSize: '12px', fontWeight: 700 }}>
                {item.order || 0}
              </div>
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
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Display Order</p>
            <input type="text" value={newItem.order} onChange={e => setNewItem(n => ({ ...n, order: e.target.value }))} placeholder="0" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create}><FiPlus size={12} /> Add</SBtn>
            <SBtn onClick={() => { setAdding(false); setNewItem({ title: '', subtitle: '', readMoreText: '', order: 0 }) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAdding(true)} variant="ghost" style={{ marginTop: '8px' }}><FiPlus size={13} /> Add {label}</SBtn>
      )}
    </>
  )
}

// ─── 3. EXPERTISE / SERVICES MANAGER ─────────────────────────────────────────
function ExpertiseManager() {
  const [items, setItems] = useState([])
  const [globalData, setGlobalData] = useState({ heading: '', subheading: '' })
  const [globalSaved, setGlobalSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})

  // Media states for active draft
  const [mediaMode, setMediaMode] = useState('image')
  const [linkUrl, setLinkUrl] = useState('')
  const [uploadedImg, setUploadedImg] = useState('')
  const [uploadedVid, setUploadedVid] = useState('')
  const [uploading, setUploading] = useState(false)

  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const imgRef = useRef(null)
  const vidRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const now = Date.now()
      const gRes = await axios.get(`${API}/api/content/services?t=${now}`)
      const d = gRes.data?.items || []
      const map = {}
      d.forEach(i => { map[i.key] = i.value })
      setGlobalData({
        subheading: map.services_subheading || 'Wellbeing for every environment.'
      })

      const res = await axios.get(`${API}/api/sections/services?t=${now}`)
      setItems(res.data.items || [])
    } catch (error) {
      setErr(`Failed to load services: ${error.message} - ${error.response?.data?.error || ''} - ${error.response?.status || ''}`)
      console.error("Load services error", error)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveGlobal = async () => {
    try {
      setLoading(true)
      await Promise.all([
        axios.put(`${API}/api/content`, { section: 'services', key: 'services_subheading', value: globalData.subheading }, { headers: authH() })
      ])
      setGlobalSaved(true); setTimeout(() => setGlobalSaved(false), 2000)
    } catch { setErr('Save failed.') } finally { setLoading(false) }
  }

  const startEdit = (item) => {
    setDraft({ ...item })
    setEditId(item._id)
    setAdding(false)
    setMediaMode(item.mediaMode || 'image')
    if (item.mediaMode === 'link') setLinkUrl(item.image)
    if (item.mediaMode === 'video') setUploadedVid(item.image)
    if (item.mediaMode !== 'video' && item.mediaMode !== 'link') setUploadedImg(item.image)
    setErr(''); setMsg('')
  }

  const saveCard = async () => {
    if (!draft.title || !draft.typeSlug) return setErr('Title and Slug are required.')

    // Create pristine payload without mutating react state directly
    const payload = { ...draft }
    if (mediaMode === 'link') payload.image = linkUrl
    else if (mediaMode === 'video') payload.image = uploadedVid
    else payload.image = uploadedImg
    payload.mediaMode = mediaMode

    try {
      setLoading(true); setErr(''); setMsg('')
      if (adding) await axios.post(`${API}/api/sections/services`, payload, { headers: authH() })
      else await axios.put(`${API}/api/sections/services/${editId}`, payload, { headers: authH() })

      setEditId(null); setAdding(false); setDraft({})
      setUploadedImg(''); setUploadedVid(''); setLinkUrl('')
      setMsg('Card saved successfully!')
      setTimeout(() => setMsg(''), 3000)
      load()
    } catch (error) {
      setErr(error.response?.data?.error || error.message || 'Card save failed.')
    } finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this card?')) return
    try {
      await axios.delete(`${API}/api/sections/services/${id}`, { headers: authH() })
      load()
    } catch (err) { setErr(err.response?.data?.error || err.message || 'Delete failed.') }
  }

  const uploadFile = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isTemp = adding
    let targetId = editId
    if (isTemp) {
      if (!draft.title) return setErr("Please draft a title first, so we can save the structure before uploading media.")
      try {
        const payload = { ...draft, mediaMode: type }
        const res = await axios.post(`${API}/api/sections/services`, payload, { headers: authH() })
        targetId = res.data.item._id
        setEditId(targetId)
        setAdding(false)
      } catch (error) {
        return setErr(error.response?.data?.error || "Failed creating card to upload against.")
      }
    }

    setUploading(true); setErr(''); setMsg('')
    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await axios.post(`${API}/api/sections/services/${targetId}/image`, fd, { headers: authH() })
      if (res.data?.item) {
        if (type === 'image') setUploadedImg(res.data.item.image)
        if (type === 'video') setUploadedVid(res.data.item.image)
        setMsg(`${type === 'video' ? 'Video' : 'Image'} uploaded successfully! Click 'Save Card' to confirm.`)
      }
    } catch (err) { setErr(err.response?.data?.error || 'Upload failed') }
    finally { setUploading(false); e.target.value = null }
  }

  const modeBtnStyle = (active) => ({
    padding: '6px 14px', borderRadius: '6px', border: 'none',
    fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'var(--dark)' : 'transparent',
    color: active ? 'var(--white)' : 'var(--secondary)'
  })

  // Preview Resolver
  let previewUrl = ''
  let isVideoPreview = false
  if (mediaMode === 'link') {
    previewUrl = linkUrl
    isVideoPreview = /\.(mp4|webm|ogg)(\?|$)/i.test(linkUrl)
  } else if (mediaMode === 'video') {
    previewUrl = uploadedVid; isVideoPreview = true;
  } else { previewUrl = uploadedImg }

  return (
    <div style={{ paddingBottom: '20px' }}>
      {/* Global Headers */}
      <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(204,199,185,0.3)', marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Section Titles</p>
        <Field label="Subheading" value={globalData.subheading} onChange={v => setGlobalData(g => ({ ...g, subheading: v }))} placeholder="Wellbeing for every..." />
        <SBtn onClick={saveGlobal} disabled={loading}><FiCheck size={12} /> {globalSaved ? 'Titles Saved!' : 'Save Titles'}</SBtn>
      </div>

      <ErrMsg msg={err} />
      {msg && <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck size={12} color="green" /> {msg}</p>}

      {/* Existing Items */}
      {items.map(item => (
        <div key={item._id} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', border: '1px solid rgba(204,199,185,0.25)' }}>
          {editId === item._id && !adding ? (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Slug (For URL)" value={draft.typeSlug} onChange={v => setDraft(n => ({ ...n, typeSlug: v }))} placeholder="e.g. corporate" />
                <Field label="Display Order (e.g. 1)" value={draft.order} onChange={v => setDraft(n => ({ ...n, order: v }))} placeholder="1" />
              </div>
              <Field label="Card Title" value={draft.title} onChange={v => setDraft(n => ({ ...n, title: v }))} placeholder="Corporate Wellbeing" />
              <Field label="Headline" value={draft.headline} onChange={v => setDraft(n => ({ ...n, headline: v }))} multiline placeholder="Build a Resilient Workforce" />
              <Field label="Description" value={draft.description} onChange={v => setDraft(n => ({ ...n, description: v }))} multiline />

              {/* Media Manager for Card */}
              <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '10px', border: '1px dashed rgba(204,199,185,0.8)' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Card Background Media</p>
                <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--bg)', borderRadius: '8px', padding: '4px', marginBottom: '12px' }}>
                  <button style={modeBtnStyle(mediaMode === 'image')} onClick={() => setMediaMode('image')}>📷 Image</button>
                  <button style={modeBtnStyle(mediaMode === 'video')} onClick={() => setMediaMode('video')}>🎬 Video</button>
                  <button style={modeBtnStyle(mediaMode === 'link')} onClick={() => setMediaMode('link')}>🔗 URL Link</button>
                </div>

                {mediaMode === 'image' && (
                  <div>
                    <input ref={imgRef} type="file" accept="image/*" onChange={e => uploadFile(e, 'image')} style={{ display: 'none' }} />
                    <SBtn onClick={() => imgRef.current?.click()} disabled={uploading} variant="ghost"><FiUpload size={12} /> {uploading ? 'Uploading...' : 'Upload Image'}</SBtn>
                    <p style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>Please upload a 16:9 ratio image.</p>
                  </div>
                )}
                {mediaMode === 'video' && (
                  <div>
                    <input ref={vidRef} type="file" accept="video/*" onChange={e => uploadFile(e, 'video')} style={{ display: 'none' }} />
                    <SBtn onClick={() => vidRef.current?.click()} disabled={uploading} variant="ghost"><FiUpload size={12} /> {uploading ? 'Uploading...' : 'Upload Video'}</SBtn>
                  </div>
                )}
                {mediaMode === 'link' && (
                  <Field value={linkUrl} onChange={setLinkUrl} placeholder="https://..." />
                )}

                {/* Live Preview Box */}
                {previewUrl && (
                  <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden', height: '120px', width: '200px', background: '#ccc', position: 'relative' }}>
                    {isVideoPreview ? (
                      <video src={previewUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '9px' }}>PREVIEW</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <SBtn onClick={saveCard} disabled={loading}><FiCheck size={12} /> Save Card</SBtn>
                <SBtn onClick={() => { setEditId(null); setErr(''); setMsg(''); }} variant="ghost" disabled={loading}><FiX size={12} /> Cancel</SBtn>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--white)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.1)' }}>
                  {(item.mediaMode === 'video' || (item.mediaMode === 'link' && /\.(mp4|webm|ogg)(\?|$)/i.test(item.image))) ? (
                    <video src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : item.image ? (
                    <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '10px', color: '#aaa' }}>N/A</span>
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                    <span style={{ color: 'var(--secondary)', marginRight: '6px' }}>#{item.order || 0}</span> {item.title}
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--secondary)' }}>{item.headline || 'No headline set'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <SBtn onClick={() => startEdit(item)} variant="ghost" style={{ padding: '6px 10px' }}><FiEdit3 size={12} /></SBtn>
                <SBtn onClick={() => del(item._id)} variant="danger" style={{ padding: '6px 10px' }}><FiTrash2 size={12} /></SBtn>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add New */}
      {adding && (
        <div style={{ background: 'rgba(175,122,109,0.06)', borderRadius: '10px', padding: '16px', marginTop: '12px', border: '1px dashed rgba(175,122,109,0.3)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>New Program Card</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Title" value={draft.title} onChange={v => { setDraft(n => ({ ...n, title: v })); if (!draft.typeSlug) setDraft(n => ({ ...n, typeSlug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })) }} placeholder="e.g. Corporate Wellbeing" />
            <Field label="Display Order" value={draft.order} onChange={v => setDraft(n => ({ ...n, order: v }))} placeholder="1" />
          </div>
          <Field label="Slug (For URL)" value={draft.typeSlug} onChange={v => setDraft(n => ({ ...n, typeSlug: v }))} placeholder="corporate-wellbeing" />
          <Field label="Headline" value={draft.headline} onChange={v => setDraft(n => ({ ...n, headline: v }))} multiline />
          <Field label="Description" value={draft.description} onChange={v => setDraft(n => ({ ...n, description: v }))} multiline />
          <p style={{ fontSize: '11px', color: 'var(--secondary)', marginBottom: '16px' }}>Save first to unlock image/video uploading.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={saveCard} disabled={loading}><FiPlus size={12} /> Create Card</SBtn>
            <SBtn onClick={() => { setAdding(false); setErr(''); setMsg(''); }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      )}
      {!adding && (
        <SBtn onClick={() => { setAdding(true); setDraft({ title: '', typeSlug: '', headline: '', description: '', image: '', mediaMode: 'image', order: items.length + 1 }); setUploadedImg(''); setUploadedVid(''); setLinkUrl(''); setMediaMode('image'); setErr(''); setMsg(''); }} variant="ghost" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}><FiPlus size={13} /> Add New Program Card</SBtn>
      )}
    </div>
  )
}

// ─── 4. TESTIMONIALS MANAGER ─────────────────────────────────────────────────
function TestimonialsManager() {
  const [items, setItems] = useState([])
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', rating: 5, quote: '', text: '', position: 'last' })
  const [err, setErr] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [headings, setHeadings] = useState({
    title: 'Voices of SWA',
    subtitle: 'Hear directly from the organizations and individuals experiencing the profound shifts of a mindful workplace.'
  })

  const load = useCallback(async () => {
    try {
      const [testRes, contRes] = await Promise.all([
        axios.get(`${API}/api/sections/testimonials`),
        axios.get(`${API}/api/content/testimonials`).catch(() => ({ data: [] }))
      ])
      setItems(testRes.data.items || [])

      const cmap = {}
        ; (contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
      if (Object.keys(cmap).length > 0) {
        setHeadings(h => ({
          title: cmap.title !== undefined ? cmap.title : h.title,
          subtitle: cmap.subtitle !== undefined ? cmap.subtitle : h.subtitle
        }))
      }
      setLoaded(true)
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
    } catch (err) { setErr(err.response?.data?.error || err.message || 'Delete failed.') }
  }

  const create = async () => {
    if (!newItem.name || !newItem.quote) return setErr('Name and quote are required.')
    try {
      const timestamp = Date.now()
      const payload = {
        name: newItem.name,
        rating: newItem.rating,
        quote: newItem.quote,
        text: newItem.text,
        order: newItem.position === 'first' ? -timestamp : timestamp
      }
      await axios.post(`${API}/api/sections/testimonials`, payload, { headers: authH() })
      setNewItem({ name: '', rating: 5, quote: '', text: '', position: 'last' })
      setAdding(false); load()
    } catch { setErr('Create failed.') }
  }

  const StarPicker = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '20px', color: n <= value ? 'rgba(226,212,186,0.9)' : 'rgba(226,212,186,0.25)',
          padding: '2px', transition: 'color 0.2s ease'
        }}>★</button>
      ))}
    </div>
  )

  if (!loaded) return <ErrMsg msg="Loading..." />

  return (
    <>
      <ErrMsg msg={err} />

      {/* Headings Editor */}
      <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Section Headings</p>
        <ContentField section="testimonials" field={{ key: 'title', label: 'Main Title', value: headings.title }} />
        <ContentField section="testimonials" field={{ key: 'subtitle', label: 'Sub Title (Description)', value: headings.subtitle }} />
      </div>

      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Testimonial Cards</p>
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
                  {[1, 2, 3, 4, 5].map(n => (
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
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setNewItem(ni => ({ ...ni, rating: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: n <= newItem.rating ? 'rgba(226,212,186,0.9)' : 'rgba(226,212,186,0.25)', padding: '2px' }}>★</button>
            ))}
          </div>
          <Field label="Quote (short headline)" value={newItem.quote} onChange={v => setNewItem(n => ({ ...n, quote: v }))} />
          <Field label="Full Text" value={newItem.text} onChange={v => setNewItem(n => ({ ...n, text: v }))} multiline />
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Position in List</p>
            <select
              value={newItem.position}
              onChange={e => setNewItem(n => ({ ...n, position: e.target.value }))}
              style={{
                width: '100%', padding: '10px 13px', borderRadius: '8px',
                border: '1.5px solid rgba(204,199,185,0.35)', background: 'var(--bg)',
                fontSize: '13px', cursor: 'pointer', outline: 'none', color: 'var(--dark)'
              }}
            >
              <option value="first">Add to Beginning (First)</option>
              <option value="last">Add to End (Last)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create}><FiPlus size={12} /> Add</SBtn>
            <SBtn onClick={() => { setAdding(false); setNewItem({ name: '', rating: 5, quote: '', text: '', position: 'last' }) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
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
    }).catch(() => { })
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
  const [newItem, setNewItem] = useState({ value: '', suffix: '', label: '', order: '' })
  const [err, setErr] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [headings, setHeadings] = useState({
    title: 'Our global impact',
  })

  const load = useCallback(async () => {
    try {
      const [res, contRes] = await Promise.all([
        axios.get(`${API}/api/sections/stats`),
        axios.get(`${API}/api/content/stats`).catch(() => ({ data: [] }))
      ])

      const cmap = {}
        ; (contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
      if (Object.keys(cmap).length > 0) {
        setHeadings(h => ({
          title: cmap.title || h.title
        }))
      }

      setItems(res.data.items || [])
      setLoaded(true)
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
      await axios.post(`${API}/api/sections/stats`, { ...newItem, value: Number(newItem.value) || 0, order: Number(newItem.order) || 0 }, { headers: authH() })
      setNewItem({ value: '', suffix: '', label: '', order: '' })
      setAdding(false); load()
    } catch { setErr('Create failed.') }
  }

  if (!loaded) return <ErrMsg msg="Loading..." />

  return (
    <>
      <ErrMsg msg={err} />

      {/* Headings Editor */}
      <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Section Headings</p>
        <ContentField section="stats" field={{ key: 'title', label: 'Main Title', value: headings.title }} />
      </div>

      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Impact Stats</p>
      {items.map(item => (
        <div key={item._id} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', border: '1px solid rgba(204,199,185,0.25)' }}>
          {editId === item._id ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Value (number)" value={String(draft.value ?? item.value)} onChange={v => setDraft(d => ({ ...d, value: v }))} placeholder="450" />
                <Field label="Suffix" value={draft.suffix ?? item.suffix} onChange={v => setDraft(d => ({ ...d, suffix: v }))} placeholder="+" />
              </div>
              <Field label="Label" value={draft.label ?? item.label} onChange={v => setDraft(d => ({ ...d, label: v }))} placeholder="Organizations\nTransformed" />
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Display Order</p>
                <input type="text" value={draft.order !== undefined ? draft.order : (item.order ?? '')} onChange={e => setDraft(d => ({ ...d, order: e.target.value }))} placeholder="0" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order: #{item.order || 0}</p>
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
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Display Order</p>
            <input type="text" value={newItem.order} onChange={e => setNewItem(n => ({ ...n, order: e.target.value }))} placeholder="0" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
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

// ─── 7b. FAQ MANAGER ─────────────────────────────────────────────────────────
function FaqManager() {
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ question: '', answer: '', order: '' })

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/sections/faqs`)
      setItems(res.data.items || [])
    } catch {
      setErr('Failed to load FAQs.')
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (id) => {
    try {
      await axios.put(`${API}/api/sections/faqs/${id}`, {
        ...draft,
        order: draft.order !== undefined ? Number(draft.order) : undefined
      }, { headers: authH() })
      setEditId(null); setDraft({}); load()
    } catch { setErr('Save failed.') }
  }

  const create = async () => {
    if (!newItem.question.trim() || !newItem.answer.trim()) return setErr('Question and Answer are required.')
    try {
      await axios.post(`${API}/api/sections/faqs`, {
        question: newItem.question, answer: newItem.answer, order: Number(newItem.order) || 0
      }, { headers: authH() })
      setAdding(false); setNewItem({ question: '', answer: '', order: '' }); load()
    } catch { setErr('Create failed.') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return
    try {
      await axios.delete(`${API}/api/sections/faqs/${id}`, { headers: authH() })
      load()
    } catch { setErr('Delete failed.') }
  }

  if (!loaded) return <ErrMsg msg="Loading..." />

  return (
    <>
      <ErrMsg msg={err} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, idx) => (
          <div key={item._id} style={{ background: 'var(--bg)', borderRadius: '12px', padding: '16px 18px', border: '1px solid rgba(204,199,185,0.25)' }}>
            {editId === item._id ? (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Question</p>
                  <textarea value={draft.question ?? item.question} onChange={e => setDraft(d => ({ ...d, question: e.target.value }))} rows={2} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', lineHeight: 1.6, color: 'var(--dark)', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Answer</p>
                  <textarea value={draft.answer ?? item.answer} onChange={e => setDraft(d => ({ ...d, answer: e.target.value }))} rows={4} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', lineHeight: 1.6, color: 'var(--dark)', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Display Order</p>
                  <input type="number" value={draft.order ?? item.order ?? 0} onChange={e => setDraft(d => ({ ...d, order: e.target.value }))} style={{ width: '100px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                  <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Order #{item.order ?? idx}</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 6px', lineHeight: 1.4 }}>{item.question}</p>
                  <p style={{ fontSize: '13px', color: 'var(--secondary)', margin: 0, lineHeight: 1.6 }}>{item.answer}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginTop: '4px' }}>
                  <SBtn onClick={() => { setEditId(item._id); setDraft({}) }} variant="ghost" style={{ padding: '6px 10px' }}><FiEdit3 size={12} /></SBtn>
                  <SBtn onClick={() => del(item._id)} variant="danger" style={{ padding: '6px 10px' }}><FiTrash2 size={12} /></SBtn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div style={{ background: 'rgba(175,122,109,0.06)', borderRadius: '12px', padding: '18px', marginTop: '14px', border: '1px dashed rgba(175,122,109,0.3)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>New FAQ</p>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Question</p>
            <textarea value={newItem.question} onChange={e => setNewItem(n => ({ ...n, question: e.target.value }))} rows={2} placeholder="Write the question..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', lineHeight: 1.6, outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Answer</p>
            <textarea value={newItem.answer} onChange={e => setNewItem(n => ({ ...n, answer: e.target.value }))} rows={4} placeholder="Write the answer..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', lineHeight: 1.6, outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Display Order</p>
            <input type="number" value={newItem.order} onChange={e => setNewItem(n => ({ ...n, order: e.target.value }))} placeholder="0" style={{ width: '100px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create}><FiPlus size={12} /> Add FAQ</SBtn>
            <SBtn onClick={() => { setAdding(false); setNewItem({ question: '', answer: '', order: '' }) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAdding(true)} variant="ghost" style={{ marginTop: '14px' }}><FiPlus size={13} /> Add New FAQ</SBtn>
      )}
    </>
  )
}

// ─── 8. GALLERY MANAGER ──────────────────────────────────────────────────────
const SIZE_VARIANTS = ['medium', 'large']


function GalleryManager() {
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState(false)
  const [addingVideo, setAddingVideo] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [headings, setHeadings] = useState({ tagline: 'Our World', title: 'Moments of transformation' })
  const [sectionVisible, setSectionVisible] = useState(true)
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const [res, contRes] = await Promise.all([
        axios.get(`${API}/api/sections/gallery`),
        axios.get(`${API}/api/content/gallery`).catch(() => ({ data: [] }))
      ])

      const cmap = {}
        ; (contRes.data.items || contRes.data || []).forEach(i => cmap[i.key] = i.value)
      if (Object.keys(cmap).length > 0) {
        setHeadings(h => ({
          tagline: cmap.tagline || h.tagline,
          title: cmap.title || h.title
        }))
        if (cmap.visible !== undefined) setSectionVisible(cmap.visible !== 'false')
      }

      setItems(res.data.items || [])
      setLoaded(true)
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
        { url: videoUrl, type: 'video' },
        { headers: authH() }
      )
      setVideoUrl(''); setAddingVideo(false); load()
    } catch { setErr('Add failed.') }
  }

  const save = async (id) => {
    try {
      await axios.put(`${API}/api/sections/gallery/${id}`, draft, { headers: authH() })
      setEditId(null); load()
    } catch { setErr('Save failed.') }
  }

  const del = async (id) => {
    if (!window.confirm('Remove this item?')) return
    try {
      await axios.delete(`${API}/api/sections/gallery/${id}`, { headers: authH() })
      load()
    } catch { setErr('Delete failed.') }
  }

  if (!loaded) return <ErrMsg msg="Loading..." />

  return (
    <>
      <ErrMsg msg={err} />

      {/* Section Visibility Toggle */}
      <div style={{
        marginBottom: '28px', padding: '18px 20px',
        background: sectionVisible ? 'rgba(80,160,80,0.06)' : 'rgba(200,60,60,0.06)',
        border: `1.5px solid ${sectionVisible ? 'rgba(80,160,80,0.25)' : 'rgba(200,60,60,0.25)'}`,
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--dark)' }}>
            {sectionVisible ? '✅ Gallery Section is Visible' : '🙈 Gallery Section is Hidden'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--secondary)' }}>
            {sectionVisible ? 'The entire gallery (heading + images) is shown on the website.' : 'The entire gallery section is completely hidden from the website.'}
          </p>
        </div>
        <button
          onClick={async () => {
            const next = !sectionVisible
            setSectionVisible(next)
            try {
              await axios.put(`${API}/api/content`, { section: 'gallery', key: 'visible', value: String(next) }, { headers: authH() })
            } catch { setSectionVisible(!next); setErr('Could not update visibility.') }
          }}
          style={{
            flexShrink: 0,
            padding: '9px 22px', borderRadius: '20px', border: 'none',
            background: sectionVisible ? 'rgba(200,60,60,0.12)' : 'rgba(80,160,80,0.15)',
            color: sectionVisible ? '#c83c3c' : '#3a9a3a',
            fontWeight: 700, fontSize: '12px', letterSpacing: '1px',
            textTransform: 'uppercase', cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
        >
          {sectionVisible ? 'Hide Section' : 'Show Section'}
        </button>
      </div>

      {/* Headings Editor */}
      <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Section Headings</p>
        <ContentField section="gallery" field={{ key: 'tagline', label: 'Tagline', value: headings.tagline }} />
        <ContentField section="gallery" field={{ key: 'title', label: 'Main Title', value: headings.title }} />
      </div>

      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gallery Items</p>

      {/* Upload image */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input type="file" accept="image/*,video/*" style={{ display: 'none' }} ref={fileRef} onChange={uploadImage} />
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={addVideo}><FiPlus size={12} /> Add Video</SBtn>
            <SBtn onClick={() => { setAddingVideo(false); setVideoUrl('') }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAddingVideo(true)} variant="ghost" style={{ marginBottom: '16px' }}><FiPlus size={13} /> Add Video URL</SBtn>
      )}

      {/* List of current items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        {items.map(item => (
          <div key={item._id} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px', border: '1px solid rgba(204,199,185,0.25)', display: 'flex', gap: '16px' }}>
            {/* Image Preview */}
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--dark)' }}>
              {item.type === 'video' ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '24px', color: 'white' }}>▶</span></div>
              ) : (
                <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              {editId === item._id ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Name / Title" value={draft.title ?? item.title ?? ''} onChange={v => setDraft(d => ({ ...d, title: v }))} placeholder="Alina R." />
                    <Field label="Subtitle / Role" value={draft.subtitle ?? item.subtitle ?? ''} onChange={v => setDraft(d => ({ ...d, subtitle: v }))} placeholder="Senior Therapist" />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Description (optional — shows Read More)</p>
                    <textarea
                      value={draft.description ?? item.description ?? ''}
                      onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                      placeholder="Write a short description that appears on hover with a Read More effect..."
                      rows={3}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px',
                        border: '1.5px solid rgba(204,199,185,0.4)', background: 'var(--bg)',
                        fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                        resize: 'vertical', lineHeight: 1.6, color: 'var(--dark)', outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Card Size Orientation</p>
                    <select value={draft.sizeVariant ?? item.sizeVariant} onChange={e => setDraft(d => ({ ...d, sizeVariant: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>
                      {SIZE_VARIANTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                    <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--dark)' }}>{item.title || 'No Title Provided'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--secondary)' }}>{item.subtitle || 'No Subtitle'} • {item.sizeVariant}</p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                    <SBtn onClick={() => { setEditId(item._id); setDraft({}) }} variant="ghost" style={{ padding: '6px 10px' }}><FiEdit3 size={12} /></SBtn>
                    <SBtn onClick={() => del(item._id)} variant="danger" style={{ padding: '6px 10px' }}><FiTrash2 size={12} /></SBtn>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
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
  const isArrayField = ['offerings', 'formats', 'outcomes'].includes(field.key)
  const isLong = value.length > 80 || isArrayField

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
            <textarea value={value} onChange={e => setValue(e.target.value)} rows={isArrayField ? 5 : 4} autoFocus style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--secondary)', borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none', background: 'var(--bg)', color: 'var(--dark)', resize: 'vertical', lineHeight: 1.7, marginBottom: '10px', boxSizing: 'border-box' }} />
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
    {
      group: 'Corporate', section: 'corporate', fields: [
        { key: 'challenge', label: 'The Challenge', value: "Today's workplaces are facing rising stress, burnout, disengagement, and declining focus. While organizations push for higher performance, the emotional and mental foundation of employees is often overlooked." },
        { key: 'approach', label: 'Our Approach', value: 'At SWA, we design customized wellbeing programs aligned with your organizational goals. Our approach is practical, structured, and outcome-driven—ensuring real behavioral change, not just temporary motivation.' },
        { key: 'offerings', label: 'What We Offer (One per line)', value: "Corporate Wellbeing Programs\nEmotional Resilience Workshops\nStress Management Sessions\nLeadership & Mindset Training" },
        { key: 'formats', label: 'Program Formats (One per line)', value: "On-site workshops\nVirtual sessions\nMulti-session engagement programs\nLeadership interventions" },
        { key: 'outcomes', label: 'Outcomes You Can Expect (One per line)', value: "Improved employee focus and productivity\nReduced stress and burnout\nHigher engagement and retention\nStronger team dynamics" },
      ]
    },
    {
      group: 'Education', section: 'education', fields: [
        { key: 'challenge', label: 'The Challenge', value: 'Students today face increasing academic pressure, distractions, and emotional stress—impacting both performance and wellbeing. Educators also face challenges in managing student engagement and emotional balance in classrooms.' },
        { key: 'approach', label: 'Our Approach', value: 'We deliver simple, practical, and age-appropriate programs that help students understand and manage their thoughts, emotions, and stress effectively.' },
        { key: 'offerings', label: 'What We Offer (One per line)', value: "Student Wellbeing Programs\nStress & Exam Anxiety Management\nFocus & Concentration Sessions\nTeacher Wellbeing Programs" },
        { key: 'formats', label: 'Program Formats (One per line)', value: "School & college workshops\nInteractive group sessions\nOngoing wellbeing programs" },
        { key: 'outcomes', label: 'Outcomes You Can Expect (One per line)', value: "Improved focus and academic performance\nBetter emotional balance\nReduced stress and anxiety\nHealthier learning environment" },
      ]
    },
    {
      group: 'Community', section: 'community', fields: [
        { key: 'challenge', label: 'The Challenge', value: 'In today’s fast-changing world, stress and emotional challenges are not limited to workplaces—they impact entire communities. There is a growing need for accessible and practical wellbeing solutions at scale.' },
        { key: 'approach', label: 'Our Approach', value: 'We partner with organizations, NGOs, and institutions to deliver impactful community wellbeing programs that are simple, scalable, and effective.' },
        { key: 'offerings', label: 'What We Offer (One per line)', value: "Community Wellbeing Programs\nStress Awareness Campaigns\nGroup Workshops & Sessions\nPublic Wellbeing Initiatives" },
        { key: 'formats', label: 'Program Formats (One per line)', value: "Large group sessions\nAwareness drives\nWorkshops & events" },
        { key: 'outcomes', label: 'Outcomes You Can Expect (One per line)', value: "Increased awareness of mental wellbeing\nPractical tools for daily stress management\nStronger, more resilient communities" },
      ]
    },
    {
      group: 'Government', section: 'government', fields: [
        { key: 'challenge', label: 'The Challenge', value: 'Public servants operate in high-stress, unpredictable environments. Constant pressure and critical decision-making can lead to chronic stress, impacting their wellbeing and the quality of public service.' },
        { key: 'approach', label: 'Our Approach', value: 'We provide practical, evidence-based wellbeing programs tailored for the public sector, helping teams build resilience, manage stress, and maintain focus in demanding roles.' },
        { key: 'offerings', label: 'What We Offer (One per line)', value: "Stress Management for First Responders\nLeadership & Decision-Making under Pressure\nMental Resilience Training\nPublic Sector Wellbeing Programs" },
        { key: 'formats', label: 'Program Formats (One per line)', value: "Department-wide initiatives\nTargeted workshops\nSpecialized training camps" },
        { key: 'outcomes', label: 'Outcomes You Can Expect (One per line)', value: "Enhanced crisis management capabilities\nReduced occupational burnout\nImproved team cohesion and morale\nBetter public service delivery" },
      ]
    },
  ],
  about: [
    {
      group: 'Founder', section: 'about', fields: [
        { key: 'founderName', label: 'Founder Name', value: 'Dhruvi Shah' },
        { key: 'founderTitle', label: 'Founder Title', value: 'Founder & Head Coach – SWA Wellbeing' },
        { key: 'founderBio', label: 'Founder Bio', value: 'Dhruvi Shah is the Founder and Head Wellbeing Coach at SWA Wellbeing.' },
        { key: 'founderQuote', label: 'Founder Quote', value: 'To help individuals understand and master their emotions.' },
      ]
    },
  ],
  blogs: [
    {
      group: 'Blogs Section', section: 'blogs', fields: [
        { key: 'heading', label: 'Section Heading', value: 'Latest Insights' },
        { key: 'subtext', label: 'Subtext', value: 'Explore our latest articles on wellbeing, mindfulness, and organizational health.' },
        { key: 'ctaText', label: 'CTA Button Text', value: 'Read All Articles' },
      ]
    },
  ],
}

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Programs' },
  { id: 'about', label: 'About' },
  { id: 'blogs', label: 'Blogs' },
]

// ─── CLIENT LOGOS MANAGER ──────────────────────────────────────────────────
function ClientLogosManager() {
  const [items, setItems] = useState([])
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [newFile, setNewFile] = useState(null)
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState(null)
  const [creating, setCreating] = useState(false)
  const fileRefs = useRef({})
  const newFileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/client-logos?t=${Date.now()}`)
      setItems(res.data.items || [])
    } catch { setErr('Failed to load logos.') }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (id) => {
    try {
      await axios.put(`${API}/api/client-logos/${id}`, draft, { headers: authH() })
      setEditId(null); load()
    } catch { setErr('Save failed.') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this logo?')) return
    try {
      await axios.delete(`${API}/api/client-logos/${id}`, { headers: authH() })
      load()
    } catch (err) { setErr(err.response?.data?.error || err.message || 'Delete failed.') }
  }

  const create = async () => {
    if (!draft.name) return setErr('Name is required.')

    setCreating(true); setErr('')
    try {
      const res = await axios.post(`${API}/api/client-logos`, { ...draft, url: draft.url || 'https://via.placeholder.com/150' }, { headers: authH() })

      if (newFile) {
        const newId = res.data.item._id
        const fd = new FormData()
        fd.append('file', newFile)
        await axios.post(`${API}/api/client-logos/${newId}/image`, fd, {
          headers: { ...authH(), 'Content-Type': 'multipart/form-data' }
        })
      }

      setDraft({})
      setNewFile(null)
      setAdding(false); load()
    } catch { setErr('Create failed.') }
    finally { setCreating(false) }
  }

  const uploadImg = async (id, file) => {
    if (!file) return
    setUploading(id)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await axios.post(`${API}/api/client-logos/${id}/image`, fd, {
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
        <div key={item._id} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', border: '1px solid rgba(204,199,185,0.25)' }}>
          {editId === item._id ? (
            <>
              <Field label="Company Name" value={draft.name ?? item.name} onChange={v => setDraft(d => ({ ...d, name: v }))} />
              <Field label="Link URL (Optional link when clicked)" value={draft.link ?? item.link ?? ''} onChange={v => setDraft(d => ({ ...d, link: v }))} placeholder="https://..." />
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Display Order</p>
                <input type="text" value={draft.order !== undefined ? draft.order : (item.order ?? '')} onChange={e => setDraft(d => ({ ...d, order: e.target.value }))} placeholder="0" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {item.url && (
                <div style={{ background: 'var(--white)', padding: '6px', borderRadius: '6px' }}>
                  <img src={item.url} alt="" style={{ height: '32px', objectFit: 'contain', width: '100px', display: 'block' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: '120px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>{item.name}</p>
                {item.link && <p style={{ fontSize: '11px', color: 'var(--secondary)', margin: '2px 0 0' }}>{item.link}</p>}
                <p style={{ fontSize: '11px', color: 'var(--secondary)', margin: '2px 0 0' }}>Order: {item.order}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} ref={el => fileRefs.current[item._id] = el} onChange={e => uploadImg(item._id, e.target.files?.[0])} />
                <SBtn onClick={() => fileRefs.current[item._id]?.click()} disabled={uploading === item._id} variant="ghost" style={{ padding: '6px 10px' }}><FiUpload size={12} /> {uploading === item._id ? '...' : 'Replace IMG'}</SBtn>
                <SBtn onClick={() => { setEditId(item._id); setDraft({}) }} variant="ghost" style={{ padding: '6px 10px' }}><FiEdit3 size={12} /></SBtn>
                <SBtn onClick={() => del(item._id)} variant="danger" style={{ padding: '6px 10px' }}><FiTrash2 size={12} /></SBtn>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div style={{ background: 'rgba(175,122,109,0.06)', borderRadius: '10px', padding: '16px', marginTop: '12px', border: '1px dashed rgba(175,122,109,0.3)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>New Client Logo</p>
          <Field label="Company Name" value={draft.name || ''} onChange={v => setDraft(d => ({ ...d, name: v }))} placeholder="ex. Acme Corp" />

          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Upload Logo Image</p>
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={newFileRef} onChange={e => setNewFile(e.target.files?.[0])} />
            <SBtn onClick={() => newFileRef.current?.click()} variant="ghost" style={{ width: '100%', justifyContent: 'center' }}>
              <FiUpload size={13} /> {newFile ? newFile.name : 'Choose local file...'}
            </SBtn>
            <p style={{ fontSize: '10px', color: 'rgba(101,50,57,0.5)', marginTop: '6px', textAlign: 'center' }}>
              For best display in the marquee, try to upload a rectangular logo.
            </p>
          </div>

          <Field label="Link URL (Optional click destination)" value={draft.link || ''} onChange={v => setDraft(d => ({ ...d, link: v }))} placeholder="https://..." />
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Display Order</p>
            <input type="text" value={draft.order || ''} onChange={e => setDraft(d => ({ ...d, order: e.target.value }))} placeholder="1" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create} disabled={creating}><FiPlus size={12} /> {creating ? 'Saving...' : 'Add'}</SBtn>
            <SBtn onClick={() => { setAdding(false); setDraft({}); setNewFile(null); setErr('') }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => { setAdding(true); setDraft({}); setNewFile(null); setErr('') }} variant="ghost" style={{ marginTop: '8px' }}><FiPlus size={13} /> Add Client Logo</SBtn>
      )}
    </>
  )
}

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
            <SectionAccordion title="Client Logos (Hero Marquee)">
              <ClientLogosManager />
            </SectionAccordion>
            <SectionAccordion title="Our Programs">
              <ExpertiseManager />
            </SectionAccordion>
            <SectionAccordion title="Healing Techniques">
              <TechniquesManager category="healing" label="Technique" />
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
