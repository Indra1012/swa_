import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

const TEAM_IMAGES = [
  { img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80', name: 'Alina R.', role: 'Senior Therapist' },
  { img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', name: 'Marcus T.', role: 'Performance Coach' },
  { img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', name: 'Sarah M.', role: 'Somatic Healer' },
  { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', name: 'David L.', role: 'Organizational Expert' }
]

export default function About() {
  const navigate = useNavigate()
  const pageRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] })
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 150])

  return (
    <main ref={pageRef} className="about-page" style={{ margin: 0, padding: 0, paddingTop: '72px', minHeight: '100vh', overflow: 'hidden' }}>

      {/* 1. EPIC HERO BANNER */}
      <section style={{
        position: 'relative', height: '600px', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', background: 'var(--dark)', margin: 0
      }}>
        <motion.div style={{ position: 'absolute', inset: 0, y: heroY }}>
          <img
            src="https://images.unsplash.com/photo-1494599948593-3dafe8338d71?w=2000&q=80"
            alt="SWA About Hero"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(101,50,57,0.62)' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px', padding: '0 40px' }}
        >
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700, color: 'var(--accent)',
            letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '24px'
          }}>
            The SWA Story
          </span>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(50px, 6vw, 84px)',
            fontWeight: 700, color: 'var(--white)', lineHeight: 1.05, letterSpacing: '-1px', marginBottom: '24px'
          }}>
            Master your <span style={{ fontStyle: 'italic', fontWeight: 500 }}>emotions.</span>
          </h1>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(50px, 6vw, 84px)',
            fontWeight: 700, color: 'var(--white)', lineHeight: 1.05, letterSpacing: '-1px', fontStyle: 'italic'
          }}>
            Lead with <span style={{ color: 'var(--primary)' }}>clarity.</span>
          </h1>
        </motion.div>
      </section>

      {/* 2. ELEVATED FOUNDER HIGHLIGHT */}
      <section style={{ background: 'var(--white)', padding: '80px 0', margin: 0 }}>
      <div style={{ padding: '0 40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '80px', alignItems: 'center'
        }}>
          {/* Stunning Portrait with floating backdrop */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ position: 'relative', height: '650px', borderRadius: '32px' }}
          >
            {/* Floating abstract decorative box behind */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: '-40px', left: '-40px', width: '80%', height: '80%',
                background: 'rgba(175,122,109,0.1)', borderRadius: '32px', zIndex: 0
              }} 
            />
            {/* The Image */}
            <div style={{
              width: '100%', height: '100%', borderRadius: '32px', overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1
            }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80"
                alt="Dhruvi Shah"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Floating name badge */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', bottom: '40px', right: '-30px', background: 'var(--white)',
                padding: '24px 40px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', zIndex: 2
              }}
            >
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: 'var(--dark)', marginBottom: '4px' }}>
                Dhruvi Shah
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
                Founder & Head Coach
              </p>
            </motion.div>
          </motion.div>

          {/* Deep Bio Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          >
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: 'var(--dark)', lineHeight: 1.1, marginBottom: '32px', fontWeight: 700, letterSpacing: '-0.5px'
            }}>
              Building emotionally resilient individuals & <span style={{ fontStyle: 'italic', fontWeight: 500 }}>conscious leaders.</span>
            </h2>
            
            <p style={{ fontSize: '18px', color: 'var(--secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
              Dhruvi Shah is the Founder and Head Wellness Coach at SWA Wellness. With a deeply rooted background in psychology, a diploma in expressive art therapy, and rich experience as an international sound healer, she brings a uniquely holistic and integrative approach to modern mental well-being.
            </p>
            
            <p style={{ fontSize: '18px', color: 'var(--secondary)', lineHeight: 1.8, marginBottom: '40px' }}>
              Her expertise extensively spans mental health wellness, Indian psychology, and leadership development—masterfully blending traditional ancient wisdom with structured contemporary practices.
            </p>

            <div style={{
              padding: '40px', background: 'var(--white)', borderRadius: '24px', position: 'relative',
              boxShadow: '0 10px 40px rgba(0,0,0,0.03)', borderLeft: '3px solid var(--secondary)'
            }}>
              <span style={{ position: 'absolute', top: -15, left: 30, fontSize: '60px', color: 'var(--accent)', opacity: 0.2, fontFamily: 'serif', lineHeight: 1 }}>"</span>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: 'var(--dark)', fontStyle: 'italic', lineHeight: 1.4, margin: 0
              }}>
                Dhruvi is driven by a clear mission: to help individuals understand and master their emotions before those emotions begin to shape their decisions—enabling more balanced, self-aware, and effective leadership.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      </section>

      {/* 3. CORE SERVICES SNAPSHOT WITH FLOATING HOVER */}
      <section style={{ background: 'var(--white)', padding: '0 0 80px 0', margin: 0 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h5 style={{ fontSize: '11px', color: 'var(--dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '16px' }}>Services by us</h5>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', color: 'var(--dark)', fontWeight: 700, letterSpacing: '-0.5px' }}>Wellness across every <span style={{ fontStyle: 'italic', fontWeight: 500 }}>pillar</span></h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { t: 'Corporate Wellness Program', d: 'Fostering high-performance organizations through resilience and connection.' },
              { t: 'Student Welfare Program', d: 'Cultivating emotional intelligence and academic focus in early stages.' },
              { t: 'Community Wellness Program', d: 'Healing the collective fabric through scaleable wellbeing outreach.' }
            ].map((srv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
                style={{
                  background: 'var(--bg2)', padding: '50px 40px', borderRadius: '24px', textAlign: 'center',
                  border: '1px solid rgba(204,199,185,0.25)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: 'all 0.4s ease', cursor: 'pointer'
                }}
                onClick={() => navigate('/services')}
              >
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: 'var(--dark)', marginBottom: '16px' }}>{srv.t}</h3>
                <p style={{ fontSize: '15px', color: 'var(--secondary)', lineHeight: 1.6 }}>{srv.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE TEAM GALLERY WITH CONSTANT FLOATING ANIMATIONS */}
      <section style={{ background: 'var(--bg2)', padding: '80px 0', margin: 0 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '4px' }}>The Collective</span>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '56px', color: 'var(--dark)', margin: '16px 0 24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Our Team of <span style={{ fontStyle: 'italic', fontWeight: 500 }}>Experts</span></h2>
          <p style={{ fontSize: '18px', color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto' }}>A meticulously curated network of psychological professionals, coaches, and healers dedicated to holistic integration.</p>
        </div>

        <div className="team-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', maxWidth: '1400px', margin: '0 auto', padding: '0 40px'
        }}>
          {TEAM_IMAGES.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              animate={{ y: [0, (i%2===0?-15:15), 0] }} // Asymmetric continuous float
              style={{
                borderRadius: '24px', overflow: 'hidden', position: 'relative', height: i%2===0 ? '320px' : '420px',
                marginTop: i%2!==0 ? '80px' : '0', boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
              }}
            >
              <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(101,50,57,0.8) 0%, transparent 60%)'
              }} />
              <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: 'var(--white)' }}>
                <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', marginBottom: '4px' }}>{member.name}</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, margin: 0 }}>{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. ABOUT THE COMPANY - DEEP STORYTELLING & HIGHLIGHTS */}
      <section style={{ background: 'var(--dark)', padding: '80px 0', margin: 0 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          {/* Animated floating insignia */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ width: '80px', height: '80px', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '60px' }}
          >
            <div style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '50%' }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px, 5vw, 68px)', color: 'var(--white)', lineHeight: 1.1, maxWidth: '900px', marginBottom: '40px', fontWeight: 700, letterSpacing: '-0.5px' }}
          >
            True performance is sustained by <span style={{ fontStyle: 'italic', fontWeight: 500 }}>inner stability</span>, not external pressure.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: '800px', marginBottom: '80px' }}
          >
            At SWA Wellness, we believe that emotional wellbeing is the absolute bedrock of successful lives and organizations. 
            We do not just offer temporary relief; we architect structured, science-backed, and culturally-rooted programs tailored to fundamentally shift internal perspectives. 
            Our mission is to establish behavioral foundations that stand resilient through shifting environments.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', width: '100%', textAlign: 'left' }}>
            {[
              { title: 'Scientific & Grounded', text: 'Integrating empirical modern psychology with highly effective somatic traditional modalities for comprehensive healing.' },
              { title: 'Measurable Outcomes', text: 'Crafting strategic pathways for tangible improvement in focus, retention, and conflict-resolution.' }
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + (i*0.1) }}
                style={{ background: 'rgba(255,255,255,0.04)', padding: '50px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '16px' }}>{p.title}</h4>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>{p.text}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section style={{ background: 'var(--bg2)', padding: '80px 0', margin: 0, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px', display: 'block' }}>Let's Collaborate</span>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 4vw, 56px)', color: 'var(--dark)', fontWeight: 700, letterSpacing: '-0.5px' }}>Transform your <span style={{ fontStyle: 'italic', fontWeight: 500 }}>environment</span> today.</h2>
          
          <button 
            onClick={() => navigate('/book-demo')}
            style={{
              marginTop: '40px', display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '20px 48px', background: 'var(--dark)', color: 'var(--white)',
              borderRadius: '50px', fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease', boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'
              e.currentTarget.style.background = 'var(--dark2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)'
              e.currentTarget.style.background = 'var(--dark)'
            }}
          >
            Work with us <FiArrowRight size={20} />
          </button>
        </motion.div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </main>
  )
}
