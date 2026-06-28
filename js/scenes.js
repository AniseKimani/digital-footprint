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
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[3] = {

  init() {
    const el = qs("#scene-3");
    if (!el) { console.warn("[Scene 3] #scene-3 not found"); return; }

    const prev = el.querySelector("#s3-svg");
    if (prev) prev.remove();

    // ── Story of this scene ──
    // Screen tears/splits from centre — LEFT = bright blue (Active, intentional),
    // RIGHT = deep purple (Passive, silent, watching).
    // Active side: each item appears with a confident "click" animation — the
    //   user is choosing to share.
    // Passive side: items materialise silently, with an eerie watching-eye motif —
    //   data being collected without the user knowing.
    // A person silhouette in each half reinforces who is in control.
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
          <!-- Active (left) panel gradient — vivid blue wash -->
          <linearGradient id="s3-left-bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${C.blue}"  stop-opacity="0.18"/>
            <stop offset="100%" stop-color="${C.blue}"  stop-opacity="0.04"/>
          </linearGradient>
          <!-- Passive (right) panel gradient — eerie purple wash -->
          <linearGradient id="s3-right-bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${C.purple}" stop-opacity="0.04"/>
            <stop offset="100%" stop-color="${C.purple}" stop-opacity="0.22"/>
          </linearGradient>
          <!-- Divider glow -->
          <linearGradient id="s3-div-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stop-color="transparent"   stop-opacity="0"/>
            <stop offset="20%"  stop-color="${C.white}"    stop-opacity="0.6"/>
            <stop offset="50%"  stop-color="${C.blue}"     stop-opacity="1.0"/>
            <stop offset="80%"  stop-color="${C.purple}"   stop-opacity="0.6"/>
            <stop offset="100%" stop-color="transparent"   stop-opacity="0"/>
          </linearGradient>
          <!-- Eye iris gradient -->
          <radialGradient id="s3-iris-grad" cx="40%" cy="35%" r="60%">
            <stop offset="0%"   stop-color="${C.white}"   stop-opacity="0.9"/>
            <stop offset="40%"  stop-color="${C.purple}"  stop-opacity="1"/>
            <stop offset="100%" stop-color="#26215C"      stop-opacity="1"/>
          </radialGradient>
          <!-- Click cursor flash -->
          <filter id="s3-click-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- ══════════ LEFT PANEL: ACTIVE ══════════ -->
        <clipPath id="s3-left-clip">
          <rect x="0" y="0" width="201" height="720"/>
        </clipPath>
        <g id="s3-left-panel" clip-path="url(#s3-left-clip)">
          <!-- Panel background wash -->
          <rect x="0" y="0" width="202" height="720" fill="url(#s3-left-bg)"/>

          <!-- Bold ACTIVE header -->
          <g id="s3-active-header" opacity="0" transform="translate(101,75)">
            <!-- Large background box -->
            <rect x="-75" y="-28" width="150" height="56" rx="14"
                  fill="${C.blue}" opacity="0.2" stroke="${C.blue}" stroke-width="1.5"/>
            <!-- Icon -->
            <text x="-52" y="8" font-size="20">✋</text>
            <text x="-22" y="-6" font-family="'Space Grotesk',sans-serif" font-size="15"
                  fill="${C.blue}" font-weight="900" letter-spacing="1">ACTIVE</text>
            <text x="-22" y="14" font-family="Inter,sans-serif" font-size="8"
                  fill="rgba(55,138,221,0.7)" letter-spacing="0.5">YOU CHOOSE THIS</text>
          </g>

          <!-- Active items — each has an icon, label, and sub-caption -->
          ${activeItems.map((item, i) => `
            <g class="s3-active-item" id="s3-a${i}"
               opacity="0" transform="translate(12,${item.y})">
              <!-- Card background -->
              <rect x="0" y="-18" width="182" height="48" rx="10"
                    fill="${C.blue}" opacity="0.08" stroke="${C.blue}" stroke-width="0.8"
                    stroke-opacity="0.3"/>
              <!-- Colored left border -->
              <rect x="0" y="-18" width="3" height="48" rx="1.5"
                    fill="${C.blue}" opacity="0.8"/>
              <!-- Icon circle -->
              <circle cx="26" cy="6" r="18" fill="${C.blue}" opacity="0.15"/>
              <text x="26" y="12" font-size="16" text-anchor="middle">${item.icon}</text>
              <!-- Label -->
              <text x="52" y="-2" font-family="Inter,sans-serif" font-size="10"
                    fill="${C.white}" font-weight="700">${item.label}</text>
              <!-- Sub-caption -->
              <text x="52" y="16" font-family="Inter,sans-serif" font-size="7.5"
                    fill="${C.blue}" opacity="0.7">${item.sub}</text>
              <!-- Checkmark — "you did this" -->
              <circle cx="168" cy="6" r="8" fill="${C.blue}" opacity="0.2"/>
              <text x="168" y="10" font-size="9" text-anchor="middle"
                    fill="${C.blue}" font-weight="700">✓</text>
            </g>`).join("")}

          <!-- "You're in control" footer on active side -->
          <g id="s3-active-footer" opacity="0" transform="translate(101,530)">
            <text font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.blue}" text-anchor="middle" font-weight="600">
              You decide what the world sees.
            </text>
          </g>
        </g>

        <!-- ══════════ RIGHT PANEL: PASSIVE ══════════ -->
        <clipPath id="s3-right-clip">
          <rect x="204" y="0" width="201" height="720"/>
        </clipPath>
        <g id="s3-right-panel" clip-path="url(#s3-right-clip)">
          <!-- Panel background wash -->
          <rect x="203" y="0" width="202" height="720" fill="url(#s3-right-bg)"/>

          <!-- Bold PASSIVE header -->
          <g id="s3-passive-header" opacity="0" transform="translate(304,75)">
            <rect x="-75" y="-28" width="150" height="56" rx="14"
                  fill="${C.purple}" opacity="0.2" stroke="${C.purple}" stroke-width="1.5"/>
            <text x="-52" y="8" font-size="20">👁</text>
            <text x="-22" y="-6" font-family="'Space Grotesk',sans-serif" font-size="14"
                  fill="${C.purple}" font-weight="900" letter-spacing="1">PASSIVE</text>
            <text x="-22" y="14" font-family="Inter,sans-serif" font-size="8"
                  fill="rgba(127,119,221,0.7)" letter-spacing="0.5">HAPPENS TO YOU</text>
          </g>

          <!-- Passive items — eerier styling, darker -->
          ${passiveItems.map((item, i) => `
            <g class="s3-passive-item" id="s3-p${i}"
               opacity="0" transform="translate(211,${item.y})">
              <rect x="0" y="-18" width="182" height="48" rx="10"
                    fill="${C.purple}" opacity="0.08" stroke="${C.purple}" stroke-width="0.8"
                    stroke-opacity="0.3"/>
              <rect x="179" y="-18" width="3" height="48" rx="1.5"
                    fill="${C.purple}" opacity="0.8"/>
              <circle cx="26" cy="6" r="18" fill="${C.purple}" opacity="0.12"/>
              <text x="26" y="12" font-size="16" text-anchor="middle">${item.icon}</text>
              <text x="52" y="-2" font-family="Inter,sans-serif" font-size="10"
                    fill="${C.white}" font-weight="700">${item.label}</text>
              <text x="52" y="16" font-family="Inter,sans-serif" font-size="7.5"
                    fill="${C.purple}" opacity="0.7">${item.sub}</text>
              <!-- Eye icon instead of checkmark — watching, not choosing -->
              <circle cx="168" cy="6" r="8" fill="${C.purple}" opacity="0.2"/>
              <text x="168" y="10" font-size="9" text-anchor="middle">👁</text>
            </g>`).join("")}

          <!-- "You don't know" footer -->
          <g id="s3-passive-footer" opacity="0" transform="translate(304,530)">
            <text font-family="Inter,sans-serif" font-size="8.5"
                  fill="${C.purple}" text-anchor="middle" font-weight="600">
              This happens whether you know or not.
            </text>
          </g>
        </g>

        <!-- ══════════ CENTRAL DIVIDER — the split ══════════ -->
        <!-- Draw with stroke-dashoffset from top to bottom -->
        <line id="s3-divider-svg"
              x1="202" y1="30" x2="202" y2="690"
              stroke="url(#s3-div-glow)" stroke-width="2"
              stroke-dasharray="660" stroke-dashoffset="660"/>
        <!-- Divider glow orb at midpoint -->
        <circle id="s3-div-orb" cx="202" cy="360" r="6"
                fill="${C.white}" opacity="0" filter="url(#s3-click-glow)"/>

        <!-- ══════════ LARGE WATCHING EYE — passive symbol ══════════ -->
        <!-- Appears on passive side as the ultimate metaphor -->
        <g id="s3-big-eye" opacity="0" transform="translate(304,490)">
          <!-- Eyelid shape -->
          <path d="M -55,0 Q 0,-38 55,0 Q 0,38 -55,0 Z"
                fill="#1a1035" stroke="${C.purple}" stroke-width="1.5"/>
          <!-- Iris -->
          <circle cx="0" cy="0" r="22" fill="url(#s3-iris-grad)"/>
          <!-- Pupil -->
          <circle cx="0" cy="0" r="10" fill="#0a0818"/>
          <!-- Pupil shine -->
          <circle cx="6" cy="-6" r="3.5" fill="white" opacity="0.9"/>
          <!-- Outer eye highlight -->
          <path d="M -55,0 Q 0,-38 55,0" fill="none"
                stroke="rgba(127,119,221,0.3)" stroke-width="0.8"/>
        </g>

        <!-- ══════════ BOTTOM UNIFYING STATEMENT ══════════ -->
        <g id="s3-bottom-statement" opacity="0" transform="translate(202,640)">
          <rect x="-168" y="-30" width="336" height="60" rx="12"
                fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          <text font-family="'Space Grotesk',sans-serif" font-size="11"
                fill="rgba(255,255,255,0.45)" text-anchor="middle" y="-8"
                letter-spacing="2" font-weight="500">TOGETHER THEY CREATE</text>
          <text y="14" font-family="'Space Grotesk',sans-serif" font-size="16"
                fill="${C.white}" text-anchor="middle" font-weight="800">
            Your Digital Record.
          </text>
        </g>

      </svg>`);

    // ── Reset states ──
    gsap.set("#s3-active-header",   { opacity: 0, x: -24 });
    gsap.set("#s3-passive-header",  { opacity: 0, x:  24 });
    gsap.set(".s3-active-item",     { opacity: 0, x: -20 });
    gsap.set(".s3-passive-item",    { opacity: 0, x:  20 });
    gsap.set("#s3-active-footer",   { opacity: 0 });
    gsap.set("#s3-passive-footer",  { opacity: 0 });
    gsap.set("#s3-divider-svg",     { strokeDashoffset: 660 });
    gsap.set("#s3-div-orb",         { opacity: 0, scale: 0 });
    gsap.set("#s3-big-eye",         { opacity: 0, scale: 0.3, transformOrigin:"304px 490px" });
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
      transformOrigin: "center center",
    }, 0.5);

    // ── Beat 2 (0.6s): Both headers slam in simultaneously ──
    // VO: "Some parts are active..."
    tl.to("#s3-active-header", {
      opacity: 1, x: 0,
      duration: 0.6, ease: E.back,
    }, 0.6);
    tl.to("#s3-passive-header", {
      opacity: 1, x: 0,
      duration: 0.6, ease: E.back,
    }, 0.7); // slight offset for drama

    // ── Beat 3 (1.2s): Active items slide in from left, one by one ──
    // VO: "These include social media posts, videos, emails..."
    tl.to(".s3-active-item", {
      opacity: 1, x: 0,
      stagger: 0.18, duration: 0.45, ease: E.out,
    }, 1.2);

    // ── Beat 4 (1.6s): Passive items materialise from right ──
    // VO: "Other parts are passive. These are collected without us..."
    tl.to(".s3-passive-item", {
      opacity: 1, x: 0,
      stagger: 0.18, duration: 0.45, ease: E.out,
    }, 1.6);

    // ── Beat 5 (3.0s): Big eye materialises on passive side ──
    // VO: "Websites may record our location, browsing history..."
    tl.to("#s3-big-eye", {
      opacity: 1, scale: 1,
      duration: 0.8, ease: "back.out(1.4)",
      transformOrigin: "304px 490px",
    }, 3.0);
    // Eye "blink" — eyelids close briefly then open
    tl.to("#s3-big-eye", {
      scaleY: 0.08, duration: 0.1, ease: "power2.in",
      transformOrigin: "304px 490px",
    }, 3.9);
    tl.to("#s3-big-eye", {
      scaleY: 1, duration: 0.15, ease: "power2.out",
      transformOrigin: "304px 490px",
    }, 4.0);

    // ── Beat 6 (3.2s): Footer lines fade in under each panel ──
    tl.to("#s3-active-footer",  { opacity: 1, duration: 0.6, ease: E.out }, 3.2);
    tl.to("#s3-passive-footer", { opacity: 1, duration: 0.6, ease: E.out }, 3.4);

    // ── Beat 7 (4.2s): Divider orb pulses — the merge moment ──
    tl.to("#s3-div-orb", {
      scale: 3, opacity: 0,
      duration: 0.8, ease: "power2.out",
      transformOrigin: "center center",
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
        surprisingly difficult to erase..."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[4] = {

  init() {
    // Target: #scene-4 directly — no single wrapper div exists in index.html
    // for this full-scene SVG. The SVG is prepended to the scene root.
    const el = qs("#scene-4");
    if (!el) { console.warn("[Scene 4] #scene-4 not found"); return; }

    const prev = el.querySelector("#s4-svg");
    if (prev) prev.remove();

    el.insertAdjacentHTML("afterbegin", `
      <svg id="s4-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720" style="position:absolute;top:0;left:0;pointer-events:none">

        <!-- Delete button -->
        <!-- NOTE: renamed s4-delete-btn → s4-delete-btn-svg to avoid collision with <div id="s4-delete-btn"> -->
        <g id="s4-delete-btn-svg" opacity="0" transform="translate(202,240)">
          <rect x="-64" y="-22" width="128" height="44" rx="22"
                fill="${C.red}" opacity="0.85"/>
          <text font-family="'Space Grotesk',sans-serif" font-size="14"
                fill="white" text-anchor="middle" dy="5" font-weight="700">
            🗑 Delete Post
          </text>
        </g>

        <!-- Fail X indicator -->
        <g id="s4-fail" opacity="0" transform="translate(202,240)">
          <circle cx="0" cy="0" r="38"
                  fill="none" stroke="${C.red}" stroke-width="3"/>
          <line x1="-20" y1="-20" x2="20" y2="20"
                stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>
          <line x1="20"  y1="-20" x2="-20" y2="20"
                stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>
        </g>

        <!-- Server nodes — copies multiplying -->
        ${[
          { x: 100, y: 370 }, { x: 202, y: 350 }, { x: 304, y: 380 },
          { x: 68,  y: 470 }, { x: 160, y: 458 }, { x: 250, y: 455 }, { x: 340, y: 475 },
        ].map((n, i) => `
          <g class="s4-server" id="s4-server-${i}" opacity="0"
             transform="translate(${n.x},${n.y})">
            <rect x="-22" y="-16" width="44" height="32" rx="4"
                  fill="#14141F" stroke="${C.blue}" stroke-width="1.2"/>
            <rect x="-16" y="-8"  width="32" height="4" rx="2"
                  fill="${C.blue}" opacity="0.6"/>
            <rect x="-16" y="1"   width="20" height="4" rx="2"
                  fill="${C.muted}" opacity="0.4"/>
            <circle cx="14" cy="3" r="3" fill="${C.teal}" opacity="0.8"/>
          </g>`).join("")}

        <!-- Connection lines -->
        <g id="s4-server-lines" opacity="0">
          <line x1="100" y1="370" x2="202" y2="350" stroke="${C.blue}"
                stroke-width="0.8" stroke-dasharray="4 3" opacity="0.5"/>
          <line x1="202" y1="350" x2="304" y2="380" stroke="${C.blue}"
                stroke-width="0.8" stroke-dasharray="4 3" opacity="0.5"/>
          <line x1="68"  y1="470" x2="160" y2="458" stroke="${C.blue}"
                stroke-width="0.8" stroke-dasharray="4 3" opacity="0.5"/>
          <line x1="160" y1="458" x2="250" y2="455" stroke="${C.blue}"
                stroke-width="0.8" stroke-dasharray="4 3" opacity="0.5"/>
          <line x1="250" y1="455" x2="340" y2="475" stroke="${C.blue}"
                stroke-width="0.8" stroke-dasharray="4 3" opacity="0.5"/>
          <line x1="100" y1="370" x2="68"  y2="470" stroke="${C.purple}"
                stroke-width="0.8" stroke-dasharray="4 3" opacity="0.4"/>
          <line x1="304" y1="380" x2="340" y2="475" stroke="${C.purple}"
                stroke-width="0.8" stroke-dasharray="4 3" opacity="0.4"/>
        </g>

        <!-- Quote -->
        <g id="s4-quote" opacity="0" transform="translate(202,590)">
          <text font-family="Inter,sans-serif" font-size="10"
                fill="${C.white}" text-anchor="middle" opacity="0.85">
            "The internet never truly forgets."
          </text>
        </g>

        <!-- Archive stamp -->
        <!-- NOTE: renamed s4-stamp → s4-stamp-svg to avoid collision with <div id="s4-stamp"> in index.html -->
        <g id="s4-stamp-svg" opacity="0" transform="translate(202,145)">
          <rect x="-58" y="-18" width="116" height="36" rx="4"
                fill="none" stroke="${C.amber}" stroke-width="2"
                stroke-dasharray="3 2"/>
          <text font-family="'Space Grotesk',sans-serif" font-size="13"
                fill="${C.amber}" text-anchor="middle" dy="5"
                font-weight="700" letter-spacing="3">ARCHIVED</text>
        </g>

      </svg>`);

    // FIX: transformOrigin "center center" so scale animates from element centre
    gsap.set("#s4-delete-btn-svg", { opacity: 0, scale: 0.9,
      transformOrigin: "center center" });
    gsap.set("#s4-fail",           { opacity: 0, scale: 0.4,
      transformOrigin: "center center" });
    gsap.set(".s4-server",         { opacity: 0, scale: 0.5,
      transformOrigin: "center center" });
    gsap.set("#s4-server-lines",   { opacity: 0 });
    gsap.set("#s4-quote",          { opacity: 0, y: 12 });
    gsap.set("#s4-stamp-svg",      { opacity: 0, rotation: -8, scale: 1.3,
      transformOrigin: "center center" });
  },

  play() {
    // TIMESTAMP: 2:00
    const tl = gsap.timeline({ id: "scene-4" });

    tl.to("#s4-delete-btn-svg", { opacity: 1, scale: 1,
      duration: 0.6, ease: E.back }, 0);

    // Button shake (user pressing it)
    tl.to("#s4-delete-btn-svg", {
      x: 6, duration: 0.05, yoyo: true, repeat: 5, ease: "none",
    }, 0.9);

    // Fail icon replaces button
    tl.to("#s4-delete-btn-svg", { opacity: 0, scale: 0.8,
      duration: 0.25, ease: "power2.in" }, 1.3);
    tl.to("#s4-fail", { opacity: 1, scale: 1,
      duration: 0.4, ease: E.elastic }, 1.5);

    // Servers multiply
    tl.to(".s4-server", { opacity: 1, scale: 1,
      stagger: 0.1, duration: 0.4, ease: E.back }, 2.0);
    tl.to("#s4-server-lines", { opacity: 1,
      duration: 0.6, ease: E.out }, 2.3);

    // Servers pulse
    tl.to(".s4-server", {
      scale: 1.08, duration: 0.4, yoyo: true, repeat: 1,
      stagger: 0.08, ease: E.inOut,
      transformOrigin: "center center",
    }, 3.0);

    // Archive stamp slams in
    tl.to("#s4-stamp-svg", { opacity: 1, rotation: -3, scale: 1,
      duration: 0.5, ease: E.back }, 3.6);

    tl.to("#s4-quote", { opacity: 1, y: 0,
      duration: 0.7, ease: E.out }, 4.0);

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

    el.innerHTML = `
      <svg id="s5-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720">

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
        </defs>

        <!-- Glass of water -->
        <g id="s5-glass" transform="translate(202,370)">
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

        <!-- Ink drop -->
        <g id="s5-drop" transform="translate(202,180)">
          <ellipse cx="0" cy="0" rx="8" ry="12" fill="${C.purple}"/>
          <path d="M -3,-10 Q 0,-20 3,-10" fill="${C.purple}" opacity="0.7"/>
        </g>

        <!-- Ink spread rings -->
        <circle id="s5-ink-spread-1" cx="202" cy="250" r="0"
                fill="url(#s5-ink-grad)" opacity="0"/>
        <circle id="s5-ink-spread-2" cx="202" cy="250" r="0"
                fill="none" stroke="${C.purple}" stroke-width="1.5" opacity="0"/>
        <circle id="s5-ink-spread-3" cx="202" cy="250" r="0"
                fill="none" stroke="${C.blue}"   stroke-width="1"   opacity="0"/>

        <!-- Caption -->
        <g id="s5-caption" opacity="0" transform="translate(202,570)">
          <text font-family="Inter,sans-serif" font-size="11"
                fill="${C.muted}" text-anchor="middle">Once it spreads…</text>
          <text y="22" font-family="'Space Grotesk',sans-serif" font-size="15"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            you can't un-drop it.
          </text>
        </g>

        <!-- Particle host for helper -->
        <g id="s5-particles" transform="translate(202,310)"/>

      </svg>`;

    gsap.set("#s5-glass",  { opacity: 0, y: 30, scale: 0.9,
      transformOrigin: "center center" });
    gsap.set("#s5-drop",   { opacity: 0, y: -60 });
    gsap.set(["#s5-ink-spread-1", "#s5-ink-spread-2", "#s5-ink-spread-3"],
             { opacity: 0 });
    gsap.set("#s5-caption", { opacity: 0, y: 14 });
  },

  play() {
    // TIMESTAMP: 2:40
    const tl = gsap.timeline({ id: "scene-5" });

    tl.to("#s5-glass", { opacity: 1, y: 0, scale: 1,
      duration: 0.9, ease: E.back }, 0);

    // Drop appears then falls
    tl.to("#s5-drop", { opacity: 1, y: 0,
      duration: 0.05, ease: "none" }, 0.7);
    tl.to("#s5-drop", { y: 70, duration: 0.55, ease: "power2.in" }, 0.72);

    // Impact
    tl.to("#s5-drop", { opacity: 0, scale: 1.8,
      duration: 0.15, ease: "power2.out" }, 1.27);

    // Three expanding rings
    tl.to("#s5-ink-spread-1", { opacity: 0.6, r: 50,
      duration: 1.2, ease: "power2.out" }, 1.28);
    tl.to("#s5-ink-spread-1", { opacity: 0,
      duration: 1.0, ease: "power2.in"  }, 1.9);

    tl.to("#s5-ink-spread-2", { opacity: 0.7, r: 90,
      duration: 1.6, ease: "power2.out" }, 1.4);
    tl.to("#s5-ink-spread-2", { opacity: 0,
      duration: 0.9, ease: "power2.in"  }, 2.4);

    tl.to("#s5-ink-spread-3", { opacity: 0.4, r: 140,
      duration: 2.0, ease: "power2.out" }, 1.55);
    tl.to("#s5-ink-spread-3", { opacity: 0,
      duration: 1.2, ease: "power2.in"  }, 2.9);

    tl.to("#s5-caption", { opacity: 1, y: 0,
      duration: 0.8, ease: E.out }, 3.0);

    // Optional sparkles
    tl.add(() => {
      const host = qs("#s5-particles");
      if (host && window.AnimHelpers?.createSparkles) {
        AnimHelpers.createSparkles(host, 18, C.purple);
      }
    }, 1.5);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 6  —  Universities & Employers  (3:20 – 4:00)
   VO: "Today, our digital footprints influence many aspects of our lives.
        Universities may review applicants..."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[6] = {

  init() {
    // Target: #s6-profile  (class="scene__profile-card" id="s6-profile" in index.html)
    const el = qs("#s6-profile");
    if (!el) { console.warn("[Scene 6] #s6-profile not found"); return; }

    el.innerHTML = `
      <svg id="s6-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720">

        <!-- Applicant profile card -->
        <g id="s6-profile-card" transform="translate(202,200)">
          <rect x="-130" y="-100" width="260" height="200" rx="16"
                fill="#0E0E1C" stroke="${C.blue}" stroke-width="1.5"/>
          <circle cx="0" cy="-40" r="38"
                  fill="none" stroke="${C.blue}" stroke-width="2" opacity="0.6"/>
          <circle cx="0" cy="-40" r="30" fill="${C.blue}" opacity="0.25"/>
          <text x="0" y="-32" font-size="28" text-anchor="middle">👤</text>
          <text y="20" font-family="'Space Grotesk',sans-serif" font-size="14"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            Alex Johnson
          </text>
          <text y="40" font-family="Inter,sans-serif" font-size="9"
                fill="${C.muted}" text-anchor="middle">
            College Applicant · Class of 2026
          </text>
          <line x1="-100" y1="56" x2="100" y2="56"
                stroke="${C.blue}" stroke-width="0.5" opacity="0.3"/>
          <text x="-80" y="80" font-family="Inter,sans-serif" font-size="8"
                fill="${C.teal}" font-weight="600">GPA 3.9</text>
          <text x="10"  y="80" font-family="Inter,sans-serif" font-size="8"
                fill="${C.amber}" font-weight="600">SAT 1490</text>
          <text x="80"  y="80" font-family="Inter,sans-serif" font-size="8"
                fill="${C.purple}" font-weight="600">10 ECs</text>
        </g>

        <!-- Magnifying glass -->
        <g id="s6-magnifier" transform="translate(310,150)">
          <circle cx="0" cy="0" r="28"
                  fill="none" stroke="${C.amber}" stroke-width="2.5"/>
          <line x1="20" y1="20" x2="40" y2="40"
                stroke="${C.amber}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="-8" cy="-8" r="5" fill="white" opacity="0.12"/>
        </g>

        <!-- Social media thumbnails -->
        ${[
          { x: 90,  y: 415, color: C.blue,   icon: "🐦", label: "Twitter / X" },
          { x: 202, y: 415, color: C.purple,  icon: "📸", label: "Instagram"   },
          { x: 314, y: 415, color: C.teal,    icon: "💼", label: "LinkedIn"    },
        ].map((s, i) => `
          <g class="s6-social" id="s6-social-${i}"
             opacity="0" transform="translate(${s.x},${s.y})">
            <rect x="-38" y="-46" width="76" height="92" rx="10"
                  fill="#0E0E1C" stroke="${s.color}" stroke-width="1.2"/>
            <text y="-16" font-size="22" text-anchor="middle">${s.icon}</text>
            <text y="12" font-family="Inter,sans-serif" font-size="7.5"
                  fill="${C.muted}" text-anchor="middle">${s.label}</text>
            <rect x="-28" y="22" width="56" height="5" rx="2.5"
                  fill="${s.color}" opacity="0.25"/>
            <rect x="-28" y="32" width="36" height="5" rx="2.5"
                  fill="${C.muted}" opacity="0.18"/>
          </g>`).join("")}

        <!-- Verdict badge -->
        <g id="s6-verdict" transform="translate(202,550)">
          <rect x="-72" y="-18" width="144" height="36" rx="18"
                fill="${C.amber}" opacity="0.15"
                stroke="${C.amber}" stroke-width="1.5"/>
          <text font-family="'Space Grotesk',sans-serif" font-size="12"
                fill="${C.amber}" text-anchor="middle" dy="4" font-weight="700"
                letter-spacing="1">⚖ UNDER REVIEW</text>
        </g>

        <!-- Connecting lines profile → socials -->
        <g id="s6-connect-lines" opacity="0">
          <line x1="202" y1="300" x2="90"  y2="369"
                stroke="${C.blue}"   stroke-width="0.8" stroke-dasharray="4 4"/>
          <line x1="202" y1="300" x2="202" y2="369"
                stroke="${C.purple}" stroke-width="0.8" stroke-dasharray="4 4"/>
          <line x1="202" y1="300" x2="314" y2="369"
                stroke="${C.teal}"   stroke-width="0.8" stroke-dasharray="4 4"/>
        </g>

        <!-- Headline -->
        <g id="s6-headline" opacity="0" transform="translate(202,640)">
          <text font-family="'Space Grotesk',sans-serif" font-size="13"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            Universities &amp; Employers
          </text>
          <text y="18" font-family="Inter,sans-serif" font-size="9"
                fill="${C.muted}" text-anchor="middle">
            are reviewing your digital trail.
          </text>
        </g>

      </svg>`;

    gsap.set("#s6-profile-card",  { opacity: 0, y: 30, scale: 0.92,
      transformOrigin: "center center" });
    gsap.set("#s6-magnifier",     { opacity: 0, scale: 0.5, rotation: -20,
      transformOrigin: "center center" });
    gsap.set(".s6-social",        { opacity: 0, y: 20, scale: 0.8,
      transformOrigin: "center center" });
    gsap.set("#s6-connect-lines", { opacity: 0 });
    gsap.set("#s6-verdict",       { opacity: 0, scale: 0.8,
      transformOrigin: "center center" });
    gsap.set("#s6-headline",      { opacity: 0, y: 10 });
  },

  play() {
    // TIMESTAMP: 3:20
    const tl = gsap.timeline({ id: "scene-6" });

    tl.to("#s6-profile-card", { opacity: 1, y: 0, scale: 1,
      duration: 0.9, ease: E.back }, 0);

    tl.to("#s6-magnifier", { opacity: 1, scale: 1, rotation: 0,
      duration: 0.7, ease: E.elastic }, 0.7);

    // Magnifier scans across profile
    tl.to("#s6-magnifier", {
      x: -80, y: 60, duration: 1.4, ease: "sine.inOut",
    }, 1.3);

    tl.to("#s6-connect-lines", { opacity: 1,
      duration: 0.6, ease: E.out }, 1.6);

    tl.to(".s6-social", { opacity: 1, y: 0, scale: 1,
      stagger: 0.15, duration: 0.5, ease: E.back }, 1.9);

    // Magnifier moves to hover over social cards
    tl.to("#s6-magnifier", {
      x: -100, y: 140, duration: 1.0, ease: "sine.inOut",
    }, 2.6);

    tl.to("#s6-verdict", { opacity: 1, scale: 1,
      duration: 0.6, ease: E.back }, 3.4);

    // FIX: replaced drop-shadow filter tween (unreliable cross-browser)
    // with a safe opacity pulse instead
    tl.to("#s6-verdict", {
      opacity: 0.5, duration: 0.4, yoyo: true, repeat: 3, ease: E.inOut,
    }, 3.8);

    tl.to("#s6-headline", { opacity: 1, y: 0,
      duration: 0.7, ease: E.out }, 4.2);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 7  —  People Grow & Change  (4:00 – 4:25)
   VO: "This does not mean that every old mistake automatically ruins
        someone's future..."
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

        <!-- Timeline arrow -->
        <!-- NOTE: renamed s7-timeline → s7-timeline-svg to avoid collision with <div id="s7-timeline"> -->
        <g id="s7-timeline-svg" opacity="0">
          <line x1="50" y1="360" x2="355" y2="360"
                stroke="${C.blue}" stroke-width="1.5"
                stroke-dasharray="6 4" opacity="0.5"/>
          <polygon points="355,355 368,360 355,365"
                   fill="${C.blue}" opacity="0.5"/>
        </g>

        <!-- Past self (left, muted) -->
        <!-- NOTE: renamed s7-past → s7-past-svg to avoid collision with <div id="s7-past"> in index.html -->
        <g id="s7-past-svg" opacity="0" transform="translate(100,310)">
          <circle cx="0" cy="-34" r="18" fill="${C.muted}" opacity="0.6"/>
          <rect x="-14" y="-14" width="28" height="38" rx="8"
                fill="${C.muted}" opacity="0.5"/>
          <line x1="-24" y1="-58" x2="24" y2="-6"
                stroke="${C.red}" stroke-width="2.5"
                stroke-linecap="round" opacity="0.7"/>
          <line x1="24" y1="-58" x2="-24" y2="-6"
                stroke="${C.red}" stroke-width="2.5"
                stroke-linecap="round" opacity="0.7"/>
          <text y="46" font-family="Inter,sans-serif" font-size="8"
                fill="${C.muted}" text-anchor="middle">Then</text>
        </g>

        <!-- Growth arc (drawn with stroke-dashoffset trick) -->
        <path id="s7-growth-arc" d="M 130,310 Q 202,240 274,280"
              fill="none" stroke="${C.teal}" stroke-width="2"
              stroke-dasharray="200" stroke-dashoffset="200" opacity="0.7"/>

        <!-- Present self (right, taller, glowing) -->
        <!-- NOTE: renamed s7-present → s7-present-svg to avoid collision with <div id="s7-present"> in index.html -->
        <g id="s7-present-svg" opacity="0" transform="translate(302,270)">
          <circle cx="0" cy="-42" r="24" fill="${C.teal}" opacity="0.8"/>
          <rect x="-18" y="-16" width="36" height="50" rx="10"
                fill="${C.teal}" opacity="0.7"/>
          <circle cx="0" cy="-42" r="32"
                  fill="none" stroke="${C.teal}" stroke-width="1.5" opacity="0.3"/>
          <text y="60" font-family="Inter,sans-serif" font-size="8"
                fill="${C.teal}" text-anchor="middle">Now</text>
        </g>

        <!-- Context bubble -->
        <g id="s7-context-bubble" opacity="0" transform="translate(202,470)">
          <rect x="-130" y="-28" width="260" height="56" rx="14"
                fill="#12121E" stroke="${C.purple}" stroke-width="1"/>
          <text font-family="Inter,sans-serif" font-size="9.5"
                fill="${C.white}" text-anchor="middle" dy="-4">
            We all make mistakes.
          </text>
          <text y="16" font-family="Inter,sans-serif" font-size="9.5"
                fill="${C.white}" text-anchor="middle" dy="-4">
            Context and growth matter.
          </text>
        </g>

        <!-- Checkmark of progress -->
        <g id="s7-check" opacity="0" transform="translate(302,205)">
          <circle cx="0" cy="0" r="22"
                  fill="${C.teal}" opacity="0.2"
                  stroke="${C.teal}" stroke-width="2"/>
          <polyline points="-10,2 -2,10 12,-8"
                    fill="none" stroke="${C.teal}" stroke-width="3"
                    stroke-linecap="round" stroke-linejoin="round"/>
        </g>

        <!-- Headline -->
        <g id="s7-headline" opacity="0" transform="translate(202,610)">
          <text font-family="'Space Grotesk',sans-serif" font-size="15"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            People Grow &amp; Change
          </text>
        </g>

      </svg>`);

    gsap.set(["#s7-timeline-svg", "#s7-past-svg", "#s7-context-bubble",
              "#s7-headline"], { opacity: 0 });
    gsap.set("#s7-growth-arc",  { strokeDashoffset: 200, opacity: 0.7 });
    gsap.set("#s7-present-svg", { opacity: 0, scale: 0.7,
      transformOrigin: "center center" });
    gsap.set("#s7-check",       { opacity: 0, scale: 0.4,
      transformOrigin: "center center" });
  },

  play() {
    // TIMESTAMP: 4:00
    const tl = gsap.timeline({ id: "scene-7" });

    tl.to("#s7-timeline-svg", { opacity: 1, duration: 0.6, ease: E.out }, 0);
    tl.to("#s7-past-svg",     { opacity: 1, duration: 0.7, ease: E.out }, 0.4);

    // Growth arc draws
    tl.to("#s7-growth-arc", { strokeDashoffset: 0,
      duration: 1.0, ease: E.out }, 0.9);

    tl.to("#s7-present-svg", { opacity: 1, scale: 1,
      duration: 0.8, ease: E.back }, 1.7);

    tl.to("#s7-check", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.elastic }, 2.3);

    tl.to("#s7-context-bubble", { opacity: 1,
      duration: 0.7, ease: E.out }, 2.8);

    tl.to("#s7-headline", { opacity: 1, duration: 0.7, ease: E.out }, 3.4);

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

        <!-- Cards at orbit positions -->
        ${[
          { angle: 270, label: "Portfolio",  icon: "💼", color: C.blue   },
          { angle: 330, label: "Creativity", icon: "🎨", color: C.purple },
          { angle: 30,  label: "Advocacy",   icon: "📣", color: C.amber  },
          { angle: 90,  label: "Community",  icon: "🤝", color: C.teal   },
          { angle: 150, label: "Learning",   icon: "📚", color: C.blue   },
          { angle: 210, label: "Networking", icon: "🌐", color: C.purple },
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

    gsap.set("#s8-plus-badge", { opacity: 0, scale: 0.4, rotation: -45,
      transformOrigin: "center center" });
    gsap.set(".s8-card",       { opacity: 0, scale: 0.5,
      transformOrigin: "center center" });
    gsap.set("#s8-orbit",      { opacity: 0 });
    gsap.set("#s8-headline",   { opacity: 0, y: 14 });
  },

  play() {
    // TIMESTAMP: 4:25
    const tl = gsap.timeline({ id: "scene-8" });

    // Plus badge spins in
    tl.to("#s8-plus-badge", { opacity: 1, scale: 1, rotation: 0,
      duration: 0.8, ease: E.back }, 0);

    // Orbit ring fades in
    tl.to("#s8-orbit", { opacity: 0.4, duration: 0.5, ease: E.out }, 0.6);

    // Cards bloom outward via helper or fallback
    if (window.AnimHelpers?.bloomCards) {
      tl.add(() => {
        AnimHelpers.bloomCards(qsa(".s8-card"), 202, 220, 130);
      }, 0.8);
    } else {
      tl.to(".s8-card", { opacity: 1, scale: 1,
        stagger: { amount: 0.7 },
        duration: 0.5, ease: E.elastic }, 0.8);
    }

    // FIX: removed broken orbit rotation (pixel-coord anchor breaks SVG
    // coordinate space). Cards stay in place and float gently instead.
    tl.to(".s8-card", {
      y: -5, duration: 2.0, yoyo: true, repeat: -1,
      ease: "sine.inOut", stagger: { amount: 0.8 },
    }, 2.2);

    // Sparkles
    tl.add(() => {
      const host = qs("#s8-sparkle-host");
      if (host && window.AnimHelpers?.createSparkles) {
        AnimHelpers.createSparkles(host, 12, C.teal);
      }
    }, 1.8);

    tl.to("#s8-headline", { opacity: 1, y: 0,
      duration: 0.8, ease: E.out }, 2.4);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 9  —  Think Before You Post  (5:00 – 5:30)
   VO: "Before sharing something online, it is worth asking a few simple
        questions..."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[9] = {

  init() {
    // Target: #s9-phone  (class="scene__phone-ui" id="s9-phone" in index.html)
    const el = qs("#s9-phone");
    if (!el) { console.warn("[Scene 9] #s9-phone not found"); return; }

    el.innerHTML = `
      <svg id="s9-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720">

        <!-- Phone with compose screen -->
        <!-- NOTE: renamed s9-phone → s9-phone-body to avoid ID collision with host <div id="s9-phone"> -->
        <g id="s9-phone-body" transform="translate(202,210)">
          <rect x="-80" y="-130" width="160" height="260" rx="18"
                fill="#0E0E1C" stroke="${C.blue}" stroke-width="1.5"/>
          <rect x="-66" y="-112" width="132" height="140" rx="8"
                fill="#12121E"/>
          <text x="-56" y="-90" font-family="Inter,sans-serif" font-size="9"
                fill="${C.muted}">What's on your mind?</text>
          <line id="s9-cursor" x1="-56" y1="-74" x2="-56" y2="-62"
                stroke="${C.blue}" stroke-width="2"
                stroke-linecap="round" opacity="0.9"/>
          <rect x="28" y="88" width="50" height="22" rx="11"
                fill="${C.blue}" opacity="0.85"/>
          <text x="53" y="104" font-family="Inter,sans-serif" font-size="9"
                fill="white" text-anchor="middle" font-weight="600">POST</text>
        </g>

        <!-- Pause hand overlay -->
        <g id="s9-pause-hand" transform="translate(202,210)">
          <circle cx="0" cy="0" r="44"
                  fill="${C.amber}" opacity="0.15"
                  stroke="${C.amber}" stroke-width="2"/>
          <text font-size="36" text-anchor="middle" dominant-baseline="middle">✋</text>
        </g>

        <!-- Three question cards -->
        ${[
          { y: 385, q: "Is this kind?",             color: C.teal  },
          { y: 455, q: "Would I be proud of this?", color: C.blue  },
          { y: 525, q: "Could this hurt someone?",  color: C.amber },
        ].map((item, i) => `
          <g class="s9-question" id="s9-q-${i}"
             opacity="0" transform="translate(202,${item.y})">
            <rect x="-150" y="-20" width="300" height="40" rx="10"
                  fill="#0E0E1C" stroke="${item.color}" stroke-width="1.2"/>
            <text x="-134" y="5" font-family="Inter,sans-serif" font-size="10"
                  fill="${item.color}" font-weight="600">${i + 1}.</text>
            <text x="-118" y="5" font-family="Inter,sans-serif" font-size="10"
                  fill="${C.white}">${item.q}</text>
          </g>`).join("")}

        <!-- THINK stamp -->
        <g id="s9-think-stamp" transform="translate(202,640)">
          <text font-family="'Space Grotesk',sans-serif" font-size="28"
                fill="${C.amber}" text-anchor="middle" font-weight="900"
                letter-spacing="6" opacity="0.85">THINK</text>
        </g>

      </svg>`;

    gsap.set("#s9-phone-body",  { opacity: 0, y: 30 });
    gsap.set("#s9-pause-hand",  { opacity: 0, scale: 0.5,
      transformOrigin: "center center" });
    gsap.set(".s9-question",    { opacity: 0, x: -30 });
    gsap.set("#s9-think-stamp", { opacity: 0, scale: 1.5,
      transformOrigin: "center center" });
  },

  play() {
    // TIMESTAMP: 5:00
    const tl = gsap.timeline({ id: "scene-9" });

    tl.to("#s9-phone-body", { opacity: 1, y: 0,
      duration: 0.8, ease: E.back }, 0);

    // Cursor blinks
    tl.to("#s9-cursor", {
      opacity: 0, duration: 0.4, yoyo: true,
      repeat: 4, ease: "none",
    }, 0.8);

    // Pause hand
    tl.to("#s9-pause-hand", { opacity: 1, scale: 1,
      duration: 0.5, ease: E.elastic }, 1.4);

    // Question cards slide in one by one
    tl.to(".s9-question", { opacity: 1, x: 0,
      stagger: 0.4, duration: 0.5, ease: E.out }, 2.0);

    // THINK stamp slams in
    tl.to("#s9-think-stamp", { opacity: 1, scale: 1,
      duration: 0.45, ease: E.back }, 3.4);

    // Stamp shakes for emphasis
    tl.to("#s9-think-stamp", {
      x: 4, duration: 0.05, yoyo: true, repeat: 3, ease: "none",
    }, 3.85);

    return tl;
  },
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SCENE 10  —  Technology Is a Tool  (5:30 – 6:05)
   VO: "But technology itself is not the problem..."
   ═══════════════════════════════════════════════════════════════════════════════ */
SceneControllers[10] = {

  init() {
    // Target: #s10-device-wrap  (class="scene__device-wrap" id="s10-device-wrap" in index.html)
    const el = qs("#s10-device-wrap");
    if (!el) { console.warn("[Scene 10] #s10-device-wrap not found"); return; }

    el.innerHTML = `
      <svg id="s10-svg" viewBox="0 0 405 720" xmlns="http://www.w3.org/2000/svg"
           width="405" height="720">

        <!-- Wrench/tool icon -->
        <g id="s10-tool-icon" transform="translate(202,200)">
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

        <!-- Scale pivot -->
        <line id="s10-scale-pivot" x1="202" y1="310" x2="202" y2="370"
              stroke="${C.muted}" stroke-width="2" opacity="0"/>
        <!-- Balance bar -->
        <line id="s10-scale-bar"   x1="100" y1="370" x2="304" y2="370"
              stroke="${C.muted}" stroke-width="2.5" opacity="0"/>

        <!-- Bad-use pan (left) -->
        <g id="s10-bad-pan" transform="translate(100,415)">
          <ellipse cx="0" cy="0" rx="40" ry="8"
                   fill="${C.red}" opacity="0.2"
                   stroke="${C.red}" stroke-width="1"/>
          <text y="26" font-family="Inter,sans-serif" font-size="8"
                fill="${C.red}" text-anchor="middle">Bad Use</text>
          <text y="-14" font-size="18" text-anchor="middle">⚠️</text>
        </g>

        <!-- Good-use pan (right) -->
        <g id="s10-good-pan" transform="translate(304,395)">
          <ellipse cx="0" cy="0" rx="40" ry="8"
                   fill="${C.teal}" opacity="0.2"
                   stroke="${C.teal}" stroke-width="1"/>
          <text y="26" font-family="Inter,sans-serif" font-size="8"
                fill="${C.teal}" text-anchor="middle">Good Use</text>
          <text y="-14" font-size="18" text-anchor="middle">✅</text>
        </g>

        <!-- Tool examples grid -->
        ${[
          { x: 90,  y: 510, icon: "📱", label: "Social Media" },
          { x: 160, y: 510, icon: "🔍", label: "Search"       },
          { x: 230, y: 510, icon: "📧", label: "Email"        },
          { x: 300, y: 510, icon: "🤖", label: "AI Tools"     },
          { x: 90,  y: 570, icon: "📸", label: "Camera"       },
          { x: 160, y: 570, icon: "🎮", label: "Gaming"       },
          { x: 230, y: 570, icon: "📺", label: "Streaming"    },
          { x: 300, y: 570, icon: "💬", label: "Messaging"    },
        ].map(t => `
          <g class="s10-tool-item" opacity="0" transform="translate(${t.x},${t.y})">
            <text font-size="18" text-anchor="middle">${t.icon}</text>
            <text y="22" font-family="Inter,sans-serif" font-size="7"
                  fill="${C.muted}" text-anchor="middle">${t.label}</text>
          </g>`).join("")}

        <!-- Core message -->
        <g id="s10-message" opacity="0" transform="translate(202,648)">
          <text font-family="'Space Grotesk',sans-serif" font-size="13"
                fill="${C.white}" text-anchor="middle" font-weight="700">
            The tool isn't the problem.
          </text>
          <text y="20" font-family="Inter,sans-serif" font-size="9"
                fill="${C.muted}" text-anchor="middle">
            How you use it is.
          </text>
        </g>

      </svg>`;

    gsap.set("#s10-tool-icon", { opacity: 0, rotation: -30, scale: 0.6,
      transformOrigin: "center center" });
    gsap.set(["#s10-scale-pivot", "#s10-scale-bar"], { opacity: 0 });
    gsap.set(["#s10-bad-pan",  "#s10-good-pan"],     { opacity: 0, y: 16 });
    gsap.set(".s10-tool-item", { opacity: 0, y: 10, scale: 0.7,
      transformOrigin: "center center" });
    gsap.set("#s10-message",   { opacity: 0, y: 12 });
  },

  play() {
    // TIMESTAMP: 5:30
    const tl = gsap.timeline({ id: "scene-10" });

    tl.to("#s10-tool-icon", { opacity: 1, rotation: 0, scale: 1,
      duration: 0.9, ease: E.back }, 0);

    tl.to(["#s10-scale-pivot", "#s10-scale-bar"], { opacity: 0.6,
      duration: 0.5, ease: E.out }, 0.8);

    tl.to(["#s10-bad-pan", "#s10-good-pan"], { opacity: 1, y: 0,
      stagger: 0.2, duration: 0.5, ease: E.back }, 1.2);

    // Scale tilts — good side wins
    tl.to("#s10-scale-bar", {
      rotation: -6, transformOrigin: "center center",
      duration: 1.0, ease: E.inOut,
    }, 1.8);
    tl.to("#s10-good-pan", { y: -12, duration: 1.0, ease: E.inOut }, 1.8);
    tl.to("#s10-bad-pan",  { y:  12, duration: 1.0, ease: E.inOut }, 1.8);

    tl.to(".s10-tool-item", { opacity: 1, y: 0, scale: 1,
      stagger: { amount: 0.6 },
      duration: 0.35, ease: E.back }, 2.4);

    tl.to("#s10-message", { opacity: 1, y: 0,
      duration: 0.7, ease: E.out }, 3.2);

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
    // Target: #s12-phone  (class="scene__tiktok-phone" id="s12-phone" in index.html)
    const el = qs("#s12-phone");
    if (!el) { console.warn("[Scene 12] #s12-phone not found"); return; }

    el.innerHTML = `
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

      </svg>`;

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
