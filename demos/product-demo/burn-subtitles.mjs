import { spawnSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ffmpegArgs = [
  '-y',
  '-i', 'no-sound.mp4',
  '-i', 'narration.mp3',
  '-vf', "subtitles=captions.srt:force_style='Fontname=Arial,Fontsize=18,PrimaryColour=&H00FFFFFF,OutlineColour=&H90000000,BackColour=&H80000000,BorderStyle=4,Outline=1,Shadow=0,MarginV=36'",
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '19',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-shortest',
  'demo.mp4'
];

console.log('Running ffmpeg subtitle burn-in with relative path...');
const res = spawnSync('ffmpeg', ffmpegArgs, { cwd: __dirname, encoding: 'utf8' });
if (res.status !== 0) {
  console.error('Burn failed:', res.stderr);
  process.exit(1);
}
console.log('Burn succeeded! demo.mp4 now has burned-in subtitles and synchronized narration.');
