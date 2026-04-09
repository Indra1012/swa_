import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const dimensions = [
  {
    number: "01",
    title: "Psychological Awareness",
    desc: "thoughts & beliefs",
    icon: "◎",
  },
  {
    number: "02",
    title: "Emotional Expression",
    desc: "processing & intelligence",
    icon: "◑",
  },
  {
    number: "03",
    title: "Body & Somatic Awareness",
    desc: "stress release",
    icon: "◐",
  },
  {
    number: "04",
    title: "Energy & Relaxation",
    desc: "nervous system balance",
    icon: "◉",
  },
  {
    number: "05",
    title: "Social & Relationship Wellness",
    desc: "connection & communication",
    icon: "◍",
  },
  {
    number: "06",
    title: "Environmental Awareness",
    desc: "grounding & creativity",
    icon: "◌",
  },
];

function ScrollDrivenCard({ item }) {
  const cardRef = useRef(null);
  
  // Bind animation strictly to scroll progress
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 95%", "start 65%"] // Animates smoothly while the top of the card is in the bottom 30% of the screen
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, y, scale }}
      className="swa-card"
    >
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12,
        letterSpacing: "0.15em",
        color: "var(--accent)",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 600,
        textTransform: 'uppercase'
      }}>
        <span style={{ fontSize: 16, opacity: 0.8 }}>{item.icon}</span> {item.number}
      </div>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "26px",
        fontWeight: 600,
        color: "var(--dark)",
        lineHeight: 1.2,
        marginBottom: 8
      }}>
        {item.title}
      </h3>
      <p style={{ 
        fontFamily: "'DM Sans', sans-serif", 
        fontSize: "15px", 
        color: "rgba(101, 50, 57, 0.7)", 
        fontWeight: 400,
        lineHeight: 1.5,
        margin: 0
      }}>
        ({item.desc})
      </p>
    </motion.div>
  );
}

export default function TransformationModelSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  
  // Header Kinetic Typography Scroll Bond
  const { scrollYProgress: headerScroll } = useScroll({
    target: headerRef,
    offset: ["start 90%", "start 40%"]
  });
  const headerOpacity = useTransform(headerScroll, [0, 1], [0.1, 1]);
  const headerY = useTransform(headerScroll, [0, 1], [60, 0]);
  const headerScale = useTransform(headerScroll, [0, 1], [1.1, 1]); // Kinetic scale down

  // Footer Scroll Bond
  const { scrollYProgress: footerScroll } = useScroll({
    target: footerRef,
    offset: ["start 100%", "start 80%"]
  });
  const footerOpacity = useTransform(footerScroll, [0, 1], [0, 1]);
  const footerY = useTransform(footerScroll, [0, 1], [40, 0]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        background: "var(--bg)",
        fontFamily: "'Cormorant Garamond', serif",
        padding: "100px 24px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh"
      }}
    >
      {/* Background Video Layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
         <motion.video 
           className="video-desktop"
           autoPlay 
           muted 
           loop 
           playsInline
           style={{
             width: '100%',
             height: '100%', 
             objectFit: 'cover',
             objectPosition: 'center'
           }}
         >
           <source src="/video.mp4" type="video/mp4" />
         </motion.video>
         <motion.video 
           className="video-mobile"
           autoPlay 
           muted 
           loop 
           playsInline
           style={{
             width: '100%',
             height: '100%', 
             objectFit: 'cover',
             objectPosition: 'center'
           }}
         >
           <source src="/video1.mp4" type="video/mp4" />
         </motion.video>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
        
        {/* Scroll-Driven Kinetic Header */}
        <motion.div
          ref={headerRef}
          style={{ 
            textAlign: "center", 
            marginBottom: 60,
            opacity: headerOpacity,
            y: headerY,
            scale: headerScale
          }}
        >
          <h2 style={{
             fontFamily: "'Cormorant Garamond', serif",
             fontSize: 'clamp(36px, 5vw, 64px)',
             fontWeight: 700,
             color: 'var(--dark)',
             marginBottom: '16px',
             lineHeight: 1.1,
             letterSpacing: '-0.5px',
             textTransform: 'uppercase'
          }}>
            SWA 360° <span style={{ fontStyle: 'italic', fontWeight: 600, textTransform: 'none' }}>Transformation</span> Model
          </h2>
          <p style={{
             fontSize: '18px',
             color: 'rgba(101, 50, 57, 0.75)',
             lineHeight: 1.6,
             maxWidth: '600px',
             margin: '0 auto',
             fontFamily: "'DM Sans', sans-serif"
          }}>
            Our approach works across six dimensions:
          </p>
        </motion.div>

        {/* CSS rules */}
        <style>{`
          .swa-card {
            background: rgba(250, 247, 242, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1.5px solid rgba(175, 122, 109, 0.2);
            border-radius: 16px;
            padding: 32px 28px;
            transition: box-shadow 0.4s ease, border-color 0.4s ease, background 0.4s ease;
            position: relative;
            overflow: hidden;
            border-left: 4px solid var(--accent);
          }
          .swa-card:hover {
            box-shadow: 0 20px 40px rgba(101, 50, 57, 0.1);
            background: #fff;
            border-color: rgba(175, 122, 109, 0.4);
            border-left-color: var(--dark);
          }
          
          /* Using transform carefully in hover state since scale/y are bound to inline style via Framer Motion */
          .swa-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%);
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
          }
          .swa-card:hover::after {
            opacity: 1;
          }

          @media (max-width: 768px) {
            .video-desktop { display: none !important; }
            .video-mobile { display: block !important; }
          }
          @media (min-width: 769px) {
            .video-desktop { display: block !important; }
            .video-mobile { display: none !important; }
          }
        `}</style>

        {/* 3-Column Scroll-Driven Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          width: "100%"
        }}>
          {dimensions.map((item, i) => (
            <ScrollDrivenCard key={i} item={item} index={i} />
          ))}
        </div>

        {/* Scroll-Driven Footer Text */}
        <motion.div
          ref={footerRef}
          style={{
            textAlign: "center",
            marginTop: 64,
            opacity: footerOpacity,
            y: footerY
          }}
        >
          <div style={{
            width: 60,
            height: 1,
            background: "var(--accent)",
            margin: "0 auto 24px",
            opacity: 0.4
          }} />
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "16px",
            color: "var(--dark)",
            fontWeight: 500,
            letterSpacing: "0.02em"
          }}>
            This ensures holistic and sustainable transformation across all sectors.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
