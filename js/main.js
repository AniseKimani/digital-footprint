/*
================================================================
  main.js  —  Entry point
  Responsibilities:
    • Register GSAP plugins
    • Start the particle background
    • Expose jumpToScene() and playAll() for dev controls
    • Show Scene 1 on load so there's something to see
================================================================
*/

// ── Register GSAP plugins ──────────────────────────────────────
// TextPlugin: enables gsap.to(el, { text: "..." }) typewriter effect
gsap.registerPlugin(TextPlugin);

// ── Global master timeline ─────────────────────────────────────
// This will be built out as we add scenes in later steps.
let masterTimeline = null;
let currentScene   = 0;

// ── On DOM ready ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Start the floating particle background
  initParticles();

  // Show Scene 1 immediately so the page isn't blank
  showScene(1);
});

/*
  showScene(n)
  ─────────────
  Hides all scenes, then fades in scene N.
  Used by jumpToScene() (dev controls) and will be called
  by the master timeline as it progresses.
*/
function showScene(n) {
  const scenes = document.querySelectorAll('.scene');

  // Hide all scenes instantly
  gsap.set(scenes, { opacity: 0, visibility: 'hidden' });

  // Remove active class from all dev buttons
  document.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));

  // Find and show the target scene
  const target = document.getElementById('scene-' + n);
  if (!target) {
    console.warn('Scene ' + n + ' not found yet — build it in scenes.js');
    return;
  }

  gsap.to(target, {
    opacity: 1,
    visibility: 'visible',
    duration: 0.6,
    ease: 'power2.out',
  });

  // Highlight the active dev button
  const btn = document.querySelectorAll('.dev-btn')[n - 1];
  if (btn) btn.classList.add('active');

  currentScene = n;
}

/*
  jumpToScene(n)
  ─────────────
  Called by the dev control buttons.
  Pauses any running timeline, shows the requested scene.
*/
function jumpToScene(n) {
  if (masterTimeline) masterTimeline.pause();
  showScene(n);
}

/*
  playAll()
  ─────────
  Plays all scenes in order.
  The master timeline is assembled here; individual scene
  timelines are appended as we build them in scenes.js.
*/
function playAll() {
  masterTimeline = gsap.timeline();

  // As scenes are built, this function will grow.
  // For now it just shows Scene 1.
  showScene(1);

  console.log('▶ Play All — full timeline assembled in Step 16.');
}
