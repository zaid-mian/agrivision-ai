/**
 * AgriVision AI — Complete 2-minute product demo film recording.
 * Uses demo-studio engine: zone zooms, smooth cursor, styled macos-dark frame.
 */
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, readdirSync, existsSync } from 'fs';
import { chromium } from '../../demo-studio/node_modules/playwright/index.mjs';
import { createTimeline } from '../../demo-studio/skills/film-demo/scripts/timeline.mjs';
import { createFilmContext, prepareFilmPage, startFilmRecording, finishFilmRecording } from '../../demo-studio/skills/film-demo/scripts/record.mjs';
import { click, type, open, focus, wide, settle } from '../../demo-studio/skills/film-demo/scripts/actions.mjs';
import { pause } from '../../demo-studio/skills/film-demo/scripts/motion.mjs';
import { composeFilm } from '../../demo-studio/skills/film-demo/scripts/compose.mjs';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rendersDir = join(__dirname, 'renders');
mkdirSync(rendersDir, { recursive: true });
const nextNum = readdirSync(rendersDir)
  .filter((d) => /^\d+$/.test(d))
  .map(Number)
  .reduce((a, b) => Math.max(a, b), 0) + 1;
const renderDir = join(rendersDir, String(nextNum).padStart(3, '0'));
mkdirSync(renderDir, { recursive: true });
console.log(`[agrivision-demo] render -> ${renderDir}`);

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
});

const context = await createFilmContext(browser, renderDir, {
  viewport: { width: 1920, height: 1080 }
});
const page = await context.newPage();
await prepareFilmPage(page, { scale: 1.5, color: '#1A3A2B' });

// Preload the login page off-camera to eliminate any cold-start latency
console.log('[agrivision-demo] Preloading application off-camera...');
await page.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle' });
await settle(page);

// Start recording session
const timeline = createTimeline();
const recorder = await startFilmRecording(page, renderDir, timeline);
open(timeline, 'agrivision-login-ready');
console.log('[agrivision-demo] Recording started!');

// =========================================================================
// ACT 1: Hook, Platform Mission & Demo Login (0.0s - 18.5s)
// =========================================================================
console.log('[agrivision-demo] Act 1: Login & Intro...');
await wide(page, timeline, 'login-hero-wide');
await pause(6500); // Cue 1: destruction of yields (0.1 - 7.7s)

const demoBtn = page.locator('button:has-text("Explore Live Demo as Model Farmer")');
await focus(page, timeline, demoBtn, 'demo-login-btn');
await pause(2500); // Cue 2: AgriVision bridges gap (7.7 - 11.2s)

await click(page, timeline, demoBtn, 'click-demo-login', {
  expect: page.locator('text=ecological diagnostics'),
  expectTimeout: 12000
});
await settle(page);
await pause(7000); // Cue 3: enterprise-grade platform (11.2 - 18.9s)

// =========================================================================
// ACT 2: Farm Command Center Telemetry (18.5s - 34.5s)
// =========================================================================
console.log('[agrivision-demo] Act 2: Command Center Dashboard...');
await wide(page, timeline, 'dashboard-hero-wide');
await pause(3000); // Cue 4: verified model farmer loads (18.9 - 25.0s)

const healthGauge = page.locator('text=Crop Health Score').locator('..').locator('..');
await focus(page, timeline, healthGauge, 'crop-health-gauge');
await pause(4500);

await wide(page, timeline, 'dashboard-recent-telemetry');
await pause(7500); // Cue 5: track active field health index (25.0 - 35.0s)

// =========================================================================
// ACT 3: Deep Learning Disease Scanner Workflow (34.5s - 63.3s)
// =========================================================================
console.log('[agrivision-demo] Act 3: Disease Detection Workflow...');
const diseaseNav = page.locator('aside a[href="#/disease"]');
await click(page, timeline, diseaseNav, 'nav-to-disease-scanner', {
  expect: page.locator('text=Crop Disease Detection'),
  expectTimeout: 10000
});
await settle(page);
await wide(page, timeline, 'disease-scanner-view');
await pause(2500); // Cue 6: diagnosis workflow in action (35.0 - 38.7s)

const leafImagePath = resolve('app/uploads/leaf-1781288230956-797817476.jpg');
await page.locator('input[type="file"]').setInputFiles(leafImagePath);
const analyzeBtn = page.locator('button:has-text("Analyze Health")');
await analyzeBtn.waitFor({ state: 'visible', timeout: 15000 });
await focus(page, timeline, analyzeBtn, 'analyze-health-btn');
await pause(2000); // Cue 7: upload leaf specimen (38.7 - 44.4s)

await click(page, timeline, analyzeBtn, 'trigger-neural-inference', {
  expect: page.locator('text=Tomato Late Blight'),
  expectTimeout: 25000
});
await settle(page);
console.log('[agrivision-demo] Inference finished! Showing results...');

await wide(page, timeline, 'results-revealed-wide');
await pause(1000);

const resultHeader = page.locator('text=Tomato Late Blight').first().locator('..').locator('..');
await resultHeader.waitFor({ state: 'visible', timeout: 10000 });
await focus(page, timeline, resultHeader, 'diagnostic-result-badge');
await pause(7500); // Cue 8: MobileNetV3 runs locally in under 50ms (44.4 - 54.3s)

const topPredictions = page.locator('text=Neural Class Probabilities').first().locator('..');
await topPredictions.waitFor({ state: 'visible', timeout: 10000 });
await focus(page, timeline, topPredictions, 'top3-probabilities-ranking');
await pause(8000); // Cue 9: 88% confidence top-3 breakdown (54.3 - 63.3s)

// =========================================================================
// ACT 4: Explainable AI — Attention Lesion Heatmap (63.3s - 83.2s)
// =========================================================================
console.log('[agrivision-demo] Act 4: Explainable AI Attention Heatmap...');
const attentionMapBtn = page.locator('button:has-text("AI Attention Map")');
await attentionMapBtn.waitFor({ state: 'visible', timeout: 15000 });
await focus(page, timeline, attentionMapBtn, 'attention-heatmap-toggle');
await pause(3500); // Cue 10: explainable diagnostics (63.3 - 69.3s)

await click(page, timeline, attentionMapBtn, 'toggle-attention-map', {
  expect: page.locator('button:has-text("Original")').first(),
  expectTimeout: 10000
});
await pause(8000); // Cue 11: visual verification of necrotic lesions (69.3 - 77.6s)

await wide(page, timeline, 'treatment-regimens-overview');
await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
await pause(6500); // Cue 12: actionable chemical & organic regimens (77.6 - 83.2s)

// =========================================================================
// ACT 5: Bilingual Semantic RAG Knowledge Assistant (83.2s - 102.9s)
// =========================================================================
console.log('[agrivision-demo] Act 5: Bilingual Semantic RAG Assistant...');
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
const assistantNav = page.locator('aside a[href="#/assistant"]');
await click(page, timeline, assistantNav, 'nav-to-rag-assistant', {
  expect: page.locator('input[type="text"]').first(),
  expectTimeout: 10000
});
await settle(page);
await pause(2000); // Cue 13: bilingual semantic RAG assistant (83.2 - 90.4s)

const chatInput = page.locator('input[type="text"]').first();
await chatInput.waitFor({ state: 'visible', timeout: 10000 });
await focus(page, timeline, chatInput, 'rag-chat-input');
await type(page, timeline, chatInput, 'What is the recommended fungicide treatment for Tomato Late Blight during wet weather?', 'type-fungicide-query');

const sendBtn = page.locator('button[type="submit"]').first();
await sendBtn.waitFor({ state: 'visible', timeout: 10000 });
await click(page, timeline, sendBtn, 'send-rag-query', {
  expect: page.locator('text=BM25 Retrieval').first(),
  expectTimeout: 15000
});
await settle(page);
console.log('[agrivision-demo] BM25 RAG query answered!');

const botMsg = page.locator('text=BM25 Retrieval').first().locator('..').locator('..').locator('..');
await botMsg.waitFor({ state: 'visible', timeout: 10000 });
await focus(page, timeline, botMsg, 'rag-answer-citations');
await pause(9500); // Cue 14: 3ms BM25 retrieval, handbook citations (90.4 - 102.9s)

// =========================================================================
// ACT 6: Audit Reports & Grand Payoff (102.9s - 121.5s)
// =========================================================================
console.log('[agrivision-demo] Act 6: Reports & Grand Payoff...');
const reportsNav = page.locator('aside a[href="#/reports"]');
await click(page, timeline, reportsNav, 'nav-to-reports', {
  expect: page.locator('text=Farm Performance Reports').first(),
  expectTimeout: 10000
});
await settle(page);

const reportsTable = page.locator('text=Recent Diagnosis Records').first().locator('..').locator('..');
await reportsTable.waitFor({ state: 'visible', timeout: 10000 });
await focus(page, timeline, reportsTable, 'certified-diagnostics-report');
await pause(7500); // Cue 15: audit-ready diagnostic report & certificate (102.9 - 114.0s)

await wide(page, timeline, 'grand-closing-payoff');
await pause(7000); // Cue 16: closing payoff (114.0 - 120.5s)

// Dump timeline and finish recording
console.log('[agrivision-demo] Finishing recording session...');
timeline.dump(join(renderDir, 'timeline.json'));
const { ok, capturedFps, frameCount } = await finishFilmRecording(context, page, renderDir, recorder);
await browser.close();

if (!ok) {
  console.error('[agrivision-demo] Recording assembly failed: raw.mp4 not produced');
  process.exit(1);
}
console.log(`[agrivision-demo] Recording successful: ${frameCount} frames at ${capturedFps} fps`);

// =========================================================================
// COMPOSE: Smart Zooms + Rice Terraces Frame (macos-dark)
// =========================================================================
console.log('[agrivision-demo] Composing zoomed video with styled frame...');
const silentOut = join(__dirname, 'no-sound.mp4');
await composeFilm(renderDir, {
  preset: 'macos-dark',
  wallpaper: 'photo-rice-terraces',
  wallpaperDim: 0.35,
  radius: 16,
  titlebarHeight: 38,
  trafficLights: true,
  out: silentOut,
  fps: 30,
  speedupConfig: {
    idleGapMin: 9999, // protect intentional narration holds
    toolWaitMax: 4,
    preToolWaitMax: 2.5,
    tailHold: 3
  }
});
console.log(`[agrivision-demo] Composed silent video -> ${silentOut}`);

// =========================================================================
// SYNC: Audio Narration + Burned Subtitles -> demo.mp4
// =========================================================================
console.log('[agrivision-demo] Merging voiceover narration and burning captions...');
const audioPath = join(__dirname, 'narration.mp3');
const subtitlesPath = join(__dirname, 'captions.srt');
const finalDeliverable = join(__dirname, 'demo.mp4');

// Escape subtitle path for Windows ffmpeg filter
const escapedSubtitles = subtitlesPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '$1\\\\:');

// FFmpeg merge: silent video + narration audio + subtitle overlay with high quality
const ffmpegArgs = [
  '-y',
  '-i', silentOut,
  '-i', audioPath,
  '-filter_complex',
  `[0:v]subtitles='${escapedSubtitles}':force_style='Fontname=Arial,Fontsize=17,PrimaryColour=&H00FFFFFF,OutlineColour=&H90000000,BackColour=&H80000000,BorderStyle=4,Outline=1,Shadow=0,MarginV=35'[v]`,
  '-map', '[v]',
  '-map', '1:a',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '19',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-shortest',
  finalDeliverable
];

const mergeRes = spawnSync('ffmpeg', ffmpegArgs, { encoding: 'utf8' });
if (mergeRes.status !== 0) {
  console.error('[agrivision-demo] Subtitle burn-in warning:', mergeRes.stderr);
  // Fallback to simple audio mux if subtitle filter fails
  console.log('[agrivision-demo] Retrying audio mux without subtitle filter...');
  const fallbackArgs = [
    '-y',
    '-i', silentOut,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    finalDeliverable
  ];
  const fbRes = spawnSync('ffmpeg', fallbackArgs, { encoding: 'utf8' });
  if (fbRes.status !== 0) {
    console.error('[agrivision-demo] Audio mux failed:', fbRes.stderr);
    process.exit(1);
  }
}

console.log(`[agrivision-demo] PRODUCTION COMPLETE! Final deliverable saved to: ${finalDeliverable}`);
