# Toolpath Demo Video — Production Report

## Project
- **App**: Toolpath (HydraDB Hackathon Track 2) — `/home/sketchify/hydradb`
- **Video workspace**: `/home/sketchify/toolpath-video` (kept separate from the Toolpath repo per brief)
- **Final output**: `export/toolpath-demo-with-subs.mp4` (1920×1080, 30fps, 90s, 2700 frames, ~4MB)
- **Intermediate**: `export/toolpath-demo.mp4` (silent video only), `export/toolpath-demo-final.mp4` (video + audio, no subtitles)

## 8-Scene Structure

| Scene | Time | Frames | Content |
|-------|------|--------|---------|
| Hook | 0–8s | 0–240 | "Your agent doesn't need 40 tools. It needs the right three." |
| Problem | 8–19s | 240–570 | Preloads entire catalog; 40 tools / 12,400 estimated tokens |
| Intro | 19–29s | 570–870 | "Traverse, don't preload." — Toolpath on HydraDB |
| Traversal | 29–41s | 870–1230 | SVG graph: Task → Capabilities → Tools |
| Demo | 41–64s | 1230–1920 | Real deployed demo footage (snapshot mode) |
| Numbers | 64–76s | 1920–2280 | 40 tools / 12,400 tokens vs 3 tools / 1,800 tokens |
| Honesty | 76–84s | 2280–2520 | Snapshot mode disclosure, estimates not live measurements |
| Closing | 84–90s | 2520–2700 | "Traverse, don't preload." + links |

## Technical Stack

- **Remotion 4.0.543** + React 18.3.1 (isolated workspace, 242 packages)
- **ffmpeg** at `/home/sketchify/.local/bin/ffmpeg`
- **Footage**: real Playwright recording (`footage/page@...webm`, 19s, 1920×1080, 25fps), converted via ffmpeg to MP4
- **Palette**: matched to Toolpath app (`#0B1220` bg, `#38BDF8` accent, `#FBBF24` warn)

## Issues Encountered and Fixes

1. **Remotion 4.0 `Composition` API change**: v4.0 requires exactly one of `component` or `lazyComponent` on `<Composition>`; passing children directly throws "You must pass either 'component' or 'lazyComponent'". Fix: wrapped all 8 scene components in a `VideoContent` component and passed it as `component={VideoContent}`.

2. **`Text` and `Spring` not exported in Remotion 4.0**: React #130 "Invalid element type". Fix: replaced all `<Text>` with `<div>` (same explicit styles), removed `Text`/`Spring`/`StyleProps` from imports.

3. **Scene timing bug**: `seconds(n)` was defined as `n / FPS`, treating second-values as frames. Fix: made it identity (`const seconds = (s) => s`).

4. **`interpolate` input range not monotonic**: `scenes.hook.start * FPS + 60` = 60 but `scenes.hook.end * FPS` = 8 (due to bug #3). Fixed by bug #3 fix.

5. **Video asset 404**: relative `../footage/` path not served by Remotion dev server. Fix: copied footage to `public/footage/` and used `staticFile()` from Remotion.

## Known Limitations

- **HTML entities**: Replaced with literal Unicode characters (`·`, `→`, `≈`, `'`). Em dashes avoided per project constraint (used plain hyphen instead).
- **Snapshot mode**: The deployed demo uses a recorded snapshot, not live HydraDB traversal. Token figures (300/tool, 200/entity, 100/round-trip) are reproducible estimates, not live tokenizer measurements. Entity reuse is in-session only.

## Deliverables

## Audio Generation Scripts

| Script | Purpose |
|--------|---------|
| `scripts/generate-voiceover.py` | Generates 8 voiceover segments via edge-tts |
| `scripts/mix-audio.sh` | Generates soundtrack + SFX, mixes all audio, burns subtitles |

## Audio & Subtitles (Final)

**No AI voiceover** — per user request, narration audio was removed. The soundtrack + SFX mix carries the audio.

**Soundtrack**: Minimal electronic ambient drone — 110 Hz + 220 Hz + 330 Hz sine waves mixed, low-pass filtered at 900 Hz, with echo, at 30% volume. Generated with ffmpeg `sine` + `amix` + `lowpass` + `aecho`.

**SFX**: Subtle whoosh sweeps at each scene transition (8s, 19s, 29s, 41s, 64s, 76s, 84s) + soft click at demo start (~42s). Generated with ffmpeg `sine` + volume/fade envelopes.

**Subtitles**: Burned into video using ffmpeg `ass` filter from `scripts/subtitles-pro.ass`, professional lower-third styling — 26pt Geist font, white text, semi-transparent dark background box, bottom center (MarginV=60), does NOT fill the screen.

**Mix**: All 9 audio sources (1 soundtrack + 8 SFX) combined with `amix=inputs=9:duration=longest`, downmixed to stereo with `pan=stereo`, encoded as AAC 192kbps.

| File | Status |
|------|--------|
| `export/toolpath-demo-final.mp4` | Complete — video + soundtrack + SFX + professional subtitles |
| `export/toolpath-demo-no-voice.mp4` | Video + audio, no subtitles (intermediate) |
| `export/toolpath-demo.mp4` | Silent video only (Remotion render) |
| `src/ToolpathVideo.tsx` | Complete, 8-scene composition |
| `src/index.ts` | Remotion entry with `registerRoot` |
| `scripts/voiceover-script.md` | Voiceover script (from brief, unused — no AI voiceover) |
| `scripts/subtitles.srt` | SRT subtitles (from brief, converted to ASS) |
| `scripts/subtitles-pro.ass` | Professional ASS subtitle file (burned into video) |
| `scripts/production-report.md` | This document |
| `public/footage/page@...webm` | Real demo footage |

## Remaining Items

- Commit/push video work to the Toolpath repo only with explicit approval (per brief constraint).
- Review rendered frames for visual QA before finalizing.