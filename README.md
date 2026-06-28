# The Power of the Digital Footprint
## Animated Introduction — Project README

---

### Quick Start

1. Open `index.html` in **Google Chrome** or **Firefox**
2. Use the scene buttons at the bottom to jump to any scene
3. Click **▶ Play All** to run the full animation (available after all scenes are built)

> **No build step required.** This is pure HTML/CSS/JS.
> An internet connection is needed on first load for Google Fonts and GSAP CDN.

---

### Project Structure

```
/digital-footprint/
│
├── index.html              ← Open this in your browser
├── css/
│   └── style.css           ← All styles and design tokens
├── js/
│   ├── main.js             ← Entry point, scene controller
│   ├── scenes.js           ← Each scene's animation code
│   └── animations.js       ← Reusable GSAP helper functions
├── assets/
│   ├── icons/              ← Lucide SVG icons (download separately)
│   ├── svg/                ← Custom scene SVG graphics
│   ├── images/             ← Raster image fallbacks
│   ├── audio/              ← Place your recorded voiceover here
│   └── video/              ← Exported MP4 will go here
└── README.md               ← This file
```

---

### Assets To Download

Before building beyond Step 2, download these free assets:

**Icons (Lucide)** → https://lucide.dev/icons/
Save these as SVG into `assets/icons/`:
- bell.svg, share-2.svg, globe.svg, eye.svg
- download.svg, copy.svg, archive.svg, cloud.svg
- search.svg, briefcase.svg, graduation-cap.svg, trash-2.svg
- smartphone.svg, mouse-pointer-2.svg, cookie.svg, map-pin.svg

**Fonts** — loaded from Google Fonts automatically (internet required)
- Space Grotesk (headings)
- Inter (body)

---

### Voiceover Sync

Once your voiceover is recorded:
1. Place the MP3/WAV file at `assets/audio/voiceover.mp3`
2. In `main.js`, uncomment the audio element section (added in Step 16)
3. The master timeline uses the audio's `currentTime` to sync scenes

---

### Exporting to MP4

**Option A — Browser recording (simplest):**
1. Open Chrome, press F12 → Performance tab
2. Use the built-in screen recorder, or use **OBS Studio** to capture the browser tab
3. Set capture to the exact #app dimensions (405×720 at 2× = 810×1440)

**Option B — Puppeteer script (best quality):**
A `record.js` script will be provided in the final step that uses
headless Chrome to capture each frame and stitch to MP4 via ffmpeg.

---

### Design Tokens (quick reference)

| Token | Value | Use |
|-------|-------|-----|
| `--color-blue` | `#378ADD` | Primary accent |
| `--color-purple` | `#7F77DD` | Secondary accent |
| `--color-teal` | `#1D9E75` | Positive/Scene 8 |
| `--color-amber` | `#EF9F27` | Warnings |
| `--color-red` | `#E24B4A` | Danger/delete |
| `--font-display` | Space Grotesk | Titles, statements |
| `--font-body` | Inter | Labels, UI text |

---

### Build Progress

- [x] Step 1 — Storyboard approved
- [x] Step 2 — index.html + style.css foundation
- [ ] Step 3 — animations.js helper library
- [ ] Step 4 — Scene 1: The Resurfaced Post
- [ ] Step 5 — Scene 2: What Is a Digital Footprint?
- [ ] Step 6 — Scene 3: Active vs Passive
- [ ] Step 7 — Scene 4: Digital Permanence
- [ ] Step 8 — Scene 5: The Ink Drop Metaphor
- [ ] Step 9 — Scene 6: Universities & Employers
- [ ] Step 10 — Scene 7: People Grow & Change
- [ ] Step 11 — Scene 8: Positive Digital Footprint
- [ ] Step 12 — Scene 9: Think Before You Post
- [ ] Step 13 — Scene 10: Technology Is a Tool
- [ ] Step 14 — Scene 11: Every Click Leaves a Mark
- [ ] Step 15 — Scene 12: Transition Into the Film
- [ ] Step 16 — Master timeline + voiceover sync + export
