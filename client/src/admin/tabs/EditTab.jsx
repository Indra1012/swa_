import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  FiEdit3, FiCheck, FiX, FiAlertCircle, FiChevronDown,
  FiChevronUp, FiTrash2, FiPlus, FiUpload, FiToggleLeft, FiToggleRight
} from 'react-icons/fi'
import RichTextEditor from '../../components/RichTextEditor'

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
          Background Media <span style={{ textTransform: 'none', fontSize: '11px', letterSpacing: 'normal', fontStyle: 'italic', marginLeft: '6px' }}>(try to add rectangle / 16:9 ratio images only)</span>
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
    title: category === 'wellbeing' ? '12 Wellbeing Processes' : (category === 'healing' ? 'SWA Insights' : 'Healing Techniques'),
    subtitle: category === 'wellbeing' ? 'A comprehensive framework for holistic transformation — mind, body and soul.' : (category === 'healing' ? 'Honest insights on stress, resilience, and the inner work behind lasting performance.' : '')
  })
  const [savingGlobal, setSavingGlobal] = useState(false)
  const [globalSaved, setGlobalSaved] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', subtitle: '', focus: '', readMoreText: '', purpose: '', order: 0, pendingFiles: null, pendingMediaMode: 'image' })
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState(null)

  // Media modes for draft
  const [mediaMode, setMediaMode] = useState('image')
  const fileRef = useRef(null)
  const fileRefNew = useRef(null)

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

    setUploading('new')
    try {
      const res = await axios.post(`${API}/api/sections/techniques`, { ...newItem, category }, { headers: authH() })

      if (newItem.pendingFiles && newItem.pendingFiles.length > 0) {
        const id = res.data.item._id;
        const fd = new FormData()
        Array.from(newItem.pendingFiles).forEach(f => fd.append('files', f))
        await axios.post(`${API}/api/sections/techniques/${id}/images`, fd, {
          headers: { ...authH(), 'Content-Type': 'multipart/form-data' }
        }).catch(() => console.error("Initial media upload failed"))
      }

      setNewItem({ title: '', subtitle: '', focus: '', readMoreText: '', purpose: '', order: 0, pendingFiles: null, pendingMediaMode: 'image' })
      setAdding(false); load()
    } catch { setErr('Create failed.') }
    finally { setUploading(null) }
  }

  const uploadMedia = async (id, files) => {
    if (!files || files.length === 0) return
    if (mediaMode === 'image') {
      const maxLimit = category === 'healing' ? 1 : 3;
      if (files.length > maxLimit) return setErr(`Maximum ${maxLimit} image(s) allowed.`);
    }
    if (mediaMode === 'video' && files.length > 1) return setErr('Maximum 1 video allowed.')

    setUploading(id)
    try {
      const fd = new FormData()
      Array.from(files).forEach(file => fd.append('files', file))

      await axios.post(`${API}/api/sections/techniques/${id}/images`, fd, {
        headers: { ...authH(), 'Content-Type': 'multipart/form-data' }
      })
      load()
    } catch { setErr('Media upload failed.') }
    finally { setUploading(null) }
  }

  const deleteMediaItem = async (id, publicId) => {
    try {
      await axios.put(`${API}/api/sections/techniques/${id}/image/delete`, { publicId }, { headers: authH() })
      load()
    } catch { setErr('Failed to delete media item.') }
  }

  const modeBtnStyle = (active) => ({
    padding: '6px 14px', borderRadius: '6px', border: 'none',
    fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'var(--dark)' : 'transparent',
    color: active ? 'var(--white)' : 'var(--secondary)'
  })

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
              <Field label={category === 'healing' ? "Heading" : "Title"} value={draft.title ?? item.title} onChange={v => setDraft(d => ({ ...d, title: v }))} />
              {category !== 'healing' && <Field label="Subtitle" value={draft.subtitle ?? item.subtitle} onChange={v => setDraft(d => ({ ...d, subtitle: v }))} />}
              {category === 'healing' && <Field label="1 Line / Focus text" value={draft.focus ?? item.focus} onChange={v => setDraft(d => ({ ...d, focus: v }))} />}
              <Field label={category === 'healing' ? "Few Points (Write each point on a new line)" : "Read More Text"} value={draft.readMoreText ?? item.readMoreText} onChange={v => setDraft(d => ({ ...d, readMoreText: v }))} multiline />
              {category === 'healing' && <Field label="Bottom text (Purpose) - Italicized" value={draft.purpose ?? item.purpose} onChange={v => setDraft(d => ({ ...d, purpose: v }))} multiline />}
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Display Order</p>
                <input type="text" value={draft.order !== undefined ? draft.order : (item.order ?? '')} onChange={e => setDraft(d => ({ ...d, order: e.target.value }))} placeholder="0" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
              </div>

              {/* Media Manager */}
              <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '10px', border: '1px dashed rgba(204,199,185,0.8)' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Card Media</p>
                {category === 'healing' && (
                  <p style={{ fontSize: '11px', color: 'var(--secondary)', marginBottom: '12px', marginTop: '-4px', fontStyle: 'italic' }}>
                    Tip: For best layout, use a 9:16 vertical rectangle image (portrait format).
                  </p>
                )}
                <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--bg)', borderRadius: '8px', padding: '4px', marginBottom: '12px' }}>
                  <button style={modeBtnStyle(mediaMode === 'image')} onClick={() => setMediaMode('image')}>📷 {category === 'healing' ? 'Image' : 'Images (Max 3)'}</button>
                  <button style={modeBtnStyle(mediaMode === 'video')} onClick={() => setMediaMode('video')}>🎬 Video</button>
                </div>

                {mediaMode === 'image' && (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" multiple={category !== 'healing'} onChange={e => uploadMedia(item._id, e.target.files)} style={{ display: 'none' }} />
                    <SBtn onClick={() => fileRef.current?.click()} disabled={uploading === item._id} variant="ghost"><FiUpload size={12} /> {uploading === item._id ? 'Uploading...' : 'Upload Image'}</SBtn>
                  </div>
                )}
                {mediaMode === 'video' && (
                  <div>
                    <input ref={fileRef} type="file" accept="video/*" onChange={e => uploadMedia(item._id, e.target.files)} style={{ display: 'none' }} />
                    <SBtn onClick={() => fileRef.current?.click()} disabled={uploading === item._id} variant="ghost"><FiUpload size={12} /> {uploading === item._id ? 'Uploading...' : 'Upload Video'}</SBtn>
                  </div>
                )}

                {/* Preview */}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.mediaMode === 'video' && item.image && mediaMode !== 'image' ? (
                    <div style={{ position: 'relative' }}>
                      <video src={item.image} autoPlay loop muted style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                      {item.publicId && <button onClick={() => deleteMediaItem(item._id, item.publicId)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex' }}><FiX size={12} /></button>}
                    </div>
                  ) : mediaMode === 'image' && item.images && item.images.length > 0 ? (
                    item.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={img.url} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                        {img.publicId && <button onClick={() => deleteMediaItem(item._id, img.publicId)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex' }}><FiX size={12} /></button>}
                      </div>
                    ))
                  ) : mediaMode === 'image' && item.image && item.mediaMode !== 'video' ? (
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                      {item.publicId && <button onClick={() => deleteMediaItem(item._id, item.publicId)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex' }}><FiX size={12} /></button>}
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <SBtn onClick={() => save(item._id)}><FiCheck size={12} /> Save</SBtn>
                <SBtn onClick={() => { setEditId(null); setDraft({}) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {item.mediaMode === 'video' ? (
                  <video src={item.image} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                ) : (item.images && item.images.length > 0) ? (
                  item.images.map((img, idx) => (
                    <img key={idx} src={img.url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  ))
                ) : item.image ? (
                  <img src={item.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', flexShrink: 0 }} />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(204,199,185,0.2)', borderRadius: '6px', color: 'var(--secondary)', fontSize: '12px', fontWeight: 700 }}>
                {item.order || 0}
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)', margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: 0 }}>{item.subtitle}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <SBtn onClick={() => { setEditId(item._id); setDraft({}); setMediaMode(item.mediaMode || 'image') }} variant="ghost" style={{ padding: '6px 10px' }}>
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
          <Field label={category === 'healing' ? "Heading" : "Title"} value={newItem.title} onChange={v => setNewItem(n => ({ ...n, title: v }))} placeholder={`${label} title`} />
          {category !== 'healing' && <Field label="Subtitle" value={newItem.subtitle} onChange={v => setNewItem(n => ({ ...n, subtitle: v }))} placeholder="Short description" />}
          {category === 'healing' && <Field label="1 Line / Focus text" value={newItem.focus} onChange={v => setNewItem(n => ({ ...n, focus: v }))} placeholder="E.g., Thoughts, beliefs..." />}
          <Field label={category === 'healing' ? "Few Points (Write each point on a new line)" : "Read More Text"} value={newItem.readMoreText} onChange={v => setNewItem(n => ({ ...n, readMoreText: v }))} multiline placeholder={category === 'healing' ? "Point 1\nPoint 2\nPoint 3" : "Expanded description..."} />
          {category === 'healing' && <Field label="Bottom text (Purpose) - Italicized" value={newItem.purpose} onChange={v => setNewItem(n => ({ ...n, purpose: v }))} multiline placeholder="E.g., Helps individuals understand..." />}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Display Order</p>
            <input type="text" value={newItem.order} onChange={e => setNewItem(n => ({ ...n, order: e.target.value }))} placeholder="0" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
          </div>

          <div style={{ marginTop: '16px', marginBottom: '16px', background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '10px', border: '1px dashed rgba(204,199,185,0.8)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Card Media</p>
            {category === 'healing' && (
              <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.6)', marginBottom: '12px', marginTop: '-4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(175,122,109,0.12)', border: '1px solid rgba(175,122,109,0.3)', borderRadius: '4px', padding: '2px 7px', fontWeight: 700, fontSize: '11px', color: 'var(--secondary)', letterSpacing: '0.5px' }}>9:16</span>
                Use a <strong>portrait / vertical</strong> image — taller than wide (e.g. 900 × 1600 px). Landscape images will be cropped.
              </p>
            )}
            <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--bg)', borderRadius: '8px', padding: '4px', marginBottom: '12px' }}>
              <button style={modeBtnStyle(newItem.pendingMediaMode === 'image')} onClick={() => setNewItem(n => ({ ...n, pendingMediaMode: 'image', pendingFiles: null }))}>📷 {category === 'healing' ? 'Image' : 'Images (Max 3)'}</button>
              <button style={modeBtnStyle(newItem.pendingMediaMode === 'video')} onClick={() => setNewItem(n => ({ ...n, pendingMediaMode: 'video', pendingFiles: null }))}>🎬 Video</button>
            </div>

            <div>
              <input ref={fileRefNew} type="file" accept={newItem.pendingMediaMode === 'image' ? "image/*" : "video/*"} multiple={category !== 'healing' && newItem.pendingMediaMode === 'image'} onChange={e => setNewItem(n => ({ ...n, pendingFiles: e.target.files }))} style={{ display: 'none' }} />
              <SBtn onClick={() => fileRefNew.current?.click()} disabled={uploading === 'new'} variant="ghost"><FiUpload size={12} /> {uploading === 'new' ? 'Saving...' : 'Select File'}</SBtn>
            </div>

            {newItem.pendingFiles && newItem.pendingFiles.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Array.from(newItem.pendingFiles).map((file, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {newItem.pendingMediaMode === 'video' ? (
                      <video src={URL.createObjectURL(file)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                    ) : (
                      <img src={URL.createObjectURL(file)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                    )}
                    <button onClick={() => setNewItem(n => ({ ...n, pendingFiles: null }))} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex' }}><FiX size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <SBtn onClick={create} disabled={uploading === 'new'}><FiPlus size={12} /> {uploading === 'new' ? 'Saving & Uploading...' : 'Add'}</SBtn>
            <SBtn onClick={() => { setAdding(false); setNewItem({ title: '', subtitle: '', focus: '', readMoreText: '', purpose: '', order: 0, pendingFiles: null, pendingMediaMode: 'image' }) }} variant="ghost"><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn onClick={() => setAdding(true)} variant="ghost" style={{ marginTop: '8px' }}><FiPlus size={13} /> Add {label}</SBtn>
      )}
    </>
  )
}

// ─── 2b. BLOGS MANAGER (Swa Insights) ────────────────────────────────────────
function BlogsManagerInline() {
  const [blogs, setBlogs] = useState([])
  const [headings, setHeadings] = useState({ title: 'Swa Insights', subtitle: 'Reflections on growth, alignment, and coming home to yourself' })
  const [headingsSaved, setHeadingsSaved] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [adding, setAdding] = useState(false)
  const [newBlog, setNewBlog] = useState({ title: '', subtitle: '', snippet: '', readMoreText: '', order: 0, pendingFile: null })
  const [uploading, setUploading] = useState(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)
  const fileRefNew = useRef(null)

  const load = useCallback(async () => {
    try {
      const now = Date.now()
      const [blogsRes, headRes] = await Promise.all([
        axios.get(`${API}/api/sections/techniques/insights?t=${now}`),
        axios.get(`${API}/api/content/insights?t=${now}`).catch(() => ({ data: [] }))
      ])
      setBlogs((blogsRes.data.items || []).sort((a, b) => (a.order || 0) - (b.order || 0)))
      const cmap = {}
      const arr = headRes.data.items || headRes.data || []
      arr.forEach(i => cmap[i.key] = i.value)
      if (cmap.title || cmap.subtitle) setHeadings(h => ({ title: cmap.title || h.title, subtitle: cmap.subtitle || h.subtitle }))
    } catch { setErr('Failed to load.') }
  }, [])

  useEffect(() => { load() }, [load])

  const saveHeadings = async () => {
    try {
      await Promise.all([
        axios.put(`${API}/api/content`, { section: 'insights', key: 'title', value: headings.title }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'insights', key: 'subtitle', value: headings.subtitle }, { headers: authH() })
      ])
      setHeadingsSaved(true); setTimeout(() => setHeadingsSaved(false), 2500)
    } catch { setErr('Failed to save headings.') }
  }

  const saveBlog = async (id) => {
    try {
      await axios.put(`${API}/api/sections/techniques/${id}`, draft, { headers: authH() })
      setEditId(null); setDraft({}); setMsg('Saved!'); setTimeout(() => setMsg(''), 2500); load()
    } catch { setErr('Save failed.') }
  }

  const deleteBlog = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return
    try { await axios.delete(`${API}/api/sections/techniques/${id}`, { headers: authH() }); load() }
    catch { setErr('Delete failed.') }
  }

  const createBlog = async () => {
    if (!newBlog.title) return setErr('Title is required.')
    setUploading('new')
    try {
      const res = await axios.post(`${API}/api/sections/techniques`,
        { title: newBlog.title, subtitle: newBlog.subtitle, snippet: newBlog.snippet, readMoreText: newBlog.readMoreText, order: Number(newBlog.order) || 0, category: 'insights' },
        { headers: authH() })
      if (newBlog.pendingFile) {
        const fd = new FormData(); fd.append('files', newBlog.pendingFile)
        await axios.post(`${API}/api/sections/techniques/${res.data.item._id}/images`, fd, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } }).catch(() => { })
      }
      setNewBlog({ title: '', subtitle: '', snippet: '', readMoreText: '', order: 0, pendingFile: null })
      setAdding(false); setMsg('Blog created!'); setTimeout(() => setMsg(''), 2500); load()
    } catch { setErr('Create failed.') }
    finally { setUploading(null) }
  }

  const uploadImage = async (blogId, file) => {
    setUploading(blogId)
    try {
      const fd = new FormData(); fd.append('files', file)
      await axios.post(`${API}/api/sections/techniques/${blogId}/images`, fd, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } })
      load(); setMsg('Image uploaded!'); setTimeout(() => setMsg(''), 2000)
    } catch { setErr('Upload failed.') }
    finally { setUploading(null) }
  }

  const deleteImage = async (blogId, publicId) => {
    try { await axios.put(`${API}/api/sections/techniques/${blogId}/image/delete`, { publicId }, { headers: authH() }); load() }
    catch { setErr('Image delete failed.') }
  }

  const getImg = (b) => b.images?.length > 0 ? (typeof b.images[0] === 'string' ? b.images[0] : b.images[0].url) : (b.image || '')
  const getPid = (b) => b.images?.length > 0 ? (b.images[0].publicId || '') : (b.publicId || '')
  const lbl = { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px', display: 'block' }
  const inp = { width: '100%', padding: '10px 13px', border: '1.5px solid rgba(204,199,185,0.4)', borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', background: 'var(--white)', outline: 'none' }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '4px', height: '22px', background: 'var(--secondary)', borderRadius: '2px' }} />
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>Swa Insights — Blog Manager</h3>
      </div>

      {/* Page Headings */}
      <div style={{ background: 'var(--bg)', border: '1px solid rgba(204,199,185,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Page Headings</p>
        <div style={{ marginBottom: '10px' }}><span style={lbl}>Main Title</span>
          <input value={headings.title} onChange={e => setHeadings(h => ({ ...h, title: e.target.value }))} style={inp} placeholder="Swa Insights" />
        </div>
        <div style={{ marginBottom: '14px' }}><span style={lbl}>Subtitle / Tagline</span>
          <input value={headings.subtitle} onChange={e => setHeadings(h => ({ ...h, subtitle: e.target.value }))} style={inp} placeholder="Reflections on growth..." />
        </div>
        <button onClick={saveHeadings} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: headingsSaved ? 'green' : 'var(--dark)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <FiCheck size={12} /> {headingsSaved ? 'Saved!' : 'Save Headings'}
        </button>
      </div>

      <div style={{ background: 'rgba(175,122,109,0.07)', border: '1px solid rgba(175,122,109,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: 'var(--secondary)', lineHeight: 1.6 }}>
        💡 <strong>Rich Editor:</strong> Use the toolbar for headings, bold, bullets. <strong>Paste from ChatGPT</strong> — all formatting is preserved automatically.
      </div>

      {err && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c83232', padding: '8px 12px', background: 'rgba(200,50,50,0.07)', borderRadius: '8px', marginBottom: '12px' }}><FiAlertCircle size={13} /> {err}</div>}
      {msg && <div style={{ fontSize: '12px', color: 'green', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck size={13} /> {msg}</div>}

      {blogs.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--secondary)', fontSize: '14px', fontStyle: 'italic', border: '1px dashed rgba(204,199,185,0.5)', borderRadius: '12px', marginBottom: '16px' }}>
          No blogs yet. Click "Add New Blog Post" below to get started.
        </div>
      )}

      {blogs.map(blog => (
        <div key={blog._id} style={{ background: 'rgba(250,248,245,0.95)', borderRadius: '12px', padding: '16px', marginBottom: '14px', border: '1px solid rgba(204,199,185,0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          {editId === blog._id ? (
            <>
              <div style={{ marginBottom: '12px' }}><span style={lbl}>Title</span>
                <input value={draft.title ?? blog.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} style={inp} />
              </div>
              <div style={{ marginBottom: '12px' }}><span style={lbl}>Subtitle (e.g. "Mind" or tag)</span>
                <input value={draft.subtitle ?? blog.subtitle ?? ''} onChange={e => setDraft(d => ({ ...d, subtitle: e.target.value }))} style={inp} />
              </div>
              <div style={{ marginBottom: '12px' }}><span style={lbl}>Card Snippet (short preview paragraph on blog card)</span>
                <textarea value={draft.snippet ?? blog.snippet ?? ''} onChange={e => setDraft(d => ({ ...d, snippet: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '16px' }}><span style={lbl}>Full Article — paste from ChatGPT, all formatting preserved!</span>
                <RichTextEditor value={draft.readMoreText ?? blog.readMoreText ?? ''} onChange={v => setDraft(d => ({ ...d, readMoreText: v }))} placeholder="Write or paste full article here..." />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(204,199,185,0.6)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <span style={lbl}>Cover Image</span>
                {getImg(blog) && (
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <img src={getImg(blog)} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd', flexShrink: 0 }} alt="" />
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: '0 0 8px' }}>Current cover image</p>
                      {getPid(blog) && <button onClick={() => deleteImage(blog._id, getPid(blog))} style={{ background: 'rgba(200,50,50,0.1)', color: '#c83232', border: '1px solid rgba(200,50,50,0.2)', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><FiTrash2 size={11} /> Delete Image</button>}
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(blog._id, f); e.target.value = null }} />
                <button onClick={() => fileRef.current?.click()} disabled={uploading === blog._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid rgba(204,199,185,0.5)', borderRadius: '8px', background: 'var(--white)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--dark)' }}>
                  <FiUpload size={13} /> {uploading === blog._id ? 'Uploading...' : 'Upload / Replace Image'}
                </button>
                <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.5)', marginTop: '6px' }}>Portrait format recommended (e.g. 900×1400 px)</p>
              </div>
              <div style={{ marginBottom: '14px' }}><span style={lbl}>Display Order</span>
                <input type="number" value={draft.order ?? blog.order ?? 0} onChange={e => setDraft(d => ({ ...d, order: Number(e.target.value) }))} style={{ width: '80px', padding: '8px 12px', border: '1.5px solid rgba(204,199,185,0.4)', borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => saveBlog(blog._id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--dark)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}><FiCheck size={12} /> Save Blog</button>
                <button onClick={() => { setEditId(null); setDraft({}) }} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg)', color: 'var(--secondary)', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}><FiX size={12} /> Cancel</button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {getImg(blog) ? <img src={getImg(blog)} style={{ width: '44px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid rgba(204,199,185,0.4)' }} alt="" />
                : <div style={{ width: '44px', height: '56px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiUpload size={16} color="rgba(0,0,0,0.2)" /></div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', background: 'rgba(204,199,185,0.2)', borderRadius: '6px', color: 'var(--secondary)', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{blog.order || 0}</div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>{blog.title}</p>
                {blog.subtitle && <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: '2px 0 0' }}>{blog.subtitle}</p>}
                {blog.snippet && <p style={{ fontSize: '12px', color: 'var(--secondary)', margin: '2px 0 0' }}>{blog.snippet.slice(0, 80)}{blog.snippet.length > 80 ? '…' : ''}</p>}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => { setEditId(blog._id); setDraft({}) }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg)', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: 'var(--secondary)' }}><FiEdit3 size={12} /></button>
                <button onClick={() => deleteBlog(blog._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(200,50,50,0.08)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#c83232' }}><FiTrash2 size={12} /></button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div style={{ background: 'rgba(175,122,109,0.05)', border: '1px dashed rgba(175,122,109,0.3)', borderRadius: '12px', padding: '20px', marginTop: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>New Blog Post</p>
          <div style={{ marginBottom: '12px' }}><span style={lbl}>Title</span>
            <input value={newBlog.title} onChange={e => setNewBlog(n => ({ ...n, title: e.target.value }))} placeholder="Blog post title" style={inp} />
          </div>
          <div style={{ marginBottom: '12px' }}><span style={lbl}>Subtitle (e.g. "Mind" or tag)</span>
            <input value={newBlog.subtitle} onChange={e => setNewBlog(n => ({ ...n, subtitle: e.target.value }))} placeholder="Subtitle or tag..." style={inp} />
          </div>
          <div style={{ marginBottom: '12px' }}><span style={lbl}>Card Snippet (short preview paragraph on blog card)</span>
            <textarea value={newBlog.snippet} onChange={e => setNewBlog(n => ({ ...n, snippet: e.target.value }))} placeholder="Short preview paragraph..." rows={3} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '16px' }}><span style={lbl}>Full Article (paste from ChatGPT — formatting preserved!)</span>
            <RichTextEditor value={newBlog.readMoreText} onChange={v => setNewBlog(n => ({ ...n, readMoreText: v }))} placeholder="Paste your full article here..." />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(204,199,185,0.6)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
            <span style={lbl}>Cover Image</span>
            <input ref={fileRefNew} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setNewBlog(n => ({ ...n, pendingFile: f })); e.target.value = null }} />
            {newBlog.pendingFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <img src={URL.createObjectURL(newBlog.pendingFile)} style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} alt="" />
                <button onClick={() => setNewBlog(n => ({ ...n, pendingFile: null }))} style={{ background: 'rgba(200,50,50,0.1)', color: '#c83232', border: '1px solid rgba(200,50,50,0.2)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
              </div>
            )}
            <button onClick={() => fileRefNew.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid rgba(204,199,185,0.5)', borderRadius: '8px', background: 'var(--white)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--dark)' }}>
              <FiUpload size={13} /> Select Cover Image
            </button>
          </div>
          <div style={{ marginBottom: '14px' }}><span style={lbl}>Display Order</span>
            <input type="number" value={newBlog.order} onChange={e => setNewBlog(n => ({ ...n, order: Number(e.target.value) }))} style={{ width: '80px', padding: '8px 12px', border: '1.5px solid rgba(204,199,185,0.4)', borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={createBlog} disabled={uploading === 'new'} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--dark)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}><FiPlus size={12} /> {uploading === 'new' ? 'Creating...' : 'Create Blog'}</button>
            <button onClick={() => { setAdding(false); setNewBlog({ title: '', subtitle: '', readMoreText: '', order: 0, pendingFile: null }) }} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg)', color: 'var(--secondary)', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}><FiX size={12} /> Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--secondary)', marginTop: '8px' }}>
          <FiPlus size={13} /> Add New Blog Post
        </button>
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

// ─── X. CTA MANAGER ──────────────────────────────────────────────────────────
function CtaManager() {
  const [slides, setSlides] = useState([
    "It's time to bring the SWA Magic to your place and people",
    'Transform your organization with the power of wellbeing',
    'Join forward-thinking organizations on the journey to lasting wellbeing'
  ])
  const [mediaMode, setMediaMode] = useState('image') // 'image' | 'video'
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const [uploadedImgs, setUploadedImgs] = useState([])
  const [uploadedVid, setUploadedVid] = useState(null)

  const imgRef = useRef(null)
  const vidRef = useRef(null)

  const loadData = async () => {
    try {
      const now = Date.now()
      const [contentRes, mediaRes] = await Promise.all([
        axios.get(`${API}/api/content/cta?t=${now}`),
        axios.get(`${API}/api/media/cta?t=${now}`)
      ])

      const items = contentRes.data.items || contentRes.data || []
      if (Array.isArray(items)) {
        let s = [null, null, null]
        items.forEach(i => {
          if (i.key === 'slide0') s[0] = i.value
          if (i.key === 'slide1') s[1] = i.value
          if (i.key === 'slide2') s[2] = i.value
          if (i.key === 'mediaType') setMediaMode(i.value)
        })
        setSlides(prev => [
          s[0] ?? prev[0],
          s[1] ?? prev[1],
          s[2] ?? prev[2]
        ])
      }

      const media = mediaRes.data.media || []
      const imgItems = media.filter(m => m.type !== 'video')
      const vidItem = media.find(m => m.type === 'video')

      setUploadedImgs(imgItems)
      if (vidItem) setUploadedVid(vidItem)
    } catch { }
  }

  useEffect(() => { loadData() }, [])

  const saveAll = async () => {
    setSaving(true); setErr(''); setMsg('')
    try {
      const updates = [
        axios.put(`${API}/api/content`, { section: 'cta', key: 'slide0', value: slides[0] }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'cta', key: 'slide1', value: slides[1] }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'cta', key: 'slide2', value: slides[2] }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'cta', key: 'mediaType', value: mediaMode }, { headers: authH() }),
      ]

      await Promise.all(updates)
      setMsg('Saved successfully!')
      setTimeout(() => setMsg(''), 2500)
    } catch (error) {
      const errorText = error.response?.data?.error || error.response?.data?.message || 'Unknown error'
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
      fd.append('section', 'cta')

      const res = await axios.post(`${API}/api/media/upload`, fd, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } })

      if (res.data?.media) {
        if (type === 'image') setUploadedImgs(prev => [...prev, res.data.media])
        if (type === 'video') setUploadedVid(res.data.media)
      }

      await axios.put(`${API}/api/content`, { section: 'cta', key: 'mediaType', value: type }, { headers: authH() })

      setMsg(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`)
      setTimeout(() => setMsg(''), 3000)
    } catch (error) {
      setErr('Upload failed.')
    }
    finally {
      setUploading(false)
      e.target.value = null
    }
  }

  const deleteUploadedImage = async (id, isVideo = false) => {
    if (!window.confirm('Delete this media?')) return
    try {
      await axios.delete(`${API}/api/media/${id}`, { headers: authH() })
      if (isVideo) {
        setUploadedVid(null)
      } else {
        setUploadedImgs(prev => prev.filter(m => m._id !== id))
      }
    } catch { setErr('Failed to delete media') }
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
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Background Media <span style={{ textTransform: 'none', fontSize: '11px', letterSpacing: 'normal', fontStyle: 'italic', marginLeft: '6px' }}>(Upload 16:9 ratio images or video only here)</span>
        </p>

        <div style={{
          display: 'inline-flex', gap: '4px', background: 'var(--bg)',
          borderRadius: '10px', padding: '4px',
          border: '1px solid rgba(204,199,185,0.35)', marginBottom: '16px'
        }}>
          <button style={modeBtnStyle(mediaMode === 'image')} onClick={() => setMediaMode('image')}>📷 Upload Image</button>
          <button style={modeBtnStyle(mediaMode === 'video')} onClick={() => setMediaMode('video')}>🎬 Upload Video</button>
        </div>

        {mediaMode === 'image' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[0, 1, 2].map(idx => {
                const upImg = uploadedImgs[idx]
                const fallbackImg = [
                  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
                  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80',
                  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&q=80'
                ][idx]

                return (
                  <div key={idx} style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(204,199,185,0.4)', background: 'var(--bg)' }}>
                    {upImg ? (
                      <>
                        <img src={upImg.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => deleteUploadedImage(upImg._id)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Delete Image"><FiX size={12} /></button>
                      </>
                    ) : (
                      <>
                        <img src={fallbackImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(250,248,245,0.5)' }}>
                          <button onClick={() => imgRef.current?.click()} style={{ background: 'var(--white)', border: '1px solid var(--secondary)', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', color: 'var(--dark)' }}>
                            Replace
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
              <input ref={imgRef} type="file" accept="image/*" onChange={e => uploadFile(e, 'image')} style={{ display: 'none' }} />
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.5)', marginTop: '8px' }}>
              Accepts JPG, PNG, WebP. Upload up to 3 images which will automatically crossfade like a slideshow.
            </p>
          </div>
        )}

        {mediaMode === 'video' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {uploadedVid && (
                <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(204,199,185,0.4)', position: 'relative' }}>
                  <video src={uploadedVid.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => deleteUploadedImage(uploadedVid._id, true)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Delete Video"><FiX size={12} /></button>
                </div>
              )}
              <input ref={vidRef} type="file" accept="video/*" onChange={e => uploadFile(e, 'video')} style={{ display: 'none' }} />
              <SBtn onClick={() => vidRef.current?.click()} disabled={uploading} variant="ghost" style={{ marginTop: '20px' }}>
                <FiUpload size={13} /> {uploading ? 'Uploading...' : 'Upload Video'}
              </SBtn>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.5)', marginTop: '8px' }}>
              Accepts MP4, WebM. Video will autoplay silently while texts slide over it.
            </p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Sliding Text Headlines
        </p>
        {[0, 1, 2].map(idx => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <Field
              label={`Headline ${idx + 1}`}
              value={slides[idx]}
              onChange={v => { const n = [...slides]; n[idx] = v; setSlides(n) }}
              placeholder={`Text for slide ${idx + 1}`}
              multiline
            />
          </div>
        ))}
      </div>

      <ErrMsg msg={err} />
      {msg && <p style={{ fontSize: '12px', color: 'green', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck size={13} /> {msg}</p>}
      <SBtn onClick={saveAll} disabled={saving}><FiCheck size={12} /> {saving ? 'Saving...' : 'Save All Changes'}</SBtn>
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
  const isBool = field.type === 'boolean'

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await axios.put(`${API}/api/content`, { section, key: field.key, value }, { headers: authH() })
      setSaved(true); setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch { setError('Failed to save.') }
    finally { setSaving(false) }
  }

  const handleToggle = async () => {
    setSaving(true); setError('')
    try {
      const nextVal = value === 'true' ? 'false' : 'true'
      await axios.put(`${API}/api/content`, { section, key: field.key, value: nextVal }, { headers: authH() })
      setValue(nextVal)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { setError('Failed to toggle.') }
    finally { setSaving(false) }
  }

  if (isBool) {
    const isVisible = value !== 'false' // default true
    return (
      <div style={{ background: 'var(--white)', borderRadius: '12px', padding: '18px 22px', border: '1.5px solid rgba(204,199,185,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '2px' }}>{field.label}</p>
            <p style={{ fontSize: '10px', color: 'rgba(60,47,47,0.3)', fontFamily: 'monospace' }}>{section}.{field.key}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {saved && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'green', fontWeight: 500 }}><FiCheck size={13} /> Saved</div>}
            <button
              onClick={handleToggle}
              disabled={saving}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none',
                background: isVisible ? 'rgba(80,160,80,0.12)' : 'rgba(200,60,60,0.12)',
                color: isVisible ? '#3a9a3a' : '#c83c3c',
                fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              {isVisible ? 'Currently Visible (Hide)' : 'Currently Hidden (Show)'}
            </button>
          </div>
        </div>
      </div>
    )
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
      group: 'Hero Section', section: 'about', fields: [
        { key: 'heroTitle', label: 'Hero Title', value: 'The SWA Story' },
        { key: 'heroLine1', label: 'Hero Line 1', value: 'Master your emotions.' },
        { key: 'heroLine2', label: 'Hero Line 2', value: 'Lead with clarity.' },
      ]
    },
    {
      group: 'Our Story Settings', section: 'about', fields: [
        { key: 'storyTitle', label: 'Section Title', value: 'Our Story' },
        { key: 'storySubtitle', label: 'Section Subtitle', value: 'Where It All Began' },
        { key: 'storyQuote', label: 'Highlight Quote', value: '"SWA was born from one simple, undeniable truth — people are not machines."' },
        { key: 'storyP1', label: 'First Paragraph Text', value: 'In a world obsessed with productivity and performance metrics, something deeply human was being lost. The stress was visible. The burnout was real. And yet, the systems meant to support people kept treating symptoms — never roots.' },
        { key: 'storyP2', label: 'Second Highlight Text', value: 'Every program. Every session. Every technique at SWA carries the same intention: to help people think clearly, feel strongly, and perform consistently — from the inside out.' },
      ]
    },
    {
      group: 'Vision & Mission', section: 'about', fields: [
        { key: 'visionTitle', label: 'Vision Card Title', value: 'OUR VISION' },
        { key: 'visionQuote', label: 'Vision Highlight Quote', value: '"To build a world where emotional wellbeing and resilience are the foundation of human performance."' },
        { key: 'visionBullets', label: 'Vision Bullets (One per line)', value: 'Workplaces that are not just productive, but mentally strong\nInstitutions that nurture intellect and emotional balance\nIndividuals who don\'t just survive — but truly thrive' },
        { key: 'missionTitle', label: 'Mission Card Title', value: 'OUR MISSION' },
        { key: 'missionQuote', label: 'Mission Highlight Quote', value: '"To move people beyond awareness — into real, lasting transformation."' },
        { key: 'missionBullets', label: 'Mission Bullets (One per line)', value: 'Manage stress before it manages them\nBuild emotional strength that holds under pressure\nSustain high performance without burning out\nCultivate deep self-awareness to lead with unwavering clarity' },
      ]
    },
    {
      group: 'Core Philosophy', section: 'about_philosophy', fields: [
        { key: 'philosophyTitle', label: 'Section Title', value: 'Core Philosophy' },
        { key: 'philosophySubtitle', label: 'Section Subtitle', value: 'We move past quick fixes to provide structured, practical wellbeing programs that create real, lasting changes in your environment.' },
        { key: 'pillar1', label: 'Pillar 1', value: 'Performance is driven by inner stability, not external pressure.' },
        { key: 'pillar2', label: 'Pillar 2', value: 'Wellbeing is a skill that can be developed.' },
        { key: 'pillar3', label: 'Pillar 3', value: 'Transformation happens through consistent experiential learning.' },
        { key: 'pillar4', label: 'Pillar 4', value: 'Emotional awareness leads to better decisions and outcomes.' },
      ]
    },
  ],
  blogs: [],
  book_demo: [
    {
      group: 'Header & Video Section', section: 'book_demo', fields: [
        { key: 'showVideo', label: 'Toggle Video Button & Video Display', value: 'true', type: 'boolean' },
        { key: 'title', label: 'Main Title', value: 'Experience <i>SWA Wellbeing</i>' },
        { key: 'subtitle', label: 'Subtitle', value: 'Want a quick preview?' },
        { key: 'btnText', label: 'Watch Video Button Text', value: 'Watch Demo Video' },
        { key: 'videoUrl', label: 'YouTube Embed URL', value: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]
    },
    {
      group: 'Booking Form Section', section: 'book_demo', fields: [
        { key: 'formTitle', label: 'Form Section Title', value: 'Book a 30-Min <i>Google Meet</i>' },
        { key: 'formDesc', label: 'Form Section Description', value: 'Schedule a focused 1-on-1 video call session. Our team will speak with you directly to understand your needs and demonstrate exactly how SWA can elevate your organization.' },
      ]
    }
  ]
}

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Programs' },
  { id: 'about', label: 'About' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'book_demo', label: 'Book Demo' },
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

  const [tagline, setTagline] = useState('Loved by leading organizations worldwide')
  const [taglineSaving, setTaglineSaving] = useState(false)
  const [taglineMsg, setTaglineMsg] = useState('')
  const [sectionVisible, setSectionVisible] = useState(true)

  const load = useCallback(async () => {
    try {
      const [logosRes, contentRes] = await Promise.all([
        axios.get(`${API}/api/client-logos?t=${Date.now()}`),
        axios.get(`${API}/api/content/client-logos?t=${Date.now()}`)
      ])
      setItems(logosRes.data.items || [])
      const items = contentRes.data.items || []
      const tLine = items.find(i => i.key === 'tagline')
      if (tLine?.value) setTagline(tLine.value)
      const visItem = items.find(i => i.key === 'visible')
      if (visItem && visItem.value === 'false') setSectionVisible(false)
    } catch { setErr('Failed to load logos.') }
  }, [])

  useEffect(() => { load() }, [load])

  const saveTagline = async () => {
    setTaglineSaving(true); setTaglineMsg('')
    try {
      await axios.put(`${API}/api/content`, { section: 'client-logos', key: 'tagline', value: tagline }, { headers: authH() })
      setTaglineMsg('Saved!')
      setTimeout(() => setTaglineMsg(''), 2500)
    } catch { setTaglineMsg('Save failed.') }
    finally { setTaglineSaving(false) }
  }

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
      <div style={{
        marginBottom: '28px', padding: '18px 20px',
        background: sectionVisible ? 'rgba(80,160,80,0.06)' : 'rgba(200,60,60,0.06)',
        border: `1.5px solid ${sectionVisible ? 'rgba(80,160,80,0.25)' : 'rgba(200,60,60,0.25)'}`,
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--dark)' }}>
            {sectionVisible ? '✅ Client Logos Marquee is Visible' : '🙈 Client Logos Marquee is Hidden'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--secondary)' }}>
            {sectionVisible ? 'The client logo scrolling banner is shown on the website.' : 'The client logo scrolling banner is completely hidden from the website.'}
          </p>
        </div>
        <button
          onClick={async () => {
            const next = !sectionVisible
            setSectionVisible(next)
            try {
              await axios.put(`${API}/api/content`, { section: 'client-logos', key: 'visible', value: String(next) }, { headers: authH() })
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

      <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(204,199,185,0.25)' }}>
        <Field
          label="Section Tagline"
          value={tagline}
          onChange={setTagline}
          placeholder="Loved by leading organizations worldwide"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SBtn onClick={saveTagline} disabled={taglineSaving}>
            <FiCheck size={12} /> {taglineSaving ? 'Saving...' : 'Save Tagline'}
          </SBtn>
          {taglineMsg && <span style={{ fontSize: '12px', color: taglineMsg === 'Saved!' ? 'green' : '#c83232' }}>{taglineMsg}</span>}
        </div>
      </div>
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

// ─── FOUNDER MANAGER ────────────────────────────────────────────────────────
function FounderManager() {
  const [name, setName] = useState('Dhruvi Shah')
  const [title, setTitle] = useState('Founder & Head Coach')
  const [bio1, setBio1] = useState('Dhruvi Shah is the Founder and Head Wellbeing Coach at SWA Wellbeing. With a deeply rooted background in psychology, a diploma in expressive art therapy, and rich experience as an international sound healer, she brings a uniquely holistic and integrative approach to modern mental well-being.')
  const [bio2, setBio2] = useState('Her expertise extensively spans mental health wellbeing, Indian psychology, and leadership development—masterfully blending traditional ancient wisdom with structured contemporary practices.')
  const [bioQuote, setBioQuote] = useState('Dhruvi is driven by a clear mission: to help individuals understand and master their emotions before those emotions begin to shape their decisions—enabling more balanced, self-aware, and effective leadership.')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [uploadedImg, setUploadedImg] = useState({ url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80', isDefault: true })
  const imgRef = useRef(null)

  const loadData = async () => {
    try {
      const now = Date.now()
      const [contentRes, mediaRes] = await Promise.all([
        axios.get(`${API}/api/content/about?t=${now}`),
        axios.get(`${API}/api/media/founder?t=${now}`)
      ])
      const items = contentRes.data.items || contentRes.data || []
      if (Array.isArray(items)) {
        items.forEach(i => {
          if (i.key === 'founderName') setName(i.value)
          if (i.key === 'founderTitle') setTitle(i.value)
          if (i.key === 'founderBio1') setBio1(i.value)
          if (i.key === 'founderBio2') setBio2(i.value)
          if (i.key === 'founderBioQuote') setBioQuote(i.value)
        })
      }
      const media = mediaRes.data.media || []
      if (media.length > 0) setUploadedImg(media[media.length - 1])
    } catch { }
  }

  useEffect(() => { loadData() }, [])

  const saveAll = async () => {
    setSaving(true); setErr(''); setMsg('')
    try {
      await Promise.all([
        axios.put(`${API}/api/content`, { section: 'about', key: 'founderName', value: name }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'about', key: 'founderTitle', value: title }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'about', key: 'founderBio1', value: bio1 }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'about', key: 'founderBio2', value: bio2 }, { headers: authH() }),
        axios.put(`${API}/api/content`, { section: 'about', key: 'founderBioQuote', value: bioQuote }, { headers: authH() }),
      ])
      setMsg('Saved successfully!')
      setTimeout(() => setMsg(''), 2500)
    } catch (error) {
      setErr(`Failed to save: ${error.message}`)
    } finally { setSaving(false) }
  }

  const uploadFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr(''); setMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('section', 'founder')
      const res = await axios.post(`${API}/api/media/upload`, fd, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } })
      if (res.data?.media) {
        setUploadedImg(res.data.media)
      }
      setMsg(`Image uploaded successfully!`)
      setTimeout(() => setMsg(''), 3000)
    } catch (error) {
      let errorText = 'Upload failed'
      if (error.response?.data?.error) errorText = error.response.data.error;
      setErr(errorText)
    } finally {
      setUploading(false)
      e.target.value = null
    }
  }

  const deleteImage = async (id) => {
    if (uploadedImg?.isDefault) {
      setUploadedImg(null)
      return
    }
    if (!window.confirm('Delete founder image?')) return
    try {
      await axios.delete(`${API}/api/media/${id}`, { headers: authH() })
      setUploadedImg(null)
    } catch { setErr('Failed to delete image') }
  }

  return (
    <>
      <div style={{ marginBottom: '24px', background: 'rgba(250, 248, 245, 0.95)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(204,199,185,0.3)' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Founder Photo</p>
        <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '4px' }}>This image appears beside the Founder biography block.</p>
        <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.6)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ background: 'rgba(175,122,109,0.12)', border: '1px solid rgba(175,122,109,0.3)', borderRadius: '4px', padding: '2px 8px', fontWeight: 700, fontSize: '11px', color: 'var(--secondary)', letterSpacing: '0.5px' }}>9:16</span>
          Use a <strong>portrait / vertical rectangle</strong> image for the best fit — taller than wide (e.g. 900 × 1600 px).
        </p>
        {uploadedImg ? (
          <div style={{ position: 'relative', width: 'fit-content' }}>
            <img src={uploadedImg.url} style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '12px' }} alt="" />
            <button onClick={() => deleteImage(uploadedImg._id)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#c83232', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>×</button>
          </div>
        ) : (
          <div>
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={imgRef} onChange={uploadFile} />
            <SBtn onClick={() => imgRef.current?.click()} disabled={uploading}>
              <FiUpload size={13} /> {uploading ? 'Uploading...' : 'Upload Image'}
            </SBtn>
          </div>
        )}
      </div>

      <Field label="Name" value={name} onChange={setName} />
      <Field label="Title" value={title} onChange={setTitle} />
      <Field label="Bio Paragraph 1" value={bio1} onChange={setBio1} multiline={true} />
      <Field label="Bio Paragraph 2" value={bio2} onChange={setBio2} multiline={true} />
      <Field label="Quote Paragraph" value={bioQuote} onChange={setBioQuote} multiline={true} />

      {msg && <div style={{ color: 'var(--primary)', fontSize: '12px', marginBottom: '10px', background: 'rgba(50,200,50,0.1)', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}><FiCheck size={12} style={{ marginRight: '6px' }} />{msg}</div>}
      {err && <ErrMsg msg={err} />}

      <SBtn onClick={saveAll} disabled={saving}><FiCheck size={13} /> {saving ? 'Saving...' : 'Save Text Content'}</SBtn>
    </>
  )
}

// ─── TEAM MANAGER ────────────────────────────────────────────────────────────
function TeamManager() {
  const [members, setMembers] = useState([])
  const [view, setView] = useState('team') // 'team' | 'expert'
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  // Add form state
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ name: '', role: '', category: 'team', order: '' })
  const [newFile, setNewFile] = useState(null)
  const [newPreview, setNewPreview] = useState(null)
  const [creating, setCreating] = useState(false)
  const newFileRef = useRef(null)

  // Inline edit state
  const [editId, setEditId] = useState(null)
  const [editDraft, setEditDraft] = useState({})
  const [replaceFile, setReplaceFile] = useState(null)
  const [replacePreview, setReplacePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const replaceRef = useRef(null)

  const flash = (text, isErr = false) => {
    if (isErr) setErr(text); else setMsg(text)
    setTimeout(() => { setErr(''); setMsg('') }, 3000)
  }

  const loadMembers = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/team?t=${Date.now()}`)
      setMembers(res.data.items || [])
    } catch { flash('Failed to load members', true) }
    setLoading(false)
  }

  useEffect(() => { loadMembers() }, [])

  const filtered = members.filter(m => m.category === view).sort((a, b) => a.order - b.order)

  // ── ADD NEW MEMBER ──
  const handleNewFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setNewFile(f)
    setNewPreview(URL.createObjectURL(f))
  }

  const createMember = async () => {
    if (!draft.name.trim() || !draft.role.trim()) return flash('Name and Role are required', true)
    setCreating(true)
    try {
      // 1. Create the record
      const res = await axios.post(`${API}/api/team`,
        { name: draft.name, role: draft.role, category: draft.category, order: Number(draft.order) || 0 },
        { headers: authH() }
      )
      const newId = res.data.item._id

      // 2. If an image was selected, upload it immediately
      if (newFile) {
        const fd = new FormData()
        fd.append('file', newFile)
        await axios.post(`${API}/api/team/${newId}/image`, fd, {
          headers: { ...authH(), 'Content-Type': 'multipart/form-data' }
        })
      }

      flash('Member added!')
      setAdding(false)
      setDraft({ name: '', role: '', category: 'team', order: '' })
      setNewFile(null); setNewPreview(null)
      loadMembers()
    } catch (e) { flash(e.response?.data?.error || 'Create failed', true) }
    setCreating(false)
  }

  // ── INLINE EDIT ──
  const startEdit = (m) => {
    setEditId(m._id)
    setEditDraft({ name: m.name, role: m.role, order: m.order })
    setReplaceFile(null); setReplacePreview(null)
  }

  const handleReplaceFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setReplaceFile(f)
    setReplacePreview(URL.createObjectURL(f))
  }

  const saveEdit = async (id) => {
    setSaving(true)
    try {
      await axios.put(`${API}/api/team/${id}`,
        { name: editDraft.name, role: editDraft.role, order: Number(editDraft.order) || 0 },
        { headers: authH() }
      )
      if (replaceFile) {
        setUploading(true)
        const fd = new FormData()
        fd.append('file', replaceFile)
        await axios.post(`${API}/api/team/${id}/image`, fd, {
          headers: { ...authH(), 'Content-Type': 'multipart/form-data' }
        })
        setUploading(false)
      }
      flash('Saved!')
      setEditId(null)
      loadMembers()
    } catch (e) { flash(e.response?.data?.error || 'Save failed', true) }
    setSaving(false)
  }

  const deleteMember = async (id) => {
    if (!window.confirm('Delete this member?')) return
    try {
      await axios.delete(`${API}/api/team/${id}`, { headers: authH() })
      flash('Deleted')
      loadMembers()
    } catch { flash('Delete failed', true) }
  }

  const cardStyle = {
    background: 'rgba(250,248,245,0.95)', border: '1px solid rgba(204,199,185,0.3)',
    borderRadius: '12px', padding: '14px', marginBottom: '12px',
    display: 'flex', gap: '14px', alignItems: 'flex-start'
  }

  return (
    <>
      {/* Category Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[{ id: 'team', label: '🧑‍💼 Our Team' }, { id: 'expert', label: '🌐 Global Experts' }].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{
            padding: '8px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600,
            background: view === tab.id ? 'var(--dark)' : 'rgba(204,199,185,0.2)',
            color: view === tab.id ? 'var(--white)' : 'var(--secondary)',
            transition: 'all 0.2s'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Status messages */}
      {msg && <div style={{ color: '#2a7a2a', fontSize: '12px', marginBottom: '10px', background: 'rgba(50,200,50,0.1)', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck size={12} />{msg}</div>}
      {err && <ErrMsg msg={err} />}

      {/* Members list */}
      {loading ? <p style={{ color: 'var(--secondary)', fontSize: '13px' }}>Loading...</p> : (
        filtered.length === 0
          ? <p style={{ color: 'var(--secondary)', fontSize: '13px', fontStyle: 'italic' }}>No members yet. Add one below.</p>
          : filtered.map(m => (
            <div key={m._id} style={cardStyle}>
              {/* Image preview */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={editId === m._id && replacePreview ? replacePreview : (m.url || 'https://via.placeholder.com/70x90?text=No+Image')}
                  style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                  alt={m.name}
                />
                {editId === m._id && (
                  <>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={replaceRef} onChange={handleReplaceFile} />
                    <button
                      onClick={() => replaceRef.current?.click()}
                      title="Replace image"
                      style={{
                        position: 'absolute', bottom: '-6px', right: '-6px',
                        background: 'var(--dark)', color: '#fff', border: 'none',
                        borderRadius: '50%', width: '22px', height: '22px',
                        cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    ><FiUpload size={10} /></button>
                    {replaceFile && <p style={{ fontSize: '9px', color: 'var(--secondary)', marginTop: '4px', maxWidth: '70px', wordBreak: 'break-all' }}>{replaceFile.name}</p>}
                  </>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editId === m._id ? (
                  <>
                    <input
                      value={editDraft.name} onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))}
                      placeholder="Name"
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', marginBottom: '6px', boxSizing: 'border-box' }}
                    />
                    <input
                      value={editDraft.role} onChange={e => setEditDraft(d => ({ ...d, role: e.target.value }))}
                      placeholder="Role / Position"
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', marginBottom: '6px', boxSizing: 'border-box' }}
                    />
                    <input
                      value={editDraft.order} onChange={e => setEditDraft(d => ({ ...d, order: e.target.value }))}
                      placeholder="Order (e.g. 1)"
                      type="number"
                      style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1.5px solid rgba(204,199,185,0.4)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', marginBottom: '8px', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <SBtn onClick={() => saveEdit(m._id)} disabled={saving || uploading}>
                        <FiCheck size={11} /> {saving || uploading ? 'Saving...' : 'Save'}
                      </SBtn>
                      <SBtn variant="ghost" onClick={() => { setEditId(null); setReplaceFile(null); setReplacePreview(null) }}>
                        <FiX size={11} /> Cancel
                      </SBtn>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 700, color: 'var(--dark)', margin: '0 0 2px' }}>{m.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, margin: '0 0 8px' }}>{m.role}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(101,50,57,0.5)', margin: '0 0 8px' }}>Order: {m.order}</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <SBtn variant="ghost" onClick={() => startEdit(m)} style={{ padding: '5px 12px', fontSize: '12px' }}>
                        <FiEdit3 size={11} /> Edit
                      </SBtn>
                      <SBtn variant="danger" onClick={() => deleteMember(m._id)} style={{ padding: '5px 12px', fontSize: '12px' }}>
                        <FiTrash2 size={11} /> Delete
                      </SBtn>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
      )}

      {/* Add Member Form */}
      {adding ? (
        <div style={{ background: 'rgba(250,248,245,0.97)', border: '1.5px dashed rgba(175,122,109,0.4)', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>➕ New Member</p>

          {/* Image picker with preview */}
          <div style={{ marginBottom: '12px' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={newFileRef} onChange={handleNewFile} />
            {newPreview
              ? <div style={{ position: 'relative', width: 'fit-content', marginBottom: '8px' }}>
                <img src={newPreview} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} alt="preview" />
                <button onClick={() => { setNewFile(null); setNewPreview(null) }} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#c83232', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              : <SBtn variant="ghost" onClick={() => newFileRef.current?.click()} style={{ marginBottom: '8px' }}>
                <FiUpload size={12} /> Upload Photo
              </SBtn>
            }
            <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.6)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: 'rgba(175,122,109,0.12)', border: '1px solid rgba(175,122,109,0.3)', borderRadius: '4px', padding: '2px 7px', fontWeight: 700, fontSize: '11px', color: 'var(--secondary)', letterSpacing: '0.5px' }}>3:4</span>
              Use a <strong>portrait headshot</strong> — taller than wide (e.g. 600 × 800 px). Avoid wide/landscape images.
            </p>
          </div>

          <Field label="Name" value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} placeholder="e.g. Dhruvi Shah" />
          <Field label="Role / Position" value={draft.role} onChange={v => setDraft(d => ({ ...d, role: v }))} placeholder="e.g. Head Coach" />
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>Category</p>
            <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
              style={{ width: '100%', padding: '10px 13px', border: '1.5px solid rgba(204,199,185,0.35)', borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', background: 'var(--bg)', color: 'var(--dark)' }}>
              <option value="team">Our Team (Internal)</option>
              <option value="expert">Global Experts</option>
            </select>
          </div>
          <Field label="Order (1 = first)" value={draft.order} onChange={v => setDraft(d => ({ ...d, order: v }))} placeholder="1" />

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <SBtn onClick={createMember} disabled={creating}><FiPlus size={12} /> {creating ? 'Adding...' : 'Add Member'}</SBtn>
            <SBtn variant="ghost" onClick={() => { setAdding(false); setDraft({ name: '', role: '', category: 'team', order: '' }); setNewFile(null); setNewPreview(null) }}><FiX size={12} /> Cancel</SBtn>
          </div>
        </div>
      ) : (
        <SBtn variant="ghost" onClick={() => setAdding(true)} style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
          <FiPlus size={13} /> Add Member
        </SBtn>
      )}
    </>
  )
}

// ─── ABOUT HERO MEDIA MANAGER ────────────────────────────────────────────────
function AboutHeroMediaManager() {
  const [mediaMode, setMediaMode] = useState('image') // 'image' | 'video'
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [uploadedImgs, setUploadedImgs] = useState([])
  const [uploadedVid, setUploadedVid] = useState(null)

  const imgRef = useRef(null)
  const vidRef = useRef(null)

  const loadData = async () => {
    try {
      const now = Date.now()
      const [contentRes, mediaRes] = await Promise.all([
        axios.get(`${API}/api/content/aboutHero?t=${now}`),
        axios.get(`${API}/api/media/aboutHero?t=${now}`)
      ])

      const items = contentRes.data.items || contentRes.data || []
      if (Array.isArray(items)) {
        items.forEach(i => {
          if (i.key === 'mediaType') setMediaMode(i.value)
        })
      }

      const media = mediaRes.data.media || []
      const imgItems = media.filter(m => m.type !== 'video')
      const vidItem = media.find(m => m.type === 'video')

      setUploadedImgs(imgItems)
      if (vidItem) setUploadedVid(vidItem)
    } catch { }
  }

  useEffect(() => { loadData() }, [])

  const uploadFile = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr(''); setMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('section', 'aboutHero')

      const res = await axios.post(`${API}/api/media/upload`, fd, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } })

      if (res.data?.media) {
        if (type === 'image') setUploadedImgs(prev => [...prev, res.data.media])
        if (type === 'video') setUploadedVid(res.data.media)
      }

      await axios.put(`${API}/api/content`, { section: 'aboutHero', key: 'mediaType', value: type }, { headers: authH() })

      setMsg(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`)
      setTimeout(() => setMsg(''), 3000)
    } catch (error) {
      setErr('Upload failed.')
    }
    finally {
      setUploading(false)
      e.target.value = null
    }
  }

  const deleteUploadedMedia = async (id, isVideo = false) => {
    if (!window.confirm('Delete this media?')) return
    try {
      await axios.delete(`${API}/api/media/${id}`, { headers: authH() })
      if (isVideo) {
        setUploadedVid(null)
      } else {
        setUploadedImgs(prev => prev.filter(m => m._id !== id))
      }
    } catch { setErr('Failed to delete media') }
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
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Background Media <span style={{ textTransform: 'none', fontSize: '11px', letterSpacing: 'normal', fontStyle: 'italic', marginLeft: '6px' }}>(Upload 16:9 ratio images or video)</span>
        </p>

        <div style={{
          display: 'inline-flex', gap: '4px', background: 'var(--bg)',
          borderRadius: '10px', padding: '4px',
          border: '1px solid rgba(204,199,185,0.35)', marginBottom: '16px'
        }}>
          <button style={modeBtnStyle(mediaMode === 'image')} onClick={() => {
            setMediaMode('image')
            axios.put(`${API}/api/content`, { section: 'aboutHero', key: 'mediaType', value: 'image' }, { headers: authH() })
          }}>📷 Upload Image</button>
          <button style={modeBtnStyle(mediaMode === 'video')} onClick={() => {
            setMediaMode('video')
            axios.put(`${API}/api/content`, { section: 'aboutHero', key: 'mediaType', value: 'video' }, { headers: authH() })
          }}>🎬 Upload Video</button>
        </div>

        {mediaMode === 'image' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[0, 1, 2].map(idx => {
                const upImg = uploadedImgs[idx]
                const fallbackImg = [
                  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=400',
                  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=400',
                  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=400'
                ][idx]

                return (
                  <div key={idx} style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(204,199,185,0.4)', background: 'var(--bg)' }}>
                    {upImg ? (
                      <>
                        <img src={upImg.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => deleteUploadedMedia(upImg._id)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Delete Image"><FiX size={12} /></button>
                      </>
                    ) : (
                      <>
                        <img src={fallbackImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(250,248,245,0.5)' }}>
                          <button onClick={() => imgRef.current?.click()} style={{ background: 'var(--white)', border: '1px solid var(--secondary)', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', color: 'var(--dark)' }}>
                            Replace
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
              <input ref={imgRef} type="file" accept="image/*" onChange={e => uploadFile(e, 'image')} style={{ display: 'none' }} />
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.5)', marginTop: '8px' }}>
              Accepts JPG, PNG, WebP.
            </p>
          </div>
        )}

        {mediaMode === 'video' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {uploadedVid && (
                <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(204,199,185,0.4)', position: 'relative' }}>
                  <video src={uploadedVid.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => deleteUploadedMedia(uploadedVid._id, true)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,50,50,0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Delete Video"><FiX size={12} /></button>
                </div>
              )}
              <input ref={vidRef} type="file" accept="video/*" onChange={e => uploadFile(e, 'video')} style={{ display: 'none' }} />
              <SBtn onClick={() => vidRef.current?.click()} disabled={uploading} variant="ghost" style={{ marginTop: '20px' }}>
                <FiUpload size={13} /> {uploading ? 'Uploading...' : 'Upload Video'}
              </SBtn>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.5)', marginTop: '8px' }}>
              Accepts MP4, WebM. Video will autoplay silently.
            </p>
          </div>
        )}
      </div>

      <ErrMsg msg={err} />
      {msg && <p style={{ fontSize: '12px', color: 'green', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck size={13} /> {msg}</p>}
    </>
  )
}

// ─── MAIN EDIT TAB ────────────────────────────────────────────────────────────
export default function EditTab() {
  const [activePage, setActivePage] = useState(
    () => localStorage.getItem('swa_edit_page') || 'home'
  )
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
            onClick={() => {
              setActivePage(page.id)
              localStorage.setItem('swa_edit_page', page.id)
            }}
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
              <TechniquesManager category="healing" label="Healing Technique" />
            </SectionAccordion>
            <SectionAccordion title="Testimonials">
              <TestimonialsManager />
            </SectionAccordion>

            <SectionAccordion title="Global Impact (Stats)">
              <StatsManager />
            </SectionAccordion>
            <SectionAccordion title="Media Gallery">
              <GalleryManager />
            </SectionAccordion>
            <SectionAccordion title="Bottom CTA Banner">
              <CtaManager />
            </SectionAccordion>
            <SectionAccordion title="FAQ">
              <FaqManager />
            </SectionAccordion>
          </>
        ) : activePage === 'about' ? (
          <>
            <SectionAccordion title="Hero Banner Background Media">
              <AboutHeroMediaManager />
            </SectionAccordion>
            {mergedGroups.filter(g => g.section !== 'about_philosophy').map(group => (
              <div key={group.group} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '4px', height: '18px', background: 'var(--secondary)', borderRadius: '2px', flexShrink: 0 }} />
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>
                    {group.group}
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {group.fields.map(field => (
                    <ContentField key={`${group.group}-${field.key}`} field={field} section={group.section} />
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '4px', height: '18px', background: 'var(--secondary)', borderRadius: '2px', flexShrink: 0 }} />
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>
                  Founder Profile
                </h3>
              </div>
              <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(204,199,185,0.3)', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
                <FounderManager />
              </div>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '4px', height: '18px', background: 'var(--secondary)', borderRadius: '2px', flexShrink: 0 }} />
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>
                  Team Members &amp; Global Experts
                </h3>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(101,50,57,0.6)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '14px' }}>
                <span style={{ background: 'rgba(175,122,109,0.12)', border: '1px solid rgba(175,122,109,0.3)', borderRadius: '4px', padding: '2px 7px', fontWeight: 700, fontSize: '11px', color: 'var(--secondary)', letterSpacing: '0.5px' }}>3:4</span>
                Use a <strong>portrait headshot</strong> — taller than wide (e.g. 600 × 800 px). Avoid wide/landscape images.
              </p>
              <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(204,199,185,0.3)', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
                <TeamManager />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <SectionAccordion title="Core Philosophy">
                <p style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '14px', lineHeight: 1.6 }}>
                  Edit the section title, subtitle, and all 4 philosophy pillar statements shown on the About page.
                </p>
                {(() => {
                  const phGroup = mergedGroups.find(g => g.section === 'about_philosophy')
                  return phGroup ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {phGroup.fields.map(field => (
                        <ContentField key={field.key} field={field} section="about_philosophy" />
                      ))}
                    </div>
                  ) : null
                })()}
              </SectionAccordion>
            </div>
          </>
        ) : activePage === 'blogs' ? (
          <div>
            <BlogsManagerInline />
          </div>
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
