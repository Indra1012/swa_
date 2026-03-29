import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { FiArrowRight, FiCheckCircle, FiChevronDown } from 'react-icons/fi'

// Floating Expandable Button
function ExpandableCard({ title, delay, children }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      style={{
        background: 'var(--white)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: isOpen ? '0 20px 40px rgba(0,0,0,0.06)' : '0 10px 20px rgba(0,0,0,0.03)',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
        border: '1px solid rgba(0,0,0,0.02)'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h5 style={{ margin: 0, fontSize: '12px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>
          {title}
        </h5>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }}
          style={{ color: isOpen ? 'var(--accent)' : 'var(--dark)' }}
        >
          {isOpen ? <FiChevronDown size={22} /> : <FiChevronDown size={22} />}
        </motion.div>
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 32px 32px 32px' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const SERVICES_DATA = [
  {
    id: 'corporate',
    tag: 'Corporate Solutions',
    headlinePre: 'Build a Resilient, ',
    headlineAccent: 'High-Performing Workforce',
    accentColor: 'var(--copper)',
    subheadline: 'Empower your teams with structured wellness and resilience programs designed to reduce stress, improve focus, and drive sustainable performance.',
    cta: 'Book a Corporate Consultation',
    challenge: 'Today’s workplaces are facing rising stress, burnout, disengagement, and declining focus. While organizations push for higher performance, the emotional and mental foundation of employees is often overlooked.',
    approach: 'At SWA, we design customized wellness programs aligned with your organizational goals. Our approach is practical, structured, and outcome-driven—ensuring real behavioral change, not just temporary motivation.',
    offerings: [
      'Corporate Wellness Programs',
      'Emotional Resilience Workshops',
      'Stress Management Sessions',
      'Leadership & Mindset Training'
    ],
    formats: [
      'On-site workshops',
      'Virtual sessions',
      'Multi-session engagement programs',
      'Leadership interventions'
    ],
    outcomes: [
      'Improved employee focus and productivity',
      'Reduced stress and burnout',
      'Higher engagement and retention',
      'Stronger team dynamics'
    ],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80'
  },
  {
    id: 'education',
    tag: 'Educational Environments',
    headlinePre: 'Building Emotionally Strong & ',
    headlineAccent: 'Focused Students',
    accentColor: 'var(--sage)',
    subheadline: 'Helping students and educators manage stress, improve concentration, and build emotional resilience for long-term success.',
    cta: 'Partner With Us',
    challenge: 'Students today face increasing academic pressure, distractions, and emotional stress—impacting both performance and wellbeing. Educators also face challenges in managing student engagement and emotional balance in classrooms.',
    approach: 'We deliver simple, practical, and age-appropriate programs that help students understand and manage their thoughts, emotions, and stress effectively.',
    offerings: [
      'Student Wellness Programs',
      'Stress & Exam Anxiety Management',
      'Focus & Concentration Sessions',
      'Teacher Wellbeing Programs'
    ],
    formats: [
      'School & college workshops',
      'Interactive group sessions',
      'Ongoing wellbeing programs'
    ],
    outcomes: [
      'Improved focus and academic performance',
      'Better emotional balance',
      'Reduced stress and anxiety',
      'Healthier learning environment'
    ],
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80'
  },
  {
    id: 'community',
    tag: 'Community Outreaches',
    headlinePre: 'Creating Healthier, ',
    headlineAccent: 'More Resilient Communities',
    accentColor: 'var(--terracotta)',
    subheadline: 'Driving large-scale wellbeing initiatives that help individuals manage stress, build resilience, and live more balanced lives.',
    cta: 'Collaborate With Us',
    challenge: 'In today’s fast-changing world, stress and emotional challenges are not limited to workplaces—they impact entire communities. There is a growing need for accessible and practical wellbeing solutions at scale.',
    approach: 'We partner with organizations, NGOs, and institutions to deliver impactful community wellness programs that are simple, scalable, and effective.',
    offerings: [
      'Community Wellness Programs',
      'Stress Awareness Campaigns',
      'Group Workshops & Sessions',
      'Public Wellbeing Initiatives'
    ],
    formats: [
      'Large group sessions',
      'Awareness drives',
      'Workshops & events'
    ],
    outcomes: [
      'Increased awareness of mental wellbeing',
      'Practical tools for daily stress management',
      'Stronger, more resilient communities'
    ],
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80'
  }
]

// Dynamic Full-Width Editorial Section
function ServiceFullWidthSection({ data, index }) {
  const navigate = useNavigate()
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Deep Parallax Effect on scrolling
  const sectionY = useTransform(scrollYProgress, [0, 1], [40, -40])
  const imgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"])

  return (
    <motion.div
      id={data.id}
      ref={sectionRef}
      style={{
        padding: '60px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        borderBottom: index !== 2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
        y: sectionY
      }}
    >
      {/* 1. Header Stack (Centered) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.25 } }
        }}
        style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px' }}
      >
        <motion.div variants={{
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }
        }}>
          <span style={{
            display: 'inline-block',
            fontSize: '11px', fontWeight: 700, color: 'var(--dark)',
            letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px',
            background: 'rgba(201, 138, 68, 0.08)', padding: '6px 14px', borderRadius: '50px'
          }}>
            {data.tag}
          </span>
        </motion.div>

        <motion.h2 
          variants={{
            hidden: { opacity: 0, x: 30 },
            visible: { opacity: 1, x: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }
          }}
          style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 4vw, 56px)',
            fontWeight: 700, color: 'var(--dark)', lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: '24px'
          }}
        >
          {data.headlinePre}
          <span style={{
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
            color: 'var(--dark2)', fontWeight: 500
          }}>
            {data.headlineAccent}
          </span>
        </motion.h2>

        <motion.p 
          variants={{
            hidden: { opacity: 0, x: -30 },
            visible: { opacity: 1, x: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }
          }}
          style={{
            fontSize: '18px', color: 'var(--secondary)', fontWeight: 400, lineHeight: 1.6, opacity: 0.9
          }}
        >
          {data.subheadline}
        </motion.p>
      </motion.div>

      {/* 2. Massive Parallax Image Box */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', height: '460px', borderRadius: '32px', overflow: 'hidden', position: 'relative',
          marginBottom: '48px', boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
        }}
      >
        <motion.img 
          src={data.image} alt={data.headline} 
          style={{ width: '100%', height: '130%', objectFit: 'cover', y: imgY }}
        />
      </motion.div>

      {/* 3. The Problem & Solution (Identical Premium Cards) */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', marginBottom: '48px'
      }}>
        {/* Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'var(--white)', padding: '50px', borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)', borderBottom: '4px solid var(--accent)'
          }}
        >
          <h5 style={{ fontSize: '11px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', opacity: 0.6 }}>
            The Challenge
          </h5>
          <p style={{ fontSize: '18px', color: 'var(--dark)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
            {data.challenge}
          </p>
        </motion.div>

        {/* Approach Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{
            background: 'var(--white)', padding: '50px', borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)', borderBottom: '4px solid var(--accent)'
          }}
        >
          <h5 style={{ fontSize: '11px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', opacity: 0.6 }}>
            Our Approach
          </h5>
          <h4 style={{ 
            fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', 
            color: 'var(--dark)', fontWeight: 500, lineHeight: 1.4, fontStyle: 'italic', margin: 0
          }}>
            "{data.approach}"
          </h4>
        </motion.div>
      </div>

      {/* 4. Offerings & Formats (Floating Expanding Accordions) */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '48px',
        alignItems: 'start'
      }}>
        <ExpandableCard title="What We Offer" delay={0}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.offerings.map((offering, idx) => (
              <li key={idx} style={{ position: 'relative', paddingLeft: '32px', fontSize: '17px', color: 'var(--dark)', fontWeight: 500 }}>
                <FiCheckCircle size={18} color="var(--dark2)" style={{ position: 'absolute', left: 0, top: '4px' }} />
                {offering}
              </li>
            ))}
          </ul>
        </ExpandableCard>

        <ExpandableCard title="Program Formats" delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {data.formats.map((format, idx) => (
              <span key={idx} style={{
                padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(28,25,23,0.1)',
                fontSize: '14px', color: 'var(--secondary)', fontWeight: 500, background: 'var(--bg)',
              }}>
                {format}
              </span>
            ))}
          </div>
        </ExpandableCard>
      </div>

      {/* 5. Outcomes Banner & Centered CTA (Light Aesthetics) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(255,255,255,0.7)', padding: '60px', borderRadius: '32px', color: 'var(--dark)',
          position: 'relative', overflow: 'hidden', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
          border: '1px solid rgba(255,255,255,1)', backdropFilter: 'blur(20px)'
        }}
      >
        <h5 style={{ fontSize: '12px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '36px' }}>
          Outcomes {data.id === 'community' ? '' : 'You Can Expect'}
        </h5>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginBottom: '40px' }}>
          {data.outcomes.map((outcome, idx) => (
            <div key={idx} style={{
              background: 'var(--white)', padding: '16px 28px', borderRadius: '16px',
              fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)', fontWeight: 500
            }}>
              {outcome}
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate('/book-demo')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            padding: '18px 40px', background: 'var(--accent)', color: 'var(--white)',
            borderRadius: '50px', fontSize: '16px', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(184, 139, 88, 0.4)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(184, 139, 88, 0.6)'
            e.currentTarget.style.background = 'var(--dark)'
            e.currentTarget.style.color = 'var(--white)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(184, 139, 88, 0.4)'
            e.currentTarget.style.background = 'var(--accent)'
            e.currentTarget.style.color = 'var(--white)'
          }}
        >
          {data.cta} <FiArrowRight size={20} />
        </button>
      </motion.div>

    </motion.div>
  )
}

export default function ServicesPage() {
  const { hash } = useLocation()
  // Hash scrolling logic, highly precise with setTimeout
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 300) 
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [hash])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
    <div style={{ position: 'relative', zIndex: 1 }}>
    <main style={{
      position: 'relative',
      background: 'transparent',
      minHeight: '100vh', paddingTop: '72px', overflow: 'hidden'
    }}>
      
      {/* Ambient Luxury Lighting Gradients */}
      <motion.div
        animate={{ y: [0, -60, 0], x: [0, 40, 0], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: '-10%', left: '-10%', width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(200, 160, 140, 0.08) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none'
        }} 
      />
      <motion.div
        animate={{ y: [0, 50, 0], x: [0, -40, 0], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'fixed', bottom: '-10%', right: '-5%', width: '70vw', height: '70vw',
          background: 'radial-gradient(circle, rgba(140, 160, 180, 0.07) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none'
        }} 
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Render Full-Width Sections */}
        <div>
          {SERVICES_DATA.map((service, i) => (
            <ServiceFullWidthSection key={service.id} data={service} index={i} />
          ))}
        </div>
      </div>
    </main>
    </div>
    </div>
  )
}
