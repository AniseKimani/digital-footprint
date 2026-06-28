/*
================================================================
  main.js  —  Entry point  (FIXED)
  Responsibilities:
    • Register GSAP plugins
    • Start the particle background
    • Expose jumpToScene() and playAll() for dev controls
    • Show Scene 1 on load so there's something to see

  KEY FIX: showScene() now calls SceneControllers[n].play()
  after revealing the scene. The DOMContentLoaded listener
  is also the single source of truth — scenes.js init() calls
  are driven from here, not from a separate listener in
  scenes.js, eliminating the race condition.
================================================================
*/

// ── Register GSAP plugins ──────────────────────────────────────
gsap.registerPlugin(TextPlugin);

// ── Global state ───────────────────────────────────────────────
let masterTimeline  = null;
let currentScene    = 0;
let activeSceneTl   = null;   // tracks the running scene timeline so we can kill it

// ── On DOM ready ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // 1. Start floating particle background (defined in animations.js)
  if (typeof initParticles === 'function') initParticles();

  // 2. Run every scene's init() so SVGs are injected before we try
  //    to show anything. We do this HERE, not inside scenes.js, so
  //    the order is guaranteed: init → then showScene → then play.
  for (let i = 1; i <= 12; i++) {
    if (window.SceneControllers?.[i]?.init) {
      try {
        SceneControllers[i].init();
      } catch (err) {
        console.warn(`[main.js] Scene ${i} init() error:`, err);
      }
    }
  }
  console.log('[main.js] All scene inits complete ✓');

  // 3. Show Scene 1 now that SVGs are in the DOM
  showScene(1);
});


/*
  showScene(n)
  ─────────────
  Hides all scenes, fades in scene N, then calls play().
  Used by jumpToScene() and will be called by the master timeline.
*/
function showScene(n) {
  const scenes = document.querySelectorAll('.scene');

  // Kill any currently running scene timeline cleanly
  if (activeSceneTl) {
    activeSceneTl.kill();
    activeSceneTl = null;
  }

  // Hide all scenes instantly (sets opacity:0, visibility:hidden)
  gsap.set(scenes, { opacity: 0, visibility: 'hidden' });

  // Update dev button highlight
  document.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById('scene-' + n);
  if (!target) {
    console.warn('Scene ' + n + ' not found in DOM');
    return;
  }

  // Reveal the scene, THEN fire play() in the onComplete so the
  // fade-in doesn't fight the GSAP initial states inside play().
  gsap.to(target, {
    opacity: 1,
    visibility: 'visible',
    duration: 0.4,
    ease: 'power2.out',
    onComplete() {
      // Fire this scene's timeline
      if (window.SceneControllers?.[n]?.play) {
        try {
          activeSceneTl = SceneControllers[n].play();
        } catch (err) {
          console.warn(`[main.js] Scene ${n} play() error:`, err);
        }
      }
    }
  });

  // Highlight the active dev button
  const btn = document.querySelectorAll('.dev-btn')[n - 1];
  if (btn) btn.classList.add('active');

  currentScene = n;
}


/*
  jumpToScene(n)
  ─────────────
  Called by the dev control buttons (number keys / on-screen).
  Re-inits the scene so SVG state is reset, then plays it fresh.
*/
function jumpToScene(n) {
  if (masterTimeline) masterTimeline.pause();

  // Re-run init so elements return to their starting GSAP states
  if (window.SceneControllers?.[n]?.init) {
    try {
      SceneControllers[n].init();
    } catch (err) {
      console.warn(`[main.js] Scene ${n} re-init error:`, err);
    }
  }

  showScene(n);
}


/*
  playAll()
  ─────────
  Assembles all 12 scene timelines onto a master timeline and runs them.
  Scene durations are based on the VO timestamps in the brief.
*/
function playAll() {
  if (masterTimeline) {
    masterTimeline.kill();
    masterTimeline = null;
  }

  // Re-init all scenes so every element resets to its start state
  for (let i = 1; i <= 12; i++) {
    if (window.SceneControllers?.[i]?.init) {
      try { SceneControllers[i].init(); } catch (e) { /* skip */ }
    }
  }

  // Scene durations in seconds (derived from VO timestamps in the brief)
  const sceneDurations = [
    0,   // placeholder — scenes are 1-indexed
    38,  // Scene 1:  0:00 – 0:38
    42,  // Scene 2:  0:38 – 1:20
    40,  // Scene 3:  1:20 – 2:00
    40,  // Scene 4:  2:00 – 2:40
    40,  // Scene 5:  2:40 – 3:20
    40,  // Scene 6:  3:20 – 4:00
    25,  // Scene 7:  4:00 – 4:25
    35,  // Scene 8:  4:25 – 5:00
    30,  // Scene 9:  5:00 – 5:30
    35,  // Scene 10: 5:30 – 6:05
    25,  // Scene 11: 6:05 – 6:30
    30,  // Scene 12: 6:30 – 7:00
  ];

  masterTimeline = gsap.timeline({
    onComplete() {
      console.log('[main.js] ▶ Full animation complete ✓');
    }
  });

  let cursor = 0; // running time offset in seconds

  for (let i = 1; i <= 12; i++) {
    const ctrl = window.SceneControllers?.[i];
    if (!ctrl) continue;

    const sceneIndex = i; // capture for closure
    const offset     = cursor;
    const dur        = sceneDurations[i];

    // At this scene's start time: hide all, show this scene, play it
    masterTimeline.call(() => {
      const scenes = document.querySelectorAll('.scene');
      gsap.set(scenes, { opacity: 0, visibility: 'hidden' });

      const target = document.getElementById('scene-' + sceneIndex);
      if (target) gsap.set(target, { opacity: 1, visibility: 'visible' });

      // Highlight dev button
      document.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));
      const btn = document.querySelectorAll('.dev-btn')[sceneIndex - 1];
      if (btn) btn.classList.add('active');

      currentScene = sceneIndex;

      // Play the scene timeline
      if (ctrl.play) {
        try { ctrl.play(); } catch (e) { console.warn(`Scene ${sceneIndex} play error`, e); }
      }
    }, null, offset);

    cursor += dur;
  }

  console.log(`[main.js] ▶ Master timeline built — total duration ~${cursor}s`);
}
