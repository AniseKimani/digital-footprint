/**
 * scenes.js — Scene Controllers for "The Power of the Digital Footprint"
 * Educational Short Film Intro — 12 scenes, ~7 minutes total
 *
 * Structure:
 *   Each scene is a SceneControllers[N] = { init(), play() } object.
 *   init()  — injects SVG/DOM into the scene's pre-existing HTML containers,
 *              sets all elements to their "before" state (invisible / off-screen).
 *   play()  — builds and returns a gsap.Timeline for that scene's full animation.
 *
 * main.js assembles all play() timelines into a master timeline and handles
 * showScene() / jumpToScene() routing.
 *
 * All helpers live on window.DFAnimations (loaded by animations.js first).
 * Canvas: 405 × 720 px portrait
 *
 * TIMESTAMP markers indicate where each scene sits in the voiceover:
 *   Scene  1 — 0:00 – 0:38  The Resurfaced Post
 *   Scene  2 — 0:38 – 1:20  What Is a Digital Footprint?
 *   Scene  3 — 1:20 – 2:00  Active vs Passive
 *   Scene  4 — 2:00 – 2:40  Digital Permanence
 *   Scene  5 — 2:40 – 3:20  The Ink Drop Metaphor
 *   Scene  6 — 3:20 – 4:00  Universities & Employers
 *   Scene  7 — 4:00 – 4:25  People Grow & Change
 *   Scene  8 — 4:25 – 5:00  Positive Digital Footprint
 *   Scene  9 — 5:00 – 5:30  Think Before You Post
 *   Scene 10 — 5:30 – 6:05  Technology Is a Tool
 *   Scene 11 — 6:05 – 6:30  Every Click Leaves a Mark
 *   Scene 12 — 6:30 – 7:00  Transition Into the Film
 */

'use strict';

// ─────────────────────────────────────────────
//  SHORTHAND ALIASES
// ─────────────────────────────────────────────
// Pull helpers off the global DFAnimations namespace (set by animations.js).
// We alias them here so scene code stays readable.
const {
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
} = window.DFAnimations;

// Master controllers registry — main.js iterates this
window.SceneControllers = window.SceneControllers || {};


// ═════════════════════════════════════════════════════════════════════════════
//
//  SCENE 1 — THE RESURFACED POST
//  TIMESTAMP: 0:00 – 0:38
//
//  Voiceover: "Imagine waking up one morning to discover that something you
//  posted online years ago has suddenly resurfaced..."
//
//  Visual concept:
//    • Dark bedroom. An alarm goes off on a phone.
//    • The phone screen lights up — notifications cascade in.
//    • A glowing "old post" card rises into frame from below.
//    • Notification badges (likes, shares, DMs) explode around it.
//    • Screen cracks slightly at the edges — the uneasy feeling of exposure.
//
//  HTML targets (already exist in index.html):
//    #scene-1                 ← the <section> wrapper
//    #s1-phone-wrap           ← outer phone frame container
//    #s1-screen               ← the phone screen (inner content area)
//    #s1-notif-stream         ← notification badges mount here
//    #s1-post-card            ← the "old post" card
//    #s1-caption              ← bottom caption text
//
// ═════════════════════════════════════════════════════════════════════════════

window.SceneControllers[1] = {

  // ── init() ───────────────────────────────────────────────────────────────
  // Called once when the page loads (or when jumpToScene resets state).
  // Injects SVG markup and sets all animated elements to their starting state.
  init() {
    // ── 1a. Inject the phone SVG into #s1-phone-wrap ─────────────────────
    // A minimal flat-design smartphone: rounded rect body, camera dot, screen area.
    // The screen area is transparent so #s1-screen (a real div) shows through.
    const phoneWrap = document.getElementById('s1-phone-wrap');
    if (phoneWrap) {
      phoneWrap.innerHTML = `
        <!-- Smartphone silhouette — 405×720 canvas, phone centred at ~200×420 -->
        <svg id="s1-phone-svg"
             viewBox="0 0 220 400"
             width="220" height="400"
             xmlns="http://www.w3.org/2000/svg"
             style="position:absolute; left:50%; top:50%;
                    transform:translate(-50%,-52%); overflow:visible;">

          <!-- Phone body -->
          <rect id="s1-phone-body"
                x="4" y="4" width="212" height="392" rx="28" ry="28"
                fill="#0D0D1A"
                stroke="${TOKEN.blue}" stroke-width="2"
                filter="url(#glow-phone)"/>

          <!-- Side buttons -->
          <rect x="0" y="100" width="4" height="40" rx="2"
                fill="${TOKEN.blue}" opacity="0.6"/>
          <rect x="0" y="150" width="4" height="30" rx="2"
                fill="${TOKEN.blue}" opacity="0.6"/>
          <rect x="216" y="120" width="4" height="50" rx="2"
                fill="${TOKEN.blue}" opacity="0.6"/>

          <!-- Front camera dot -->
          <circle cx="110" cy="22" r="5"
                  fill="#111130" stroke="${TOKEN.blue}" stroke-width="1.5"/>

          <!-- Home indicator bar -->
          <rect x="80" y="376" width="60" height="4" rx="2"
                fill="${TOKEN.blue}" opacity="0.5"/>

          <!-- Screen bezel — the actual content is layered via #s1-screen div -->
          <rect id="s1-screen-bezel"
                x="12" y="38" width="196" height="318" rx="10"
                fill="#050510" opacity="0.95"/>

          <!-- Alarm icon — clock face -->
          <g id="s1-alarm-icon" transform="translate(85, 120)" opacity="0">
            <circle cx="25" cy="25" r="22"
                    fill="none" stroke="${TOKEN.amber}" stroke-width="2"/>
            <line x1="25" y1="25" x2="25" y2="10"
                  stroke="${TOKEN.amber}" stroke-width="2.5"
                  stroke-linecap="round"/>
            <line x1="25" y1="25" x2="36" y2="30"
                  stroke="${TOKEN.amber}" stroke-width="2"
                  stroke-linecap="round"/>
            <!-- Bell ears -->
            <path d="M10,22 Q10,8 25,8 Q40,8 40,22"
                  fill="none" stroke="${TOKEN.amber}" stroke-width="1.5"/>
            <line x1="15" y1="43" x2="11" y2="48"
                  stroke="${TOKEN.amber}" stroke-width="2" stroke-linecap="round"/>
            <line x1="35" y1="43" x2="39" y2="48"
                  stroke="${TOKEN.amber}" stroke-width="2" stroke-linecap="round"/>
          </g>

          <!-- Screen crack lines (start invisible, reveal at scene climax) -->
          <g id="s1-cracks" opacity="0" stroke="${TOKEN.red}" stroke-width="0.8"
             stroke-linecap="round">
            <line id="s1-crack-1" x1="12"  y1="38"  x2="60"  y2="100"/>
            <line id="s1-crack-2" x1="12"  y1="38"  x2="12"  y2="120"/>
            <line id="s1-crack-3" x1="60"  y1="100" x2="40"  y2="160"/>
            <line id="s1-crack-4" x1="200" y1="50"  x2="150" y2="130"/>
            <line id="s1-crack-5" x1="150" y1="130" x2="180" y2="200"/>
          </g>

          <!-- Glow filter definition -->
          <defs>
            <filter id="glow-phone" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>

        <!-- Notification stream container — badges injected by createNotifBadges() -->
        <div id="s1-notif-stream"
             style="position:absolute; right:-10px; top:80px;
                    display:flex; flex-direction:column; align-items:flex-end;
                    gap:6px; z-index:10;">
        </div>
      `;
    }

    // ── 1b. Build the "old post" card inside #s1-post-card ────────────────
    // Represents a social-media post from years ago resurfacing.
    const postCard = document.getElementById('s1-post-card');
    if (postCard) {
      postCard.innerHTML = `
        <div id="s1-post-inner"
             style="background: linear-gradient(135deg, #0D0D2A 0%, #1A1A3A 100%);
                    border: 1px solid ${TOKEN.blue}55;
                    border-radius: 14px;
                    padding: 14px 16px;
                    min-width: 200px;
                    box-shadow: 0 0 20px ${TOKEN.blue}33;
                    font-family: var(--font-body, Inter, sans-serif);">

          <!-- Post header: avatar + username + timestamp -->
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <div style="width:32px; height:32px; border-radius:50%;
                        background: linear-gradient(135deg,${TOKEN.blue},${TOKEN.purple});
                        flex-shrink:0;"></div>
            <div>
              <div style="color:#fff; font-size:12px; font-weight:600;">@your_username</div>
              <div style="color:${TOKEN.blue}99; font-size:10px;">3 years ago</div>
            </div>
            <!-- Platform icon (generic grid of dots = "a platform") -->
            <div style="margin-left:auto; opacity:0.5; font-size:14px;">⋯</div>
          </div>

          <!-- Post body text -->
          <div id="s1-post-text"
               style="color:#ccd; font-size:11.5px; line-height:1.55;
                      margin-bottom:10px;">
            "Can't believe they thought this was a good idea lol 😂
            some people really need to think before they speak 🙄"
          </div>

          <!-- Engagement row -->
          <div style="display:flex; gap:16px; color:${TOKEN.blue}AA; font-size:10.5px;">
            <span id="s1-likes">❤️ <span id="s1-like-count">12</span></span>
            <span id="s1-shares">🔁 <span id="s1-share-count">3</span></span>
            <span id="s1-comments">💬 <span id="s1-comment-count">4</span></span>
          </div>
        </div>

        <!-- "YEARS AGO" tag overlaid on the card -->
        <div id="s1-age-tag"
             style="position:absolute; top:-10px; left:12px;
                    background:${TOKEN.amber}; color:#000;
                    font-size:9px; font-weight:700; letter-spacing:0.08em;
                    padding:3px 8px; border-radius:4px;
                    text-transform:uppercase; opacity:0;">
          3 YEARS AGO
        </div>
      `;
      // Position the card container itself
      Object.assign(postCard.style, {
        position: 'absolute',
        bottom:   '110px',
        left:     '50%',
        transform:'translateX(-50%)',
        zIndex:   '20',
      });
    }

    // ── 1c. Style the caption text ────────────────────────────────────────
    const caption = document.getElementById('s1-caption');
    if (caption) {
      caption.textContent = 'Every post leaves a trace.';
      Object.assign(caption.style, {
        position:  'absolute',
        bottom:    '40px',
        left:      '50%',
        transform: 'translateX(-50%)',
        color:     TOKEN.blue,
        fontSize:  '13px',
        fontFamily:'var(--font-display, "Space Grotesk", sans-serif)',
        fontWeight:'500',
        letterSpacing: '0.04em',
        textAlign: 'center',
        whiteSpace:'nowrap',
        opacity:   '0',
        zIndex:    '30',
      });
    }

    // ── 1d. Set ALL animated elements to their initial hidden state ───────
    // Everything starts invisible / off-screen. play() brings them to life.
    gsap.set('#s1-phone-svg',    { opacity: 0, scale: 0.85, y: 30 });
    gsap.set('#s1-alarm-icon',   { opacity: 0 });
    gsap.set('#s1-post-inner',   { opacity: 0, y: 40 });
    gsap.set('#s1-age-tag',      { opacity: 0, scale: 0.7 });
    gsap.set('#s1-cracks',       { opacity: 0 });
    gsap.set('#s1-crack-1, #s1-crack-2, #s1-crack-3, #s1-crack-4, #s1-crack-5', {
      strokeDasharray: 200,
      strokeDashoffset: 200,
    });
    // Caption starts hidden
    if (document.getElementById('s1-caption')) {
      gsap.set('#s1-caption', { opacity: 0, y: 8 });
    }

    console.log('[Scene 1] init() complete');
  },


  // ── play() ───────────────────────────────────────────────────────────────
  // Builds and returns the full GSAP timeline for Scene 1.
  // main.js will .add() this to the master timeline at t=0.
  play() {
    // TIMESTAMP: 0:00 — Scene 1 begins
    const tl = gsap.timeline({ id: 'scene-1' });

    // ─────────────────────────────────────────────────────────────────────
    //  ACT 1 (0:00 – 0:08): The phone wakes up
    //  Voiceover: "Imagine waking up one morning..."
    // ─────────────────────────────────────────────────────────────────────

    // 1. Phone rises up from below and materialises
    tl.to('#s1-phone-svg', {
      opacity: 1,
      scale:   1,
      y:       0,
      duration: 1.1,
      ease:    'expo.out',        // fast settle — feels like snapping awake
    }, 0);

    // 2. Phone body border pulses once with blue glow (screen turning on)
    tl.to('#s1-phone-body', {
      attr: { stroke: TOKEN.amber },   // flicker to amber (alarm colour)
      duration: 0.15,
      ease:    'none',
      yoyo:    true,
      repeat:  3,
    }, 1.0);

    // 3. Alarm icon fades in + jiggles (alarm going off)
    tl.to('#s1-alarm-icon', {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    }, 1.2);

    // Jiggle: rotate left-right rapidly to simulate vibrate
    tl.to('#s1-alarm-icon', {
      rotation: -8,
      duration: 0.07,
      ease:     'none',
      yoyo:     true,
      repeat:   7,
      transformOrigin: '50% 50%',
    }, 1.5);

    // ─────────────────────────────────────────────────────────────────────
    //  ACT 2 (0:08 – 0:22): Notifications cascade in
    //  Voiceover: "...to discover that something you posted online years ago
    //              has suddenly resurfaced..."
    // ─────────────────────────────────────────────────────────────────────

    // 4. Dismiss alarm icon (it fades out as notifications take over)
    tl.to('#s1-alarm-icon', {
      opacity:  0,
      y:        -10,
      duration: 0.4,
      ease:     'power2.in',
    }, 2.4);

    // 5. Notification badges cascade in from the right
    //    createNotifBadges() injects the DOM and returns its own timeline.
    //    We add that sub-timeline at t=2.8 in our parent timeline.
    tl.add(() => {
      const notifContainer = document.getElementById('s1-notif-stream');
      if (!notifContainer) return;

      const notifTl = createNotifBadges(notifContainer, [
        '🔔  Someone shared your post',
        '❤️  47 new likes',
        '💬  "Did you really say this?"',
        '🔁  Reshared by @newsaccount',
        '👁️  Your post is going viral',
        '⚠️  12 comments on old post',
      ], {
        color:   TOKEN.red,       // red = alarm / negative attention
        duration: 0.45,
        stagger:  0.22,
        fromX:   0,               // badges slide in flush right
      });

      notifTl.play();
    }, 2.8);

    // ─────────────────────────────────────────────────────────────────────
    //  ACT 3 (0:22 – 0:32): The old post surfaces
    //  Voiceover: "...has suddenly resurfaced."
    // ─────────────────────────────────────────────────────────────────────

    // 6. The post card rises up from below the phone
    tl.to('#s1-post-inner', {
      opacity:  1,
      y:        0,
      duration: 0.85,
      ease:     'back.out(1.3)',  // slight overshoot = feels like it snaps into focus
    }, 4.5);

    // 7. "3 YEARS AGO" tag pops in on the card
    tl.to('#s1-age-tag', {
      opacity: 1,
      scale:   1,
      duration: 0.4,
      ease:    'back.out(1.6)',
    }, 5.2);

    // 8. Like/share counts start rapidly incrementing (going viral feeling)
    //    We animate innerHTML numbers using a GSAP counter trick via onUpdate
    tl.to({ val: 12 }, {
      val:      847,
      duration: 1.8,
      ease:     'power2.inOut',
      onUpdate() {
        const el = document.getElementById('s1-like-count');
        if (el) el.textContent = Math.round(this.targets()[0].val).toLocaleString();
      },
    }, 5.3);

    tl.to({ val: 3 }, {
      val:      219,
      duration: 1.8,
      ease:     'power2.inOut',
      onUpdate() {
        const el = document.getElementById('s1-share-count');
        if (el) el.textContent = Math.round(this.targets()[0].val).toLocaleString();
      },
    }, 5.5);

    // 9. Ripple pulses emanate from the post card (spreading virality)
    tl.add(() => {
      const postCard = document.getElementById('s1-post-card');
      if (postCard) {
        rippleOut(postCard, TOKEN.red, 3, {
          maxScale: 2.8,
          duration: 1.2,
          stagger:  0.35,
          repeat:   1,
        });
      }
    }, 5.6);

    // ─────────────────────────────────────────────────────────────────────
    //  ACT 4 (0:32 – 0:38): Screen crack — the unsettling reveal
    //  Voiceover beat: the realisation moment
    // ─────────────────────────────────────────────────────────────────────

    // 10. Screen cracks appear at the corner of the phone — metaphor for
    //     the feeling that something is broken, exposed, irreversible.
    tl.to('#s1-cracks', {
      opacity:  1,
      duration: 0.1,
    }, 7.0);

    // Draw each crack line in quick succession using drawSVGPath
    const cracks = ['#s1-crack-1','#s1-crack-2','#s1-crack-3','#s1-crack-4','#s1-crack-5'];
    cracks.forEach((id, i) => {
      tl.add(drawSVGPath(id, 0.25), 7.0 + i * 0.06);
    });

    // 11. Brief red flash tint over the whole phone to heighten unease
    tl.to('#s1-phone-body', {
      attr:     { fill: '#1A0505' },
      duration: 0.3,
      ease:     'power2.out',
      yoyo:     true,
      repeat:   1,
    }, 7.2);

    // 12. Caption fades in at the very end of the scene
    tl.to('#s1-caption', {
      opacity:  1,
      y:        0,
      duration: 0.8,
      ease:     'power3.out',
    }, 7.5);

    // 13. Everything fades out slightly as we prepare to transition to Scene 2
    //     (main.js sceneTransition will handle the actual scene swap)
    tl.to('#scene-1', {
      opacity:  0,
      duration: 0.6,
      ease:     'power2.inOut',
    }, 8.8);

    // TIMESTAMP: 0:38 — Scene 1 ends → Scene 2 begins
    console.log('[Scene 1] play() timeline built, duration:', tl.duration().toFixed(2) + 's');
    return tl;
  },

}; // end SceneControllers[1]


// ─────────────────────────────────────────────
//  INITIALISE SCENE 1 ON LOAD
// ─────────────────────────────────────────────
// main.js calls SceneControllers[N].init() for all scenes on DOMContentLoaded,
// but we also call it here so the file is self-contained during development.
document.addEventListener('DOMContentLoaded', () => {
  // Only init Scene 1 from this file; main.js handles all scenes together.
  // During isolated testing you can uncomment the lines below:
  // SceneControllers[1].init();
  // SceneControllers[1].play().play();
});

// ─────────────────────────────────────────────
//  SCENE 2–12 stubs (filled in Steps 5–15)
// ─────────────────────────────────────────────
// Placeholder objects prevent "SceneControllers[N] is undefined" errors
// in main.js while the remaining scenes are being built.
[2,3,4,5,6,7,8,9,10,11,12].forEach(n => {
  window.SceneControllers[n] = window.SceneControllers[n] || {
    init() { console.log(`[Scene ${n}] stub init()`); },
    play() {
      console.log(`[Scene ${n}] stub play() — not yet built`);
      return gsap.timeline(); // empty timeline so master doesn't break
    },
  };
});

console.log('[scenes.js] Scene 1 loaded. SceneControllers:', Object.keys(window.SceneControllers));
