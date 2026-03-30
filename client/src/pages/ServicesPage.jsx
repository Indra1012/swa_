import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
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
        background: 'rgba(250, 248, 245, 0.95)', /* Premium Off-White Glass */
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: isOpen ? '0 20px 40px rgba(0,0,0,0.06)' : '0 10px 20px rgba(0,0,0,0.03)',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
        border: '1px solid rgba(0,0,0,0.02)'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ padding: 'clamp(20px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <div style={{ padding: '0 clamp(20px, 4vw, 32px) clamp(20px, 4vw, 32px) clamp(20px, 4vw, 32px)' }}>
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
    offset: ["start 90%", "end start"]
  })

  // Smooth Kinetic Spring to avoid lagging and strict popping
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 })

  // Deep Parallax Effect on scrolling
  const sectionY = useTransform(smoothScroll, [0, 1], [40, -40])
  const imgY = useTransform(smoothScroll, [0, 1], ["-15%", "15%"])

  // Kinetic Typography Mappings
  const headerScale = useTransform(smoothScroll, [0, 0.2, 0.4], [0.85, 1, 1])
  const headerOpacity = useTransform(smoothScroll, [0, 0.15, 0.3], [0, 1, 1])
  const headerY = useTransform(smoothScroll, [0, 0.2, 0.4], [40, 0, 0])

  const sublineOpacity = useTransform(smoothScroll, [0.05, 0.25, 0.4], [0, 1, 1])
  const sublineY = useTransform(smoothScroll, [0.05, 0.25, 0.4], [30, 0, 0])

  const cardOpacity = useTransform(smoothScroll, [0.1, 0.3, 0.5], [0, 1, 1])
  const cardY = useTransform(smoothScroll, [0.1, 0.3, 0.5], [60, 0, 0])
  const cardScale = useTransform(smoothScroll, [0.1, 0.3, 0.5], [0.95, 1, 1])

  return (
    <motion.div
      id={data.id}
      ref={sectionRef}
      style={{
        padding: '20px 0 10px 0', /* Dramatically reduced bottom padding to pull the footer up */
        maxWidth: '1200px',
        margin: '0 auto',
        y: sectionY
      }}
    >
      {/* 1. Kinetic Header Stack (Centered) */}
      <motion.div
        style={{ 
          textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px',
          scale: headerScale, opacity: headerOpacity, y: headerY
        }}
      >
        <div>
          <span style={{
            display: 'inline-block',
            fontSize: '11px', fontWeight: 700, color: 'var(--dark)',
            letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px',
            background: 'rgba(201, 138, 68, 0.08)', padding: '6px 14px', borderRadius: '50px'
          }}>
            {data.tag}
          </span>
        </div>

        <h2 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 8vw, 56px)',
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
        </h2>

        <motion.p style={{
            fontSize: '18px', color: 'var(--secondary)', fontWeight: 400, lineHeight: 1.6, 
            opacity: sublineOpacity, y: sublineY
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
        className="services-parallax-img"
        style={{
          width: '100%', borderRadius: 'clamp(16px, 4vw, 32px)', overflow: 'hidden', position: 'relative',
          marginBottom: '48px', boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
        }}
      >
        <motion.img 
          src={data.image} alt={data.headlinePre} 
          style={{ width: '100%', height: '130%', objectFit: 'cover', y: imgY }}
        />
      </motion.div>

      {/* 3. The Problem & Solution (Kinetic Premium Cards) */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 'clamp(20px, 4vw, 40px)', marginBottom: '48px'
      }}>
        {/* Challenge Card */}
        <motion.div
          style={{
            background: 'rgba(250, 248, 245, 0.95)', padding: 'clamp(24px, 5vw, 50px)', borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)', borderBottom: '4px solid var(--accent)',
            scale: cardScale, opacity: cardOpacity, y: cardY
          }}
        >
          <h5 style={{ fontSize: '11px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', opacity: 0.6 }}>
            The Challenge
          </h5>
          <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: 'var(--dark)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
            {data.challenge}
          </p>
        </motion.div>

        {/* Approach Card */}
        <motion.div
          style={{
            background: 'rgba(250, 248, 245, 0.95)', padding: 'clamp(24px, 5vw, 50px)', borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)', borderBottom: '4px solid var(--accent)',
            scale: cardScale, opacity: cardOpacity, y: cardY
          }}
        >
          <h5 style={{ fontSize: '11px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', opacity: 0.6 }}>
            Our Approach
          </h5>
          <h4 style={{ 
            fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(20px, 4vw, 24px)', 
            color: 'var(--dark)', fontWeight: 500, lineHeight: 1.4, fontStyle: 'italic', margin: 0
          }}>
            "{data.approach}"
          </h4>
        </motion.div>
      </div>

      {/* 4. Offerings & Formats (Floating Expanding Accordions) */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '40px', marginBottom: '48px',
        alignItems: 'start'
      }}>
        <ExpandableCard title="What We Offer" delay={0}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.offerings.map((offering, idx) => (
              <li key={idx} style={{ position: 'relative', paddingLeft: '32px', fontSize: 'clamp(15px, 2.5vw, 17px)', color: 'var(--dark)', fontWeight: 500 }}>
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
          background: 'rgba(255,255,255,0.7)', padding: 'clamp(30px, 6vw, 60px)', borderRadius: '32px', color: 'var(--dark)',
          position: 'relative', overflow: 'hidden', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
          border: '1px solid rgba(255,255,255,1)', backdropFilter: 'blur(20px)'
        }}
      >
        <h5 style={{ fontSize: '12px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '36px' }}>
          Outcomes {data.id === 'community' ? '' : 'You Can Expect'}
        </h5>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          {data.outcomes.map((outcome, idx) => (
            <div key={idx} style={{
              background: 'rgba(250, 248, 245, 0.95)', padding: 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 28px)', borderRadius: '16px',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(18px, 3.5vw, 24px)', border: '1px solid rgba(0,0,0,0.04)',
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
            padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 40px)', background: 'var(--accent)', color: 'var(--white)',
            borderRadius: '50px', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: 600,
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
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(SERVICES_DATA[0].id)

  // Navigate to the correct tab based on URL param
  useEffect(() => {
    if (serviceId && SERVICES_DATA.find(s => s.id === serviceId)) {
      setActiveTab(serviceId)
    }
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }, [serviceId])

  const activeServiceData = SERVICES_DATA.find(s => s.id === activeTab) || SERVICES_DATA[0]

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
    <div style={{ position: 'relative', zIndex: 1 }}>
    <main style={{
      position: 'relative',
      background: 'transparent',
      minHeight: '100vh', paddingTop: '120px', overflow: 'hidden'
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* ACTIVE CONTENT WITH BUTTER SMOOTH ANIMATION TRIGGERED BY NAVBAR DROPDOWN */}
        <AnimatePresence mode="wait">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
             animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
             exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
             transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
           >
             <ServiceFullWidthSection data={activeServiceData} index={0} />
           </motion.div>
        </AnimatePresence>

        {/* BOTTOM NAVIGATION - EXPLORE OTHER SERVICES */}
        <div style={{
           marginTop: '0px',
           marginBottom: '100px',
           paddingTop: '20px',
           display: 'flex',
           flexDirection: 'column',
           alignItems: 'center'
        }}>
           <h3 style={{ 
               fontFamily: 'Cormorant Garamond, serif', 
               fontSize: '36px', 
               color: 'var(--dark)',
               marginBottom: '40px',
               fontStyle: 'italic'
           }}>
              Explore More Services
           </h3>
           <div style={{
               display: 'grid',
               gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
               gap: '30px',
               width: '100%',
               maxWidth: '900px'
           }}>
              {SERVICES_DATA.filter(s => s.id !== activeTab).map((service) => (
                 <button
                    key={service.id}
                    onClick={() => {
                        setActiveTab(service.id)
                        navigate(`/services/${service.id}`)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    style={{
                        background: 'var(--dark)',
                        padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 36px)', /* Dynamic padding to keep slimmer on mobile */
                        borderRadius: '50px',
                        border: 'none',
                        boxShadow: '0 15px 30px rgba(101,50,57,0.2)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 25px 50px rgba(101,50,57,0.3)'
                        e.currentTarget.style.background = '#4A2B2F' /* Slightly lighter plum on hover */
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(101,50,57,0.2)'
                        e.currentTarget.style.background = 'var(--dark)'
                    }}
                 >
                    <span style={{ 
                        fontFamily: 'Cormorant Garamond, serif', 
                        fontSize: 'clamp(18px, 4vw, 22px)', /* Fluid typography to fit slimmer button bounds */
                        fontWeight: 600, 
                        color: 'var(--white)',
                        lineHeight: 1.15
                    }}>
                        {service.tag}
                    </span>
                    
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700,
                        color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px',
                        flexShrink: 0  /* Ensure action text doesn't squish out of bounded box */
                    }}>
                        Explore <FiArrowRight size={18} />
                    </div>
                 </button>
              ))}
           </div>
        </div>

      </div>
    </main>

    {/* Responsive Media Queries for Services */}
    <style>{`
      .services-parallax-img {
        height: 460px;
      }
      @media (max-width: 768px) {
        .services-parallax-img {
          aspect-ratio: 0.8 !important;
          height: auto !important;
        }
      }
    `}</style>

    </div>
    </div>
  )
}
