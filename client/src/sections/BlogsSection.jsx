import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiArrowRight } from 'react-icons/fi'
import BlogModal from '../components/BlogModal'

const BLOGS = [
  {
    id: 1,
    category: 'Wellbeing Festival',
    title: '4 Years of Spreading Joy at Flipkart during BBD Sale',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
    excerpt: 'How we brought lasting wellbeing to thousands of employees during India\'s biggest sale season.',
    body: 'For four consecutive years, SWA has partnered with Flipkart to bring holistic wellbeing experiences to thousands of employees during their biggest sale season. From mindfulness corners to high-energy wellbeing games, we created spaces of joy amid the hustle. This year was the most impactful yet, with over 3,000 employees participating in curated experiences designed to restore balance and boost morale.'
  },
  {
    id: 2,
    category: 'Wellbeing Retreat',
    title: 'A Journey to Rejuvenate the Mind, Body, Heart, and Soul',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    excerpt: 'Inside the Transformational Wellbeing Retreat for BPCL Leaders — 3 days of deep renewal.',
    body: 'Inside the Transformational Wellbeing Retreat for BPCL Leaders — a 3-day immersive experience that took senior leadership on a journey of self-discovery through ancient healing techniques, group therapy, and nature immersion. Participants emerged with renewed purpose, deeper connections, and practical tools for leading with empathy and clarity.'
  },
  {
    id: 3,
    category: 'Zen Garden',
    title: 'Zen Garden: A Revolutionary Wellbeing Space',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    excerpt: 'How we turned an unused office corner into a sanctuary of calm that changed everything.',
    body: 'We transformed an unused office corner into a thriving Zen Garden — a sanctuary of calm in the middle of one of India\'s fastest-moving companies. Featuring sound bowls, breathing stations, and art therapy walls, the space has seen over 500 visits in its first month. Employees report lower stress, higher focus, and a genuine sense of being cared for by their organization.'
  }
]

function BlogCard({ blog, index, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => onOpen(blog)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 50px rgba(101,50,57,0.12)'
          : '0 4px 20px rgba(101,50,57,0.06)',
        transition: 'transform 0.35s ease, box-shadow 0.35s ease'
      }}
    >
      {/* Image */}
      <div style={{
        overflow: 'hidden',
        height: '220px'
      }}>
        <img
          src={blog.image}
          alt={blog.title}
          loading="lazy"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s ease'
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '28px' }}>
        {/* Category */}
        <p style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'var(--secondary)',
          fontWeight: 600,
          marginBottom: '10px'
        }}>
          {blog.category}
        </p>

        {/* Title */}
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '20px', fontWeight: 700,
          color: 'var(--dark)',
          lineHeight: 1.4,
          marginBottom: '12px'
        }}>
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p style={{
          fontSize: '13px',
          color: 'var(--secondary)',
          lineHeight: 1.7,
          marginBottom: '20px',
          opacity: 0.85
        }}>
          {blog.excerpt}
        </p>

        {/* Read more */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: hovered ? '10px' : '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--secondary)',
          transition: 'gap 0.25s ease'
        }}>
          Read more
          <FiArrowRight size={14} />
        </div>
      </div>
    </motion.div>
  )
}

export default function BlogsSection() {
  const [selectedBlog, setSelectedBlog] = useState(null)

  return (
    <>
      <section
        id="blogs"
        style={{
          background: 'transparent',
          padding: '80px 60px',
          margin: 0
        }}
      >
        <div className="section-inner">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ textAlign: 'center', marginBottom: '50px' }}
          >
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              fontWeight: 700,
              color: 'var(--dark)',
              letterSpacing: '-0.5px'
            }}>
              Latest from <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--dark2)' }}>SWA</span>
            </h2>
          </motion.div>

          {/* Blog grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {BLOGS.map((blog, i) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                index={i}
                onOpen={setSelectedBlog}
              />
            ))}
          </div>
        </div>
      </section>

      <BlogModal
        isOpen={!!selectedBlog}
        blog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
      />

      <style>{`
        @media (max-width: 900px) {
          #blogs .section-inner > div:last-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          #blogs .section-inner > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
