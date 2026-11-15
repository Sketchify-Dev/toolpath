import {
  Composition,
  interpolate,
  staticFile,
  useCurrentFrame,
  Video,
} from 'remotion';
import React from 'react';

// Palette (matches Toolpath app globals.css)
const BG = '#0B1220';
const SURFACE = '#111C2E';
const SURFACE_LIFT = '#17243A';
const TEXT = '#F8FAFC';
const TEXT_DIM = '#CBD5E1';
const MUTED = '#94A3B8';
const ACCENT = '#38BDF8';
const ACCENT_HOVER = '#7DD3FC';
const WARN = '#FBBF24';

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
// 90 seconds at 30 fps
const DURATION_IN_FRAMES = 2700;

const footageSrc = staticFile('footage/page@93b2db2f087f90fe510c9cb7628d2ce9.webm');

const seconds = (s: number) => s;

const scenes = {
  hook: { start: 0, end: seconds(8) }, // 0 - 8
  problem: { start: seconds(8), end: seconds(19) }, // 8 - 19
  intro: { start: seconds(19), end: seconds(29) }, // 19 - 29
  traversal: { start: seconds(29), end: seconds(41) }, // 29 - 41
  demo: { start: seconds(41), end: seconds(64) }, // 41 - 64
  numbers: { start: seconds(64), end: seconds(76) }, // 64 - 76
  honesty: { start: seconds(76), end: seconds(84) }, // 76 - 84
  closing: { start: seconds(84), end: seconds(90) }, // 84 - 90
};

const inScene = (frame: number, scene: (typeof scenes)[keyof typeof scenes]) =>
  frame >= scene.start * FPS && frame < scene.end * FPS;

const progress = (frame: number, scene: (typeof scenes)[keyof typeof scenes]) =>
  (frame - scene.start * FPS) / ((scene.end - scene.start) * FPS);

// ToolpathVideo is defined at the bottom of this file, after all scene components.

// ---------- Scene 01: Hook ----------
const Hook = () => {
  const frame = useCurrentFrame();
  if (!inScene(frame, scenes.hook)) return null;
  const p = progress(frame, scenes.hook);
  const opacity = interpolate(frame, [scenes.hook.start * FPS, scenes.hook.end * FPS], [0, 1]);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, opacity }}>
      <div
        style={{
          fontSize: 96,
          fontFamily: 'Geist',
          color: TEXT,
          textAlign: 'center',
          position: 'absolute',
          top: '40%',
          left: 0,
          width: WIDTH,
          lineHeight: 1.05,
        }}
      >
        Your agent doesn't need 40 tools.
      </div>
      <div
        style={{
          fontSize: 96,
          fontFamily: 'Geist',
          color: ACCENT,
          textAlign: 'center',
          position: 'absolute',
          top: '56%',
          left: 0,
          width: WIDTH,
          lineHeight: 1.05,
          opacity: interpolate(frame, [scenes.hook.start * FPS + 60, scenes.hook.end * FPS], [0, 1]),
        }}
      >
        It needs the right three.
      </div>
    </div>
  );
};

// ---------- Scene 02: Problem ----------
const Problem = () => {
  const frame = useCurrentFrame();
  if (!inScene(frame, scenes.problem)) return null;
  const p = progress(frame, scenes.problem);
  const opacity = interpolate(frame, [scenes.problem.start * FPS, scenes.problem.end * FPS], [0, 1]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, opacity }}>
      <div
        style={{
          fontSize: 56,
          fontFamily: 'Geist',
          color: TEXT,
          textAlign: 'center',
          position: 'absolute',
          top: '18%',
          left: 0,
          width: WIDTH,
        }}
      >
        The baseline preloads the entire tool catalog before the task is even processed.
      </div>
      <div
        style={{
          position: 'absolute',
          top: '34%',
          left: 0,
          width: WIDTH,
          height: '46%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <div style={{ fontSize: 40, fontFamily: 'Geist Mono', color: WARN, fontWeight: 700 }}>
          40 TOOLS
        </div>
        <div style={{ fontSize: 40, fontFamily: 'Geist Mono', color: WARN, fontWeight: 700 }}>
          12,400 ESTIMATED TOKENS
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: '78%',
          left: 0,
          width: WIDTH,
          height: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 120,
              height: 44,
              borderRadius: 8,
              background: SURFACE_LIFT,
              border: `1px solid ${WARN}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontFamily: 'Geist Mono',
              color: MUTED,
              opacity: interpolate(frame, [scenes.problem.start * FPS, scenes.problem.start * FPS + 120], [0, 1]),
            }}
          >
            tool-{i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Scene 03: Intro ----------
const Intro = () => {
  const frame = useCurrentFrame();
  if (!inScene(frame, scenes.intro)) return null;
  const p = progress(frame, scenes.intro);
  const opacity = interpolate(frame, [scenes.intro.start * FPS, scenes.intro.end * FPS], [0, 1]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, opacity }}>
      <div
        style={{
          fontSize: 110,
          fontFamily: 'Geist',
          color: TEXT,
          textAlign: 'center',
          position: 'absolute',
          top: '30%',
          left: 0,
          width: WIDTH,
          lineHeight: 1.02,
        }}
      >
        Traverse, don't preload.
      </div>
      <div
        style={{
          fontSize: 32,
          fontFamily: 'Geist',
          color: ACCENT,
          textAlign: 'center',
          position: 'absolute',
          top: '48%',
          left: 0,
          width: WIDTH,
        }}
      >
        Toolpath · An agent context layer on HydraDB
      </div>
      <div
        style={{
          fontSize: 26,
          fontFamily: 'Geist',
          color: TEXT_DIM,
          textAlign: 'center',
          position: 'absolute',
          top: '56%',
          left: 0,
          width: WIDTH,
        }}
      >
        Task → Capability → Tool
      </div>
    </div>
  );
};

// ---------- Scene 04: Traversal ----------
const Traversal = () => {
  const frame = useCurrentFrame();
  if (!inScene(frame, scenes.traversal)) return null;
  const p = progress(frame, scenes.traversal);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT }}>
      <div
        style={{
          fontSize: 44,
          fontFamily: 'Geist',
          color: TEXT,
          textAlign: 'center',
          position: 'absolute',
          top: '14%',
          left: 0,
          width: WIDTH,
        }}
      >
        Graph traversal selects three tools instead of loading the catalog.
      </div>
      <svg
        style={{ position: 'absolute', top: '30%', left: 0, width: WIDTH, height: '44%' }}
        viewBox="0 0 1920 480"
      >
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0,0 10,3 0,6" fill={ACCENT} />
          </marker>
        </defs>
        {/* Task node */}
        <g>
          <rect x="760" y="140" width="400" height="70" rx="12" fill={SURFACE_LIFT} stroke={ACCENT} strokeWidth="2" />
          <text x="960" y="178" textAnchor="middle" fill={TEXT} fontFamily="Geist" fontSize="20" fontWeight="600">
            "summarize PR #412 and file a follow-up issue"
          </text>
        </g>
        {/* Capabilities layer */}
        <g>
          <text x="300" y="300" textAnchor="middle" fill={TEXT_DIM} fontFamily="Geist" fontSize="18">
            Capabilities
          </text>
          <rect x="140" y="330" width="160" height="56" rx="8" fill={SURFACE_LIFT} stroke="#94A3B8" strokeWidth="1" />
          <text x="220" y="362" textAnchor="middle" fill={TEXT} fontFamily="Geist Mono" fontSize="14">
            repo
          </text>
          <rect x="340" y="330" width="160" height="56" rx="8" fill={SURFACE_LIFT} stroke="#94A3B8" strokeWidth="1" />
          <text x="420" y="362" textAnchor="middle" fill={TEXT} fontFamily="Geist Mono" fontSize="14">
            pr
          </text>
          <rect x="540" y="330" width="160" height="56" rx="8" fill={SURFACE_LIFT} stroke="#94A3B8" strokeWidth="1" />
          <text x="620" y="362" textAnchor="middle" fill={TEXT} fontFamily="Geist Mono" fontSize="14">
            issue
          </text>
          {/* Arrows task -> caps */}
          <line x1="960" y1="210" x2="220" y2="330" stroke={ACCENT} strokeWidth="2" marker-end="url(#arrow)" />
          <line x1="960" y1="210" x2="420" y2="330" stroke={ACCENT} strokeWidth="2" marker-end="url(#arrow)" />
          <line x1="960" y1="210" x2="620" y2="330" stroke={ACCENT} strokeWidth="2" marker-end="url(#arrow)" />
        </g>
        {/* Tools layer */}
        <g>
          <text x="1450" y="300" textAnchor="middle" fill={TEXT_DIM} fontFamily="Geist" fontSize="18">
            Tools
          </text>
          <rect x="1330" y="330" width="160" height="56" rx="8" fill={SURFACE_LIFT} stroke={ACCENT} strokeWidth="2" />
          <text x="1410" y="362" textAnchor="middle" fill={TEXT} fontFamily="Geist Mono" fontSize="14">
            repo_resolve
          </text>
          <rect x="1530" y="330" width="120" height="56" rx="8" fill={SURFACE_LIFT} stroke={ACCENT} strokeWidth="2" />
          <text x="1590" y="362" textAnchor="middle" fill={TEXT} fontFamily="Geist Mono" fontSize="14">
            pr_read
          </text>
          <rect x="1690" y="330" width="140" height="56" rx="8" fill={SURFACE_LIFT} stroke={ACCENT} strokeWidth="2" />
          <text x="1760" y="362" textAnchor="middle" fill={TEXT} fontFamily="Geist Mono" fontSize="14">
            issue_create
          </text>
          {/* Arrows caps -> tools */}
          <line x1="220" y1="386" x2="1410" y2="330" stroke="#94A3B8" strokeWidth="1" marker-end="url(#arrow)" opacity="0.4" />
          <line x1="420" y1="386" x2="1590" y2="330" stroke={ACCENT} strokeWidth="2" marker-end="url(#arrow)" />
          <line x1="620" y1="386" x2="1760" y2="330" stroke={ACCENT} strokeWidth="2" marker-end="url(#arrow)" />
        </g>
        {/* Result stats */}
        <g>
          <text x="960" y="430" textAnchor="middle" fill={WARN} fontFamily="Geist Mono" fontSize="20" fontWeight="700">
            3 CAPABILITIES · 3 TOOLS · 1 TRAVERSAL · 6 HOPS
          </text>
        </g>
      </svg>
    </div>
  );
};

// ---------- Scene 05: Demo (real footage) ----------
const Demo = () => {
  const frame = useCurrentFrame();
  if (!inScene(frame, scenes.demo)) return null;
  const demoStart = scenes.demo.start * FPS;
  const demoFrame = frame - demoStart;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT }}>
      <Video
        src={footageSrc}
        style={{ width: WIDTH, height: HEIGHT, objectFit: 'cover' }}
      />
      <div
        style={{
          fontSize: 22,
          fontFamily: 'Geist Mono',
          color: WARN,
          position: 'absolute',
          bottom: 40,
          left: 40,
          background: 'rgba(11, 18, 32, 0.7)',
          padding: '10px 16px',
          borderRadius: 6,
          border: `1px solid ${WARN}`,
        }}
      >
        Deployed demo - snapshot mode. Recorded run from the seeded graph.
      </div>
    </div>
  );
};

// ---------- Scene 06: Numbers ----------
const Numbers = () => {
  const frame = useCurrentFrame();
  if (!inScene(frame, scenes.numbers)) return null;
  const p = progress(frame, scenes.numbers);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT }}>
      <div
        style={{
          position: 'absolute',
          top: '28%',
          left: 0,
          width: WIDTH,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: 60,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontFamily: 'Geist', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Baseline
          </div>
          <div style={{ fontSize: 110, fontFamily: 'Geist Mono', color: WARN, fontWeight: 700 }}>
            40 tools
          </div>
          <div style={{ fontSize: 56, fontFamily: 'Geist Mono', color: WARN }}>
            12,400 estimated tokens
          </div>
        </div>
        <div
          style={{
            width: 2,
            height: 320,
            background: SURFACE_LIFT,
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontFamily: 'Geist', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Toolpath
          </div>
          <div style={{ fontSize: 110, fontFamily: 'Geist Mono', color: ACCENT, fontWeight: 700 }}>
            3 tools
          </div>
          <div style={{ fontSize: 56, fontFamily: 'Geist Mono', color: ACCENT }}>
            1,800 estimated tokens
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 44,
          fontFamily: 'Geist',
          color: TEXT,
          textAlign: 'center',
          position: 'absolute',
          top: '68%',
          left: 0,
          width: WIDTH,
          opacity: interpolate(frame, [scenes.numbers.start * FPS + 60, scenes.numbers.end * FPS], [0, 1]),
        }}
      >
        ≈85% estimated context token reduction
      </div>
    </div>
  );
};

// ---------- Scene 07: Honesty ----------
const Honesty = () => {
  const frame = useCurrentFrame();
  if (!inScene(frame, scenes.honesty)) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT }}>
      <div
        style={{
          fontSize: 26,
          fontFamily: 'Geist',
          color: TEXT_DIM,
          textAlign: 'center',
          position: 'absolute',
          top: '40%',
          left: 0,
          width: WIDTH,
          lineHeight: 1.5,
        }}
      >
        The public deployment runs in snapshot mode: a recorded run from the seeded graph.
        Token figures are reproducible estimates, not live tokenizer measurements.
      </div>
    </div>
  );
};

// ---------- Scene 08: Closing ----------
const Closing = () => {
  const frame = useCurrentFrame();
  if (!inScene(frame, scenes.closing)) return null;
  const p = progress(frame, scenes.closing);
  const opacity = interpolate(frame, [scenes.closing.start * FPS, scenes.closing.end * FPS], [0, 1]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, opacity }}>
      <div
        style={{
          fontSize: 100,
          fontFamily: 'Geist',
          color: TEXT,
          textAlign: 'center',
          position: 'absolute',
          top: '34%',
          left: 0,
          width: WIDTH,
          lineHeight: 1.02,
        }}
      >
        Traverse, don't preload.
      </div>
      <div
        style={{
          fontSize: 30,
          fontFamily: 'Geist',
          color: ACCENT,
          textAlign: 'center',
          position: 'absolute',
          top: '50%',
          left: 0,
          width: WIDTH,
        }}
      >
        Toolpath · An agent context layer on HydraDB
      </div>
      <div
        style={{
          fontSize: 22,
          fontFamily: 'Geist Mono',
          color: TEXT_DIM,
          textAlign: 'center',
          position: 'absolute',
          top: '62%',
          left: 0,
          width: WIDTH,
          lineHeight: 1.7,
        }}
      >
        toolpath-five.vercel.app{'\n'}github.com/Sketchify-Dev/toolpath
      </div>
    </div>
  );
};

const VideoContent = () => (
  <>
    <Hook />
    <Problem />
    <Intro />
    <Traversal />
    <Demo />
    <Numbers />
    <Honesty />
    <Closing />
  </>
);

export const ToolpathVideo = () => (
  <Composition
    id="ToolpathVideo"
    component={VideoContent}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={DURATION_IN_FRAMES}
    backgroundColor={BG}
  />
);
