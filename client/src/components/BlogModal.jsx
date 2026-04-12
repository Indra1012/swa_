import { useEffect } from 'react'

export default function BlogModal({ isOpen, blog, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !blog) return null

  const mainImage = blog.image || (blog.images && blog.images[0]) || ''

  const rawText = blog.readMoreText || blog.body || ''
  const paragraphs = rawText.split('\n').filter(p => p.trim() !== '')

  return (
    <>
      <style>{`
        .blog-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(40,30,30,0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: modalFadeIn 0.3s ease;
        }
        .blog-modal-container {
          position: relative;
          background: rgba(252, 250, 248, 1);
          border-radius: 28px;
          max-width: 900px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 40px 80px rgba(0,0,0,0.2);
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .blog-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: rgba(0,0,0,0.05);
          border: none;
          border-radius: 50%;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--dark, #2C2C2C);
          transition: all 0.3s ease;
          z-index: 10;
        }
        .blog-modal-close:hover {
          background: rgba(0,0,0,0.1);
          transform: rotate(90deg);
        }
        .blog-modal-content {
          flex: 1;
          padding: 50px 60px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,0.2) transparent;
        }
        .blog-modal-content::-webkit-scrollbar {
          width: 6px;
        }
        .blog-modal-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .blog-modal-content::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.2);
          border-radius: 10px;
        }
        .blog-floated-image {
          float: left;
          width: 280px;
          height: 380px;
          object-fit: cover;
          object-position: center;
          border-radius: 16px;
          margin-right: 32px;
          margin-bottom: 24px;
          margin-top: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .blog-category {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--primary, #A87C7C);
          font-weight: 700;
          margin-bottom: 16px;
        }
        .blog-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 6vw, 54px);
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 30px;
          line-height: 1.1;
          padding-right: 40px; /* Space for close button */
          letter-spacing: -0.5px;
        }
        .blog-section-heading {
          font-family: 'DM Sans', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: var(--dark);
          margin-top: 40px;
          margin-bottom: 12px;
          line-height: 1.3;
          letter-spacing: 1.5px;
        }
        .blog-paragraph {
          font-size: 16.5px;
          color: var(--secondary);
          line-height: 1.9;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        /* Rich Text Content Overrides */
        .rich-text-content * {
          font-family: 'DM Sans', sans-serif !important;
        }
        .rich-text-content p {
          font-size: 16.5px !important;
          color: var(--secondary) !important;
          line-height: 1.9 !important;
          margin-bottom: 20px !important;
          font-weight: 500 !important;
        }
        .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 {
          font-family: 'Cormorant Garamond', serif !important;
          color: var(--dark) !important;
          margin-top: 40px !important;
          margin-bottom: 16px !important;
          line-height: 1.2 !important;
          font-weight: 800 !important;
        }
        .rich-text-content h3 {
          font-family: 'DM Sans', sans-serif !important;
          font-size: 18px !important;
          letter-spacing: 1.5px !important;
          text-transform: uppercase !important;
        }
        .rich-text-content ul, .rich-text-content ol {
          margin-bottom: 20px !important;
          padding-left: 20px !important;
          color: var(--secondary) !important;
          font-size: 16.5px !important;
          line-height: 1.9 !important;
        }
        .rich-text-content li {
          margin-bottom: 6px !important;
        }
        
        .clearfix::after {
          content: "";
          display: table;
          clear: both;
        }
        @media (max-width: 768px) {
          .blog-modal-content {
             padding: 40px 30px;
          }
          .blog-floated-image {
             display: none !important;
          }
          .blog-title {
            font-size: 32px;
          }
        }
        @media (max-width: 480px) {
          .blog-modal-overlay {
             padding: 15px;
          }
          .blog-modal-content {
             padding: 30px 20px;
          }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="blog-modal-overlay" onClick={onClose}>
        <div className="blog-modal-container" onClick={e => e.stopPropagation()}>

          {/* Close X Button */}
          <button className="blog-modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>

          <div className="blog-modal-content" data-lenis-prevent="true">
            {blog.category && (
              <p className="blog-category text-center" style={{ textAlign: 'center' }}>{blog.category}</p>
            )}

            <h2 className="blog-title" style={{ textAlign: 'center', paddingRight: 0 }}>{blog.title}</h2>

            <div className="clearfix rich-text-content">
              {/* For both old text & new HTML we float the main image */}
              {mainImage && (
                <img
                  src={mainImage}
                  alt={blog.title}
                  className="blog-floated-image"
                />
              )}
              
              {/<[a-z][\s\S]*>/i.test(rawText) ? (
                <div dangerouslySetInnerHTML={{ __html: rawText }} />
              ) : (
                <>
                  {paragraphs.length > 0 && (
                    <p className="blog-paragraph" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '20px', fontStyle: 'italic', fontWeight: 600, color: 'var(--secondary)' }}>
                      {paragraphs[0]}
                    </p>
                  )}
                  {paragraphs.slice(1).map((p, i) => {
                    const isHeading = p === p.toUpperCase() && /[A-Z]/.test(p) && !p.startsWith('•');
                    return (
                      <p key={i} className={isHeading ? "blog-section-heading" : "blog-paragraph"}>
                        {p}
                      </p>
                    )
                  })}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
