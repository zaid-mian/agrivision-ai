import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';
import { composeFilm } from '../../demo-studio/skills/film-demo/scripts/compose.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const renderDir = join(__dirname, 'renders', '001');

console.log('[finish-compose] Composing zoomed video with styled frame for render 001...');
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
  minFps: 10,
  speedupConfig: {
    idleGapMin: 9999, // protect intentional narration holds
    toolWaitMax: 4,
    preToolWaitMax: 2.5,
    tailHold: 3
  }
});
console.log(`[finish-compose] Composed silent video -> ${silentOut}`);

// FFmpeg merge: silent video + narration audio + subtitle overlay with high quality
console.log('[finish-compose] Merging voiceover narration and burning captions...');
const audioPath = join(__dirname, 'narration.mp3');
const subtitlesPath = join(__dirname, 'captions.srt');
const finalDeliverable = join(__dirname, 'demo.mp4');

// Escape subtitle path for Windows ffmpeg filter
const escapedSubtitles = subtitlesPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '$1\\\\:');

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
  console.warn('[finish-compose] Subtitle burn-in warning:', mergeRes.stderr);
  console.log('[finish-compose] Retrying audio mux without subtitle filter...');
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
    console.error('[finish-compose] Audio mux failed:', fbRes.stderr);
    process.exit(1);
  }
}

console.log(`[finish-compose] DELIVERABLE READY: ${finalDeliverable}`);
