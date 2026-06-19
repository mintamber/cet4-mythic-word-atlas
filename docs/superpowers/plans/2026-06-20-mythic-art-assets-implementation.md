# Mythic Art Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate, optimize, organize, and integrate one homepage illustration, ten illustrated realm backgrounds, and ten matching level badges in the approved Art Nouveau mythic storybook style.

**Architecture:** Keep image generation and optimization isolated from the active vocabulary-feature branch. Store selected PNG masters under `assets/images/source/`, optimized WebP files under stable shipping paths, validate them with an asset manifest test, then integrate after the TTS/collocation branch reaches main so `index.html` is edited once against the latest application.

**Tech Stack:** Built-in ImageGen, local image conversion tooling, HTML/CSS/Vanilla JS, Node.js verification scripts.

---

### Task 1: Establish asset manifest and failing contract

**Files:**
- Create: `assets/images/manifest.json`
- Create: `tests/verify-art-assets.mjs`

- [ ] **Step 1: Write the manifest**

Define 21 entries with stable IDs, scene/day metadata, source PNG path, shipping WebP path, and role (`home`, `scene`, or `badge`). Include `day01-oracle-temple` and `day01-oracle-badge` through `day10-starry-academy` and `day10-academy-badge`.

- [ ] **Step 2: Write the failing verifier**

The test must assert 21 unique entries, one home/ten scene/ten badge roles, every file exists, scene raster aspect ratio is landscape, badges are square, each shipping file is WebP, dimensions are at least 1600×900 for scenes and 512×512 for badges, and no shipping file is empty.

- [ ] **Step 3: Run RED**

```bash
node tests/verify-art-assets.mjs
```

Expected: FAIL on the first missing generated asset.

- [ ] **Step 4: Commit contract**

```bash
git add assets/images/manifest.json tests/verify-art-assets.mjs
git commit -m "test: define mythic art asset manifest"
```

### Task 2: Generate and optimize the 21-asset art set

**Files:**
- Create: `assets/images/source/*.png`
- Create: `assets/images/home/atlas-hero.webp`
- Create: `assets/images/scenes/*.webp`
- Create: `assets/images/badges/*.webp`

- [ ] **Step 1: Save approved Day 1 anchors**

Copy the selected Greek Oracle Temple background and badge from the built-in ImageGen output directory into their manifest source paths without deleting originals.

- [ ] **Step 2: Generate the homepage atlas illustration**

Use the Day 1 background as strict style/palette/material reference. Compose the celestial atlas on the right with negative space on the left, no readable page text, logos, or close-up character.

- [ ] **Step 3: Generate Days 2–10 backgrounds**

Issue one ImageGen request per scene using the shared Art Bible and scene-specific motifs. Use the Day 1 anchor as style reference. Preserve center-lower UI calm space and landscape composition.

- [ ] **Step 4: Generate Days 2–10 badges**

Issue one ImageGen request per badge using the approved Day 1 badge as style reference. Preserve the circular medallion system, small-size silhouette, no text, and each scene’s symbol.

- [ ] **Step 5: Inspect each selected output**

Reject any asset with readable text, watermarks, extra modern objects, childish rendering, neon/rainbow/cyberpunk drift, wrong scene motifs, unusable UI contrast, or a badge silhouette that collapses at small size. Regenerate only the failing asset with one targeted prompt correction.

- [ ] **Step 6: Convert masters to shipping WebP**

Use an installed image converter, retain aspect ratio, and choose high visual quality. Do not upscale beyond the source. Keep source PNGs and shipping WebPs in separate folders.

- [ ] **Step 7: Run asset contract GREEN**

```bash
node tests/verify-art-assets.mjs
```

Expected: PASS with 21 assets, correct roles, formats, dimensions, and aspect ratios.

- [ ] **Step 8: Commit generated asset set**

```bash
git add assets/images
git commit -m "feat: add illustrated mythic realm asset set"
```

### Task 3: Integrate art into the latest application

**Files:**
- Modify: `index.html`
- Modify: `tests/verify-art-assets.mjs`

- [ ] **Step 1: Update branch base after vocabulary merge**

Merge or rebase from the latest `main` only after TTS/collocation work has landed. Resolve no asset files by replacement; preserve the latest application script and data.

- [ ] **Step 2: Add manifest-equivalent scene mapping**

Extend scene metadata with `background` and `badge` paths. Add the homepage image path in one configuration constant. Paths must remain relative so `file://` double-click works.

- [ ] **Step 3: Integrate homepage, map badges, and scene backgrounds**

Render the homepage illustration decoratively; render map badges with explicit dimensions and lazy loading; set realm backgrounds through CSS custom properties. Retain SVG/Canvas/fog/light layers as motion overlays and add dark readability veils.

- [ ] **Step 4: Add image failure fallback**

If an `<img>` fails, hide only that decorative image. CSS gradients and scene SVG remain visible. A missing background must not make text unreadable.

- [ ] **Step 5: Extend integration tests**

Assert all manifest shipping paths occur in `index.html`, ten scenes map to unique scene/background/badge combinations, lazy decorative images have dimensions and empty alt text, and no Base64 duplicate of shipping images is embedded.

- [ ] **Step 6: Commit integration**

```bash
git add index.html tests/verify-art-assets.mjs
git commit -m "feat: integrate illustrated realm artwork"
```

### Task 4: Browser and performance verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run complete automated verification**

Run art, corpus, TTS/collocation, UI, inline-parse, and `git diff --check` tests from the latest integrated branch.

- [ ] **Step 2: Browser-test from local server and file URL**

Verify homepage, map, all ten learning scenes, failed-image fallback, console, and localStorage. Test desktop and 390×844 mobile with no horizontal overflow.

- [ ] **Step 3: Review visual contrast and motion**

Check that no background competes with headwords, meanings, examples, or buttons; badge labels remain readable; reduced-motion keeps a stable composition.

- [ ] **Step 4: Document assets and runtime**

Update README to state that `assets/` is required beside `index.html`, no server/build/API is required at runtime, and PNG masters are editing sources rather than page payloads.

- [ ] **Step 5: Commit documentation**

```bash
git add README.md
git commit -m "docs: explain illustrated asset runtime"
```
