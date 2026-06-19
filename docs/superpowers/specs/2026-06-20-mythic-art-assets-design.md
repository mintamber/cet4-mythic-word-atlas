# Mythic Art Assets Design

## Goal

Turn CET-4 Mythic Word Atlas into a premium illustrated game experience while preserving text readability, responsive performance, and offline operation. The chosen direction is **B · Collector-edition Art Nouveau mythic storybook**: intricate classical illustration with mature RPG key-art depth, never childish or cyberpunk.

## Asset Scope

The first complete art set contains 21 shipping assets:

- one homepage atlas illustration;
- ten 16:9 realm backgrounds, one for each Day;
- ten square level badges, one for each Day.

Day 1 Greek Oracle Temple background and badge are the approved style anchors. Remaining assets must inherit their deep indigo, moon-white marble, antique-gold ornament, restrained magical glow, painterly realism, and high-detail finish.

## Shared Art Bible

Every scene belongs to the same illustrated universe. Consistency comes from:

- deep navy and muted violet shadows;
- moon-white, ice-blue, sea-green, or fire-amber local accents;
- antique-gold Art Nouveau framing and ornament;
- realistic stone, glass, vellum, metal, water, smoke, snow, and foliage;
- layered cinematic depth and controlled volumetric light;
- mature, intellectual wonder instead of cartoon comedy;
- no readable text, letters, logos, watermarks, neon overload, rainbow gradients, cyberpunk, or modern objects.

Differences between realms come from architecture, weather, local materials, and a single accent family. The global gold/navy material language remains constant.

## Scene Composition

Backgrounds are wide environment illustrations. Major architecture stays around the outer thirds and upper half. The center-lower region remains darker and calmer so glass learning cards remain readable. Scenes may include tiny distant silhouettes or creatures for scale, but no close-up hero character.

The ten realms are:

1. Greek Oracle Temple — marble, olive, prophetic smoke, gold divine light.
2. Moonlit Library — glass dome, floating pages, quill, lunar dust.
3. Nordic Snow Gate — rune arch, ice crystal, snow mountain, aurora.
4. Dragon Trial — monumental stone gate, small distant dragon, rune fire, valley.
5. Mirror Castle — silver candlelight, rose ornament, reflections, glass halls.
6. Arabian Night Market — lamps, tent canopies, spice haze, distant flying carpet.
7. Glass Mountain — translucent peaks, refracted dawn, ice-blue crystal.
8. Mermaid Harbor — tides, shell lamps, sails, sea mist, teal light.
9. Labyrinth of Echoes — ancient maze walls, echo rings, blue flame, carved stone.
10. Starry Academy — orrery, floating star charts, magical classroom, gold runes.

## Badge System

Badges are centered circular medallions on very dark navy. They use engraved antique gold, enamel, marble or local realm material, and one unmistakable central symbol. Silhouettes must remain readable at 48–72 px. They contain no text or numbers.

Symbols:

1. oracle tripod + olive + star;
2. open book + crescent + quill;
3. rune gate + snow crystal + aurora arc;
4. dragon silhouette + gate + flame rune;
5. hand mirror + rose + candle;
6. hanging lamp + tent arch + carpet;
7. faceted mountain + dawn ray;
8. shell lantern + wave + sail;
9. maze spiral + echo ring + blue flame;
10. armillary sphere + star chart + academy arch.

## File Structure and Formats

```text
assets/
  images/
    home/atlas-hero.webp
    scenes/day01-oracle-temple.webp ... day10-starry-academy.webp
    badges/day01-oracle-badge.webp ... day10-academy-badge.webp
    source/  # selected master PNGs retained for future re-export
```

Shipping backgrounds target 1920×1080 or the generated equivalent and use visually high-quality WebP. Badges target 512×512 or larger source resolution and ship as WebP. Homepage art targets a landscape composition with left-side negative space. PNG masters remain separate from files consumed by the app.

Practical targets are under 900 KB per background, under 250 KB per badge, and under 900 KB for homepage art when quality permits. Quality is preferred over an arbitrary hard cap, but excessively large files are recompressed before integration.

## Web Integration

The application may use the new `assets/` directory and no longer claims a single-file runtime. It still has no package install, CDN, API, or server requirement and opens by double-clicking `index.html`.

The homepage uses `atlas-hero.webp` as a decorative illustration with a dark readability veil. Map cards use badges. Scene banners and learning views use the matching realm background through a CSS custom property or data mapping. Existing SVG silhouettes, gradients, Canvas particles, fog, and runes remain as animated overlays so the page still feels alive rather than like static wallpaper.

Images use `loading="lazy"` where applicable, decorative empty alt text where they convey no unique information, and explicit dimensions or aspect ratios to prevent layout shift. CSS supplies the current generated scene as a fallback if an image fails to load.

## Motion Policy

No Remotion or HyperFrames runtime is used; those are video-production systems. No GSAP dependency is added in this phase. Existing CSS keyframes, Canvas, and Web Animations API provide subtle parallax, fog, shimmer, badge hover, and scene crossfade. Motion respects `prefers-reduced-motion`.

## Verification

- all 21 shipping paths exist and are referenced correctly;
- no missing image requests when opened from `file://`;
- homepage, map, and all ten learning scenes show their intended assets;
- overlays preserve readable contrast;
- badges remain legible on desktop and mobile;
- 390×844 layout has no horizontal overflow;
- lazy loading and dimensions avoid layout jump;
- automated tests and console remain clean;
- source and shipping images are not accidentally duplicated in page payloads.
