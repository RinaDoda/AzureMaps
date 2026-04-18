import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  if (!self.crossOriginIsolated) {
    throw new Error(
      'SharedArrayBuffer is not available. Please reload the page — the service worker needs one extra load to activate.',
    );
  }

  ffmpeg = new FFmpeg();
  if (onLog) ffmpeg.on('log', ({ message }) => onLog(message));

  const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  return ffmpeg;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = reject;
    video.src = url;
  });
}

export async function assembleVideo(
  clips: File[],
  voiceover: Blob,
  backgroundMusic: File | null,
  onProgress: (msg: string) => void,
): Promise<Blob> {
  onProgress('⏳ Loading FFmpeg (first time takes ~30s)...');
  const ff = await getFFmpeg((msg) => {
    if (msg.includes('time=')) onProgress(`🎬 ${msg.slice(0, 60)}`);
  });

  onProgress('📐 Measuring clip durations...');
  const durations = await Promise.all(clips.map(getVideoDuration));

  onProgress('📂 Loading files into FFmpeg...');
  for (let i = 0; i < clips.length; i++) {
    await ff.writeFile(`clip${i}.mp4`, await fetchFile(clips[i]));
  }
  await ff.writeFile('voiceover.mp3', await fetchFile(voiceover));
  if (backgroundMusic) {
    await ff.writeFile('music.mp3', await fetchFile(backgroundMusic));
  }

  onProgress('🎬 Building filter graph...');

  // Build xfade filter for 6 clips with 1s crossfade
  const CROSS = 1;
  const FADE_IN = 2;
  const FADE_OUT = 3;

  // Scale all clips to 1920x1080 first
  const scaleFilters = clips.map(
    (_, i) =>
      `[${i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,` +
      `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=25,setsar=1[sv${i}]`,
  );

  // Chain xfade
  let xfadeChain = '';
  let prev = 'sv0';
  let offset = durations[0] - CROSS;
  for (let i = 1; i < clips.length; i++) {
    const next = i === clips.length - 1 ? 'xv' : `xv${i}`;
    xfadeChain += `[${prev}][sv${i}]xfade=transition=fade:duration=${CROSS}:offset=${offset.toFixed(3)}[${next}];`;
    offset += durations[i] - CROSS;
    prev = next;
  }

  const totalDuration = durations.reduce((a, b) => a + b, 0) - CROSS * (clips.length - 1);
  const fadeOutStart = (totalDuration - FADE_OUT).toFixed(3);

  const videoFade =
    `[xv]fade=t=in:st=0:d=${FADE_IN},fade=t=out:st=${fadeOutStart}:d=${FADE_OUT}[vout]`;

  let audioFilter: string;
  if (backgroundMusic) {
    audioFilter =
      `[${clips.length}:a]volume=1.0,afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${fadeOutStart}:d=${FADE_OUT}[voice];` +
      `[${clips.length + 1}:a]volume=0.15,aloop=loop=-1:size=2e+09,atrim=duration=${totalDuration.toFixed(3)}[bgm];` +
      `[voice][bgm]amix=inputs=2:duration=first[aout]`;
  } else {
    audioFilter =
      `[${clips.length}:a]volume=1.0,afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${fadeOutStart}:d=${FADE_OUT}[aout]`;
  }

  const filterComplex = [
    ...scaleFilters,
    xfadeChain.replace(/;$/, ''),
    videoFade,
    audioFilter,
  ].join(';');

  // Build input args
  const inputs: string[] = [];
  for (let i = 0; i < clips.length; i++) inputs.push('-i', `clip${i}.mp4`);
  inputs.push('-i', 'voiceover.mp3');
  if (backgroundMusic) inputs.push('-i', 'music.mp3');

  onProgress('⚙️ Assembling video (this takes a few minutes)...');

  await ff.exec([
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', '[vout]',
    '-map', '[aout]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    'output.mp4',
  ]);

  onProgress('📦 Packaging final video...');
  const data = await ff.readFile('output.mp4');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Blob([data as any], { type: 'video/mp4' });
}
