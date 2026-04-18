import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const frameworkSteps = [
  { id: '01', title: 'Awareness', desc1: 'Understand thoughts', desc2: '& emotions' },
  { id: '02', title: 'Regulation', desc1: 'Control reactions', desc2: '& stress' },
  { id: '03', title: 'Expression', desc1: 'Release emotions safely', desc2: '' },
  { id: '04', title: 'Integration', desc1: 'Apply into daily life', desc2: '' },
  { id: '05', title: 'Performance', desc1: 'Achieve clarity', desc2: '& resilience' }
];

/* ─── Particle Canvas Component ─── */
function ParticleCanvas({ isHovered, size = 220, radius = 104 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const isHoveredRef = useRef(false);
  const mousePosRef = useRef(null); // { x, y } in canvas pixel coords

  useEffect(() => { isHoveredRef.current = isHovered; }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = size, H = size, R = radius;
    const cx = W / 2, cy = H / 2;

    // Track mouse relative to canvas
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      // Scale from display CSS pixels → canvas internal pixels
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      mousePosRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };
    const onMouseLeave = () => { mousePosRef.current = null; };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    // SWA brand colour palette
    const palette = [
      { r: 197, g: 144, b: 128 }, // #C69080 warm rose
      { r: 155, g: 91, b: 91 }, // #9B5B5B deep rose
      { r: 232, g: 197, b: 188 }, // #E8C5BC blush
      { r: 237, g: 216, b: 210 }, // #EDD8D2 cream
      { r: 175, g: 110, b: 100 }, // mid rose
      { r: 101, g: 50, b: 57 }, // #653239 dark
    ];

    // 480 particles — denser field with 0.25x speed bump
    const particles = Array.from({ length: 480 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.5) * R * 0.94; // uniform radial distribution
      const c = palette[Math.floor(Math.random() * palette.length)];
      const baseSpeed = (0.35 + Math.random() * 0.3); // 0.25x faster than before
      const va = Math.random() * Math.PI * 2;
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: Math.cos(va) * baseSpeed,
        vy: Math.sin(va) * baseSpeed,
        baseSpeed,
        size: 0.8 + Math.random() * 2,
        r: c.r, g: c.g, b: c.b,
        baseAlpha: 0.25 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.007 + Math.random() * 0.015,
      };
    });

    const REPEL_RADIUS = 55;   // px — how close cursor affects particles
    const REPEL_FORCE = 2.8;  // strength of push
    const MAX_SPEED = 4.5;  // speed cap so particles don't fly off instantly

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Subtle radial glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grd.addColorStop(0, 'rgba(245, 235, 232, 0.13)');
      grd.addColorStop(0.5, 'rgba(197, 144, 128, 0.05)');
      grd.addColorStop(1, 'rgba(101, 50, 57, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      const mouse = mousePosRef.current;

      for (const p of particles) {
        // ── Mouse repulsion ──────────────────────────────────────────
        if (mouse) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < REPEL_RADIUS && md > 0) {
            const force = (1 - md / REPEL_RADIUS) * REPEL_FORCE;
            p.vx += (mdx / md) * force;
            p.vy += (mdy / md) * force;
          }
        }

        // ── Speed management ───────────────────────────────────────────
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        if (spd > MAX_SPEED) {
          // Hard cap — clamp to max
          p.vx = (p.vx / spd) * MAX_SPEED;
          p.vy = (p.vy / spd) * MAX_SPEED;
        } else if (mouse && spd > p.baseSpeed * 1.3) {
          // Damp ONLY when repulsion has boosted speed above normal
          p.vx *= 0.97;
          p.vy *= 0.97;
        } else if (spd < p.baseSpeed * 0.85) {
          // Speed FLOOR — particles should never stop; gradually restore base speed
          const factor = Math.min(1.06, p.baseSpeed / (spd + 0.0001));
          p.vx *= factor;
          p.vy *= factor;
        }

        p.x += p.vx;
        p.y += p.vy;

        // ── Boundary bounce ───────────────────────────────────────────
        const dx = p.x - cx, dy = p.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d >= R - p.size) {
          const nx = dx / d, ny = dy / d;
          const dot = p.vx * nx + p.vy * ny;
          p.vx -= 2 * dot * nx;
          p.vy -= 2 * dot * ny;
          p.x = cx + nx * (R - p.size - 0.5);
          p.y = cy + ny * (R - p.size - 0.5);
        }

        // ── Twinkle ──────────────────────────────────────────────────
        p.phase += p.phaseSpeed;
        const alpha = p.baseAlpha * (0.35 + 0.65 * Math.abs(Math.sin(p.phase)));

        // Highlight particles near the cursor
        const glow = mouse && (() => {
          const md = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
          return md < REPEL_RADIUS ? 1 - md / REPEL_RADIUS : 0;
        })();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + (glow ? glow * 1.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${Math.min(1, alpha + (glow || 0) * 0.5)})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [size, radius]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: 'block', borderRadius: '50%', cursor: 'crosshair' }}
    />
  );
}


/* ─── Main Section ─── */
export default function TransformationModelSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [centerHovered, setCenterHovered] = useState(false);

  const { scrollYProgress: headerScroll } = useScroll({
    target: headerRef,
    offset: ["start 90%", "start 40%"]
  });
  const headerOpacity = useTransform(headerScroll, [0, 1], [0.1, 1]);
  const headerY = useTransform(headerScroll, [0, 1], [60, 0]);
  const headerScale = useTransform(headerScroll, [0, 1], [1.1, 1]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        background: "var(--bg)",
        fontFamily: "'Cormorant Garamond', serif",
        padding: "60px 24px 0px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {/* Background Video */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <motion.video className="video-desktop" autoPlay muted loop playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}>
          <source src="/video.mp4" type="video/mp4" />
        </motion.video>
        <motion.video className="video-mobile" autoPlay muted loop playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}>
          <source src="/video1.mp4" type="video/mp4" />
        </motion.video>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(250, 247, 242, 0.4)' }} />
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>

        {/* Kinetic Header */}
        <motion.div
          ref={headerRef}
          style={{ textAlign: "center", marginBottom: 0, opacity: headerOpacity, y: headerY, scale: headerScale }}
        >
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(16px, 3.5vw, 64px)',
            fontWeight: 700,
            color: 'var(--dark)',
            marginBottom: '16px',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            SWA Core <span style={{ fontStyle: 'italic', fontWeight: 600, textTransform: 'none' }}>Transformation</span> Framework
          </h2>
        </motion.div>

        {/* Global CSS */}
        <style>{`
          @keyframes dashMove {
            from { stroke-dashoffset: 80; }
            to   { stroke-dashoffset: 0;  }
          }
          @keyframes float {
            0%,100% { transform: translateY(0px); }
            50%      { transform: translateY(-8px); }
          }
          @keyframes floatMobile {
            0%,100% { transform: translateX(0px); }
            50%      { transform: translateX(-4px); }
          }
          .arc-bg   { fill: none; stroke: #E8D5D0; stroke-width: 2; }
          .arc-anim {
            fill: none; stroke: #9B5B5B; stroke-width: 3;
            stroke-linecap: round; stroke-dasharray: 8 20;
            animation: dashMove 1.5s linear infinite;
          }
          .node-circle { cursor: default; transition: filter 0.4s ease, transform 0.4s ease; }
          .node-circle:hover {
            filter: drop-shadow(0 12px 20px rgba(101,50,57,0.3));
            transform: scale(1.05);
          }
          .center-hover-zone {
            cursor: pointer;
          }
          .floating   { animation: float 4s ease-in-out infinite; }
          .floatMob   { animation: floatMobile 4s ease-in-out infinite; }
          .d-1 { animation-delay:0.0s; } .d-2 { animation-delay:0.8s; }
          .d-3 { animation-delay:1.6s; } .d-4 { animation-delay:2.4s; }
          .d-5 { animation-delay:3.2s; }
          @media (max-width:768px) {
            .video-desktop,.desktop-framework { display:none !important; }
            .video-mobile,.mobile-framework   { display:block !important; }
          }
          @media (min-width:769px) {
            .video-mobile,.mobile-framework   { display:none !important; }
            .video-desktop,.desktop-framework { display:block !important; }
          }
        `}</style>

        {/* ───── DESKTOP SVG ───── */}
        <div className="desktop-framework" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg
            viewBox="-80 45 840 640"
            style={{ width: '100%', maxWidth: '780px', height: 'auto', display: 'block', margin: '0 auto' }}
            role="img" xmlns="http://www.w3.org/2000/svg"
          >
            <title>SWA Core Transformation Framework</title>
            <defs>
              <marker id="arrowWine" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M1 1L9 5L1 9" fill="none" stroke="#9B5B5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
              {/* Clip path to constrain particles to the center circle */}
              <clipPath id="centerCircleClip">
                <circle cx="340" cy="340" r="189" />
              </clipPath>
            </defs>

            {/* ── Full-orbit particle canvas ── */}
            <foreignObject
              x="150" y="150" width="380" height="380"
              clipPath="url(#centerCircleClip)"
              onMouseEnter={() => setCenterHovered(true)}
              onMouseLeave={() => setCenterHovered(false)}
              className="center-hover-zone"
            >
              <div xmlns="http://www.w3.org/1999/xhtml">
                <ParticleCanvas isHovered={centerHovered} size={380} radius={186} />
              </div>
            </foreignObject>

            {/* Center Label (on top of particles) */}
            <text x="340" y="330" textAnchor="middle" fontSize="20" fontWeight="700" fill="#653239" fontFamily="'DM Sans', sans-serif" letterSpacing="3" pointerEvents="none">SWA CORE</text>
            <text x="340" y="356" textAnchor="middle" fontSize="20" fontWeight="700" fill="#653239" fontFamily="'DM Sans', sans-serif" letterSpacing="2" pointerEvents="none">TRANSFORMATION</text>

            {/* Animated Arcs */}
            <path className="arc-bg" d="M 405 161 A 190 190 0 0 1 490 223" markerEnd="url(#arrowWine)" />
            <path className="arc-anim" d="M 405 161 A 190 190 0 0 1 490 223" />
            <path className="arc-bg" d="M 530 347 A 190 190 0 0 1 498 446" markerEnd="url(#arrowWine)" />
            <path className="arc-anim" d="M 530 347 A 190 190 0 0 1 498 446" />
            <path className="arc-bg" d="M 392 523 A 190 190 0 0 1 288 523" markerEnd="url(#arrowWine)" />
            <path className="arc-anim" d="M 392 523 A 190 190 0 0 1 288 523" />
            <path className="arc-bg" d="M 183 446 A 190 190 0 0 1 150 347" markerEnd="url(#arrowWine)" />
            <path className="arc-anim" d="M 183 446 A 190 190 0 0 1 150 347" />
            <path className="arc-bg" d="M 190 223 A 190 190 0 0 1 275 161" markerEnd="url(#arrowWine)" />
            <path className="arc-anim" d="M 190 223 A 190 190 0 0 1 275 161" />

            {/* Node 1 — TOP */}
            <g className="floating d-1" style={{ transformOrigin: '340px 150px' }}>
              <g className="node-circle">
                <circle cx="340" cy="150" r="54" fill="#F5EBE8" stroke="#C69080" strokeWidth="1" />
                <circle cx="340" cy="150" r="44" fill="#EDD8D2" stroke="#C69080" strokeWidth="0.5" />
                <text x="340" y="145" textAnchor="middle" fontSize="16" fontWeight="600" fill="#653239" fontFamily="'Cormorant Garamond', serif">Awareness</text>
                <text x="340" y="163" textAnchor="middle" fontSize="12" fontWeight="500" fill="#9B5B5B" fontFamily="'DM Sans', sans-serif">01</text>
              </g>
              <text x="340" y="72" textAnchor="middle" fontSize="13" fill="#653239" fontFamily="'DM Sans', sans-serif">Understand thoughts &amp; emotions</text>
            </g>

            {/* Node 2 — RIGHT */}
            <g className="floating d-2" style={{ transformOrigin: '521px 281px' }}>
              <g className="node-circle">
                <circle cx="521" cy="281" r="54" fill="#F5EBE8" stroke="#C69080" strokeWidth="1" />
                <circle cx="521" cy="281" r="44" fill="#EDD8D2" stroke="#C69080" strokeWidth="0.5" />
                <text x="521" y="276" textAnchor="middle" fontSize="16" fontWeight="600" fill="#653239" fontFamily="'Cormorant Garamond', serif">Regulation</text>
                <text x="521" y="294" textAnchor="middle" fontSize="12" fontWeight="500" fill="#9B5B5B" fontFamily="'DM Sans', sans-serif">02</text>
              </g>
              <text x="588" y="276" textAnchor="start" fontSize="13" fill="#653239" fontFamily="'DM Sans', sans-serif">Control reactions</text>
              <text x="588" y="293" textAnchor="start" fontSize="13" fill="#653239" fontFamily="'DM Sans', sans-serif">&amp; stress</text>
            </g>

            {/* Node 3 — BOTTOM RIGHT */}
            <g className="floating d-3" style={{ transformOrigin: '452px 494px' }}>
              <g className="node-circle">
                <circle cx="452" cy="494" r="54" fill="#7A3535" stroke="#5A2020" strokeWidth="1" />
                <circle cx="452" cy="494" r="44" fill="#653239" stroke="#5A2020" strokeWidth="0.5" />
                <text x="452" y="489" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F5EBE8" fontFamily="'Cormorant Garamond', serif">Expression</text>
                <text x="452" y="507" textAnchor="middle" fontSize="12" fontWeight="500" fill="#E8C5BC" fontFamily="'DM Sans', sans-serif">03</text>
              </g>
              <text x="452" y="580" textAnchor="middle" fontSize="13" fill="#653239" fontFamily="'DM Sans', sans-serif">Release emotions safely</text>
            </g>

            {/* Node 4 — BOTTOM LEFT */}
            <g className="floating d-4" style={{ transformOrigin: '228px 494px' }}>
              <g className="node-circle">
                <circle cx="228" cy="494" r="54" fill="#7A3535" stroke="#5A2020" strokeWidth="1" />
                <circle cx="228" cy="494" r="44" fill="#653239" stroke="#5A2020" strokeWidth="0.5" />
                <text x="228" y="489" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F5EBE8" fontFamily="'Cormorant Garamond', serif">Integration</text>
                <text x="228" y="507" textAnchor="middle" fontSize="12" fontWeight="500" fill="#E8C5BC" fontFamily="'DM Sans', sans-serif">04</text>
              </g>
              <text x="228" y="580" textAnchor="middle" fontSize="13" fill="#653239" fontFamily="'DM Sans', sans-serif">Apply into daily life</text>
            </g>

            {/* Node 5 — LEFT */}
            <g className="floating d-5" style={{ transformOrigin: '159px 281px' }}>
              <g className="node-circle">
                <circle cx="159" cy="281" r="54" fill="#F5EBE8" stroke="#C69080" strokeWidth="1" />
                <circle cx="159" cy="281" r="44" fill="#EDD8D2" stroke="#C69080" strokeWidth="0.5" />
                <text x="159" y="276" textAnchor="middle" fontSize="16" fontWeight="600" fill="#653239" fontFamily="'Cormorant Garamond', serif">Performance</text>
                <text x="159" y="294" textAnchor="middle" fontSize="12" fontWeight="500" fill="#9B5B5B" fontFamily="'DM Sans', sans-serif">05</text>
              </g>
              <text x="90" y="276" textAnchor="end" fontSize="13" fill="#653239" fontFamily="'DM Sans', sans-serif">Achieve clarity</text>
              <text x="90" y="293" textAnchor="end" fontSize="13" fill="#653239" fontFamily="'DM Sans', sans-serif">&amp; resilience</text>
            </g>
          </svg>
        </div>

        {/* ───── MOBILE VERTICAL TIMELINE ───── */}
        <div className="mobile-framework">
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '32px' }}>
            <svg style={{ position: 'absolute', left: '0px', top: '32px', height: 'calc(100% - 64px)', width: '30px', overflow: 'visible' }}>
              <line x1="15" y1="0" x2="15" y2="100%" stroke="#E8D5D0" strokeWidth="2" />
              <line x1="15" y1="0" x2="15" y2="100%" stroke="#9B5B5B" strokeWidth="3" strokeDasharray="8 20" style={{ animation: 'dashMove 1.5s linear infinite' }} />
            </svg>

            {frameworkSteps.map((step, index) => {
              const isDark = step.id === '03' || step.id === '04';
              return (
                <div key={index} className={`floatMob d-${index + 1}`} style={{ marginBottom: index === frameworkSteps.length - 1 ? 40 : '40px', position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: '-17px', top: '30px', width: '20px', height: '2px', overflow: 'visible' }}>
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#E8D5D0" strokeWidth="2" />
                  </svg>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: isDark ? '#7A3535' : '#F5EBE8', padding: '8px 16px 8px 8px', borderRadius: '40px', border: `1px solid ${isDark ? '#5A2020' : '#C69080'}` }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: isDark ? '#653239' : '#EDD8D2', border: `1px solid ${isDark ? '#5A2020' : '#C69080'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: isDark ? '#E8C5BC' : '#9B5B5B' }}>{step.id}</span>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: isDark ? '#F5EBE8' : '#653239', margin: '0 0 2px 0', lineHeight: 1.1 }}>{step.title}</h4>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: isDark ? '#E8C5BC' : 'var(--dark)', margin: 0, lineHeight: 1.4, opacity: 0.9 }}>{step.desc1} {step.desc2}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
