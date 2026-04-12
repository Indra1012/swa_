import { useRef, useEffect, useCallback } from 'react'

const TOOLBAR = [
  { cmd: 'formatBlock', value: 'h2', label: 'H2', title: 'Big Heading' },
  { cmd: 'formatBlock', value: 'h3', label: 'H3', title: 'Sub Heading' },
  { cmd: 'bold', label: '<b>B</b>', title: 'Bold' },
  { cmd: 'italic', label: '<i>I</i>', title: 'Italic' },
  { cmd: 'insertUnorderedList', label: '• List', title: 'Bullet List' },
  { cmd: 'insertOrderedList', label: '1. List', title: 'Numbered List' },
  { cmd: 'formatBlock', value: 'blockquote', label: '" Quote', title: 'Blockquote' },
  { cmd: 'insertHorizontalRule', label: '— Rule', title: 'Horizontal Rule' },
]

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing or paste from ChatGPT...' }) {
  const editorRef = useRef(null)
  const skipSync = useRef(false)

  useEffect(() => {
    if (!editorRef.current) return
    if (skipSync.current) { skipSync.current = false; return }
    if (editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = useCallback(() => {
    skipSync.current = true
    onChange(editorRef.current.innerHTML)
  }, [onChange])

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    handleInput()
  }

  const btnStyle = {
    padding: '5px 10px', border: '1px solid rgba(204,199,185,0.4)', borderRadius: '6px',
    background: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans,sans-serif',
    fontWeight: 600, color: '#2c2c2c', whiteSpace: 'nowrap', lineHeight: 1
  }

  return (
    <div style={{ border: '1.5px solid rgba(204,199,185,0.4)', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', padding: '9px 12px', borderBottom: '1px solid rgba(204,199,185,0.3)', background: 'rgba(250,248,245,0.9)' }}>
        {TOOLBAR.map((btn, i) => (
          <button key={i} title={btn.title} style={btnStyle}
            onMouseDown={e => { e.preventDefault(); exec(btn.cmd, btn.value || null) }}
            dangerouslySetInnerHTML={{ __html: btn.label }}
          />
        ))}
        <button title="Clear Formatting" style={{ ...btnStyle, color: '#c83232', borderColor: 'rgba(200,50,50,0.25)' }}
          onMouseDown={e => { e.preventDefault(); exec('removeFormat'); exec('formatBlock', 'p') }}>
          ✕ Clear
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight: '260px', maxHeight: '480px', overflowY: 'auto', padding: '16px 18px', outline: 'none', fontSize: '14px', lineHeight: 1.8, color: '#2c2c2c', fontFamily: 'DM Sans,sans-serif' }}
      />

      <style>{`
        [contenteditable]:empty:before{content:attr(data-placeholder);color:rgba(101,50,57,.35);font-style:italic;pointer-events:none}
        [contenteditable] h2{font-size:19px;font-weight:800;margin:18px 0 8px;font-family:'DM Sans',sans-serif;letter-spacing:.5px}
        [contenteditable] h3{font-size:14px;font-weight:700;margin:14px 0 6px;font-family:'DM Sans',sans-serif;text-transform:uppercase;letter-spacing:1px;color:#7a5c5c}
        [contenteditable] blockquote{border-left:3px solid #7a5c5c;padding:8px 16px;margin:12px 0;color:#7a5c5c;font-style:italic;background:rgba(204,199,185,.1);border-radius:0 8px 8px 0}
        [contenteditable] ul,[contenteditable] ol{padding-left:22px;margin:8px 0}
        [contenteditable] li{margin-bottom:4px}
        [contenteditable] hr{border:none;border-top:1px solid rgba(204,199,185,.5);margin:18px 0}
        [contenteditable] p{margin:0 0 10px}
        [contenteditable] strong,[contenteditable] b{font-weight:700}
      `}</style>
    </div>
  )
}
