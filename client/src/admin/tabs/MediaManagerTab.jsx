import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  FiUpload, FiTrash2, FiEdit3, FiX,
  FiImage, FiVideo, FiCheck, FiAlertCircle
} from 'react-icons/fi'

const API = import.meta.env.VITE_API_URL

const SECTIONS = [
  'hero', 'programs', 'techniques', 'corporate',
  'education', 'community', 'about', 'testimonials', 'blogs'
]

const IMAGE_RATIOS = [
  { label: '1:1', value: '1/1', name: 'Square' },
  { label: '4:3', value: '4/3', name: 'Standard' },
  { label: '16:9', value: '16/9', name: 'Landscape' },
  { label: '9:16', value: '9/16', name: 'Portrait' },
  { label: '3:2', value: '3/2', name: 'Photo' },
  { label: '2:3', value: '2/3', name: 'Portrait Photo' },
  { label: '21:9', value: '21/9', name: 'Ultrawide' },
  { label: 'Free', value: 'free', name: 'No Crop' }
]

const VIDEO_RATIOS = [
  { label: '16:9', value: '16/9', name: 'Landscape' },
  { label: '9:16', value: '9/16', name: 'Vertical' },
  { label: '1:1', value: '1/1', name: 'Square' },
  { label: 'Free', value: 'free', name: 'No Crop' }
]

export default function MediaManagerTab() {
  const [section, setSection] = useState('hero')
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [fileType, setFileType] = useState('image')
  const [aspectRatio, setAspectRatio] = useState('16/9')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const fileInputRef = useRef(null)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/media/${section}`)
      setMediaItems(res.data.media || res.data || [])
    } catch {
      setMediaItems([])
    } finally {
      setLoading(false)
    }
  }, [section])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    if (!isVideo && !isImage) {
      setUploadError('Only images and videos are allowed.')
      return
    }

    setUploadError('')
    setSelectedFile(file)
    setFileType(isVideo ? 'video' : 'image')
    setAspectRatio('16/9')

    const reader = new FileReader()
    reader.onload = (ev) => setFilePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadError('')
    setUploadSuccess(false)

    try {
      const token = localStorage.getItem('swa_token')
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('section', section)
      formData.append('aspectRatio', aspectRatio)
      formData.append('caption', caption)
      formData.append('type', fileType)

      await axios.post(`${API}/api/media/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setUploadProgress(pct)
        }
      })

      setUploadSuccess(true)
      setSelectedFile(null)
      setFilePreview(null)
      setCaption('')
      setUploadProgress(0)
      setTimeout(() => {
        setShowUpload(false)
        setUploadSuccess(false)
        fetchMedia()
      }, 1500)

    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media item?')) return
    setDeletingId(id)
    try {
      const token = localStorage.getItem('swa_token')
      await axios.delete(`${API}/api/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMediaItems(prev => prev.filter(m => m._id !== id))
    } catch {
      alert('Failed to delete. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const ratios = fileType === 'video' ? VIDEO_RATIOS : IMAGE_RATIOS

  const resetUpload = () => {
    setShowUpload(false)
    setSelectedFile(null)
    setFilePreview(null)
    setCaption('')
    setUploadError('')
    setUploadSuccess(false)
    setUploadProgress(0)
  }

  return (
    <div>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px', fontWeight: 700,
            color: 'var(--dark)', marginBottom: '4px'
          }}>
            Media Manager
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>
            Upload and manage images and videos for each section
          </p>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--dark)', color: 'var(--white)',
            border: 'none', borderRadius: '10px',
            padding: '12px 20px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer',
            transition: 'var(--transition)',
            fontFamily: 'DM Sans, sans-serif'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--dark2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--dark)'}
        >
          <FiUpload size={16} />
          Upload New
        </button>
      </div>

      {/* Section selector */}
      <div style={{
        display: 'flex', gap: '8px',
        flexWrap: 'wrap', marginBottom: '28px'
      }}>
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            style={{
              padding: '8px 18px',
              borderRadius: '50px',
              border: section === s
                ? '2px solid var(--dark)'
                : '1.5px solid rgba(204,199,185,0.4)',
              background: section === s ? 'var(--dark)' : 'var(--white)',
              color: section === s ? 'var(--white)' : 'var(--dark)',
              fontSize: '13px', fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--transition)',
              textTransform: 'capitalize',
              fontFamily: 'DM Sans, sans-serif'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Media grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: '160px', borderRadius: '12px',
              background: 'rgba(204,199,185,0.15)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--white)',
          borderRadius: '16px',
          border: '1px solid rgba(204,199,185,0.2)'
        }}>
          <FiImage size={40} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '22px', color: 'var(--dark)',
            marginBottom: '8px'
          }}>
            No media in {section}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
            Upload images or videos to get started
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {mediaItems.map(item => (
            <MediaCard
              key={item._id}
              item={item}
              onDelete={handleDelete}
              deleting={deletingId === item._id}
            />
          ))}
        </div>
      )}

      {/* Upload Panel Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetUpload}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(101,50,57,0.6)',
              zIndex: 1000,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--white)',
                borderRadius: '24px',
                padding: '40px',
                maxWidth: '600px', width: '100%',
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: 'var(--shadow-modal)'
              }}
            >
              {/* Upload modal header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '28px'
              }}>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '24px', fontWeight: 700,
                  color: 'var(--dark)'
                }}>
                  Upload Media
                </h3>
                <button
                  onClick={resetUpload}
                  style={{
                    background: 'var(--bg)', border: 'none',
                    width: '36px', height: '36px',
                    borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--dark)'
                  }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* STEP 1 — File picker */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '12px', textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--accent)',
                  fontWeight: 600, marginBottom: '12px'
                }}>
                  Step 1 — Select File
                </p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(204,199,185,0.5)',
                    borderRadius: '14px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg)',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(204,199,185,0.5)'}
                >
                  {selectedFile ? (
                    <div>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px',
                        color: 'var(--secondary)', marginBottom: '4px'
                      }}>
                        {fileType === 'video'
                          ? <FiVideo size={20} />
                          : <FiImage size={20} />
                        }
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                          {selectedFile.name}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <FiUpload size={28} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)', marginBottom: '4px' }}>
                        Click to select a file
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                        Images: JPG, PNG, WEBP, HEIC, HEIF &nbsp;|&nbsp; Videos: MP4, MOV, AVI, WEBM
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/mov,video/avi,video/webm"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* STEP 2 — Aspect ratio */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginBottom: '24px' }}
                >
                  <p style={{
                    fontSize: '12px', textTransform: 'uppercase',
                    letterSpacing: '1px', color: 'var(--secondary)',
                    fontWeight: 600, marginBottom: '12px'
                  }}>
                    Step 2 — Choose Aspect Ratio
                  </p>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {ratios.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setAspectRatio(r.value)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: aspectRatio === r.value
                            ? '2px solid var(--dark)'
                            : '1.5px solid rgba(204,199,185,0.4)',
                          background: aspectRatio === r.value
                            ? 'var(--dark)' : 'var(--white)',
                          color: aspectRatio === r.value
                            ? 'var(--white)' : 'var(--dark)',
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                          fontFamily: 'DM Sans, sans-serif'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>
                          {r.label}
                        </span>
                        <span style={{ fontSize: '10px', opacity: 0.7, display: 'block' }}>
                          {r.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Live preview with aspect ratio */}
                  {filePreview && (
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{
                        fontSize: '12px', color: 'var(--secondary)',
                        marginBottom: '8px'
                      }}>
                        Preview with selected ratio:
                      </p>
                      <div style={{
                        width: '100%',
                        maxWidth: '320px',
                        aspectRatio: aspectRatio === 'free' ? 'auto' : aspectRatio,
                        overflow: 'hidden',
                        borderRadius: '10px',
                        border: '1px solid rgba(204,199,185,0.3)',
                        background: 'var(--bg)'
                      }}>
                        {fileType === 'video' ? (
                          <video
                            src={filePreview}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            muted
                          />
                        ) : (
                          <img
                            src={filePreview}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3 — Caption */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginBottom: '24px' }}
                >
                  <p style={{
                    fontSize: '12px', textTransform: 'uppercase',
                    letterSpacing: '1px', color: 'var(--secondary)',
                    fontWeight: 600, marginBottom: '12px'
                  }}>
                    Step 3 — Caption (optional)
                  </p>
                  <input
                    type="text"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Add a caption for this media..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1.5px solid rgba(204,199,185,0.35)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontFamily: 'DM Sans, sans-serif',
                      outline: 'none',
                      background: 'var(--bg)',
                      color: 'var(--dark)'
                    }}
                  />
                </motion.div>
              )}

              {/* Upload progress */}
              {uploading && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '13px', color: 'var(--secondary)',
                    marginBottom: '8px'
                  }}>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{
                    height: '6px', background: 'rgba(204,199,185,0.2)',
                    borderRadius: '3px', overflow: 'hidden'
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      style={{
                        height: '100%',
                        background: 'var(--secondary)',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Success message */}
              {uploadSuccess && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 18px',
                  background: 'rgba(175,122,109,0.08)',
                  border: '1px solid rgba(175,122,109,0.3)',
                  borderRadius: '10px', marginBottom: '20px',
                  fontSize: '14px', color: 'var(--secondary)'
                }}>
                  <FiCheck size={16} />
                  Upload successful!
                </div>
              )}

              {/* Error message */}
              {uploadError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 18px',
                  background: 'rgba(175,122,109,0.08)',
                  border: '1px solid rgba(175,122,109,0.3)',
                  borderRadius: '10px', marginBottom: '20px',
                  fontSize: '14px', color: 'var(--secondary)'
                }}>
                  <FiAlertCircle size={16} />
                  {uploadError}
                </div>
              )}

              {/* STEP 4 — Upload button */}
              {selectedFile && !uploadSuccess && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{
                    width: '100%',
                    background: uploading ? 'rgba(101,50,57,0.5)' : 'var(--dark)',
                    color: 'var(--white)',
                    border: 'none', borderRadius: '10px',
                    padding: '14px', fontSize: '15px',
                    fontWeight: 600,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition)',
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                  onMouseEnter={e => {
                    if (!uploading) e.currentTarget.style.background = 'var(--dark2)'
                  }}
                  onMouseLeave={e => {
                    if (!uploading) e.currentTarget.style.background = 'var(--dark)'
                  }}
                >
                  {uploading ? `Uploading ${uploadProgress}%...` : 'Upload to Cloudinary →'}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

function MediaCard({ item, onDelete, deleting }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--white)',
        border: '1px solid rgba(204,199,185,0.2)',
        boxShadow: hovered ? 'var(--shadow-card)' : 'none',
        transition: 'box-shadow 0.3s ease'
      }}
    >
      {/* Media preview */}
      <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
        {item.type === 'video' ? (
          <video
            src={item.url}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
          />
        ) : (
          <img
            src={`${item.url}?w=400&q=80&f=auto`}
            alt={item.caption || 'Media'}
            loading="lazy"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.4s ease'
            }}
          />
        )}

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          background: 'rgba(60,47,47,0.7)',
          backdropFilter: 'blur(4px)',
          borderRadius: '6px', padding: '3px 8px',
          fontSize: '10px', color: 'white',
          fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          {item.type === 'video'
            ? <FiVideo size={10} />
            : <FiImage size={10} />
          }
          {item.type}
        </div>

        {/* Action buttons on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(101,50,57,0.4)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px'
              }}
            >
              <button
                onClick={() => onDelete(item._id)}
                disabled={deleting}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white', borderRadius: '8px',
                  padding: '8px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif'
                }}
              >
                <FiTrash2 size={14} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Caption */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{
          fontSize: '12px', color: 'var(--secondary)',
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.caption || item.section}
        </p>
        {item.aspectRatio && (
          <p style={{
            fontSize: '10px',
            color: 'rgba(101,50,57,0.4)',
            marginTop: '2px'
          }}>
            {item.aspectRatio}
          </p>
        )}
      </div>
    </motion.div>
  )
}
