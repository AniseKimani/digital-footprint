/**
 * animations.js — Reusable GSAP Animation Helpers
 * "The Power of the Digital Footprint" — Educational Short Film Intro
 *
 * Depends on: GSAP 3.12 core, TextPlugin, ScrollTrigger (loaded via CDN)
 * Canvas: 405px × 720px portrait (9:16)
 * Design tokens defined in style.css (--color-blue, --color-purple, etc.)
 *
 * Helper index:
 *   1. initParticles(canvasId)
 *   2. drawSVGPath(el, duration, delay)
 *   3. rippleOut(container, color, count, options)
 *   4. typeWriter(el, text, duration, delay)
 *   5. bloomCards(cards, centerX, centerY, radius, options)
 *   6. createNotifBadges(container, messages, options)
 *   7. buildNodeGraph(canvas, nodeCount, options)
 *   8. createSparkles(container, count, color, options)
 *   9. sceneTransition(fromScene, toScene, type, duration)
 */

// ─────────────────────────────────────────────
//  0. GSAP PLUGIN REGISTRATION
// ─────────────────────────────────────────────
// Register TextPlugin so typeWriter() can animate text character by character.
// ScrollTrigger is registered here too for completeness even if scenes don't scrub.
gsap.registerPlugin(TextPlugin, ScrollTrigger);

// Pull CSS custom properties so JS colours match the design tokens exactly.
const ROOT_STYLES = getComputedStyle(document.documentElement);
const TOKEN = {
  blue:    ROOT_STYLES.getPropertyValue('--color-blue').trim()   || '#378ADD',
  purple:  ROOT_STYLES.getPropertyValue('--color-purple').trim() || '#7F77DD',
  teal:    ROOT_STYLES.getPropertyValue('--color-teal').trim()   || '#1D9E75',
  amber:   ROOT_STYLES.getPropertyValue('--color-amber').trim()  || '#EF9F27',
  red:     ROOT_STYLES.getPropertyValue('--color-red').trim()    || '#E24B4A',
  bg:      ROOT_STYLES.getPropertyValue('--color-bg').trim()     || '#080810',
};

// ─────────────────────────────────────────────
//  1. PARTICLE BACKGROUND — initParticles()
// ─────────────────────────────────────────────
/**
 * Renders a persistent floating particle field on a <canvas> element.
 * Particles drift upward slowly, fade at the top, and re-seed at the bottom —
 * creating the sense of data quietly streaming through the background.
 *
 * @param {string} canvasId  — id attribute of the <canvas> element
 * @returns {{ stop: Function }} — call .stop() to cancel the animation loop
 */
function initParticles(canvasId = 'particle-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.warn(`initParticles: no <canvas id="${canvasId}"> found.`);
    return { stop: () => {} };
  }

  const ctx    = canvas.getContext('2d');
  const W      = canvas.width  = canvas.offsetWidth  || 405;
  const H      = canvas.height = canvas.offsetHeight || 720;

  // ── Particle configuration ──────────────────────────────────────────────
  const PARTICLE_COUNT = 60;  // enough to feel alive without being noisy
  const BASE_COLOR     = TOKEN.blue;

  // Convert hex → {r, g, b} so we can set alpha independently
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 55, g: 138, b: 221 };
  }
  const { r: PR, g: PG, b: PB } = hexToRgb(BASE_COLOR);

  // ── Particle factory ────────────────────────────────────────────────────
  function makeParticle(seedAtTop = false) {
    return {
      x:     Math.random() * W,
      // if seeding fresh, start anywhere; otherwise start at bottom for loop
      y:     seedAtTop ? Math.random() * H : H + Math.random() * 40,
      // speed varies so particles don't move as a sheet
      speed: 0.2 + Math.random() * 0.5,
      // slight horizontal drift for organic feel
      drift: (Math.random() - 0.5) * 0.15,
      // radius: mostly tiny, occasionally a slightly larger "data node"
      r:     Math.random() < 0.1 ? 2.2 : 0.8 + Math.random() * 1.2,
      // alpha peaks mid-canvas, fades near top and bottom
      alpha: 0.15 + Math.random() * 0.45,
      // each particle has a random twinkle phase
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed:  0.4 + Math.random() * 0.8,
    };
  }

  // Seed the canvas with particles spread across the full height
  const particles = Array.from({ length: PARTICLE_COUNT }, () => makeParticle(true));

  // ── Animation loop ──────────────────────────────────────────────────────
  let frameId;
  let elapsed = 0;

  function tick() {
    frameId = requestAnimationFrame(tick);
    elapsed += 0.016; // approximate 60 fps delta

    // Clear with a dark translucent fill for a soft motion-blur trail effect
    ctx.fillStyle = 'rgba(8, 8, 16, 0.18)';
    ctx.fillRect(0, 0, W, H);

    for (const p of particles) {
      // Move upward + drift
      p.y -= p.speed;
      p.x += p.drift;

      // Wrap horizontally
      if (p.x < -5)  p.x = W + 5;
      if (p.x > W + 5) p.x = -5;

      // Recycle particle when it drifts off the top
      if (p.y < -10) {
        Object.assign(p, makeParticle(false));
      }

      // Twinkle: modulate alpha gently with a sine wave
      const twinkle = 0.75 + 0.25 * Math.sin(elapsed * p.twinkleSpeed + p.twinkleOffset);
      const finalAlpha = p.alpha * twinkle;

      // Fade near vertical edges for natural vignette
      const edgeFade = Math.min(p.y / 60, 1, (H - p.y) / 60);
      const alpha = finalAlpha * edgeFade;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${PR}, ${PG}, ${PB}, ${alpha})`;
      ctx.fill();

      // Occasionally draw a tiny connecting line to the nearest particle
      // (kept cheap — only runs for 15% of particles per frame)
      if (Math.random() < 0.15) {
        for (const other of particles) {
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 55 && dist > 1) {
            const lineAlpha = (1 - dist / 55) * 0.08 * edgeFade;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(${PR}, ${PG}, ${PB}, ${lineAlpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
    }
  }

  tick();

  // Return a handle so callers can stop the loop (e.g. when recording frames)
  return {
    stop() { cancelAnimationFrame(frameId); },
  };
}


// ─────────────────────────────────────────────
//  2. SVG PATH DRAW — drawSVGPath()
// ─────────────────────────────────────────────
/**
 * Animates an SVG <path> (or <line>, <circle>, <polyline>) drawing itself on
 * screen by animating stroke-dashoffset from its full length down to 0.
 * This is the free-tier replacement for GSAP's paid DrawSVGPlugin.
 *
 * Usage:
 *   const tl = gsap.timeline();
 *   tl.add(drawSVGPath('#my-path', 1.2), 0);
 *
 * @param {string|Element} el       — CSS selector or DOM element of the SVG path
 * @param {number}         duration — seconds for the draw animation
 * @param {number}         delay    — optional start delay in seconds
 * @returns {gsap.core.Tween}       — GSAP tween (can be .add()'d to a timeline)
 */
function drawSVGPath(el, duration = 1, delay = 0) {
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!element) {
    console.warn('drawSVGPath: element not found:', el);
    return gsap.to({}, { duration: 0 }); // return a no-op tween so timelines don't break
  }

  // getTotalLength() works on <path>, <line>, <polyline>, <polygon>, <circle>, <ellipse>
  const length = element.getTotalLength ? element.getTotalLength() : 300;

  // Initialise: make the path "invisible" by setting dasharray = dashoffset = full length
  gsap.set(element, {
    strokeDasharray:  length,
    strokeDashoffset: length,
    // Ensure the stroke is visible (scenes set fill/stroke in SVG markup)
    visibility: 'visible',
  });

  // Animate dashoffset to 0 → path appears to draw itself left-to-right
  return gsap.to(element, {
    strokeDashoffset: 0,
    duration,
    delay,
    ease: 'power3.out', // feels like a brush stroke
  });
}


// ─────────────────────────────────────────────
//  3. RIPPLE RINGS — rippleOut()
// ─────────────────────────────────────────────
/**
 * Creates `count` concentric ring elements that expand outward and fade —
 * like sonar pulses. Used for notification pings, data broadcast effects,
 * and the "permanence" scene's radiating-wave metaphor.
 *
 * @param {Element} container  — DOM element the rings are appended to
 * @param {string}  color      — hex or CSS color for the rings
 * @param {number}  count      — number of rings
 * @param {object}  options    — { maxScale, duration, stagger, repeat }
 * @returns {gsap.core.Timeline}
 */
function rippleOut(container, color = TOKEN.blue, count = 3, options = {}) {
  const {
    maxScale = 3,       // how large the ring grows before vanishing
    duration = 1.4,     // seconds per ring expand
    stagger  = 0.35,    // seconds between each ring start
    repeat   = -1,      // -1 = infinite, 0 = once
  } = options;

  const tl = gsap.timeline({ repeat });

  for (let i = 0; i < count; i++) {
    // Create the ring as a <div> styled as a circle with a coloured border
    const ring = document.createElement('div');
    ring.classList.add('ripple-ring'); // styled in CSS if desired; we force inline styles here
    Object.assign(ring.style, {
      position:     'absolute',
      inset:        '50%',          // centres in parent (0px from each edge of center point)
      transform:    'translate(-50%, -50%)',
      width:        '40px',
      height:       '40px',
      borderRadius: '50%',
      border:       `2px solid ${color}`,
      opacity:      '0',
      pointerEvents:'none',
    });
    container.style.position = container.style.position || 'relative';
    container.appendChild(ring);

    // Each ring: fade in → scale up → fade out
    tl.fromTo(ring,
      { scale: 0.5, opacity: 0.8 },
      {
        scale:    maxScale,
        opacity:  0,
        duration,
        ease:     'power2.out',
      },
      i * stagger // stagger start time
    );
  }

  return tl;
}


// ─────────────────────────────────────────────
//  4. TYPEWRITER TEXT — typeWriter()
// ─────────────────────────────────────────────
/**
 * Reveals text character by character using GSAP's TextPlugin.
 * Optionally shows a blinking cursor that disappears when typing finishes.
 *
 * @param {string|Element} el       — target element
 * @param {string}         text     — the string to type
 * @param {number}         duration — total typing duration in seconds
 * @param {number}         delay    — start delay
 * @returns {gsap.core.Timeline}
 */
function typeWriter(el, text, duration = 1.5, delay = 0) {
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!element) return gsap.timeline();

  const tl = gsap.timeline({ delay });

  // Insert a cursor span alongside the text container
  const cursorId = `cursor-${Math.random().toString(36).slice(2, 7)}`;
  element.innerHTML = `<span class="tw-text"></span><span id="${cursorId}" class="tw-cursor">|</span>`;
  const textSpan   = element.querySelector('.tw-text');
  const cursorSpan = element.querySelector(`#${cursorId}`);

  // Style the cursor inline
  Object.assign(cursorSpan.style, {
    color:     TOKEN.blue,
    fontWeight:'300',
    marginLeft:'1px',
    animation: 'none',
  });

  // Blink the cursor while waiting to type
  tl.to(cursorSpan, {
    opacity:  0,
    duration: 0.5,
    repeat:   -1,
    yoyo:     true,
    ease:     'none',
  }, 0);

  // Type the text using TextPlugin
  tl.to(textSpan, {
    text:     { value: text, delimiter: '' }, // character by character
    duration,
    ease:     'none', // even pace feels most like real typing
  }, 0);

  // After typing finishes, stop blinking and fade out cursor
  tl.to(cursorSpan, {
    opacity:  0,
    duration: 0.3,
    ease:     'power2.out',
    onStart() {
      // Kill the blink repeat
      gsap.killTweensOf(cursorSpan);
    },
  }, duration);

  return tl;
}


// ─────────────────────────────────────────────
//  5. BLOOM CARDS — bloomCards()
// ─────────────────────────────────────────────
/**
 * Animates an array of card elements expanding outward from a central point,
 * like a flower blooming — used in the "Positive Footprint" and "Universities"
 * scenes to show multiple outcomes radiating from one decision.
 *
 * @param {NodeList|Array} cards    — DOM elements to animate
 * @param {number}         centerX  — X origin in px (relative to cards' parent)
 * @param {number}         centerY  — Y origin in px
 * @param {number}         radius   — how far out the cards travel in px
 * @param {object}         options  — { duration, stagger, ease }
 * @returns {gsap.core.Timeline}
 */
function bloomCards(cards, centerX = 202, centerY = 360, radius = 120, options = {}) {
  const {
    duration = 0.7,
    stagger  = 0.1,
    ease     = 'back.out(1.4)',
  } = options;

  const cardArray = Array.from(cards);
  const count     = cardArray.length;
  const tl        = gsap.timeline();

  cardArray.forEach((card, i) => {
    // Distribute cards evenly around a circle
    const angle  = ((2 * Math.PI) / count) * i - Math.PI / 2; // start at top
    const destX  = centerX + Math.cos(angle) * radius;
    const destY  = centerY + Math.sin(angle) * radius;

    // Get the card's own dimensions so we offset from its center
    const cw = card.offsetWidth  || 80;
    const ch = card.offsetHeight || 80;

    // Start every card at the center origin, invisible and tiny
    gsap.set(card, {
      x:       centerX - cw / 2,
      y:       centerY - ch / 2,
      scale:   0,
      opacity: 0,
      position:'absolute',
    });

    // Animate to final position
    tl.to(card, {
      x:       destX - cw / 2,
      y:       destY - ch / 2,
      scale:   1,
      opacity: 1,
      duration,
      ease,
    }, i * stagger);
  });

  return tl;
}


// ─────────────────────────────────────────────
//  6. NOTIFICATION BADGES — createNotifBadges()
// ─────────────────────────────────────────────
/**
 * Dynamically creates notification badge elements inside `container`,
 * then staggers them flying in from the side.
 * Used in Scene 1 (resurfaced post) and Scene 6 (universities/employers).
 *
 * @param {Element}  container — parent element that receives the badges
 * @param {string[]} messages  — array of notification text strings
 * @param {object}   options   — { color, duration, stagger, fromX, fromY }
 * @returns {gsap.core.Timeline}
 */
function createNotifBadges(container, messages = [], options = {}) {
  const {
    color    = TOKEN.blue,
    duration = 0.5,
    stagger  = 0.18,
    fromX    = 60,    // px offset from the right edge to slide in from
    fromY    = 0,
  } = options;

  // Clear any existing badges
  container.querySelectorAll('.notif-badge').forEach(el => el.remove());

  const tl = gsap.timeline();

  messages.forEach((msg, i) => {
    // Build the badge element
    const badge = document.createElement('div');
    badge.classList.add('notif-badge');
    badge.textContent = msg;
    Object.assign(badge.style, {
      background:   `${color}22`,       // very light fill
      border:       `1px solid ${color}`,
      borderRadius: '20px',
      color:        '#fff',
      fontSize:     '11px',
      fontFamily:   'var(--font-body, Inter, sans-serif)',
      padding:      '5px 12px',
      marginBottom: '6px',
      display:      'inline-block',
      whiteSpace:   'nowrap',
      boxShadow:    `0 0 8px ${color}55`,
      opacity:      '0',
    });
    container.appendChild(badge);

    // Slide in from the right with a springy easing
    tl.fromTo(badge,
      { x: fromX + 20, y: fromY, opacity: 0 },
      {
        x:        fromX,
        y:        fromY,
        opacity:  1,
        duration,
        ease:     'back.out(1.6)',
      },
      i * stagger
    );
  });

  return tl;
}


// ─────────────────────────────────────────────
//  7. NODE GRAPH — buildNodeGraph()
// ─────────────────────────────────────────────
/**
 * Draws a procedural "network / web" graph onto a <canvas> element.
 * Nodes appear one by one, then edges draw between nearby nodes —
 * visualising how data spreads across connected systems.
 *
 * @param {Element} canvas     — <canvas> DOM element to draw on
 * @param {number}  nodeCount  — how many nodes to generate
 * @param {object}  options    — { nodeColor, edgeColor, nodeRadius, maxEdgeDist, duration }
 * @returns {gsap.core.Timeline}
 */
function buildNodeGraph(canvas, nodeCount = 18, options = {}) {
  if (!canvas) return gsap.timeline();

  const {
    nodeColor    = TOKEN.blue,
    edgeColor    = TOKEN.purple,
    nodeRadius   = 5,
    maxEdgeDist  = 110,  // px — only draw edges between nodes this close
    duration     = 2.5,  // total time for the full graph to build
  } = options;

  const ctx = canvas.getContext('2d');
  const W   = canvas.width  || 405;
  const H   = canvas.height || 300;

  // ── Generate node positions ────────────────────────────────────────────
  // Use a relaxed random placement: avoid clustering too tightly
  const nodes = [];
  const PAD   = 30;
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x:       PAD + Math.random() * (W - PAD * 2),
      y:       PAD + Math.random() * (H - PAD * 2),
      visible: false,
    });
  }

  // ── Build edge list (pairs of nearby nodes) ────────────────────────────
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx   = nodes[j].x - nodes[i].x;
      const dy   = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxEdgeDist) {
        edges.push({ a: i, b: j, progress: 0 }); // progress 0→1 drives the draw
      }
    }
  }

  // ── Helper: redraw the entire canvas state ─────────────────────────────
  function redraw() {
    ctx.clearRect(0, 0, W, H);

    // Draw edges (only between visible nodes, respect their draw progress)
    for (const edge of edges) {
      if (!nodes[edge.a].visible || !nodes[edge.b].visible) continue;
      const ax = nodes[edge.a].x,  ay = nodes[edge.a].y;
      const bx = nodes[edge.b].x,  by = nodes[edge.b].y;
      const ex = ax + (bx - ax) * edge.progress;
      const ey = ay + (by - ay) * edge.progress;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = edgeColor + '55'; // semi-transparent
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }

    // Draw nodes on top of edges
    for (const node of nodes) {
      if (!node.visible) continue;
      // Glow ring
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius * 3);
      gradient.addColorStop(0,   nodeColor + 'AA');
      gradient.addColorStop(1,   nodeColor + '00');
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Solid core
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
    }
  }

  // ── GSAP timeline to sequence the graph construction ──────────────────
  const tl = gsap.timeline({
    onUpdate: redraw, // re-render canvas whenever any tween updates
  });

  const nodeDelay   = (duration * 0.45) / nodeCount;  // 45% of time for nodes
  const edgeDuration = duration * 0.55;               // 55% for edges

  // 1. Reveal nodes one by one
  nodes.forEach((node, i) => {
    tl.call(() => { node.visible = true; }, [], i * nodeDelay);
  });

  // 2. After all nodes are visible, draw edges
  edges.forEach((edge, i) => {
    tl.to(edge, {
      progress: 1,
      duration: 0.35 + Math.random() * 0.25, // slight randomness feels organic
      ease:     'power2.out',
    }, duration * 0.45 + (i / edges.length) * edgeDuration * 0.6);
  });

  return tl;
}


// ─────────────────────────────────────────────
//  8. SPARKLES — createSparkles()
// ─────────────────────────────────────────────
/**
 * Creates small <span> dot elements inside `container` that burst outward
 * and fade — like light sparks or data "pings". Used in the positive-footprint
 * and title-card scenes for celebratory moments.
 *
 * @param {Element} container — parent element
 * @param {number}  count     — number of sparkle dots
 * @param {string}  color     — hex color
 * @param {object}  options   — { minRadius, maxRadius, duration, stagger, size }
 * @returns {gsap.core.Timeline}
 */
function createSparkles(container, count = 12, color = TOKEN.amber, options = {}) {
  const {
    minRadius = 30,
    maxRadius = 90,
    duration  = 0.7,
    stagger   = 0.04,
    size      = 4,    // px diameter of each sparkle dot
  } = options;

  // Remove old sparkles to avoid accumulation on replays
  container.querySelectorAll('.sparkle-dot').forEach(el => el.remove());

  const tl = gsap.timeline();

  container.style.position = container.style.position || 'relative';

  for (let i = 0; i < count; i++) {
    // Random angle and radius for the burst destination
    const angle  = (Math.random() * Math.PI * 2);
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const destX  = Math.cos(angle) * radius;
    const destY  = Math.sin(angle) * radius;

    const dot = document.createElement('span');
    dot.classList.add('sparkle-dot');
    Object.assign(dot.style, {
      position:     'absolute',
      left:         '50%',
      top:          '50%',
      width:        `${size}px`,
      height:       `${size}px`,
      borderRadius: '50%',
      background:   color,
      transform:    'translate(-50%, -50%)',
      pointerEvents:'none',
      opacity:      '0',
      boxShadow:    `0 0 6px ${color}`,
    });
    container.appendChild(dot);

    // Burst outward then fade
    tl.to(dot, {
      x:        destX,
      y:        destY,
      opacity:  1,
      scale:    1.2,
      duration: duration * 0.4,
      ease:     'expo.out',
    }, i * stagger);

    tl.to(dot, {
      opacity: 0,
      scale:   0.3,
      duration: duration * 0.6,
      ease:    'power2.in',
    }, i * stagger + duration * 0.4);
  }

  return tl;
}


// ─────────────────────────────────────────────
//  9. SCENE TRANSITIONS — sceneTransition()
// ─────────────────────────────────────────────
/**
 * Handles the handoff between two scene <section> elements.
 * Supports three transition styles:
 *   'fade'  — fromScene fades out while toScene fades in (crossfade)
 *   'wipe'  — a vertical overlay wipes across the canvas between scenes
 *   'flash' — white flash burst between scenes (used for dramatic cuts)
 *
 * NOTE: main.js's showScene() handles visibility; this handles the *motion*.
 * Call this at the precise moment in a scene timeline where the cut happens.
 *
 * @param {string|Element} fromScene — outgoing scene selector or element
 * @param {string|Element} toScene   — incoming scene selector or element
 * @param {string}         type      — 'fade' | 'wipe' | 'flash'
 * @param {number}         duration  — transition duration in seconds
 * @returns {gsap.core.Timeline}
 */
function sceneTransition(fromScene, toScene, type = 'fade', duration = 0.6) {
  const from = typeof fromScene === 'string' ? document.querySelector(fromScene) : fromScene;
  const to   = typeof toScene   === 'string' ? document.querySelector(toScene)   : toScene;
  const tl   = gsap.timeline();

  if (!from || !to) {
    console.warn('sceneTransition: one or both scene elements not found.');
    return tl;
  }

  // Ensure incoming scene is visible but transparent before we start
  gsap.set(to, { opacity: 0, display: 'flex' });

  if (type === 'fade') {
    // ── Crossfade ───────────────────────────────────────────────────────
    tl.to(from, {
      opacity:  0,
      duration: duration / 2,
      ease:     'power2.in',
      onComplete() { gsap.set(from, { display: 'none' }); },
    });
    tl.to(to, {
      opacity:  1,
      duration: duration / 2,
      ease:     'power2.out',
    }, duration / 2); // starts as from finishes

  } else if (type === 'wipe') {
    // ── Vertical wipe using a clip overlay div ──────────────────────────
    const wipeOverlay = document.createElement('div');
    Object.assign(wipeOverlay.style, {
      position:   'fixed',
      inset:      '0',
      background: TOKEN.bg,
      zIndex:     '9999',
      transformOrigin: 'top',
      scaleY:     '0',
    });
    document.body.appendChild(wipeOverlay);

    // First half: wipe overlay expands downward (covering fromScene)
    tl.to(wipeOverlay, {
      scaleY:   1,
      duration: duration / 2,
      ease:     'power3.in',
      onComplete() {
        gsap.set(from, { display: 'none' });
        gsap.set(to, { opacity: 1 });
      },
    });
    // Second half: wipe overlay collapses upward (revealing toScene)
    tl.to(wipeOverlay, {
      scaleY:   0,
      transformOrigin: 'bottom',
      duration: duration / 2,
      ease:     'power3.out',
      onComplete() { wipeOverlay.remove(); },
    });

  } else if (type === 'flash') {
    // ── White flash cut ─────────────────────────────────────────────────
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position:  'fixed',
      inset:     '0',
      background:'#ffffff',
      zIndex:    '9999',
      opacity:   '0',
      pointerEvents: 'none',
    });
    document.body.appendChild(flash);

    tl.to(flash, {
      opacity:  1,
      duration: duration * 0.15,
      ease:     'none',
      onComplete() {
        gsap.set(from, { display: 'none' });
        gsap.set(to, { opacity: 1 });
      },
    });
    tl.to(flash, {
      opacity:  0,
      duration: duration * 0.85,
      ease:     'power2.out',
      onComplete() { flash.remove(); },
    });
  }

  return tl;
}


// ─────────────────────────────────────────────
//  EXPORT — attach all helpers to window
// ─────────────────────────────────────────────
// Make all helpers globally accessible so scenes.js and main.js can call them
// without an ES module bundler.
window.DFAnimations = {
  TOKEN,
  initParticles,
  drawSVGPath,
  rippleOut,
  typeWriter,
  bloomCards,
  createNotifBadges,
  buildNodeGraph,
  createSparkles,
  sceneTransition,
};

// Also expose the TOKEN palette at top level for convenience in scenes.js
window.DF_TOKEN = TOKEN;

console.log('[animations.js] DFAnimations helpers loaded:', Object.keys(window.DFAnimations));
