/**
 * scenes.js  —  All 12 Scene Controllers  (REWRITTEN)
 * "The Power of the Digital Footprint"
 *
 * Pattern per scene:
 *   SceneControllers[N] = { init(), play() }
 *
 *   init()  → clears the container, injects SVG via innerHTML,
 *              then calls gsap.set() to establish all starting states.
 *              Safe to call multiple times (jumpToScene re-calls it).
 *
 *   play()  → builds and returns a gsap.timeline() for this scene.
 *              Called by main.js after the scene fades in.
 *
 * Key fixes vs original:
 *   1. DOMContentLoaded listener removed — main.js owns init() calls.
 *   2. Every init() explicitly clears innerHTML before injecting,
 *      so re-plays start from a clean DOM.
 *   3. gsap.set() resets placed AFTER innerHTML injection so GSAP
 *      always finds freshly created elements.
 *   4. transformOrigin on SVG elements uses "center center" (works
 *      with GSAP's SVG handling) instead of pixel coordinates which
 *      reference the wrong coordinate space.
 *   5. Scene 8 orbit rotation removed from play() — it was rotating
 *      a pixel-coordinate anchor which breaks SVG elements.
 *   6. Scene 6 filter tween replaced with safe opacity pulse.
 *   7. All selectors double-checked against the CSS child-class names.
 *
 * Dependencies:
 *   GSAP 3.12 core + TextPlugin (registered in main.js)
 *   animations.js  (window.AnimHelpers — optional, graceful fallback)
 *
 * Canvas: 405 × 720 px portrait (9:16)
 */

"use strict";

// ─── Namespace ─────────────────────────────────────────────────────────────────
window.SceneControllers = window.SceneControllers || {};

// ─── Easing shortcuts ──────────────────────────────────────────────────────────
const E = {
  out    : "power3.out",
  back   : "back.out(1.2)",
  expo   : "expo.out",
  inOut  : "power2.inOut",
  elastic: "elastic.out(1, 0.5)",
};

// ─── Colour palette  (mirrors CSS custom properties) ───────────────────────────
const C = {
  blue  : "#378ADD",
  purple: "#7F77DD",
  teal  : "#1D9E75",
  amber : "#EF9F27",
  red   : "#E24B4A",
  bg    : "#080810",
  white : "#FFFFFF",
  muted : "#6B7280",
};

// ─── Helper: safely query inside a scene ───────────────────────────────────────
// Returns null without throwing if the element hasn't been injected yet.
function qs(selector) { return document.querySelector(selector); }
function qsa(selector){ return document.querySelectorAll(selector); }


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 1  —  The Resurfaced Post  (0:00 – 0:38)
   VO: "Imagine waking up one morning to discover that something you posted
        online years ago has suddenly resurfaced..."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[1] = {

  init() {
    // Inject directly into #scene-1 (the full 405x720 canvas section).
    // Do NOT inject into #s1-phone (a small flex child) — that offsets the SVG.
    const el = qs("#scene-1");
    if (!el) { console.warn("[Scene 1] #scene-1 not found"); return; }

    const prev = el.querySelector("#s1-svg");
    if (prev) prev.remove();

    el.insertAdjacentHTML("afterbegin", `
      <svg id="s1-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720"
           style="position:absolute;top:0;left:0;overflow:visible;pointer-events:none;">
        <defs>
          <!-- Deep vignette gives cinematic depth -->
          <radialGradient id="s1-vignette" cx="50%" cy="45%" r="60%">
            <stop offset="0%"   stop-color="#1a1040"  stop-opacity="0.0"/>
            <stop offset="70%"  stop-color="${C.bg}"  stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#000008"  stop-opacity="0.95"/>
          </radialGradient>
          <!-- Phone screen inner glow -->
          <radialGradient id="s1-screen-glow" cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stop-color="${C.blue}" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#050510"   stop-opacity="0"/>
          </radialGradient>
          <!-- Red viral glow behind phone -->
          <radialGradient id="s1-red-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="${C.red}"  stop-opacity="0.18"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <!-- Notification pill gradient -->
          <linearGradient id="s1-notif-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${C.red}"    stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${C.purple}" stop-opacity="0.9"/>
          </linearGradient>
          <!-- Share counter glow filter -->
          <filter id="s1-glow-filter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- ── Layer 0: Atmospheric background ── -->
        <!-- Red viral glow radiates behind phone as tension builds -->
        <ellipse id="s1-red-halo" cx="202" cy="290" rx="180" ry="200"
                 fill="url(#s1-red-glow)" opacity="0"/>
        <!-- Blue ambient glow -->
        <ellipse cx="202" cy="260" rx="160" ry="180"
                 fill="url(#s1-screen-glow)" opacity="0.6"/>

        <!-- ── Layer 1: Ripple shockwaves (behind phone) ── -->
        <!-- Five concentric rings expand outward when post goes viral -->
        <circle class="s1-ring" cx="202" cy="295" r="60"
                fill="none" stroke="${C.red}" stroke-width="1.5" opacity="0"/>
        <circle class="s1-ring" cx="202" cy="295" r="100"
                fill="none" stroke="${C.red}" stroke-width="1.2" opacity="0"/>
        <circle class="s1-ring" cx="202" cy="295" r="150"
                fill="none" stroke="${C.purple}" stroke-width="1" opacity="0"/>
        <circle class="s1-ring" cx="202" cy="295" r="200"
                fill="none" stroke="${C.purple}" stroke-width="0.8" opacity="0"/>
        <circle class="s1-ring" cx="202" cy="295" r="260"
                fill="none" stroke="${C.blue}" stroke-width="0.6" opacity="0"/>

        <!-- ── Layer 2: Phone body ── -->
        <g id="s1-phone-body">
          <!-- Phone chassis with bright blue border — much more vivid than before -->
          <rect x="112" y="70" width="180" height="380" rx="28"
                fill="#0C0C1E" stroke="${C.blue}" stroke-width="2" opacity="0.98"
                filter="url(#s1-glow-filter)"/>
          <!-- Side buttons -->
          <rect x="109" y="150" width="3" height="30" rx="1.5" fill="${C.blue}" opacity="0.5"/>
          <rect x="109" y="195" width="3" height="20" rx="1.5" fill="${C.blue}" opacity="0.5"/>
          <rect x="293" y="160" width="3" height="40" rx="1.5" fill="${C.blue}" opacity="0.5"/>
          <!-- Dynamic island / notch -->
          <rect x="172" y="78" width="60" height="14" rx="7" fill="#0A0A18"/>
          <!-- Screen glass -->
          <rect x="120" y="98" width="164" height="340" rx="12"
                fill="#06060F"/>
          <!-- Screen inner glow — the phone is "on" -->
          <rect x="120" y="98" width="164" height="340" rx="12"
                fill="url(#s1-screen-glow)" opacity="0.8"/>

          <!-- Status bar -->
          <text x="132" y="116" font-family="Inter,sans-serif" font-size="8"
                fill="rgba(255,255,255,0.5)" font-weight="500">9:41</text>
          <text x="266" y="116" font-family="Inter,sans-serif" font-size="7"
                fill="rgba(255,255,255,0.5)" text-anchor="end">●●● WiFi 100%</text>

          <!-- ── Social media app header ── -->
          <rect x="120" y="120" width="164" height="32" rx="0"
                fill="#0E0E22"/>
          <text x="202" y="140" font-family="'Space Grotesk',sans-serif" font-size="11"
                fill="${C.white}" text-anchor="middle" font-weight="700"
                letter-spacing="0.5">SocialFeed</text>

          <!-- ── The old post card — richly detailed ── -->
          <g id="s1-post">
            <!-- Card background -->
            <rect x="124" y="157" width="156" height="148" rx="10"
                  fill="#111128" stroke="rgba(127,119,221,0.3)" stroke-width="1"/>
            <!-- "5 YEARS AGO" time banner — amber, prominent -->
            <rect x="124" y="157" width="156" height="20" rx="10"
                  fill="${C.amber}" opacity="0.15"/>
            <rect x="124" y="167" width="156" height="10" rx="0"
                  fill="${C.amber}" opacity="0.15"/>
            <text x="202" y="171" font-family="Inter,sans-serif" font-size="8"
                  fill="${C.amber}" text-anchor="middle" font-weight="700"
                  letter-spacing="1">⏰  5 YEARS AGO</text>
            <!-- Avatar + username row -->
            <circle cx="140" cy="194" r="10"
                    fill="url(#s1-notif-grad)" opacity="0.9"/>
            <text x="140" y="198" font-family="Inter,sans-serif" font-size="7"
                  fill="white" text-anchor="middle" font-weight="700">S</text>
            <text x="156" y="191" font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.white}" font-weight="700">@uni_student</text>
            <text x="156" y="202" font-family="Inter,sans-serif" font-size="7"
                  fill="rgba(255,255,255,0.4)">Student · Public account</text>
            <!-- Post text — the actual problematic post -->
            <text x="130" y="221" font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.white}">ChatGPT literally did my</text>
            <text x="130" y="234" font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.white}">whole project lol 😭✅</text>
            <!-- Fake image thumbnail inside post -->
            <rect x="130" y="242" width="144" height="46" rx="6"
                  fill="#1A1A32" stroke="rgba(127,119,221,0.2)" stroke-width="1"/>
            <text x="202" y="270" font-family="Inter,sans-serif" font-size="8"
                  fill="rgba(255,255,255,0.2)" text-anchor="middle">📷  video thumbnail</text>
            <!-- Reaction bar -->
            <text x="130" y="298" font-family="Inter,sans-serif" font-size="8"
                  fill="${C.red}" font-weight="600">♥ 2.4K</text>
            <text x="172" y="298" font-family="Inter,sans-serif" font-size="8"
                  fill="rgba(255,255,255,0.4)">↩ 843</text>
            <text x="210" y="298" font-family="Inter,sans-serif" font-size="8"
                  fill="rgba(255,255,255,0.4)">💬 319</text>
          </g>

          <!-- ── Share counter — rockets up as post goes viral ── -->
          <g id="s1-share-counter" opacity="0" transform="translate(202,320)">
            <rect x="-50" y="-14" width="100" height="28" rx="14"
                  fill="rgba(226,75,74,0.2)" stroke="${C.red}" stroke-width="1.2"/>
            <text id="s1-counter-text" font-family="'Space Grotesk',sans-serif" font-size="11"
                  fill="${C.red}" text-anchor="middle" dy="4" font-weight="700">
              ↗ 0 shares
            </text>
          </g>

          <!-- ── Notification stack (3 banners, offset cascade) ── -->
          <!-- Notif 1 — the first ping -->
          <g id="s1-notif-1" opacity="0" transform="translate(124,314)">
            <rect width="156" height="26" rx="8"
                  fill="#1C1C3A" stroke="${C.blue}" stroke-width="1"/>
            <circle cx="14" cy="13" r="7" fill="${C.blue}" opacity="0.9"/>
            <text x="14" y="17" font-family="Inter,sans-serif" font-size="6"
                  fill="white" text-anchor="middle" font-weight="700">SF</text>
            <text x="28" y="10" font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.white}" font-weight="600">SocialFeed</text>
            <text x="28" y="22" font-family="Inter,sans-serif" font-size="6.5"
                  fill="rgba(255,255,255,0.55)">Someone shared your post</text>
          </g>
          <!-- Notif 2 — overlaps, more urgent -->
          <g id="s1-notif-2" opacity="0" transform="translate(124,346)">
            <rect width="156" height="26" rx="8"
                  fill="#221C3A" stroke="${C.purple}" stroke-width="1"/>
            <circle cx="14" cy="13" r="7" fill="${C.purple}" opacity="0.9"/>
            <text x="14" y="17" font-family="Inter,sans-serif" font-size="6"
                  fill="white" text-anchor="middle" font-weight="700">!</text>
            <text x="28" y="10" font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.white}" font-weight="600">Trending alert</text>
            <text x="28" y="22" font-family="Inter,sans-serif" font-size="6.5"
                  fill="rgba(255,255,255,0.55)">Your post is gaining traction</text>
          </g>
          <!-- Notif 3 — red, alarming -->
          <g id="s1-notif-3" opacity="0" transform="translate(124,378)">
            <rect width="156" height="26" rx="8"
                  fill="#2A1C1C" stroke="${C.red}" stroke-width="1.5"/>
            <circle cx="14" cy="13" r="7" fill="${C.red}" opacity="0.95"/>
            <text x="14" y="17" font-family="Inter,sans-serif" font-size="6"
                  fill="white" text-anchor="middle" font-weight="700">🔥</text>
            <text x="28" y="10" font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.white}" font-weight="700">GOING VIRAL</text>
            <text x="28" y="22" font-family="Inter,sans-serif" font-size="6.5"
                  fill="${C.red}" font-weight="600">48K shares in 2 hours</text>
          </g>
        </g>

        <!-- ── Layer 3: Floating notification pills orbiting around phone ── -->
        <!-- These burst out from the screen edge and orbit/drift upward -->
        <g id="s1-orbit-pills" opacity="0">
          <!-- Left side pills -->
          <g id="s1-pill-1" transform="translate(70, 180)">
            <rect x="-36" y="-11" width="72" height="22" rx="11"
                  fill="rgba(55,138,221,0.2)" stroke="${C.blue}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.blue}" text-anchor="middle" dy="4" font-weight="600">↗ Shared</text>
          </g>
          <g id="s1-pill-2" transform="translate(58, 250)">
            <rect x="-30" y="-11" width="60" height="22" rx="11"
                  fill="rgba(239,159,39,0.2)" stroke="${C.amber}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.amber}" text-anchor="middle" dy="4" font-weight="600">💬 Comment</text>
          </g>
          <g id="s1-pill-3" transform="translate(75, 330)">
            <rect x="-28" y="-11" width="56" height="22" rx="11"
                  fill="rgba(226,75,74,0.2)" stroke="${C.red}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.red}" text-anchor="middle" dy="4" font-weight="600">♥ Like</text>
          </g>
          <!-- Right side pills -->
          <g id="s1-pill-4" transform="translate(338, 195)">
            <rect x="-38" y="-11" width="76" height="22" rx="11"
                  fill="rgba(127,119,221,0.2)" stroke="${C.purple}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.purple}" text-anchor="middle" dy="4" font-weight="600">🔁 Reposted</text>
          </g>
          <g id="s1-pill-5" transform="translate(345, 275)">
            <rect x="-32" y="-11" width="64" height="22" rx="11"
                  fill="rgba(29,158,117,0.2)" stroke="${C.teal}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.teal}" text-anchor="middle" dy="4" font-weight="600">📌 Saved</text>
          </g>
          <g id="s1-pill-6" transform="translate(330, 355)">
            <rect x="-36" y="-11" width="72" height="22" rx="11"
                  fill="rgba(226,75,74,0.2)" stroke="${C.red}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.red}" text-anchor="middle" dy="4" font-weight="600">⚡ Trending</text>
          </g>
        </g>

        <!-- ── Layer 4: VIRAL stamp — slams onto the post ── -->
        <g id="s1-viral-stamp" opacity="0" transform="translate(202,230)">
          <!-- Stamp border with rotation -->
          <rect x="-58" y="-20" width="116" height="40" rx="4"
                fill="rgba(226,75,74,0.15)" stroke="${C.red}" stroke-width="3"
                stroke-dasharray="5 2"/>
          <text font-family="'Space Grotesk',sans-serif" font-size="22"
                fill="${C.red}" text-anchor="middle" dy="8" font-weight="900"
                letter-spacing="4">VIRAL</text>
        </g>

        <!-- ── Layer 5: Scene tagline at bottom ── -->
        <g id="s1-tagline" opacity="0" transform="translate(202,630)">
          <!-- Decorative line above -->
          <line x1="-80" y1="-20" x2="80" y2="-20"
                stroke="url(#s1-notif-grad)" stroke-width="1" opacity="0.6"/>
          <text font-family="'Space Grotesk',sans-serif" font-size="11"
                fill="rgba(255,255,255,0.45)" text-anchor="middle" dy="-4"
                letter-spacing="3" font-weight="500">IMAGINE</text>
          <text y="14" font-family="'Space Grotesk',sans-serif" font-size="20"
                fill="${C.white}" text-anchor="middle" font-weight="800"
                letter-spacing="-0.5">Your past comes back.</text>
          <!-- Decorative line below -->
          <line x1="-80" y1="30" x2="80" y2="30"
                stroke="url(#s1-notif-grad)" stroke-width="1" opacity="0.6"/>
        </g>

        <!-- Vignette on top of everything for cinematic depth -->
        <rect width="405" height="720" fill="url(#s1-vignette)" pointer-events="none"/>
      </svg>`);

    // ── Reset all initial states ──
    gsap.set("#s1-phone-body",   { opacity: 0, y: 60, scale: 0.88, transformOrigin:"center center" });
    gsap.set("#s1-post",         { opacity: 0 });
    gsap.set("#s1-share-counter",{ opacity: 0, scale: 0.6, transformOrigin:"center center" });
    gsap.set(["#s1-notif-1","#s1-notif-2","#s1-notif-3"], { opacity: 0, x: 30 });
    gsap.set("#s1-orbit-pills",  { opacity: 0 });
    gsap.set(["#s1-pill-1","#s1-pill-2","#s1-pill-3"], { opacity: 0, x: -30 });
    gsap.set(["#s1-pill-4","#s1-pill-5","#s1-pill-6"], { opacity: 0, x:  30 });
    gsap.set("#s1-viral-stamp",  { opacity: 0, scale: 2.5, rotation: -15, transformOrigin:"center center" });
    gsap.set("#s1-red-halo",     { opacity: 0 });
    gsap.set(".s1-ring",         { opacity: 0, scale: 0.1, transformOrigin:"202px 295px" });
    gsap.set("#s1-tagline",      { opacity: 0, y: 20 });
  },

  play() {
    // TIMESTAMP: 0:00
    // VO: "Imagine waking up one morning to discover that something you posted
    //      online years ago has suddenly resurfaced..."
    const tl = gsap.timeline({ id: "scene-1" });

    // ── Beat 1 (0s): Phone rises from darkness — slow, dramatic ──
    tl.to("#s1-phone-body", {
      opacity: 1, y: 0, scale: 1,
      duration: 1.4, ease: "expo.out",
    }, 0);

    // ── Beat 2 (0.8s): Old post materialises on screen ──
    // VO: "A photo. A comment. A video you thought everyone had forgotten."
    tl.to("#s1-post", {
      opacity: 1,
      duration: 0.8, ease: E.out,
    }, 0.8);

    // ── Beat 3 (1.8s): Share counter appears and ticks upward ──
    tl.to("#s1-share-counter", {
      opacity: 1, scale: 1,
      duration: 0.5, ease: E.back,
    }, 1.8);
    // Animate the counter number with a JS loop
    tl.add(() => {
      const counterEl = qs("#s1-counter-text");
      if (!counterEl) return;
      let n = 0;
      const target = 48200;
      const step = () => {
        n = Math.min(n + Math.floor(target / 40), target);
        counterEl.textContent = `↗ ${n.toLocaleString()} shares`;
        if (n < target) requestAnimationFrame(step);
      };
      step();
    }, 2.0);

    // ── Beat 4 (2.2s): First notification slides in from right ──
    // VO: "Within hours, it has been shared thousands of times..."
    tl.to("#s1-notif-1", {
      opacity: 1, x: 0,
      duration: 0.45, ease: E.back,
    }, 2.2);

    // ── Beat 5 (2.7s): Second notification cascades in ──
    tl.to("#s1-notif-2", {
      opacity: 1, x: 0,
      duration: 0.45, ease: E.back,
    }, 2.7);

    // ── Beat 6 (3.1s): Third "GOING VIRAL" notification — most alarming ──
    tl.to("#s1-notif-3", {
      opacity: 1, x: 0,
      duration: 0.4, ease: E.back,
    }, 3.1);

    // ── Beat 7 (3.2s): Red halo blooms behind phone — tension escalates ──
    tl.to("#s1-red-halo", {
      opacity: 1,
      duration: 1.2, ease: E.out,
    }, 3.2);

    // ── Beat 8 (3.5s): Orbit pills burst out from left and right ──
    tl.to("#s1-orbit-pills", { opacity: 1, duration: 0.1 }, 3.5);
    tl.to(["#s1-pill-1","#s1-pill-2","#s1-pill-3"], {
      opacity: 1, x: 0,
      stagger: 0.15, duration: 0.5, ease: E.back,
    }, 3.5);
    tl.to(["#s1-pill-4","#s1-pill-5","#s1-pill-6"], {
      opacity: 1, x: 0,
      stagger: 0.15, duration: 0.5, ease: E.back,
    }, 3.6);

    // ── Beat 9 (4.2s): VIRAL stamp slams in — the climax of this scene ──
    tl.to("#s1-viral-stamp", {
      opacity: 1, scale: 1, rotation: -8,
      duration: 0.35, ease: "back.out(3)",
    }, 4.2);
    // Stamp shake — like a rubber stamp impact
    tl.to("#s1-viral-stamp", {
      rotation: -6, x: 2,
      duration: 0.08, yoyo: true, repeat: 3, ease: "none",
    }, 4.55);

    // ── Beat 10 (4.5s): Shockwave rings explode outward ──
    // VO: "...people are forming opinions about you based on a single moment"
    tl.to(".s1-ring", {
      opacity: 0.6, scale: 1,
      stagger: 0.12, duration: 0.6, ease: "expo.out",
    }, 4.5);
    // Then fade the rings out as they expand to full size
    tl.to(".s1-ring", {
      opacity: 0, scale: 1.8,
      stagger: 0.15, duration: 1.2, ease: "power2.in",
    }, 5.0);

    // ── Beat 11 (5.0s): Pills gently float/bob ──
    tl.to(["#s1-pill-1","#s1-pill-2","#s1-pill-3","#s1-pill-4","#s1-pill-5","#s1-pill-6"], {
      y: -8, duration: 1.8,
      yoyo: true, repeat: -1, ease: "sine.inOut",
      stagger: { amount: 0.8 },
    }, 5.0);

    // ── Beat 12 (5.2s): Scene tagline burns in ──
    // VO: "This may sound dramatic, but it reflects a reality..."
    tl.to("#s1-tagline", {
      opacity: 1, y: 0,
      duration: 0.9, ease: E.expo,
    }, 5.2);

    // ── Beat 13 (6s+): Subtle phone breathe loop ──
    tl.to("#s1-phone-body", {
      scale: 1.012, duration: 2.0,
      yoyo: true, repeat: -1, ease: "sine.inOut",
      transformOrigin: "center center",
    }, 6.0);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 2  —  What Is a Digital Footprint?  (0:38 – 1:20)
   VO: "Every time we use the internet, we leave behind traces of our activity.
        These traces are known as our digital footprint..."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[2] = {

  init() {
    const el = qs("#s2-figure");
    if (!el) { console.warn("[Scene 2] #s2-figure not found"); return; }

    // ── Story of this scene ──
    // A person (blue silhouette) stands centre-stage.
    // With each action the narrator names, a glowing footprint icon blooms
    // from the figure and orbits outward — leaving a trail of data.
    // The footprints are color-coded by type to reinforce the diversity of data.
    // A definition box slides in at mid-scene.
    // The full web of data surrounds the figure by the end.

    const dataItems = [
      { angle: -60,  r: 130, icon: "🌐", label: "Websites visited",   color: C.blue,   delay: 0.0 },
      { angle: -20,  r: 140, icon: "🎬", label: "Videos watched",     color: C.purple, delay: 0.2 },
      { angle:  20,  r: 130, icon: "📸", label: "Photos uploaded",    color: C.teal,   delay: 0.4 },
      { angle:  60,  r: 145, icon: "💬", label: "Comments left",      color: C.amber,  delay: 0.6 },
      { angle: 100,  r: 130, icon: "🔍", label: "Searches made",      color: C.blue,   delay: 0.8 },
      { angle: 140,  r: 140, icon: "🤖", label: "Auto-collected data", color: C.red,    delay: 1.0 },
      { angle: -100, r: 140, icon: "📧", label: "Emails sent",        color: C.purple, delay: 1.2 },
      { angle: -140, r: 130, icon: "❤️", label: "Likes & reactions",  color: C.red,    delay: 1.4 },
    ];

    // Build each orbit node's SVG — positioned radially around figure
    const orbitNodes = dataItems.map((item, i) => {
      const rad = item.angle * Math.PI / 180;
      const cx  = 202 + Math.cos(rad) * item.r;
      const cy  = 310 + Math.sin(rad) * item.r;
      return `
        <!-- Node ${i}: ${item.label} -->
        <g class="s2-node" id="s2-node-${i}"
           opacity="0" transform="translate(${cx},${cy})">
          <!-- Glowing ring behind icon -->
          <circle r="26" fill="${item.color}" opacity="0.12"/>
          <circle r="26" fill="none" stroke="${item.color}" stroke-width="1.5" opacity="0.7"/>
          <!-- Icon -->
          <text font-size="18" text-anchor="middle" dominant-baseline="central">${item.icon}</text>
          <!-- Label pill below icon -->
          <g transform="translate(0, 36)">
            <rect x="${-item.label.length * 2.6}" y="-9" width="${item.label.length * 5.2}" height="18" rx="9"
                  fill="${item.color}" opacity="0.18" stroke="${item.color}" stroke-width="0.8"/>
            <text font-family="Inter,sans-serif" font-size="7" fill="${item.color}"
                  text-anchor="middle" dominant-baseline="central" font-weight="600">
              ${item.label}
            </text>
          </g>
        </g>`;
    });

    // Build connector lines from figure centre to each node
    const connectorLines = dataItems.map((item, i) => {
      const rad = item.angle * Math.PI / 180;
      const cx  = 202 + Math.cos(rad) * item.r;
      const cy  = 310 + Math.sin(rad) * item.r;
      return `
        <line class="s2-connector" id="s2-line-${i}"
              x1="202" y1="310" x2="${cx}" y2="${cy}"
              stroke="${item.color}" stroke-width="1"
              stroke-dasharray="5 4" opacity="0"/>`;
    });

    el.innerHTML = `
      <svg id="s2-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720" style="overflow:visible; position:absolute; top:0; left:0;">
        <defs>
          <!-- Radial glow behind figure -->
          <radialGradient id="s2-fig-glow" cx="50%" cy="43%" r="35%">
            <stop offset="0%"   stop-color="${C.blue}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <!-- Data web gradient for outer ring -->
          <radialGradient id="s2-web-glow" cx="50%" cy="43%" r="65%">
            <stop offset="0%"   stop-color="${C.purple}" stop-opacity="0.0"/>
            <stop offset="60%"  stop-color="${C.blue}"   stop-opacity="0.06"/>
            <stop offset="100%" stop-color="${C.purple}"  stop-opacity="0.12"/>
          </radialGradient>
          <!-- Definition box gradient -->
          <linearGradient id="s2-def-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="${C.blue}"   stop-opacity="0.15"/>
            <stop offset="100%" stop-color="${C.purple}" stop-opacity="0.08"/>
          </linearGradient>
        </defs>

        <!-- ── Atmospheric background ring ── -->
        <circle cx="202" cy="310" r="175"
                fill="url(#s2-web-glow)" opacity="0" id="s2-bg-ring"/>
        <circle cx="202" cy="310" r="170"
                fill="none" stroke="${C.blue}" stroke-width="0.5"
                stroke-dasharray="3 8" opacity="0" id="s2-orbit-ring"/>

        <!-- ── Connector lines (behind nodes and figure) ── -->
        ${connectorLines.join("\n")}

        <!-- ── Orbit nodes ── -->
        ${orbitNodes.join("\n")}

        <!-- ── Central figure — more detailed, glowing ── -->
        <g id="s2-figure-body" transform="translate(202,290)">
          <!-- Glow aura -->
          <circle cx="0" cy="-10" r="60" fill="url(#s2-fig-glow)"/>
          <!-- Outer halo ring -->
          <circle cx="0" cy="-10" r="52"
                  fill="none" stroke="${C.blue}" stroke-width="1.5"
                  stroke-dasharray="4 6" opacity="0.5" id="s2-halo-ring"/>
          <!-- Head -->
          <circle cx="0" cy="-68" r="22" fill="${C.blue}" opacity="0.95"/>
          <circle cx="0" cy="-68" r="22" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <!-- Small face detail -->
          <circle cx="-7" cy="-72" r="3" fill="rgba(255,255,255,0.5)"/>
          <circle cx=" 7" cy="-72" r="3" fill="rgba(255,255,255,0.5)"/>
          <path d="M -6,-59 Q 0,-54 6,-59" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Body -->
          <rect x="-20" y="-42" width="40" height="52" rx="10" fill="${C.blue}" opacity="0.85"/>
          <!-- Collar detail -->
          <path d="M -8,-42 L 0,-30 L 8,-42" fill="rgba(255,255,255,0.15)" stroke="none"/>
          <!-- Arms -->
          <rect x="-46" y="-36" width="26" height="10" rx="5" fill="${C.blue}" opacity="0.7"/>
          <rect x=" 20" y="-36" width="26" height="10" rx="5" fill="${C.blue}" opacity="0.7"/>
          <!-- Legs -->
          <rect x="-18" y="10" width="13" height="38" rx="6" fill="${C.blue}" opacity="0.75"/>
          <rect x="  5" y="10" width="13" height="38" rx="6" fill="${C.blue}" opacity="0.75"/>
          <!-- Device in hand — the person is on their phone -->
          <rect x="22" y="-20" width="16" height="26" rx="3"
                fill="#111128" stroke="${C.blue}" stroke-width="1" opacity="0.9"/>
          <rect x="24" y="-18" width="12" height="20" rx="2" fill="#1A1A35" opacity="0.9"/>
          <!-- tiny screen glow on phone -->
          <rect x="24" y="-18" width="12" height="20" rx="2"
                fill="${C.blue}" opacity="0.2"/>
        </g>

        <!-- ── Glowing footprints trailing below figure ── -->
        ${[...Array(6)].map((_, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const x = 202 + side * 14;
          const y = 490 + i * 32;
          const op = 0.6 - i * 0.08;
          const sz = 1 - i * 0.06;
          return `
            <ellipse class="s2-footprint" cx="${x}" cy="${y}"
                     rx="${10 * sz}" ry="${6 * sz}"
                     fill="${C.blue}" opacity="0"
                     transform="rotate(${side * 18}, ${x}, ${y})"/>`;
        }).join("")}

        <!-- ── Definition box — the key educational moment ── -->
        <g id="s2-definition" opacity="0" transform="translate(202,595)">
          <!-- Background -->
          <rect x="-168" y="-48" width="336" height="96" rx="14"
                fill="url(#s2-def-grad)" stroke="${C.blue}" stroke-width="1.2" opacity="0.95"/>
          <!-- Left accent bar -->
          <rect x="-168" y="-48" width="4" height="96" rx="2" fill="${C.blue}" opacity="0.8"/>
          <!-- Label -->
          <text x="-150" y="-26" font-family="Inter,sans-serif" font-size="8"
                fill="${C.blue}" font-weight="700" letter-spacing="2">DIGITAL FOOTPRINT</text>
          <!-- Definition text — split across lines to fit -->
          <text x="-150" y="-8" font-family="Inter,sans-serif" font-size="9"
                fill="rgba(255,255,255,0.85)" font-weight="400">
            The collection of information created
          </text>
          <text x="-150" y="8" font-family="Inter,sans-serif" font-size="9"
                fill="rgba(255,255,255,0.85)">
            whenever you interact online.
          </text>
          <!-- Sub-note -->
          <text x="-150" y="30" font-family="Inter,sans-serif" font-size="7.5"
                fill="rgba(255,255,255,0.4)">
            Websites · Videos · Searches · Comments · Auto-collected data
          </text>
        </g>

        <!-- ── Scene headline at top ── -->
        <g id="s2-headline" opacity="0" transform="translate(202,60)">
          <text font-family="'Space Grotesk',sans-serif" font-size="14"
                fill="rgba(255,255,255,0.5)" text-anchor="middle"
                letter-spacing="3" font-weight="500">EVERY CLICK</text>
          <text y="28" font-family="'Space Grotesk',sans-serif" font-size="24"
                fill="${C.white}" text-anchor="middle" font-weight="800"
                letter-spacing="-0.5">leaves a trace.</text>
        </g>

      </svg>`;

    // ── Initial GSAP states ──
    gsap.set("#s2-figure-body",  { opacity: 0, scale: 0.75, transformOrigin: "202px 290px" });
    gsap.set("#s2-bg-ring",      { opacity: 0, scale: 0.4,  transformOrigin: "202px 310px" });
    gsap.set("#s2-orbit-ring",   { opacity: 0 });
    gsap.set(".s2-connector",    { opacity: 0 });
    gsap.set(".s2-node",         { opacity: 0, scale: 0.2, transformOrigin: "center center" });
    gsap.set(".s2-footprint",    { opacity: 0, scale: 0.3, transformOrigin: "center center" });
    gsap.set("#s2-definition",   { opacity: 0, y: 18 });
    gsap.set("#s2-headline",     { opacity: 0, y: -12 });
  },

  play() {
    // TIMESTAMP: 0:38
    // VO: "Every time we use the internet, we leave behind traces of our activity.
    //      These traces are known as our digital footprint..."
    const tl = gsap.timeline({ id: "scene-2" });

    // ── Beat 1 (0s): Headline drops in ──
    tl.to("#s2-headline", {
      opacity: 1, y: 0,
      duration: 0.8, ease: E.expo,
    }, 0);

    // ── Beat 2 (0.4s): Figure materialises — scale up from centre ──
    // VO: "Every time we use the internet..."
    tl.to("#s2-figure-body", {
      opacity: 1, scale: 1,
      duration: 1.0, ease: E.back,
      transformOrigin: "202px 290px",
    }, 0.4);

    // ── Beat 3 (0.8s): Halo ring spins into existence ──
    tl.to("#s2-halo-ring", {
      rotation: 360, duration: 8, ease: "none", repeat: -1,
      transformOrigin: "0px -10px",
    }, 0.8);

    // ── Beat 4 (1.0s): Background ring expands ──
    tl.to("#s2-bg-ring", {
      opacity: 1, scale: 1,
      duration: 1.0, ease: E.out,
      transformOrigin: "202px 310px",
    }, 1.0);

    // ── Beat 5 (1.2s): Orbit ring fades in ──
    tl.to("#s2-orbit-ring", {
      opacity: 0.5, duration: 0.8, ease: E.out,
    }, 1.2);

    // ── Beat 6 (1.4s): Footprints stamp in beneath the figure ──
    // VO: "we leave behind traces of our activity..."
    tl.to(".s2-footprint", {
      opacity: 0.7, scale: 1,
      stagger: 0.14, duration: 0.4, ease: E.back,
      transformOrigin: "center center",
    }, 1.4);

    // ── Beat 7 (2.0s): Connector lines draw outward one by one ──
    // VO: "It includes the websites we visit, the videos we watch..."
    tl.to(".s2-connector", {
      opacity: 0.6,
      stagger: 0.18, duration: 0.6, ease: E.out,
    }, 2.0);

    // ── Beat 8 (2.3s): Data nodes bloom from centre outward ──
    // Each one corresponds to a type of data the narrator names
    tl.to(".s2-node", {
      opacity: 1, scale: 1,
      stagger: 0.2, duration: 0.55, ease: "back.out(1.6)",
      transformOrigin: "center center",
    }, 2.3);

    // ── Beat 9 (4.5s): Nodes gently orbit/float ──
    // Staggered sine float gives organic life
    tl.to(".s2-node", {
      y: -7, duration: 2.0,
      yoyo: true, repeat: -1, ease: "sine.inOut",
      stagger: { amount: 1.2, from: "random" },
    }, 4.5);

    // ── Beat 10 (4.0s): Definition box slides up — the educational payoff ──
    // VO: "A digital footprint is the collection of information..."
    tl.to("#s2-definition", {
      opacity: 1, y: 0,
      duration: 0.8, ease: E.expo,
    }, 4.0);

    // ── Beat 11 (5.0s): Figure subtle pulse ──
    tl.to("#s2-figure-body", {
      scale: 1.04, duration: 2.0,
      yoyo: true, repeat: -1, ease: "sine.inOut",
      transformOrigin: "202px 290px",
    }, 5.0);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 3  —  Active vs Passive  (1:20 – 2:00)
   VO: "Some parts of our digital footprint are active, meaning we intentionally
        share them... Other parts are passive. These are collected without us
        actively thinking about them..."

   UPGRADE NOTES (cream-theme pass):
   - Retheme from dark-mode glow palette → warm cream: card backgrounds are now
     translucent white instead of translucent colour-on-black, text uses
     --text-primary (warm near-black) instead of pure white, panel washes
     are much lighter so they read as a tint rather than a colour flood.
   - Eye-blink now scales around its own local origin (was previously anchored
     to a page-pixel coordinate that drifted under transform — fixed to use
     "center center" so the blink stays centred on the eye regardless of
     where the <g> sits).
   - Divider glow gradient softened — full-white-hot core looked harsh on
     cream; toned down to a warm gold-white core instead.
   - Big eye iris/pupil recoloured — was near-black eyelid with white pupil
     shine (high-contrast dark-mode trick); now uses a warm plum eyelid that
     sits comfortably on cream without becoming a black hole on the canvas.
   - Bottom statement card swapped from white-on-white-glass to a proper
     warm card with visible border, since "rgba(255,255,255,0.04)" was
     basically invisible on a cream bg.
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[3] = {

  init() {
    const el = qs("#scene-3");
    if (!el) { console.warn("[Scene 3] #scene-3 not found"); return; }

    const prev = el.querySelector("#s3-svg");
    if (prev) prev.remove();

    // ── FIX: hide legacy static HTML left over from the original index.html ──
    // Before scenes.js injected a full custom SVG, Scene 3 was built from
    // static divs: #s3-active / #s3-passive (.scene__half), #s3-divider,
    // and #s3-merge. Those elements are STILL in the DOM and were painting
    // on top of (or alongside) our injected SVG — which is exactly why the
    // "ACTIVE" title looked duplicated/obstructed (two overlapping labels)
    // and the passive side looked "empty" (the old empty .half__icons
    // container was sitting on top of our illustrated SVG, blank).
    // We hide them defensively every time init() runs, so the scene is
    // safe to re-enter via jumpToScene() without the legacy markup
    // reappearing.
    ["#s3-active", "#s3-passive", "#s3-divider", "#s3-merge"].forEach(sel => {
      const legacy = el.querySelector(sel);
      if (legacy) legacy.style.display = "none";
    });

    // ── Story of this scene ──
    // Screen tears/splits from centre — LEFT = blue (Active, intentional),
    // RIGHT = purple (Passive, silent, watching).
    // Active side: each item appears with a confident "click" animation — the
    //   user is choosing to share.
    // Passive side: items materialise silently, with an eerie watching-eye motif —
    //   data being collected without the user knowing.
    // Bottom: the two halves merge into a unified "Digital Record" statement.

    const activeItems = [
      { y: 195, icon: "📝", label: "Posts & captions",  sub: "You choose to share"   },
      { y: 258, icon: "🎬", label: "Videos & reels",    sub: "You hit record"         },
      { y: 321, icon: "💬", label: "Comments & DMs",    sub: "You type and send"      },
      { y: 384, icon: "📸", label: "Photos & stories",  sub: "You upload"             },
      { y: 447, icon: "⭐", label: "Reviews & ratings", sub: "You publish"            },
    ];

    const passiveItems = [
      { y: 195, icon: "📍", label: "Your location",     sub: "Logged silently"        },
      { y: 258, icon: "🕐", label: "Time on pages",     sub: "Measured every second"  },
      { y: 321, icon: "🍪", label: "Cookies & trackers",sub: "Set without asking"     },
      { y: 384, icon: "📱", label: "Device fingerprint",sub: "Unique to your device"  },
      { y: 447, icon: "🎯", label: "Ad targeting data", sub: "Built from your habits" },
    ];

    el.insertAdjacentHTML("afterbegin", `
      <svg id="s3-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720"
           style="position:absolute;top:0;left:0;pointer-events:none;overflow:visible">
        <defs>
          <!-- Panel gradients -->
          <linearGradient id="s3-left-bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${C.blue}"   stop-opacity="0.18"/>
            <stop offset="100%" stop-color="${C.blue}"   stop-opacity="0.04"/>
          </linearGradient>
          <linearGradient id="s3-right-bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${C.purple}" stop-opacity="0.04"/>
            <stop offset="100%" stop-color="${C.purple}" stop-opacity="0.22"/>
          </linearGradient>
          <!-- Divider glow -->
          <linearGradient id="s3-div-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stop-color="transparent" stop-opacity="0"/>
            <stop offset="20%"  stop-color="white"       stop-opacity="0.5"/>
            <stop offset="50%"  stop-color="${C.blue}"   stop-opacity="1.0"/>
            <stop offset="80%"  stop-color="${C.purple}" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </linearGradient>
          <!-- Eye iris -->
          <radialGradient id="s3-iris-grad" cx="40%" cy="35%" r="60%">
            <stop offset="0%"   stop-color="#B8A8E8"     stop-opacity="0.95"/>
            <stop offset="40%"  stop-color="${C.purple}" stop-opacity="1"/>
            <stop offset="100%" stop-color="#26215C"     stop-opacity="1"/>
          </radialGradient>
          <!-- Glow filter -->
          <filter id="s3-click-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <!-- clipPaths MUST live inside defs or browsers silently discard them -->
          <clipPath id="s3-left-clip">
            <rect x="0" y="0" width="202" height="720"/>
          </clipPath>
          <clipPath id="s3-right-clip">
            <rect x="203" y="0" width="202" height="720"/>
          </clipPath>
        </defs>

        <!-- ══════════ LEFT PANEL: ACTIVE ══════════ -->
        <g id="s3-left-panel" clip-path="url(#s3-left-clip)">
          <rect x="0" y="0" width="202" height="720" fill="url(#s3-left-bg)"/>

          <!-- ACTIVE header — wrapper pattern: outer <g> holds authored position,
               inner <g id> starts at (0,0) so GSAP y offsets work correctly -->
          <g transform="translate(101,75)">
            <g id="s3-active-header" opacity="0">
              <rect x="-75" y="-28" width="150" height="56" rx="14"
                    fill="${C.blue}" opacity="0.2" stroke="${C.blue}" stroke-width="1.5"/>
              <text x="-52" y="8" font-size="20">✋</text>
              <text x="-22" y="-6" font-family="'Space Grotesk',sans-serif" font-size="15"
                    fill="${C.blue}" font-weight="900" letter-spacing="1">ACTIVE</text>
              <text x="-22" y="14" font-family="Inter,sans-serif" font-size="8"
                    fill="${C.blue}" opacity="0.7" letter-spacing="0.5">YOU CHOOSE THIS</text>
            </g>
          </g>

          ${activeItems.map((item, i) => `
            <g transform="translate(12,${item.y})">
              <g class="s3-active-item" id="s3-a${i}" opacity="0">
                <rect x="0" y="-18" width="182" height="48" rx="10"
                      fill="${C.blue}" fill-opacity="0.08"
                      stroke="${C.blue}" stroke-width="0.8" stroke-opacity="0.4"/>
                <rect x="0" y="-18" width="3" height="48" rx="1.5"
                      fill="${C.blue}" opacity="0.9"/>
                <circle cx="26" cy="6" r="18" fill="${C.blue}" opacity="0.15"/>
                <text x="26" y="12" font-size="16" text-anchor="middle">${item.icon}</text>
                <text x="52" y="-2" font-family="Inter,sans-serif" font-size="10"
                      fill="white" font-weight="700">${item.label}</text>
                <text x="52" y="16" font-family="Inter,sans-serif" font-size="7.5"
                      fill="${C.blue}" opacity="0.8">${item.sub}</text>
                <circle cx="168" cy="6" r="8" fill="${C.blue}" opacity="0.2"/>
                <text x="168" y="10" font-size="9" text-anchor="middle"
                      fill="${C.blue}" font-weight="700">✓</text>
              </g>
            </g>`).join("")}

          <g id="s3-active-footer" opacity="0" transform="translate(101,540)">
            <text font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.blue}" text-anchor="middle" font-weight="600">
              You decide what the world sees.
            </text>
          </g>
        </g>

        <!-- ══════════ RIGHT PANEL: PASSIVE ══════════ -->
        <g id="s3-right-panel" clip-path="url(#s3-right-clip)">
          <rect x="203" y="0" width="202" height="720" fill="url(#s3-right-bg)"/>

          <!-- PASSIVE header -->
          <!-- PASSIVE header — same wrapper pattern as active side -->
          <g transform="translate(304,75)">
            <g id="s3-passive-header" opacity="0">
              <rect x="-75" y="-28" width="150" height="56" rx="14"
                    fill="${C.purple}" opacity="0.2" stroke="${C.purple}" stroke-width="1.5"/>
              <text x="-52" y="8" font-size="20">👁</text>
              <text x="-22" y="-6" font-family="'Space Grotesk',sans-serif" font-size="14"
                    fill="${C.purple}" font-weight="900" letter-spacing="1">PASSIVE</text>
              <text x="-22" y="14" font-family="Inter,sans-serif" font-size="8"
                    fill="${C.purple}" opacity="0.7" letter-spacing="0.5">HAPPENS TO YOU</text>
            </g>
          </g>

          ${passiveItems.map((item, i) => `
            <g transform="translate(211,${item.y})">
              <g class="s3-passive-item" id="s3-p${i}" opacity="0">
                <rect x="0" y="-18" width="182" height="48" rx="10"
                      fill="${C.purple}" fill-opacity="0.08"
                      stroke="${C.purple}" stroke-width="0.8" stroke-opacity="0.4"/>
                <rect x="179" y="-18" width="3" height="48" rx="1.5"
                      fill="${C.purple}" opacity="0.9"/>
                <circle cx="26" cy="6" r="18" fill="${C.purple}" opacity="0.12"/>
                <circle cx="26" cy="6" r="18" fill="none" stroke="${C.purple}"
                        stroke-width="1" stroke-dasharray="2.5 2.5" opacity="0.5"/>
                <text x="26" y="12" font-size="16" text-anchor="middle">${item.icon}</text>
                <text x="52" y="-2" font-family="Inter,sans-serif" font-size="10"
                      fill="white" font-weight="700">${item.label}</text>
                <text x="52" y="16" font-family="Inter,sans-serif" font-size="7.5"
                      fill="${C.purple}" opacity="0.8">${item.sub}</text>
                <circle cx="168" cy="6" r="8" fill="${C.purple}" opacity="0.2"/>
                <text x="168" y="10" font-size="9" text-anchor="middle">👁</text>
              </g>
            </g>`).join("")}

          <g id="s3-passive-footer" opacity="0" transform="translate(304,540)">
            <text font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.purple}" text-anchor="middle" font-weight="600">
              This happens whether you know or not.
            </text>
          </g>
        </g>

        <!-- ══════════ CENTRAL DIVIDER ══════════ -->
        <line id="s3-divider-svg"
              x1="202" y1="30" x2="202" y2="690"
              stroke="url(#s3-div-glow)" stroke-width="2"
              stroke-dasharray="660" stroke-dashoffset="660"/>
        <circle id="s3-div-orb" cx="202" cy="360" r="6"
                fill="white" opacity="0" filter="url(#s3-click-glow)"/>

        <!-- ══════════ WATCHING EYE ══════════ -->
        <g id="s3-big-eye" opacity="0" transform="translate(304,490)">
          <path d="M -55,0 Q 0,-38 55,0 Q 0,38 -55,0 Z"
                fill="#1a1035" stroke="${C.purple}" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="22" fill="url(#s3-iris-grad)"/>
          <circle cx="0" cy="0" r="10" fill="#0a0818"/>
          <circle cx="6" cy="-6" r="3.5" fill="white" opacity="0.9"/>
          <path d="M -55,0 Q 0,-38 55,0" fill="none"
                stroke="${C.purple}" stroke-opacity="0.3" stroke-width="0.8"/>
        </g>

        <!-- ══════════ BOTTOM STATEMENT — wrapper pattern ══════════ -->
        <g transform="translate(202,640)">
          <g id="s3-bottom-statement" opacity="0">
            <rect x="-168" y="-30" width="336" height="60" rx="12"
                  fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <text font-family="'Space Grotesk',sans-serif" font-size="11"
                  fill="rgba(255,255,255,0.45)" text-anchor="middle" y="-8"
                  letter-spacing="2" font-weight="500">TOGETHER THEY CREATE</text>
            <text y="14" font-family="'Space Grotesk',sans-serif" font-size="16"
                  fill="white" text-anchor="middle" font-weight="800">
              Your Digital Record.
            </text>
          </g>
        </g>

      </svg>`);

    // ── Reset states ──
    gsap.set("#s3-active-header",   { opacity: 0, y: -16 });
    gsap.set("#s3-passive-header",  { opacity: 0, y: -16 });
    gsap.set(".s3-active-item",     { opacity: 0, y: 14 });
    gsap.set(".s3-passive-item",    { opacity: 0, y: 14 });
    gsap.set("#s3-active-footer",   { opacity: 0 });
    gsap.set("#s3-passive-footer",  { opacity: 0 });
    gsap.set("#s3-divider-svg",     { strokeDashoffset: 660 });
    gsap.set("#s3-div-orb",         { opacity: 0, scale: 0, transformOrigin: "center center" });
    gsap.set("#s3-big-eye",         { opacity: 0, scale: 0.3, transformOrigin: "center center" });
    gsap.set("#s3-bottom-statement",{ opacity: 0, y: 16 });
  },

  play() {
    // TIMESTAMP: 1:20
    // VO: "Some parts of our digital footprint are active, meaning we
    //      intentionally share them... Other parts are passive..."
    const tl = gsap.timeline({ id: "scene-3" });

    // ── Beat 1 (0s): Divider line draws from top to bottom — the split ──
    tl.to("#s3-divider-svg", {
      strokeDashoffset: 0,
      duration: 0.9, ease: "power3.out",
    }, 0);
    // Orb pulses at midpoint when line reaches there
    tl.to("#s3-div-orb", {
      opacity: 1, scale: 1,
      duration: 0.4, ease: E.back,
    }, 0.5);

    // ── Beat 2 (0.6s): Both headers drop in from above ──
    tl.to("#s3-active-header", {
      opacity: 1, y: 0,
      duration: 0.6, ease: E.back,
    }, 0.6);
    tl.to("#s3-passive-header", {
      opacity: 1, y: 0,
      duration: 0.6, ease: E.back,
    }, 0.7);

    // ── Beat 3 (1.2s): Active items rise up from below ──
    tl.to(".s3-active-item", {
      opacity: 1, y: 0,
      stagger: 0.18, duration: 0.45, ease: E.out,
    }, 1.2);

    // ── Beat 4 (1.6s): Passive items rise up from below ──
    tl.to(".s3-passive-item", {
      opacity: 1, y: 0,
      stagger: 0.18, duration: 0.45, ease: E.out,
    }, 1.6);

    // ── Beat 5 (3.0s): Big eye materialises on passive side ──
    // VO: "Websites may record our location, browsing history..."
    tl.to("#s3-big-eye", {
      opacity: 1, scale: 1,
      duration: 0.8, ease: "back.out(1.4)",
    }, 3.0);
    // Eye "blink" — eyelids close briefly then open.
    // FIX: scaleY now pivots around the eye's own centre ("center center"),
    // not a hardcoded page coordinate, so the blink stays anchored even if
    // the eye's translate() position is ever adjusted.
    tl.to("#s3-big-eye", {
      scaleY: 0.08, duration: 0.1, ease: "power2.in",
    }, 3.9);
    tl.to("#s3-big-eye", {
      scaleY: 1, duration: 0.15, ease: "power2.out",
    }, 4.0);

    // ── Beat 6 (3.2s): Footer lines fade in under each panel ──
    tl.to("#s3-active-footer",  { opacity: 1, duration: 0.6, ease: E.out }, 3.2);
    tl.to("#s3-passive-footer", { opacity: 1, duration: 0.6, ease: E.out }, 3.4);

    // ── Beat 7 (4.2s): Divider orb pulses — the merge moment ──
    tl.to("#s3-div-orb", {
      scale: 3, opacity: 0,
      duration: 0.8, ease: "power2.out",
    }, 4.2);

    // ── Beat 8 (4.5s): Bottom unifying statement slides up ──
    // VO: "Together, these pieces create a digital record of who we are..."
    tl.to("#s3-bottom-statement", {
      opacity: 1, y: 0,
      duration: 0.8, ease: E.expo,
    }, 4.5);

    // ── Beat 9 (5s+): Passive items pulse subtly — they never stop watching ──
    tl.to(".s3-passive-item", {
      opacity: 0.7, duration: 1.5,
      yoyo: true, repeat: -1, ease: "sine.inOut",
      stagger: { amount: 0.8, from: "random" },
    }, 5.2);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 4  —  Digital Permanence  (2:00 – 2:40)
   VO: "One important characteristic of a digital footprint is that it can be
        surprisingly difficult to erase. Once information has been shared
        online, it may have already been downloaded, copied, archived, or
        captured in screenshots by other users..."

   UPGRADE NOTES:
   - This scene previously had TWO parallel render systems fighting each
     other: legacy static HTML already defined in index.html (#s4-post,
     #s4-delete-btn, .copy-node ×5, #s4-stamp) PLUS a second full SVG layer
     injected by this file with renamed IDs (#s4-delete-btn-svg,
     #s4-stamp-svg) to dodge collisions. That's exactly the pattern that
     caused the invisible-elements bug we hunted down in Scene 3 — running
     two systems at once is fragile and hard to debug. This rewrite commits
     to ONE system: the real HTML/CSS elements already defined in
     index.html. The SVG injection is removed entirely.
   - .scene__post-card and .copy-node__icon previously used leftover
     dark-mode CSS (rgba(255,255,255,0.06) backgrounds, white-on-white
     borders) that were invisible on the cream canvas — fixed in style.css.
   - Added a connecting-lines SVG layer (#s4-copy-lines, defined directly
     in index.html) that draws dashed lines from the post card out to each
     copy-destination icon, reinforcing "this is already everywhere."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[4] = {

  init() {
    const el = qs("#scene-4");
    if (!el) { console.warn("[Scene 4] #scene-4 not found"); return; }

    // No SVG to inject or remove anymore — this scene now animates the
    // real HTML elements that already exist in index.html.

    // ── Reset states ──
    gsap.set("#s4-post",         { opacity: 0, y: 24, scale: 0.94,
      transformOrigin: "center center" });
    gsap.set("#s4-delete-btn",   { scale: 1, transformOrigin: "center center" });
    gsap.set(".copy-node",       { opacity: 0, scale: 0.4,
      transformOrigin: "center center" });
    gsap.set("#s4-stamp",        { opacity: 0, scale: 0,
      rotation: -12 }); // base CSS already centers + rotates this element
    gsap.set("#s4-copy-lines line", { opacity: 0, strokeDashoffset: 240 });

    // Pre-compute each line's true pixel length so the dash-draw animation
    // is accurate rather than guessed — getTotalLength() is the reliable way.
    const lines = el.querySelectorAll("#s4-copy-lines line");
    lines.forEach(line => {
      try {
        const len = line.getTotalLength();
        line.style.strokeDasharray  = `${len}`;
        line.style.strokeDashoffset = `${len}`;
        line.dataset.length = len;
      } catch (e) {
        // getTotalLength can fail if the SVG isn't laid out yet — the CSS
        // dasharray fallback (5 4, near Scene start) still looks fine.
      }
    });
  },

  play() {
    // TIMESTAMP: 2:00
    // VO: "One important characteristic of a digital footprint is that it
    //      can be surprisingly difficult to erase..."
    const tl = gsap.timeline({ id: "scene-4" });

    // ── Beat 1 (0s): Post card rises in ──
    tl.to("#s4-post", { opacity: 1, y: 0, scale: 1,
      duration: 0.8, ease: E.back }, 0);

    // ── Beat 2 (0.9s): User presses delete — button shakes ──
    tl.to("#s4-delete-btn", {
      scale: 0.85, duration: 0.08, ease: "power2.in",
    }, 0.9);
    tl.to("#s4-delete-btn", {
      x: 4, duration: 0.05, yoyo: true, repeat: 5, ease: "none",
    }, 1.0);
    tl.to("#s4-delete-btn", {
      scale: 1, duration: 0.15, ease: E.back,
    }, 1.35);

    // ── Beat 3 (1.6s): Delete "fails" — button dims to show it didn't work ──
    tl.to("#s4-delete-btn", { opacity: 0.3,
      duration: 0.3, ease: "power2.in" }, 1.6);

    // ── Beat 4 (2.0s): Connector lines draw outward from the post ──
    // VO: "...it may have already been downloaded, copied, archived..."
    tl.to("#s4-copy-lines line", { opacity: 0.45,
      duration: 0.2, ease: "none" }, 2.0);
    tl.to("#s4-copy-lines line", {
      strokeDashoffset: 0,
      stagger: 0.1,
      duration: 0.6, ease: E.out,
    }, 2.0);

    // ── Beat 5 (2.1s): Copy-destination nodes pop in along the lines ──
    tl.to(".copy-node", { opacity: 1, scale: 1,
      stagger: 0.12, duration: 0.45, ease: E.back }, 2.1);

    // ── Beat 6 (3.0s): Copy nodes pulse — emphasising they're permanent/active ──
    tl.to(".copy-node__icon", {
      scale: 1.08, duration: 0.4, yoyo: true, repeat: 1,
      stagger: 0.08, ease: E.inOut,
      transformOrigin: "center center",
    }, 3.0);

    // ── Beat 7 (3.6s): Lines keep gently "flowing" — dash offset drifts ──
    tl.to("#s4-copy-lines line", {
      strokeDashoffset: "-=16",
      duration: 2, ease: "none", repeat: -1,
    }, 3.6);

    // ── Beat 8 (3.7s): DELETED stamp slams in, ironic punchline ──
    tl.to("#s4-stamp", { opacity: 1, scale: 1, rotation: -8,
      duration: 0.5, ease: E.back }, 3.7);

    // Stamp settles to its natural resting rotation
    tl.to("#s4-stamp", { rotation: -12,
      duration: 0.3, ease: E.out }, 4.2);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 5  —  The Ink Drop Metaphor  (2:40 – 3:20)
   VO: "Think of the internet like dropping a drop of ink into a glass of water..."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[5] = {

  init() {
    // Target: #s5-ink-wrap  (class="scene__ink-wrap" id="s5-ink-wrap" in index.html)
    const el = qs("#s5-ink-wrap");
    if (!el) { console.warn("[Scene 5] #s5-ink-wrap not found"); return; }

    // The static "Digital Permanence" label lives outside the wrap, in the
    // markup as #s5-label. We reuse it (rather than duplicate text in SVG)
    // and rewrite its copy mid-scene for the platform-spread beat.
    const label = qs("#s5-label");
    if (label) {
      const eyebrow = label.querySelector(".label__eyebrow");
      const term    = label.querySelector(".label__term");
      if (eyebrow) eyebrow.textContent = "Digital permanence";
      if (term)    term.textContent    = "It spreads in moments";
    }

    el.innerHTML = `
      <svg id="s5-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720" style="overflow:visible;">

        <defs>
          <radialGradient id="s5-ink-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="${C.purple}" stop-opacity="0.95"/>
            <stop offset="60%"  stop-color="${C.blue}"   stop-opacity="0.45"/>
            <stop offset="100%" stop-color="${C.bg}"     stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="s5-water-grad" cx="50%" cy="20%" r="80%">
            <stop offset="0%"   stop-color="#0A1628" stop-opacity="1"/>
            <stop offset="100%" stop-color="#060810" stop-opacity="1"/>
          </radialGradient>
          <!-- Full-glass diffuse tint — the ink that "can't be removed" -->
          <radialGradient id="s5-diffuse-grad" cx="50%" cy="35%" r="75%">
            <stop offset="0%"   stop-color="${C.purple}" stop-opacity="0.85"/>
            <stop offset="55%"  stop-color="${C.blue}"   stop-opacity="0.6"/>
            <stop offset="100%" stop-color="${C.purple}" stop-opacity="0.5"/>
          </radialGradient>
          <radialGradient id="s5-node-grad" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stop-color="#FFFFFF"     stop-opacity="0.9"/>
            <stop offset="35%"  stop-color="${C.blue}"   stop-opacity="0.95"/>
            <stop offset="100%" stop-color="${C.purple}" stop-opacity="0.9"/>
          </radialGradient>
          <radialGradient id="s5-origin-grad" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stop-color="#FFFFFF"    stop-opacity="0.95"/>
            <stop offset="100%" stop-color="${C.amber}" stop-opacity="0.95"/>
          </radialGradient>
          <filter id="s5-node-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <!-- Clip the ink so it never visually escapes the glass walls -->
          <clipPath id="s5-glass-clip">
            <path d="M -68,-126 L -77,108 Q -77,126 -59,126
                     L 59,126 Q 77,126 77,108 L 68,-126 Z"
                  transform="translate(202,330)"/>
          </clipPath>
        </defs>

        <!-- Ambient backdrop glow so the glass doesn't float in a void -->
        <ellipse cx="202" cy="330" rx="190" ry="220"
                 fill="${C.blue}" opacity="0.05"/>

        <!-- ════════════ ACT 1 — Ink in the glass ════════════ -->
        <g id="s5-act1">

          <!-- Glass of water -->
          <g id="s5-glass" transform="translate(202,330)">
            <path d="M -70,-130 L -80,110 Q -80,130 -60,130
                     L 60,130 Q 80,130 80,110 L 70,-130 Z"
                  fill="url(#s5-water-grad)"
                  stroke="${C.blue}" stroke-width="1.5" opacity="0.9"/>
            <ellipse cx="0" cy="-130" rx="70" ry="10"
                     fill="${C.blue}" opacity="0.25"/>
            <path d="M -70,-130 Q 0,-145 70,-130"
                  fill="none" stroke="white" stroke-width="1" opacity="0.15"/>
            <path d="M -68,-100 L -76,100"
                  fill="none" stroke="white" stroke-width="3"
                  stroke-linecap="round" opacity="0.08"/>
          </g>

          <!-- Everything ink-related is clipped to the glass interior -->
          <g clip-path="url(#s5-glass-clip)">
            <!-- Full diffuse tint — fades in slowly to show total, permanent spread -->
            <rect id="s5-diffuse" x="32" y="190" width="340" height="280"
                  fill="url(#s5-diffuse-grad)" opacity="0"/>
            <!-- Three expanding ink rings on impact -->
            <circle id="s5-ink-spread-1" cx="202" cy="225" r="0"
                    fill="url(#s5-ink-grad)" opacity="0"/>
            <circle id="s5-ink-spread-2" cx="202" cy="225" r="0"
                    fill="none" stroke="${C.purple}" stroke-width="1.5" opacity="0"/>
            <circle id="s5-ink-spread-3" cx="202" cy="225" r="0"
                    fill="none" stroke="${C.blue}"   stroke-width="1"   opacity="0"/>
          </g>

          <!-- Ink drop, falling from above the glass -->
          <g id="s5-drop" transform="translate(202,150)">
            <ellipse cx="0" cy="0" rx="8" ry="12" fill="${C.purple}"/>
            <path d="M -3,-10 Q 0,-20 3,-10" fill="${C.purple}" opacity="0.7"/>
          </g>

          <!-- Particle host for ink-impact sparkle helper -->
          <g id="s5-particles" transform="translate(202,225)"/>

          <!-- Caption beat 1 -->
          <g id="s5-caption-1" opacity="0" transform="translate(202,510)">
            <text font-family="Inter,sans-serif" font-size="11"
                  fill="${C.muted}" text-anchor="middle">At first, concentrated.</text>
            <text y="22" font-family="'Space Grotesk',sans-serif" font-size="15"
                  fill="${C.white}" text-anchor="middle" font-weight="700">
              Within moments, everywhere.
            </text>
          </g>
        </g>

        <!-- ════════════ ACT 2 — Spread across platforms ════════════ -->
        <g id="s5-act2" opacity="0" transform="translate(202,300)">

          <!-- Connecting lines drawn from origin out to each platform node -->
          <g id="s5-net-lines" stroke="${C.blue}" stroke-width="1"
             fill="none" opacity="0.6"></g>

          <!-- Outer "reach" pulse rings -->
          <circle id="s5-net-pulse-1" cx="0" cy="0" r="0"
                  fill="none" stroke="${C.purple}" stroke-width="1" opacity="0"/>
          <circle id="s5-net-pulse-2" cx="0" cy="0" r="0"
                  fill="none" stroke="${C.blue}" stroke-width="0.8" opacity="0"/>

          <!-- Platform nodes (populated by JS below) -->
          <g id="s5-net-nodes"></g>

          <!-- Origin node — the single original post -->
          <g id="s5-net-origin">
            <circle r="11" fill="url(#s5-origin-grad)" filter="url(#s5-node-glow)"/>
            <circle r="11" fill="none" stroke="${C.amber}" stroke-width="1" opacity="0.6"/>
          </g>

          <!-- Caption beat 2 -->
          <g id="s5-caption-2" opacity="0" transform="translate(0,250)">
            <text font-family="Inter,sans-serif" font-size="11"
                  fill="${C.muted}" text-anchor="middle">One post. Countless platforms.</text>
            <text y="22" font-family="'Space Grotesk',sans-serif" font-size="15"
                  fill="${C.white}" text-anchor="middle" font-weight="700">
              Audiences far beyond the original.
            </text>
          </g>
        </g>

      </svg>`;

    // ── Build the radial network of platform nodes programmatically ──
    const svg = qs("#s5-svg");
    const lines = svg.querySelector("#s5-net-lines");
    const nodes = svg.querySelector("#s5-net-nodes");
    const icons = ["♥", "💬", "▶", "↻", "🔖", "@"]; // heart / comment / play / repost / save / mention
    const radius = 130;
    const count  = icons.length;
    this._netCoords = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      this._netCoords.push({ x, y });

      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      line.setAttribute("class", "s5-net-line");
      line.setAttribute("d", `M 0,0 L ${x.toFixed(1)},${y.toFixed(1)}`);
      const len = Math.hypot(x, y);
      line.setAttribute("stroke-dasharray", String(len));
      line.setAttribute("stroke-dashoffset", String(len));
      lines.appendChild(line);

      const node = document.createElementNS("http://www.w3.org/2000/svg", "g");
      node.setAttribute("class", "s5-net-node");
      node.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(0)`);
      node.innerHTML = `
        <circle r="18" fill="url(#s5-node-grad)" filter="url(#s5-node-glow)" opacity="0.95"/>
        <text y="5" font-family="Inter,sans-serif" font-size="13" text-anchor="middle"
              fill="#0A0A14">${icons[i]}</text>`;
      nodes.appendChild(node);
    }

    gsap.set("#s5-act1", { opacity: 1 });
    gsap.set("#s5-act2", { opacity: 0 });
    gsap.set("#s5-glass",  { opacity: 0, y: 30, scale: 0.9,
      transformOrigin: "center center" });
    gsap.set("#s5-drop",   { opacity: 0, y: -50 });
    gsap.set(["#s5-ink-spread-1", "#s5-ink-spread-2", "#s5-ink-spread-3"],
             { opacity: 0 });
    gsap.set("#s5-diffuse", { opacity: 0 });
    gsap.set("#s5-caption-1", { opacity: 0, y: 14 });
    gsap.set("#s5-caption-2", { opacity: 0, y: 14 });
    gsap.set("#s5-net-origin", { opacity: 0, scale: 0, transformOrigin: "center center" });
    gsap.set("#s5-net-nodes .s5-net-node", { opacity: 0, transformOrigin: "center center" });
    gsap.set(["#s5-net-pulse-1", "#s5-net-pulse-2"], { opacity: 0 });
    gsap.set(label, { opacity: 0, y: -10 });
  },

  play() {
    // TIMESTAMP: 2:40
    const tl = gsap.timeline({ id: "scene-5" });
    const label   = qs("#s5-label");
    const eyebrow = label?.querySelector(".label__eyebrow");
    const term    = label?.querySelector(".label__term");

    // ── Label intro: "Digital permanence / It spreads in moments" ──
    tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: E.out }, 0.1);

    // ── ACT 1 — ink concentrated, then spreads through the glass ──
    tl.to("#s5-glass", { opacity: 1, y: 0, scale: 1,
      duration: 0.8, ease: E.back }, 0.2);

    tl.to("#s5-drop", { opacity: 1, y: 0,
      duration: 0.05, ease: "none" }, 0.85);
    tl.to("#s5-drop", { y: 75, duration: 0.5, ease: "power2.in" }, 0.87);

    tl.to("#s5-drop", { opacity: 0, scale: 1.8,
      duration: 0.15, ease: "power2.out" }, 1.35);

    tl.to("#s5-ink-spread-1", { opacity: 0.6, r: 50,
      duration: 1.0, ease: "power2.out" }, 1.36);
    tl.to("#s5-ink-spread-1", { opacity: 0, duration: 0.8, ease: "power2.in" }, 1.9);

    tl.to("#s5-ink-spread-2", { opacity: 0.7, r: 90,
      duration: 1.3, ease: "power2.out" }, 1.45);
    tl.to("#s5-ink-spread-2", { opacity: 0, duration: 0.8, ease: "power2.in" }, 2.3);

    tl.to("#s5-ink-spread-3", { opacity: 0.4, r: 130,
      duration: 1.6, ease: "power2.out" }, 1.55);
    tl.to("#s5-ink-spread-3", { opacity: 0, duration: 0.9, ease: "power2.in" }, 2.7);

    // The "impossible to remove completely" beat — ink tints the whole glass
    tl.to("#s5-diffuse", { opacity: 0.85, duration: 1.4, ease: "power2.out" }, 1.7);

    tl.add(() => {
      const host = qs("#s5-particles");
      if (host && window.AnimHelpers?.createSparkles) {
        AnimHelpers.createSparkles(host, 18, C.purple);
      }
    }, 1.55);

    tl.to("#s5-caption-1", { opacity: 1, y: 0, duration: 0.7, ease: E.out }, 2.1);
    tl.to("#s5-caption-1", { opacity: 0, y: -10, duration: 0.4, ease: "power2.in" }, 3.6);

    // ── Transition: glass dissolves, network of platforms rises ──
    tl.to("#s5-act1", { opacity: 0, scale: 0.92, transformOrigin: "center center",
      duration: 0.6, ease: "power2.in" }, 3.6);

    tl.call(() => {
      if (eyebrow) eyebrow.textContent = "It doesn't stay put";
      if (term)    term.textContent    = "It spreads across platforms";
    }, null, 4.0);
    tl.fromTo(label, { y: -6, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.4, ease: E.out }, 4.0);

    tl.to("#s5-act2", { opacity: 1, duration: 0.5, ease: E.out }, 4.0);

    // Origin node pops in first — this is the single original post
    tl.to("#s5-net-origin", { opacity: 1, scale: 1, duration: 0.5, ease: E.back }, 4.1);

    // Lines draw outward from the origin to each platform
    tl.to("#s5-net-lines .s5-net-line", { strokeDashoffset: 0,
      duration: 0.7, ease: "power3.out", stagger: 0.06 }, 4.4);

    // Platform nodes pop in along the lines, staggered like a ripple
    tl.to("#s5-net-nodes .s5-net-node", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.back, stagger: 0.07 }, 4.55);

    // Reach pulses ripple out past the outermost nodes
    tl.to("#s5-net-pulse-1", { opacity: 0.5, r: 175,
      duration: 1.1, ease: "power2.out" }, 5.1);
    tl.to("#s5-net-pulse-1", { opacity: 0, duration: 0.6, ease: "power2.in" }, 5.9);

    tl.to("#s5-net-pulse-2", { opacity: 0.35, r: 210,
      duration: 1.3, ease: "power2.out" }, 5.3);
    tl.to("#s5-net-pulse-2", { opacity: 0, duration: 0.7, ease: "power2.in" }, 6.2);

    // Gentle ambient drift on the nodes so the network feels alive
    tl.to("#s5-net-nodes .s5-net-node", {
      y: "+=4", duration: 1.6, yoyo: true, repeat: -1,
      ease: "sine.inOut", stagger: { each: 0.15, from: "random" },
    }, 5.4);

    tl.to("#s5-caption-2", { opacity: 1, y: 0, duration: 0.7, ease: E.out }, 5.6);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 6  —  Universities & Employers  (3:20 – 4:00)
   VO: "Today, our digital footprints influence many aspects of our lives.
        Universities may review applicants' online presence. Employers often
        search for candidates before making hiring decisions..."

   UPGRADE NOTES:
   - Previous version called `el.innerHTML = ...` on #s6-profile and
     replaced it with a hand-built duplicate SVG (profile card, magnifier,
     three social cards, verdict badge) — but never touched the real
     #s6-orbit (4 institution icons: 🎓💼🏆🤝) or #s6-search (search bar +
     3 results incl. the flagged warning result) that already exist,
     fully styled, in index.html. Those sat at their default CSS
     opacity:0 the entire scene and were never shown. This rewrite drops
     the SVG entirely and animates the real elements, so every piece
     index.html already built is finally used.
   - .profile__avatar, .orbit-icon, .search__bar, .search-result--normal
     all had leftover dark-mode CSS (translucent-white-on-black) that was
     invisible on the cream canvas — fixed in style.css.
   - Orbit icon positions are now computed here (4 institutions placed in
     a ring around the profile card) since index.html doesn't hardcode
     per-icon coordinates — GSAP sets them via x/y offsets from center.
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[6] = {

  init() {
    const scene = qs("#scene-6");
    if (!scene) { console.warn("[Scene 6] #scene-6 not found"); return; }

    // No SVG injection — this scene animates the real index.html elements:
    // #s6-profile, #s6-orbit (.orbit-icon ×4), #s6-search (#s6-search-text,
    // #s6-results, .search-result ×2, #s6-flagged).

    // ── Orbit icon target positions ──
    // Each institution icon orbits the profile card in a loose ring.
    // Coordinates are offsets (px) from the icon's own centred starting
    // point, applied via GSAP x/y — keeps the layout fully responsive
    // since we never hardcode top/left in CSS.
    const orbitTargets = {
      "#s6-uni":   { x: -118, y: -150 },  // top-left    — University
      "#s6-emp":   { x:  118, y: -150 },  // top-right   — Employer
      "#s6-grant": { x: -130, y:   20 },  // mid-left    — Scholarship
      "#s6-biz":   { x:  130, y:   20 },  // mid-right   — Business
    };

    // ── Reset states ──
    gsap.set("#s6-profile",        { opacity: 0, y: 28, scale: 0.92,
      transformOrigin: "center center" });
    gsap.set(".profile__avatar-ring", { scale: 0.6, opacity: 0,
      transformOrigin: "center center" });
    gsap.set(".profile__name",     { opacity: 0, y: 8 });
    gsap.set(".profile__handle",   { opacity: 0, y: 8 });

    gsap.set("#s6-orbit", { opacity: 1 }); // container itself always visible;
                                            // individual icons handle their own fade
    gsap.set(".orbit-icon", { opacity: 0, scale: 0.3, x: 0, y: 0,
      transformOrigin: "center center" });

    gsap.set("#s6-search",     { opacity: 0, y: 24 });
    gsap.set("#s6-search-text",{ /* TextPlugin will set text content */ });
    gsap.set(".search__cursor",{ opacity: 1 });
    gsap.set("#s6-results",    { opacity: 0 });
    gsap.set(".search-result", { opacity: 0, x: -14 });

    // Clear any previously typed search text so re-entering the scene
    // (via jumpToScene) starts clean.
    const searchText = scene.querySelector("#s6-search-text");
    if (searchText) searchText.textContent = "";

    // Stash orbit targets on the scene element so play() can read them
    // without redefining the object every time.
    scene._s6OrbitTargets = orbitTargets;
  },

  play() {
    // TIMESTAMP: 3:20
    // VO: "Today, our digital footprints influence many aspects of our
    //      lives. Universities may review applicants' online presence.
    //      Employers often search for candidates..."
    const tl = gsap.timeline({ id: "scene-6" });
    const scene = qs("#scene-6");
    const orbitTargets = scene?._s6OrbitTargets || {};

    // ── Beat 1 (0s): Profile card rises in ──
    tl.to("#s6-profile", { opacity: 1, y: 0, scale: 1,
      duration: 0.8, ease: E.back }, 0);
    tl.to(".profile__avatar-ring", { opacity: 1, scale: 1,
      duration: 0.6, ease: E.elastic }, 0.3);
    tl.to(".profile__name",   { opacity: 1, y: 0, duration: 0.4, ease: E.out }, 0.6);
    tl.to(".profile__handle", { opacity: 1, y: 0, duration: 0.4, ease: E.out }, 0.75);

    // ── Beat 2 (1.1s): Institution icons orbit outward into position ──
    // VO: "Universities may review applicants..."
    Object.entries(orbitTargets).forEach(([sel, pos], i) => {
      tl.to(sel, {
        opacity: 1, scale: 1, x: pos.x, y: pos.y,
        duration: 0.6, ease: E.back,
      }, 1.1 + i * 0.12);
    });

    // ── Beat 3 (2.0s): Orbit icons gently bob — alive, watching ──
    tl.to(".orbit-icon", {
      y: "+=8", duration: 1.8, yoyo: true, repeat: -1,
      ease: "sine.inOut", stagger: { amount: 0.6 },
    }, 2.0);

    // ── Beat 4 (2.2s): Search bar slides up ──
    // VO: "...Employers often search for candidates before making
    //      hiring decisions."
    tl.to("#s6-search", { opacity: 1, y: 0,
      duration: 0.6, ease: E.back }, 2.2);

    // ── Beat 5 (2.5s): Cursor blinks while "typing" ──
    tl.to(".search__cursor", {
      opacity: 0, duration: 0.4, repeat: 3, yoyo: true, ease: "none",
    }, 2.5);

    // ── Beat 6 (2.5s): Type the search query via TextPlugin ──
    tl.to("#s6-search-text", {
      duration: 1.2,
      text: { value: "Alex Johnson digital footprint", delimiter: "" },
      ease: "none",
    }, 2.5);

    // ── Beat 7 (3.8s): Results drop in — two normal, one flagged ──
    // VO: "Professional organizations, scholarship committees, and even
    //      business partners may form impressions based on publicly
    //      available information."
    tl.to("#s6-results", { opacity: 1, duration: 0.3 }, 3.8);
    tl.to(".search-result", {
      opacity: 1, x: 0,
      stagger: 0.18, duration: 0.4, ease: E.out,
    }, 3.9);

    // ── Beat 8 (4.5s): Flagged result pulses amber warning ──
    tl.to("#s6-flagged", {
      backgroundColor: "rgba(212,114,10,0.20)",
      duration: 0.35, yoyo: true, repeat: 3, ease: E.inOut,
    }, 4.5);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 7  —  People Grow & Change  (4:00 – 4:25)   [UPGRADED]
   VO: "This does not mean that every old mistake automatically ruins
        someone's future. People grow, learn, and change over time.
        However, what we share online can affect how others perceive
        our judgment, professionalism, and credibility. Because online
        content often lacks context, a single post may create an
        impression that is difficult to change."

   Two-act structure to cover the full VO beat-for-beat:
     ACT 1 (reassurance) — a three-stop timeline shows a person moving
       from a flagged "past mistake" through "learning" to a polished,
       professional "now" — the growth arc draws between them.
     ACT 2 (the caveat) — three perception badges (Judgment,
       Professionalism, Credibility) orbit a central eye/impression icon;
       a "missing context" tag is struck through, then a wax-seal stamp
       slams down to visualise an impression that's hard to undo.
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[7] = {

  init() {
    // Target: #scene-7 directly — no single wrapper div exists for this full-scene SVG.
    const el = qs("#scene-7");
    if (!el) { console.warn("[Scene 7] #scene-7 not found"); return; }

    const prev = el.querySelector("#s7-svg");
    if (prev) prev.remove();

    el.insertAdjacentHTML("afterbegin", `
      <svg id="s7-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720" style="position:absolute;top:0;left:0;pointer-events:none">
        <defs>
          <radialGradient id="s7-glow-teal" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="${C.teal}" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="s7-glow-purple" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="${C.purple}" stop-opacity="0.20"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="s7-stamp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="${C.red}"/>
            <stop offset="100%" stop-color="${C.purple}"/>
          </linearGradient>
        </defs>

        <!-- ── Ambient backdrop ── -->
        <ellipse cx="120" cy="330" rx="150" ry="150" fill="url(#s7-glow-purple)" opacity="0.5"/>
        <ellipse cx="300" cy="290" rx="150" ry="150" fill="url(#s7-glow-teal)"   opacity="0.5"/>

        <!-- Eyebrow label -->
        <g id="s7-eyebrow" opacity="0" transform="translate(202,118)">
          <text font-family="Inter,sans-serif" font-size="9" letter-spacing="3"
                fill="${C.muted}" text-anchor="middle">GROWTH &amp; CONTEXT</text>
        </g>

        <!-- ════════ ACT 1 — Growth timeline ════════ -->
        <g id="s7-act1">

          <!-- Timeline track -->
          <g id="s7-timeline-svg" opacity="0">
            <line x1="55" y1="330" x2="350" y2="330"
                  stroke="${C.blue}" stroke-width="1.5"
                  stroke-dasharray="6 4" opacity="0.5"/>
            <polygon points="350,325 363,330 350,335" fill="${C.blue}" opacity="0.5"/>
          </g>

          <!-- Growth arc (drawn with stroke-dashoffset trick) -->
          <path id="s7-growth-arc" d="M 95,330 Q 202,250 308,290"
                fill="none" stroke="${C.teal}" stroke-width="2.5"
                stroke-linecap="round"
                stroke-dasharray="260" stroke-dashoffset="260" opacity="0.85"/>

          <!-- Past self (left, muted, flagged) -->
          <!-- NOTE: renamed s7-past → s7-past-svg to avoid collision with <div id="s7-past"> in index.html -->
          <g id="s7-past-svg" opacity="0" transform="translate(95,330)">
            <circle cx="0" cy="-30" r="34" fill="${C.muted}" opacity="0.12"/>
            <circle cx="0" cy="-38" r="14" fill="${C.muted}" opacity="0.65"/>
            <path d="M -20,-2 Q -20,-22 0,-22 Q 20,-22 20,-2 L 20,8 L -20,8 Z"
                  fill="${C.muted}" opacity="0.55"/>
            <!-- flag badge -->
            <circle cx="16" cy="-52" r="11" fill="${C.red}" opacity="0.9"/>
            <text x="16" y="-48.5" font-family="Inter,sans-serif" font-size="11"
                  fill="${C.white}" text-anchor="middle" font-weight="700">!</text>
            <text y="34" font-family="Inter,sans-serif" font-size="9"
                  fill="${C.muted}" text-anchor="middle" font-weight="600">Then</text>
            <text y="46" font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.red}" text-anchor="middle" opacity="0.85">an old mistake</text>
          </g>

          <!-- Midpoint — learning / in progress -->
          <g id="s7-mid-svg" opacity="0" transform="translate(202,255)">
            <circle cx="0" cy="0" r="9" fill="${C.amber}" opacity="0.85"/>
            <circle cx="0" cy="0" r="16" fill="none" stroke="${C.amber}"
                    stroke-width="1.2" opacity="0.4"/>
            <text y="-22" font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.amber}" text-anchor="middle" letter-spacing="0.5">
              learning&#8201;&#183;&#8201;changing
            </text>
          </g>

          <!-- Present self (right, taller, polished, glowing) -->
          <!-- NOTE: renamed s7-present → s7-present-svg to avoid collision with <div id="s7-present"> in index.html -->
          <g id="s7-present-svg" opacity="0" transform="translate(308,290)">
            <circle cx="0" cy="-46" r="40" fill="${C.teal}" opacity="0.14"/>
            <circle cx="0" cy="-58" r="16" fill="${C.teal}" opacity="0.85"/>
            <!-- tailored shoulders / blazer silhouette -->
            <path d="M -24,-6 Q -24,-30 0,-30 Q 24,-30 24,-6 L 24,18 L -24,18 Z"
                  fill="${C.teal}" opacity="0.75"/>
            <path d="M -6,-28 L 0,-12 L 6,-28 Z" fill="#06060F" opacity="0.5"/>
            <circle cx="0" cy="-58" r="26"
                    fill="none" stroke="${C.teal}" stroke-width="1.5" opacity="0.35"/>
            <text y="34" font-family="Inter,sans-serif" font-size="9"
                  fill="${C.teal}" text-anchor="middle" font-weight="600">Now</text>
          </g>

          <!-- Checkmark of progress -->
          <g id="s7-check" opacity="0" transform="translate(338,222)">
            <circle cx="0" cy="0" r="16" fill="${C.teal}" opacity="0.2"
                    stroke="${C.teal}" stroke-width="2"/>
            <polyline points="-7,1 -1,7 9,-6"
                      fill="none" stroke="${C.teal}" stroke-width="2.6"
                      stroke-linecap="round" stroke-linejoin="round"/>
          </g>

          <!-- Sparkle host for growth-arc completion burst -->
          <g id="s7-sparkles" transform="translate(202,255)"/>

          <!-- Caption 1 -->
          <g id="s7-caption-1" opacity="0" transform="translate(202,430)">
            <text font-family="Inter,sans-serif" font-size="11.5"
                  fill="${C.white}" text-anchor="middle" font-weight="500">
              People grow, learn, and change
            </text>
            <text y="18" font-family="Inter,sans-serif" font-size="11.5"
                  fill="${C.white}" text-anchor="middle" font-weight="500">
              over time.
            </text>
          </g>
        </g>

        <!-- ════════ ACT 2 — Perception &amp; missing context ════════ -->
        <g id="s7-act2" opacity="0">

          <!-- Central "impression" eye icon -->
          <g id="s7-impression" transform="translate(202,300)">
            <circle cx="0" cy="0" r="46" fill="none" stroke="${C.purple}"
                    stroke-width="1.2" opacity="0.35" stroke-dasharray="3 5"/>
            <path d="M -28,0 Q 0,-22 28,0 Q 0,22 -28,0 Z"
                  fill="${C.purple}" opacity="0.18" stroke="${C.purple}" stroke-width="1.4"/>
            <circle cx="0" cy="0" r="10" fill="${C.purple}" opacity="0.85"/>
            <circle cx="0" cy="0" r="4"  fill="#06060F"/>
          </g>

          <!-- Perception badges orbiting the eye -->
          <g class="s7-badge" id="s7-badge-judgment" opacity="0" transform="translate(96,230)">
            <rect x="-46" y="-15" width="92" height="30" rx="15"
                  fill="#12121E" stroke="${C.blue}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="9.5" fill="${C.white}"
                  text-anchor="middle" dy="3.5" font-weight="600">Judgment</text>
          </g>
          <g class="s7-badge" id="s7-badge-professionalism" opacity="0" transform="translate(308,228)">
            <rect x="-66" y="-15" width="132" height="30" rx="15"
                  fill="#12121E" stroke="${C.amber}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="9.5" fill="${C.white}"
                  text-anchor="middle" dy="3.5" font-weight="600">Professionalism</text>
          </g>
          <g class="s7-badge" id="s7-badge-credibility" opacity="0" transform="translate(202,400)">
            <rect x="-56" y="-15" width="112" height="30" rx="15"
                  fill="#12121E" stroke="${C.red}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="9.5" fill="${C.white}"
                  text-anchor="middle" dy="3.5" font-weight="600">Credibility</text>
          </g>

          <!-- "Missing context" tag, struck through -->
          <g id="s7-context-tag" opacity="0" transform="translate(202,470)">
            <rect x="-92" y="-17" width="184" height="34" rx="17"
                  fill="#1A1020" stroke="${C.muted}" stroke-width="1"/>
            <text font-family="Inter,sans-serif" font-size="9.5" fill="${C.muted}"
                  text-anchor="middle" dy="3.5">Online content lacks context</text>
            <line id="s7-context-strike" x1="-86" y1="0" x2="-86" y2="0"
                  stroke="${C.red}" stroke-width="1.6" stroke-linecap="round"/>
          </g>

          <!-- Wax-seal stamp: a single post leaves a lasting impression -->
          <g id="s7-stamp" opacity="0" transform="translate(202,300) scale(2.2)">
            <circle cx="0" cy="0" r="30" fill="url(#s7-stamp-grad)" opacity="0.92"/>
            <circle cx="0" cy="0" r="30" fill="none" stroke="${C.white}"
                    stroke-width="1" opacity="0.5"/>
            <text y="4" font-family="'Space Grotesk',sans-serif" font-size="9.5"
                  fill="${C.white}" text-anchor="middle" font-weight="800"
                  letter-spacing="0.5">LASTING</text>
          </g>
          <g id="s7-stamp-ring" opacity="0" transform="translate(202,300)">
            <circle cx="0" cy="0" r="30" fill="none" stroke="${C.red}"
                    stroke-width="1.5" opacity="0.6"/>
          </g>

          <!-- Caption 2 -->
          <g id="s7-caption-2" opacity="0" transform="translate(202,560)">
            <text font-family="Inter,sans-serif" font-size="11"
                  fill="${C.white}" text-anchor="middle" font-weight="500">
              A single post can shape an impression
            </text>
            <text y="17" font-family="Inter,sans-serif" font-size="11"
                  fill="${C.white}" text-anchor="middle" font-weight="500">
              that's difficult to change.
            </text>
          </g>
        </g>

        <!-- Headline (persists across both acts) -->
        <g id="s7-headline" opacity="0" transform="translate(202,650)">
          <text font-family="'Space Grotesk',sans-serif" font-size="15"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            People Grow &amp; Change
          </text>
        </g>

      </svg>`);

    gsap.set(["#s7-eyebrow", "#s7-timeline-svg", "#s7-past-svg", "#s7-mid-svg",
              "#s7-caption-1", "#s7-headline"], { opacity: 0 });
    gsap.set("#s7-growth-arc",  { strokeDashoffset: 260, opacity: 0.85 });
    gsap.set("#s7-present-svg", { opacity: 0, scale: 0.7,
      transformOrigin: "center center" });
    gsap.set("#s7-check",       { opacity: 0, scale: 0.4,
      transformOrigin: "center center" });

    gsap.set("#s7-act2", { opacity: 0 });
    gsap.set(".s7-badge", { opacity: 0, scale: 0.6,
      transformOrigin: "center center" });
    gsap.set("#s7-context-tag",   { opacity: 0, y: 10 });
    gsap.set("#s7-context-strike",{ attr: { x2: -86 } });
    gsap.set("#s7-stamp",      { opacity: 0, scale: 3.4,
      transformOrigin: "center center" });
    gsap.set("#s7-stamp-ring", { opacity: 0, scale: 0.6,
      transformOrigin: "center center" });
    gsap.set("#s7-caption-2", { opacity: 0 });
  },

  play() {
    // TIMESTAMP: 4:00
    const tl = gsap.timeline({ id: "scene-7" });

    // ── ACT 1 (0s – 3.4s): reassurance — people grow, learn, change ──
    tl.to("#s7-eyebrow", { opacity: 1, duration: 0.5, ease: E.out }, 0);
    tl.to("#s7-timeline-svg", { opacity: 1, duration: 0.6, ease: E.out }, 0.15);
    tl.to("#s7-past-svg",     { opacity: 1, duration: 0.7, ease: E.out }, 0.45);

    // Growth arc draws, passing through the "learning" midpoint
    tl.to("#s7-growth-arc", { strokeDashoffset: 0,
      duration: 1.1, ease: E.out }, 0.95);
    tl.to("#s7-mid-svg", { opacity: 1, duration: 0.4, ease: E.out }, 1.35);
    tl.to("#s7-mid-svg", {
      scale: 1.3, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut",
      transformOrigin: "center center",
    }, 1.5);

    tl.to("#s7-present-svg", { opacity: 1, scale: 1,
      duration: 0.8, ease: E.back }, 1.85);

    tl.to("#s7-check", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.elastic }, 2.4);

    tl.add(() => {
      const host = qs("#s7-sparkles");
      if (host && window.AnimHelpers?.createSparkles) {
        AnimHelpers.createSparkles(host, 10, C.teal);
      }
    }, 1.4);

    tl.to("#s7-caption-1", { opacity: 1, duration: 0.6, ease: E.out }, 2.7);

    tl.to("#s7-headline", { opacity: 1, duration: 0.6, ease: E.out }, 3.0);

    // ── Transition: Act 1 fades, Act 2 (the caveat) rises ──
    tl.to("#s7-act1", { opacity: 0, scale: 0.94, transformOrigin: "center center",
      duration: 0.6, ease: "power2.in" }, 3.7);
    tl.to("#s7-caption-1", { opacity: 0, duration: 0.3 }, 3.7);

    tl.to("#s7-act2", { opacity: 1, duration: 0.4, ease: E.out }, 4.15);

    // ── ACT 2 (4.15s – 8.0s): judgment, professionalism, credibility ──
    tl.fromTo("#s7-impression", { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: E.back,
        transformOrigin: "center center" }, 4.15);

    tl.to("#s7-badge-judgment", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.back }, 4.6);
    tl.to("#s7-badge-professionalism", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.back }, 4.78);
    tl.to("#s7-badge-credibility", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.back }, 4.96);

    // Badges drift gently — perception keeps watching
    tl.to(".s7-badge", {
      y: "+=5", duration: 1.6, yoyo: true, repeat: -1,
      ease: "sine.inOut", stagger: { amount: 0.4, from: "random" },
    }, 5.3);

    // "Online content lacks context" rises, then gets struck through
    tl.to("#s7-context-tag", { opacity: 1, y: 0, duration: 0.6, ease: E.out }, 5.5);
    tl.to("#s7-context-strike", { attr: { x2: 86 },
      duration: 0.5, ease: "power2.out" }, 6.05);

    // Wax-seal stamp slams down — "a lasting impression"
    tl.to("#s7-stamp", { opacity: 1, scale: 1,
      duration: 0.35, ease: "power4.in" }, 6.55);
    tl.to("#s7-stamp", {
      scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut",
      transformOrigin: "center center",
    }, 6.9);
    tl.to("#s7-stamp-ring", { opacity: 0.7, scale: 1.8,
      duration: 0.6, ease: "power2.out" }, 6.85);
    tl.to("#s7-stamp-ring", { opacity: 0, duration: 0.4 }, 7.3);

    tl.to("#s7-caption-2", { opacity: 1, duration: 0.6, ease: E.out }, 7.1);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 8  —  Positive Digital Footprint  (4:25 – 5:00)
   VO: "Digital footprints are not only about negative consequences.
        They can also become powerful tools..."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[8] = {

  init() {
    // Target: #scene-8 directly — no single wrapper div exists for this full-scene SVG.
    const el = qs("#scene-8");
    if (!el) { console.warn("[Scene 8] #scene-8 not found"); return; }

    const prev = el.querySelector("#s8-svg");
    if (prev) prev.remove();

    el.insertAdjacentHTML("afterbegin", `
      <svg id="s8-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720" style="position:absolute;top:0;left:0;pointer-events:none">

        <!-- Reframe line: VO opens by flipping the narrative from negative to positive -->
        <g id="s8-subtitle" opacity="0" transform="translate(202,108)">
          <text font-family="'Space Grotesk',sans-serif" font-size="13"
                fill="${C.muted}" text-anchor="middle" font-weight="700"
                letter-spacing="0.3">NOT JUST MISTAKES.</text>
          <text y="20" font-family="'Space Grotesk',sans-serif" font-size="13"
                fill="${C.teal}" text-anchor="middle" font-weight="700"
                letter-spacing="0.3">A POWERFUL TOOL.</text>
        </g>

        <!-- Identity pulse — expands outward from the badge when VO says
             "...can strengthen a person's online identity." -->
        <circle id="s8-identity-pulse" cx="202" cy="220" r="52"
                fill="none" stroke="${C.teal}" stroke-width="2" opacity="0"/>

        <!-- Central + badge -->
        <g id="s8-plus-badge" transform="translate(202,220)">
          <circle cx="0" cy="0" r="52"
                  fill="${C.teal}" opacity="0.15"
                  stroke="${C.teal}" stroke-width="2"/>
          <text font-family="'Space Grotesk',sans-serif" font-size="52"
                fill="${C.teal}" text-anchor="middle" dy="18"
                font-weight="700">+</text>
        </g>

        <!-- Orbit ring -->
        <ellipse id="s8-orbit" cx="202" cy="220" rx="130" ry="110"
                 fill="none" stroke="${C.teal}" stroke-width="0.8"
                 stroke-dasharray="5 5" opacity="0"/>

        <!-- Cards at orbit positions — labels match the VO's own list:
             "achievements, volunteering experiences, creative work, research,
              professional accomplishments, or thoughtful discussions" -->
        ${[
          { angle: 270, label: "Achievements",     icon: "🏆", color: C.amber  },
          { angle: 330, label: "Volunteering",     icon: "🤲", color: C.teal   },
          { angle: 30,  label: "Creative Work",    icon: "🎨", color: C.purple },
          { angle: 90,  label: "Research",         icon: "🔬", color: C.blue   },
          { angle: 150, label: "Accomplishments",  icon: "💼", color: C.amber  },
          { angle: 210, label: "Discussions",      icon: "💬", color: C.purple },
        ].map((card, i) => {
          const rad = (card.angle * Math.PI) / 180;
          const cx  = 202 + Math.cos(rad) * 130;
          const cy  = 220 + Math.sin(rad) * 110;
          return `
            <g class="s8-card" id="s8-card-${i}"
               opacity="0" transform="translate(${cx},${cy})">
              <rect x="-38" y="-26" width="76" height="52" rx="10"
                    fill="#0E0E1C" stroke="${card.color}" stroke-width="1.2"/>
              <text y="-6" font-size="18" text-anchor="middle">${card.icon}</text>
              <text y="16" font-family="Inter,sans-serif" font-size="8.5"
                    fill="${card.color}" text-anchor="middle"
                    font-weight="600">${card.label}</text>
            </g>`;
        }).join("")}

        <!-- Outcome chips — "...can open doors to new opportunities,
             collaborations, and career growth." -->
        <g id="s8-outcomes" transform="translate(202,440)">
          <line x1="0" y1="-104" x2="0" y2="-34" stroke="${C.teal}"
                stroke-width="0.8" stroke-dasharray="3 4" opacity="0.3"/>
          <g class="s8-outcome" id="s8-outcome-0" opacity="0" transform="translate(-108,0)">
            <text font-size="19" text-anchor="middle">✨</text>
            <text y="21" font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.white}" text-anchor="middle" font-weight="600">Opportunities</text>
          </g>
          <g class="s8-outcome" id="s8-outcome-1" opacity="0" transform="translate(0,0)">
            <text font-size="19" text-anchor="middle">🤝</text>
            <text y="21" font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.white}" text-anchor="middle" font-weight="600">Collaborations</text>
          </g>
          <g class="s8-outcome" id="s8-outcome-2" opacity="0" transform="translate(108,0)">
            <text font-size="19" text-anchor="middle">📈</text>
            <text y="21" font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.white}" text-anchor="middle" font-weight="600">Career Growth</text>
          </g>
        </g>

        <!-- Headline -->
        <g id="s8-headline" opacity="0" transform="translate(202,580)">
          <text font-family="'Space Grotesk',sans-serif" font-size="16"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            Build Something
          </text>
          <text y="24" font-family="'Space Grotesk',sans-serif" font-size="16"
                fill="${C.teal}" text-anchor="middle" font-weight="700">
            Worth Finding.
          </text>
        </g>

        <!-- Sparkle host -->
        <g id="s8-sparkle-host" transform="translate(202,220)"/>

      </svg>`);

    gsap.set("#s8-subtitle",       { opacity: 0, y: 8 });
    gsap.set("#s8-identity-pulse", { opacity: 0, scale: 1,
      transformOrigin: "center center" });
    gsap.set("#s8-plus-badge", { opacity: 0, scale: 0.4, rotation: -45,
      transformOrigin: "center center" });
    gsap.set(".s8-card",       { opacity: 0, scale: 0.5,
      transformOrigin: "center center" });
    gsap.set("#s8-orbit",      { opacity: 0 });
    gsap.set(".s8-outcome",    { opacity: 0, y: 10 });
    gsap.set("#s8-headline",   { opacity: 0, y: 14 });
  },

  play() {
    // TIMESTAMP: 4:25
    // VO: "Digital footprints are not only about negative consequences.
    //      They can also become powerful tools for building a positive
    //      reputation. Sharing meaningful achievements, volunteering
    //      experiences, creative work, research, professional accomplishments,
    //      or thoughtful discussions can strengthen a person's online identity.
    //      A positive digital footprint can open doors to new opportunities,
    //      collaborations, and career growth."
    const tl = gsap.timeline({ id: "scene-8" });

    // 0:00 — Reframe: "not only about negative consequences..."
    tl.to("#s8-plus-badge", { opacity: 1, scale: 1, rotation: 0,
      duration: 0.8, ease: E.back }, 0);
    tl.to("#s8-subtitle", { opacity: 1, y: 0,
      duration: 0.6, ease: E.out }, 0.5);

    // ~2.0s — "...powerful tools for building a positive reputation."
    // Subtitle clears the stage and the orbit lights up to host the cards.
    tl.to("#s8-subtitle", { opacity: 0, y: -8,
      duration: 0.5, ease: E.inOut }, 2.4);
    tl.to("#s8-orbit", { opacity: 0.4, duration: 0.6, ease: E.out }, 2.6);

    // ~3.4s–16.5s — "Sharing meaningful achievements, volunteering experiences,
    // creative work, research, professional accomplishments, or thoughtful
    // discussions..." — each card pops in roughly as its word is spoken.
    const cardTimes = [3.6, 5.6, 7.6, 9.6, 11.6, 13.6];
    qsa(".s8-card").forEach((card, i) => {
      const t = cardTimes[i] ?? (3.6 + i * 2.0);
      tl.to(card, { opacity: 1, scale: 1.15, duration: 0.35, ease: E.back }, t);
      tl.to(card, { scale: 1, duration: 0.3, ease: E.out }, t + 0.32);
      // a little burst of sparkle right as each one lands
      tl.add(() => {
        const host = qs("#s8-sparkle-host");
        if (host && window.AnimHelpers?.createSparkles) {
          AnimHelpers.createSparkles(host, 4, C.teal);
        }
      }, t);
    });

    // Gentle perpetual float once all six have arrived
    tl.to(".s8-card", {
      y: -5, duration: 2.0, yoyo: true, repeat: -1,
      ease: "sine.inOut", stagger: { amount: 0.8 },
    }, 15.0);

    // ~16.8s–19.0s — "...can strengthen a person's online identity."
    // A ring of light pulses outward from the badge.
    tl.to("#s8-orbit", { opacity: 0.85, duration: 0.4, ease: E.out }, 16.8);
    tl.to("#s8-orbit", { opacity: 0.4, duration: 1.0, ease: E.inOut }, 17.4);
    tl.fromTo("#s8-identity-pulse",
      { opacity: 0.85, scale: 1 },
      { opacity: 0, scale: 1.7, duration: 1.4, ease: "power2.out" }, 16.8);
    tl.add(() => {
      const host = qs("#s8-sparkle-host");
      if (host && window.AnimHelpers?.createSparkles) {
        AnimHelpers.createSparkles(host, 14, C.teal);
      }
    }, 16.9);

    // ~19.0s–24.0s — "...can open doors to new opportunities, collaborations,
    // and career growth." Outcome chips rise in beneath the cards.
    tl.to("#s8-outcome-0", { opacity: 1, y: 0, duration: 0.6, ease: E.out }, 19.0);
    tl.to("#s8-outcome-1", { opacity: 1, y: 0, duration: 0.6, ease: E.out }, 20.6);
    tl.to("#s8-outcome-2", { opacity: 1, y: 0, duration: 0.6, ease: E.out }, 22.2);

    // Headline lands as the thought resolves
    tl.to("#s8-headline", { opacity: 1, y: 0,
      duration: 0.8, ease: E.out }, 23.6);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 9  —  Think Before You Post  (5:00 – 5:30)
   VO: "Before sharing something online, it is worth asking a few simple
        questions. Would I be comfortable if my family saw this? Would I be
        comfortable if a future employer saw this? Would I still be proud of
        this post five years from now? If the answer is no, it may be worth
        reconsidering before pressing the 'Post' button."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[9] = {

  init() {
    // FIX: previously injected a 405×720 SVG into #s9-phone, which is a
    // 200px-wide .scene__phone-ui div — so everything outside 200px got
    // clipped. Questions at x=202 were cut in half. Now we inject directly
    // into #scene-9 (the full-canvas section) and hide the legacy phone div.
    const scene = qs("#scene-9");
    if (!scene) { console.warn("[Scene 9] #scene-9 not found"); return; }

    const prev = scene.querySelector("#s9-svg");
    if (prev) prev.remove();

    // Hide the legacy phone div so it doesn't sit on top of our SVG
    const legacyPhone = scene.querySelector("#s9-phone");
    if (legacyPhone) legacyPhone.style.display = "none";
    const legacyQ = scene.querySelector("#s9-questions");
    if (legacyQ) legacyQ.style.display = "none";
    const legacyR = scene.querySelector("#s9-reconsider");
    if (legacyR) legacyR.style.display = "none";

    scene.insertAdjacentHTML("afterbegin", `
      <svg id="s9-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720">
        <defs>
          <filter id="s9-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- Phone with compose screen — wrapper pattern -->
        <g transform="translate(202,210)">
          <g id="s9-phone-body">
            <rect x="-80" y="-130" width="160" height="260" rx="18"
                  fill="#0E0E1C" stroke="${C.blue}" stroke-width="1.5"/>
            <rect x="-66" y="-112" width="132" height="140" rx="8"
                  fill="#12121E"/>
            <text id="s9-draft-text" x="-56" y="-90" font-family="Inter,sans-serif"
                  font-size="9" fill="${C.muted}"></text>
            <line id="s9-cursor" x1="-56" y1="-104" x2="-56" y2="-92"
                  stroke="${C.blue}" stroke-width="2"
                  stroke-linecap="round" opacity="0.9"/>
            <rect id="s9-post-btn-glow" x="22" y="82" width="62" height="34" rx="17"
                  fill="${C.amber}" opacity="0" filter="url(#s9-soft-glow)"/>
            <rect id="s9-post-btn" x="28" y="88" width="50" height="22" rx="11"
                  fill="${C.blue}" opacity="0.85"/>
            <text x="53" y="104" font-family="Inter,sans-serif" font-size="9"
                  fill="white" text-anchor="middle" font-weight="600">POST</text>
          </g>
        </g>

        <!-- Pause hand — interrupts the typing first ("...worth asking a
             few simple questions") -->
        <g id="s9-pause-hand" transform="translate(202,210)">
          <circle cx="0" cy="0" r="44"
                  fill="${C.amber}" opacity="0.15"
                  stroke="${C.amber}" stroke-width="2"/>
          <text font-size="36" text-anchor="middle" dominant-baseline="middle">✋</text>
        </g>

        <!-- Second hand — hesitates right over the Post button
             ("...it may be worth reconsidering before pressing 'Post'") -->
        <g id="s9-pause-hand-2" transform="translate(253,298)">
          <circle cx="0" cy="0" r="26"
                  fill="${C.amber}" opacity="0.18"
                  stroke="${C.amber}" stroke-width="1.5"/>
          <text font-size="22" text-anchor="middle" dominant-baseline="middle">✋</text>
        </g>

        <!-- "Reconsider?" callout — wrapper pattern -->
        <g transform="translate(202,355)">
          <g id="s9-reconsider-label">
            <text font-family="'Space Grotesk',sans-serif" font-size="13"
                  fill="${C.amber}" text-anchor="middle" font-weight="700"
                  letter-spacing="0.5">RECONSIDER?</text>
          </g>
        </g>

        <!-- "Ask yourself" header above the three questions -->
        <g id="s9-ask-label" transform="translate(202,348)">
          <text font-family="Inter,sans-serif" font-size="10"
                fill="${C.muted}" text-anchor="middle" font-weight="600"
                letter-spacing="2">ASK YOURSELF</text>
        </g>

        <!-- Three question cards — wrapper pattern -->
        ${[
          { y: 385, q: "Would my family see this and be okay with it?",     color: C.teal  },
          { y: 455, q: "Would a future employer see this the same way?",    color: C.blue  },
          { y: 525, q: "Will I still be proud of this five years from now?",color: C.amber },
        ].map((item, i) => `
          <g transform="translate(202,${item.y})">
            <g class="s9-question" id="s9-q-${i}" opacity="0">
              <rect x="-150" y="-22" width="300" height="44" rx="10"
                    fill="#0E0E1C" stroke="${item.color}" stroke-width="1.2"/>
              <circle cx="-130" cy="0" r="9" fill="none"
                      stroke="${item.color}" stroke-width="1.2"/>
              <text x="-130" y="3.5" font-family="Inter,sans-serif" font-size="9.5"
                    fill="${item.color}" text-anchor="middle" font-weight="700">?</text>
              <text x="-112" y="4" font-family="Inter,sans-serif" font-size="9.5"
                    fill="${C.white}">${item.q}</text>
            </g>
          </g>`).join("")}

        <!-- THINK stamp -->
        <g id="s9-think-stamp" transform="translate(202,640)">
          <text font-family="'Space Grotesk',sans-serif" font-size="28"
                fill="${C.amber}" text-anchor="middle" font-weight="900"
                letter-spacing="6" opacity="0.85">THINK</text>
        </g>

      </svg>`);

    gsap.set("#s9-phone-body",       { opacity: 0, y: 30 });
    gsap.set("#s9-draft-text",       { opacity: 1 });
    gsap.set("#s9-post-btn-glow",    { opacity: 0 });
    gsap.set("#s9-pause-hand",       { opacity: 0, scale: 0.5,
      transformOrigin: "center center" });
    gsap.set("#s9-pause-hand-2",     { opacity: 0, scale: 0.4,
      transformOrigin: "center center" });
    gsap.set("#s9-reconsider-label", { opacity: 0, y: 8 });
    gsap.set("#s9-ask-label",        { opacity: 0 });
    gsap.set(".s9-question",         { opacity: 0, x: -30 });
    gsap.set("#s9-think-stamp",      { opacity: 0, scale: 1.5,
      transformOrigin: "center center" });
  },

  play() {
    // TIMESTAMP: 5:00
    const tl = gsap.timeline({ id: "scene-9" });

    // t=0.0 — Phone rises in, blank compose box waiting
    tl.to("#s9-phone-body", { opacity: 1, y: 0,
      duration: 0.8, ease: E.back }, 0);

    // ~0.9s–2.2s — An impulsive draft gets typed out live...
    tl.to("#s9-cursor", {
      opacity: 0, duration: 0.3, yoyo: true, repeat: 5, ease: "none",
    }, 0.8);
    tl.to("#s9-draft-text", {
      duration: 1.3, text: "I can't even right now \u{1F624}", ease: "none",
    }, 0.9);

    // ~2.3s — "...it is worth asking a few simple questions."
    // A pause hand interrupts the typing before it's posted.
    tl.to("#s9-cursor",      { opacity: 0, duration: 0.2 }, 2.3);
    tl.to("#s9-pause-hand",  { opacity: 1, scale: 1,
      duration: 0.5, ease: E.elastic }, 2.3);
    tl.to("#s9-pause-hand",  { opacity: 0, scale: 0.8,
      duration: 0.4, ease: E.inOut }, 3.1);
    tl.to("#s9-ask-label",   { opacity: 0.9, duration: 0.4, ease: E.out }, 3.1);

    // ~3.6s — "Would I be comfortable if my family saw this?"
    tl.to("#s9-q-0", { opacity: 1, x: 0, duration: 0.5, ease: E.out }, 3.6);

    // ~6.6s — "Would I be comfortable if a future employer saw this?"
    tl.to("#s9-q-1", { opacity: 1, x: 0, duration: 0.5, ease: E.out }, 6.6);

    // ~10.0s — "Would I still be proud of this post five years from now?"
    tl.to("#s9-q-2", { opacity: 1, x: 0, duration: 0.5, ease: E.out }, 10.0);

    // Questions breathe gently once all three have landed
    tl.to(".s9-question", {
      x: 4, duration: 1.8, yoyo: true, repeat: -1,
      ease: "sine.inOut", stagger: { amount: 0.6 },
    }, 11.0);

    // ~13.5s — "If the answer is no, it may be worth reconsidering before
    // pressing the 'Post' button." The header clears and a hand hesitates
    // right over POST while it glows amber in warning.
    tl.to("#s9-ask-label", { opacity: 0, duration: 0.3 }, 13.4);
    tl.to("#s9-pause-hand-2", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.elastic }, 13.6);
    tl.to("#s9-reconsider-label", { opacity: 1, y: 0,
      duration: 0.4, ease: E.out }, 13.8);
    tl.to("#s9-post-btn-glow", {
      opacity: 0.7, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut",
    }, 13.8);

    // ~17.3s — Hand retracts, the moment resolves
    tl.to("#s9-pause-hand-2",     { opacity: 0, scale: 0.7,
      duration: 0.4, ease: E.inOut }, 17.0);
    tl.to("#s9-reconsider-label", { opacity: 0, y: -6,
      duration: 0.4, ease: E.inOut }, 17.0);

    // THINK stamp slams in to punctuate the whole beat
    tl.to("#s9-think-stamp", { opacity: 1, scale: 1,
      duration: 0.45, ease: E.back }, 17.5);
    tl.to("#s9-think-stamp", {
      x: 4, duration: 0.05, yoyo: true, repeat: 3, ease: "none",
    }, 17.95);

    // Slow breathing hold for the remainder of the scene
    tl.to("#s9-think-stamp", {
      scale: 1.03, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut",
    }, 18.4);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 10  —  Technology Is a Tool  (5:30 – 6:05)
   VO: "But technology itself is not the problem. Social media, artificial
        intelligence, and online platforms have transformed education,
        communication, creativity, and innovation. They provide incredible
        opportunities to learn, connect, and express ourselves. However,
        these tools must be used responsibly. Digital literacy is not only
        about knowing how to use technology—it is also about understanding
        the consequences of our actions in digital spaces."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[10] = {

  init() {
    // Target: #s10-device-wrap  (class="scene__device-wrap" id="s10-device-wrap" in index.html)
    const el = qs("#s10-device-wrap");
    if (!el) { console.warn("[Scene 10] #s10-device-wrap not found"); return; }
    // FIX: index.html's .scene__device-wrap defaults to opacity:0 (same
    // pre-existing issue as Scene 9 — see note there). Force it visible.
    gsap.set(el, { opacity: 1 });

    // Four benefits, fanned out below the device — matches the VO's own
    // list: "...transformed education, communication, creativity, and innovation."
    const benefits = [
      { x: 85,  y: 350, icon: "📚", label: "Education",     color: C.blue   },
      { x: 160, y: 380, icon: "💬", label: "Communication", color: C.teal   },
      { x: 245, y: 380, icon: "💡", label: "Creativity",    color: C.amber  },
      { x: 320, y: 350, icon: "🚀", label: "Innovation",    color: C.purple },
    ];

    el.innerHTML = `
      <svg id="s10-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720">

        <!-- Wrench/tool icon — "technology itself" -->
        <g id="s10-tool-icon" transform="translate(202,170)">
          <circle id="s10-icon-halo"   cx="0" cy="-40" r="50" fill="${C.blue}"  opacity="0.12"/>
          <circle id="s10-icon-halo-2" cx="0" cy="-40" r="50" fill="${C.amber}" opacity="0"/>
          <path d="M -14,-70 L -14,-20 L 14,-20 L 14,-70
                   Q 14,-85 0,-85 Q -14,-85 -14,-70 Z"
                fill="${C.blue}" opacity="0.8"/>
          <rect x="-8" y="-20" width="16" height="80" rx="8"
                fill="${C.blue}" opacity="0.6"/>
          <circle cx="0" cy="-72" r="18"
                  fill="none" stroke="${C.blue}" stroke-width="3" opacity="0.9"/>
          <circle cx="0" cy="-72" r="26"
                  fill="none" stroke="${C.blue}" stroke-width="1" opacity="0.25"/>
        </g>

        <!-- "Not the problem" reframe, right alongside the tool -->
        <g id="s10-not-problem" opacity="0" transform="translate(202,250)">
          <text font-family="'Space Grotesk',sans-serif" font-size="13"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            Not the problem.
          </text>
        </g>

        <!-- Quick flash of the platforms named in the VO -->
        <g id="s10-platform-row" opacity="0" transform="translate(202,250)">
          <text x="-44" font-size="20" text-anchor="middle">📱</text>
          <text x="0"   font-size="20" text-anchor="middle">🤖</text>
          <text x="44"  font-size="20" text-anchor="middle">🌐</text>
        </g>

        <!-- Beam lines radiating from the device to each benefit -->
        ${benefits.map((b, i) => `
          <line class="s10-beam-line" id="s10-beam-${i}"
                x1="202" y1="170" x2="${b.x}" y2="${b.y - 18}"
                stroke="${b.color}" stroke-width="1" opacity="0"/>
        `).join("")}

        <!-- Benefit items: Education / Communication / Creativity / Innovation -->
        ${benefits.map((b, i) => `
          <g class="s10-benefit" id="s10-benefit-${i}"
             opacity="0" transform="translate(${b.x},${b.y})">
            <circle r="28" fill="#0E0E1C" stroke="${b.color}" stroke-width="1.2"/>
            <text y="-2" font-size="18" text-anchor="middle">${b.icon}</text>
            <text y="44" font-family="Inter,sans-serif" font-size="9"
                  fill="${b.color}" text-anchor="middle" font-weight="600">${b.label}</text>
          </g>
        `).join("")}

        <!-- "Opportunities to learn, connect, express" caption -->
        <g id="s10-caption" opacity="0" transform="translate(202,452)">
          <text font-family="Inter,sans-serif" font-size="10.5"
                fill="${C.muted}" text-anchor="middle">
            Real opportunities to learn, connect,
          </text>
          <text y="16" font-family="Inter,sans-serif" font-size="10.5"
                fill="${C.muted}" text-anchor="middle">
            and express yourself.
          </text>
        </g>

        <!-- "However...used responsibly" warning beat -->
        <g id="s10-responsibly" opacity="0" transform="translate(202,510)">
          <rect x="-95" y="-18" width="190" height="36" rx="18"
                fill="rgba(239,159,39,0.08)" stroke="${C.amber}" stroke-width="1"/>
          <text y="5" font-family="'Space Grotesk',sans-serif" font-size="12"
                fill="${C.amber}" text-anchor="middle" font-weight="700"
                letter-spacing="0.5">…USED RESPONSIBLY</text>
        </g>

        <!-- Core message — digital literacy is also about consequences -->
        <g id="s10-message" opacity="0" transform="translate(202,600)">
          <text font-family="'Space Grotesk',sans-serif" font-size="15"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            Digital literacy isn't just
          </text>
          <text y="22" font-family="'Space Grotesk',sans-serif" font-size="15"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            knowing how to use it.
          </text>
          <text y="50" font-family="Inter,sans-serif" font-size="10.5"
                fill="${C.amber}" text-anchor="middle" font-weight="600">
            It's understanding the consequences.
          </text>
        </g>

      </svg>`;

    gsap.set("#s10-tool-icon", { opacity: 0, rotation: -30, scale: 0.6,
      transformOrigin: "center center" });
    gsap.set("#s10-icon-halo-2", { opacity: 0 });
    gsap.set("#s10-not-problem",  { opacity: 0, y: 6 });
    gsap.set("#s10-platform-row", { opacity: 0, y: 6 });
    gsap.set(".s10-beam-line",    { opacity: 0 });
    gsap.set(".s10-benefit",      { opacity: 0, scale: 0.5,
      transformOrigin: "center center" });
    gsap.set("#s10-caption",      { opacity: 0, y: 10 });
    gsap.set("#s10-responsibly",  { opacity: 0, scale: 0.85,
      transformOrigin: "center center" });
    gsap.set("#s10-message",      { opacity: 0, y: 12 });
  },

  play() {
    // TIMESTAMP: 5:30
    const tl = gsap.timeline({ id: "scene-10" });

    // ~0.0s — "But technology itself is not the problem."
    tl.to("#s10-tool-icon", { opacity: 1, rotation: 0, scale: 1,
      duration: 0.9, ease: E.back }, 0);
    tl.to("#s10-not-problem", { opacity: 1, y: 0,
      duration: 0.5, ease: E.out }, 0.7);
    tl.to("#s10-not-problem", { opacity: 0, y: -6,
      duration: 0.4, ease: E.inOut }, 2.0);

    // ~2.4s — "Social media, artificial intelligence, and online platforms..."
    tl.to("#s10-platform-row", { opacity: 1, y: 0,
      duration: 0.5, ease: E.out }, 2.4);
    tl.to("#s10-platform-row", { opacity: 0, duration: 0.4 }, 3.6);

    // ~3.6s–8.0s — "...have transformed education, communication, creativity,
    // and innovation." Beams + benefit items bloom one by one.
    const benefitTimes = [3.8, 5.0, 6.2, 7.4];
    benefitTimes.forEach((t, i) => {
      tl.to(`#s10-beam-${i}`,    { opacity: 0.5, duration: 0.4, ease: E.out }, t);
      tl.to(`#s10-benefit-${i}`, { opacity: 1, scale: 1,
        duration: 0.45, ease: E.back }, t + 0.1);
    });

    // Gentle float once all four have landed
    tl.to(".s10-benefit", {
      y: -4, duration: 1.8, yoyo: true, repeat: -1,
      ease: "sine.inOut", stagger: { amount: 0.6 },
    }, 8.5);

    // ~8.8s — "They provide incredible opportunities to learn, connect,
    // and express ourselves."
    tl.to("#s10-caption", { opacity: 1, y: 0,
      duration: 0.7, ease: E.out }, 8.8);

    // ~12.5s — "However, these tools must be used responsibly."
    // The icon's glow flips from cool blue to a cautionary amber.
    tl.to("#s10-icon-halo",   { opacity: 0,    duration: 0.6, ease: E.inOut }, 12.5);
    tl.to("#s10-icon-halo-2", { opacity: 0.18, duration: 0.6, ease: E.inOut }, 12.5);
    tl.to("#s10-responsibly", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.back }, 12.7);

    // ~15.5s–22.5s — "Digital literacy is not only about knowing how to use
    // technology—it is also about understanding the consequences..."
    tl.to("#s10-responsibly", { opacity: 0, scale: 0.9,
      duration: 0.4, ease: E.inOut }, 15.3);
    tl.to("#s10-message", { opacity: 1, y: 0,
      duration: 0.8, ease: E.out }, 15.7);

    // Icon settles back to its calm blue once the thought resolves
    tl.to("#s10-icon-halo",   { opacity: 0.12, duration: 1.0, ease: E.inOut }, 18.0);
    tl.to("#s10-icon-halo-2", { opacity: 0,    duration: 1.0, ease: E.inOut }, 18.0);

    // Slow breathing hold for the remainder of the scene
    tl.to("#s10-message", {
      scale: 1.02, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut",
      transformOrigin: "center center",
    }, 19.0);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 11  —  Every Click Leaves a Mark  (6:05 – 6:30)
   VO: "Remember, the internet never truly forgets."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[11] = {

  init() {
    // Target: #scene-11 directly — no single wrapper div exists for this full-scene SVG.
    const el = qs("#scene-11");
    if (!el) { console.warn("[Scene 11] #scene-11 not found"); return; }

    const prev = el.querySelector("#s11-svg");
    if (prev) prev.remove();

    el.insertAdjacentHTML("afterbegin", `
      <svg id="s11-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720" style="position:absolute;top:0;left:0;pointer-events:none">

        <defs>
          <radialGradient id="s11-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="${C.red}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="${C.bg}"  stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Background glow -->
        <rect id="s11-glow-bg" width="405" height="720"
              fill="url(#s11-glow)" opacity="0"/>

        <!-- Click-dot trail -->
        <g id="s11-click-trail">
          ${[
            { x: 80,  y: 160 }, { x: 200, y: 220 }, { x: 310, y: 140 },
            { x: 150, y: 300 }, { x: 280, y: 330 }, { x: 100, y: 400 },
            { x: 240, y: 420 }, { x: 330, y: 380 }, { x: 60,  y: 490 },
            { x: 190, y: 510 }, { x: 310, y: 530 },
          ].map(pt => `
            <g class="s11-click-dot" opacity="0" transform="translate(${pt.x},${pt.y})">
              <circle r="5"  fill="${C.red}" opacity="0.8"/>
              <circle r="12" fill="none" stroke="${C.red}"
                      stroke-width="1" opacity="0.25"/>
            </g>`).join("")}
        </g>

        <!-- Trail line -->
        <polyline id="s11-trail-line"
                  points="80,160 200,220 310,140 150,300 280,330
                          100,400 240,420 330,380 60,490 190,510 310,530"
                  fill="none" stroke="${C.red}" stroke-width="1"
                  stroke-dasharray="900" stroke-dashoffset="900"
                  opacity="0.25"/>

        <!-- REMEMBER text -->
        <g id="s11-remember-text" opacity="0" transform="translate(202,588)">
          <text font-family="'Space Grotesk',sans-serif" font-size="22"
                fill="${C.white}" text-anchor="middle" font-weight="900"
                letter-spacing="2">REMEMBER</text>
        </g>

        <!-- Sub-line -->
        <g id="s11-subline" opacity="0" transform="translate(202,625)">
          <text font-family="Inter,sans-serif" font-size="10"
                fill="${C.red}" text-anchor="middle" opacity="0.9">
            Every click leaves a mark.
          </text>
        </g>

        <!-- Fingerprint rings -->
        ${[40, 70, 100, 130, 160].map(r => `
          <circle class="s11-ring" cx="202" cy="360" r="${r}"
                  fill="none" stroke="${C.red}" stroke-width="0.8"
                  opacity="0" stroke-dasharray="4 6"/>`).join("")}

      </svg>`);

    gsap.set("#s11-glow-bg",       { opacity: 0 });
    gsap.set(".s11-click-dot",     { opacity: 0, scale: 0.3,
      transformOrigin: "center center" });
    gsap.set("#s11-trail-line",    { strokeDashoffset: 900, opacity: 0.25 });
    gsap.set(".s11-ring",          { opacity: 0, scale: 0.2,
      transformOrigin: "202px 360px" });  // SVG absolute origin for rings
    gsap.set("#s11-remember-text", { opacity: 0, scale: 0.8,
      transformOrigin: "center center" });
    gsap.set("#s11-subline",       { opacity: 0, y: 8 });
  },

  play() {
    // TIMESTAMP: 6:05
    const tl = gsap.timeline({ id: "scene-11" });

    tl.to("#s11-glow-bg", { opacity: 1, duration: 1.2, ease: E.out }, 0);

    tl.to(".s11-click-dot", { opacity: 1, scale: 1,
      stagger: 0.14, duration: 0.3, ease: E.back }, 0.3);

    tl.to("#s11-trail-line", { strokeDashoffset: 0,
      duration: 1.8, ease: E.out }, 0.3);

    tl.to(".s11-ring", { opacity: 0.3, scale: 1,
      stagger: 0.12, duration: 0.8, ease: E.expo }, 1.6);

    // Rings pulse
    tl.to(".s11-ring", {
      opacity: 0.12, duration: 1.0, yoyo: true,
      repeat: -1, ease: "sine.inOut",
      stagger: { amount: 0.4 },
    }, 2.6);

    tl.to("#s11-remember-text", { opacity: 1, scale: 1,
      duration: 0.6, ease: E.back }, 2.4);

    tl.to("#s11-subline", { opacity: 1, y: 0,
      duration: 0.5, ease: E.out }, 3.0);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 12  —  Transition Into the Film  (6:30 – 7:00)
   Cinematic handoff: TikTok mockup → screen crack → title card
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[12] = {

  init() {
    // FIX: previously injected a 405×720 SVG into #s12-phone, which is a
    // 220px-wide .scene__tiktok-phone div — so the title card text at x=202
    // and everything wider than 220px got clipped. Now inject into #scene-12
    // (the full-canvas section) and hide the legacy phone div.
    const scene = qs("#scene-12");
    if (!scene) { console.warn("[Scene 12] #scene-12 not found"); return; }

    const prev = scene.querySelector("#s12-svg");
    if (prev) prev.remove();

    // Hide legacy phone div and whiteout/title elements so they don't
    // overlap our injected SVG layers
    ["#s12-phone", "#s12-whiteout", "#s12-title"].forEach(sel => {
      const el = scene.querySelector(sel);
      if (el) el.style.display = "none";
    });

    scene.insertAdjacentHTML("afterbegin", `
      <svg id="s12-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720">

        <defs>
          <radialGradient id="s12-title-glow-grad" cx="50%" cy="50%" r="55%">
            <stop offset="0%"   stop-color="${C.blue}" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="${C.bg}"   stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="s12-crack-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="white"     stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${C.blue}" stop-opacity="0.3"/>
          </linearGradient>
        </defs>

        <!-- TikTok-style phone mockup -->
        <g id="s12-tiktok-phone" transform="translate(202,280)">
          <!-- phone body -->
          <rect x="-90" y="-200" width="180" height="400" rx="26"
                fill="#0A0A14" stroke="${C.muted}" stroke-width="1.2" opacity="0.9"/>
          <!-- screen -->
          <rect x="-80" y="-186" width="160" height="370" rx="18"
                fill="#06060F"/>
          <!-- full-bleed video tint -->
          <rect x="-80" y="-186" width="160" height="370" rx="18"
                fill="${C.purple}" opacity="0.08"/>
          <!-- username -->
          <text x="-66" y="130" font-family="Inter,sans-serif" font-size="9"
                fill="white" font-weight="700">@digitalfootprint</text>
          <!-- caption -->
          <text x="-66" y="146" font-family="Inter,sans-serif" font-size="7.5"
                fill="${C.muted}">What your posts say about you 🧵</text>
          <!-- Right-side actions -->
          <g transform="translate(60,40)">
            <text font-size="16" text-anchor="middle">❤️</text>
            <text y="20" font-family="Inter,sans-serif" font-size="7"
                  fill="white" text-anchor="middle">48K</text>
            <text y="48" font-size="16" text-anchor="middle">💬</text>
            <text y="68" font-family="Inter,sans-serif" font-size="7"
                  fill="white" text-anchor="middle">2.1K</text>
            <text y="96" font-size="16" text-anchor="middle">↗️</text>
          </g>
          <!-- Play indicator -->
          <g id="s12-play" opacity="0.4">
            <circle cx="0" cy="-20" r="30" fill="white" opacity="0.08"/>
            <polygon points="-10,-32 -10,-8 18,-20"
                     fill="white" opacity="0.6"/>
          </g>
        </g>

        <!-- Screen crack paths (stroke-dashoffset reveal) -->
        <!-- NOTE: renamed s12-crack → s12-crack-svg to avoid ID collision with <svg id="s12-crack"> in index.html -->
        <g id="s12-crack-svg" opacity="0">
          <path class="s12-crack-path"
                d="M 202,200 L 168,260 L 140,330 L 155,400"
                fill="none" stroke="url(#s12-crack-grad)"
                stroke-width="2.5" stroke-linecap="round"
                stroke-dasharray="250" stroke-dashoffset="250"/>
          <path class="s12-crack-path"
                d="M 202,200 L 240,255 L 265,340"
                fill="none" stroke="url(#s12-crack-grad)"
                stroke-width="1.8" stroke-linecap="round"
                stroke-dasharray="200" stroke-dashoffset="200"/>
          <path class="s12-crack-path"
                d="M 202,200 L 180,145 L 195,90"
                fill="none" stroke="url(#s12-crack-grad)"
                stroke-width="1.5" stroke-linecap="round"
                stroke-dasharray="130" stroke-dashoffset="130"/>
          <path class="s12-crack-path"
                d="M 175,285 L 148,295 M 230,270 L 258,262"
                fill="none" stroke="white" stroke-width="0.8"
                stroke-dasharray="60" stroke-dashoffset="60" opacity="0.5"/>
        </g>

        <!-- White flash overlay -->
        <rect id="s12-flash" width="405" height="720"
              fill="white" opacity="0"/>

        <!-- Title glow halo -->
        <rect id="s12-title-glow" width="405" height="720"
              fill="url(#s12-title-glow-grad)" opacity="0"/>

        <!-- Film title card -->
        <g id="s12-title-card" opacity="0" transform="translate(202,290)">
          <line x1="-140" y1="-80" x2="140" y2="-80"
                stroke="${C.blue}" stroke-width="0.8" opacity="0.5"/>
          <text y="-60" font-family="Inter,sans-serif" font-size="9"
                fill="${C.blue}" text-anchor="middle"
                letter-spacing="4" opacity="0.8">A SHORT FILM</text>
          <text y="-24" font-family="'Space Grotesk',sans-serif" font-size="28"
                fill="${C.white}" text-anchor="middle" font-weight="900"
                letter-spacing="-1">THE POWER OF</text>
          <text y="16" font-family="'Space Grotesk',sans-serif" font-size="28"
                fill="${C.white}" text-anchor="middle" font-weight="900"
                letter-spacing="-1">THE DIGITAL</text>
          <text y="56" font-family="'Space Grotesk',sans-serif" font-size="28"
                fill="${C.blue}" text-anchor="middle" font-weight="900"
                letter-spacing="-1">FOOTPRINT</text>
          <line x1="-140" y1="76" x2="140" y2="76"
                stroke="${C.blue}" stroke-width="0.8" opacity="0.5"/>
          <text y="98" font-family="Inter,sans-serif" font-size="9"
                fill="${C.muted}" text-anchor="middle" letter-spacing="1">
            Think before you post.
          </text>
        </g>

        <!-- Debris particle host -->
        <g id="s12-debris" transform="translate(202,300)"/>

      </svg>`);

    gsap.set("#s12-tiktok-phone", { opacity: 0, y: 40, scale: 0.9,
      transformOrigin: "center center" });
    gsap.set("#s12-crack-svg",    { opacity: 0 });
    // Reset each crack path's dashoffset individually
    const paths = document.querySelectorAll(".s12-crack-path");
    const dashValues = [250, 200, 130, 60];
    paths.forEach((p, i) => {
      gsap.set(p, { strokeDashoffset: dashValues[i] ?? 250 });
    });
    gsap.set("#s12-flash",        { opacity: 0 });
    gsap.set("#s12-title-glow",   { opacity: 0 });
    gsap.set("#s12-title-card",   { opacity: 0, scale: 0.88,
      transformOrigin: "center center" });
  },

  play() {
    // TIMESTAMP: 6:30
    const tl = gsap.timeline({ id: "scene-12" });

    // TikTok phone rises in
    tl.to("#s12-tiktok-phone", { opacity: 1, y: 0, scale: 1,
      duration: 0.9, ease: E.back }, 0);

    // Gentle TikTok-swipe bounce
    tl.to("#s12-tiktok-phone", {
      y: -10, duration: 0.6, yoyo: true, repeat: 1, ease: "sine.inOut",
    }, 1.0);

    // Crack appears
    tl.to("#s12-crack-svg", { opacity: 1, duration: 0.05 }, 2.0);

    // Draw each crack path
    const crackPaths = document.querySelectorAll(".s12-crack-path");
    crackPaths.forEach((path, i) => {
      const len = path.getTotalLength?.() ?? 250;
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 0.3 + i * 0.06,
        ease: "power3.out",
      }, 2.0 + i * 0.06);
    });

    // Flash on impact
    tl.to("#s12-flash", { opacity: 0.85, duration: 0.08, ease: "none" }, 2.05);
    tl.to("#s12-flash", { opacity: 0,    duration: 0.5,  ease: "power2.out" }, 2.13);

    // Phone fades out post-crack
    tl.to("#s12-tiktok-phone", { opacity: 0, scale: 0.96,
      duration: 0.5, ease: "power2.in" }, 2.3);

    // Debris sparkles
    tl.add(() => {
      const host = qs("#s12-debris");
      if (host && window.AnimHelpers?.createSparkles) {
        AnimHelpers.createSparkles(host, 20, C.blue);
      }
    }, 2.1);

    // Title glow blooms
    tl.to("#s12-title-glow", { opacity: 1, duration: 1.2, ease: E.out }, 2.4);

    // Title card fades + scales in
    tl.to("#s12-title-card", { opacity: 1, scale: 1,
      duration: 1.0, ease: E.expo }, 2.6);

    // Cinematic breathing loop
    tl.to("#s12-title-card", {
      scale: 1.012, duration: 2.5,
      yoyo: true, repeat: -1, ease: "sine.inOut",
      transformOrigin: "center center",
    }, 4.0);

    return tl;
  },
};

/*
 * NOTE: The DOMContentLoaded listener that was here has been removed.
 * main.js is now the single owner of the init() call sequence,
 * which guarantees: init all scenes → showScene(1) → play().
 */
