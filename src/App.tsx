import { useState } from 'react';
import type { StoryData, AppStage, ClipStatus } from './types';
import { generateStoryData } from './generate';
import { generateVoiceover } from './elevenlabs';
import { submitKlingVideo, pollKlingVideo, fetchVideoBlob } from './kling';
import { assembleVideo } from './ffmpeg-assembly';
import { generateThumbnail } from './thumbnail';
import StoryForm from './components/StoryForm';
import SceneCards from './components/SceneCards';
import KlingProgress from './components/KlingProgress';
import DownloadSection from './components/DownloadSection';

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  top: ((i * 137.5) % 100).toFixed(2),
  left: ((i * 97.3) % 100).toFixed(2),
  size: ((i % 3) + 1),
  opacity: (0.2 + (i % 5) * 0.12).toFixed(2),
  dur: (2.5 + (i % 4) * 0.8).toFixed(1),
  delay: ((i % 7) * 0.4).toFixed(1),
}));

export default function App() {
  const [anthropicKey, setAnthropicKey] = useState(() => sessionStorage.getItem('anthropic_key') ?? '');
  const [elevenLabsKey, setElevenLabsKey] = useState(() => sessionStorage.getItem('elevenlabs_key') ?? '');
  const [klingAccessKey, setKlingAccessKey] = useState(() => sessionStorage.getItem('kling_access') ?? '');
  const [klingSecretKey, setKlingSecretKey] = useState(() => sessionStorage.getItem('kling_secret') ?? '');
  const [storyTitle, setStoryTitle] = useState('');
  const [characters, setCharacters] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  const [stage, setStage] = useState<AppStage>('form');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [voiceoverURL, setVoiceoverURL] = useState<string | null>(null);
  const [voiceoverDone, setVoiceoverDone] = useState(false);
  const [clipStatuses, setClipStatuses] = useState<ClipStatus[]>(Array(6).fill('pending'));
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [thumbnailURL, setThumbnailURL] = useState<string | null>(null);
  const [submittedTitle, setSubmittedTitle] = useState('');

  const makeKeySetter = (setter: (v: string) => void, storageKey: string) => (v: string) => {
    setter(v); sessionStorage.setItem(storageKey, v);
  };

  const setClipStatus = (i: number, s: ClipStatus) =>
    setClipStatuses((prev) => { const next = [...prev]; next[i] = s; return next; });

  const handleGenerate = async () => {
    setError(null);
    setStoryData(null);
    setVoiceoverURL(null);
    setVoiceoverDone(false);
    setVideoURL(null);
    setThumbnailURL(null);
    setClipStatuses(Array(6).fill('pending'));
    setSubmittedTitle(storyTitle);
    setStage('generating-script');
    setProgress('✍️ Writing your bedtime story with Claude...');

    try {
      const data = await generateStoryData(anthropicKey, storyTitle, characters, setProgress);
      setStoryData(data);
      setStage('generating-assets');

      const voiceoverPromise = generateVoiceover(elevenLabsKey, data.fullNarration).then((blob) => {
        setVoiceoverURL(URL.createObjectURL(blob));
        setVoiceoverDone(true);
        return blob;
      });

      const clipPromises = data.scenes.map(async (scene, i) => {
        setClipStatus(i, 'submitting');
        const taskId = await submitKlingVideo(klingAccessKey, klingSecretKey, scene.klingPrompt);
        setClipStatus(i, 'generating');
        const videoUrl = await pollKlingVideo(klingAccessKey, klingSecretKey, taskId);
        setClipStatus(i, 'downloading');
        const blob = await fetchVideoBlob(videoUrl);
        setClipStatus(i, 'done');
        return blob;
      });

      const [voiceoverBlob, ...clipBlobs] = await Promise.all([voiceoverPromise, ...clipPromises]);

      setStage('assembling');
      setProgress('⚙️ Loading FFmpeg and assembling your video...');

      const clipFiles = clipBlobs.map((b, i) =>
        new File([b], `clip${i + 1}.mp4`, { type: 'video/mp4' }),
      );

      const finalBlob = await assembleVideo(clipFiles, voiceoverBlob, backgroundMusic, setProgress);
      setVideoURL(URL.createObjectURL(finalBlob));
      setThumbnailURL(generateThumbnail(storyTitle));
      setStage('complete');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
      setStage('form');
      setProgress('');
    }
  };

  const isLoading = stage !== 'form' && stage !== 'complete';

  return (
    <>
      <div className="star-field" aria-hidden="true">
        {STARS.map((s) => (
          <div key={s.id} className="star" style={{
            top: `${s.top}%`, left: `${s.left}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            '--op': s.opacity, '--dur': `${s.dur}s`, '--delay': `${s.delay}s`,
          } as React.CSSProperties} />
        ))}
      </div>

      <div className="app-wrapper">
        <header className="app-header">
          <span className="header-moon">🌙</span>
          <h1>Bedtime Story Video Generator</h1>
          <p>Script · Voiceover · Kling Videos · Assembly · Thumbnail — fully automated</p>
        </header>

        <StoryForm
          anthropicKey={anthropicKey}
          elevenLabsKey={elevenLabsKey}
          klingAccessKey={klingAccessKey}
          klingSecretKey={klingSecretKey}
          storyTitle={storyTitle}
          characters={characters}
          backgroundMusic={backgroundMusic}
          loading={isLoading}
          onAnthropicKeyChange={makeKeySetter(setAnthropicKey, 'anthropic_key')}
          onElevenLabsKeyChange={makeKeySetter(setElevenLabsKey, 'elevenlabs_key')}
          onKlingAccessKeyChange={makeKeySetter(setKlingAccessKey, 'kling_access')}
          onKlingSecretKeyChange={makeKeySetter(setKlingSecretKey, 'kling_secret')}
          onTitleChange={setStoryTitle}
          onCharactersChange={setCharacters}
          onMusicChange={setBackgroundMusic}
          onGenerate={handleGenerate}
        />

        {stage === 'generating-script' && (
          <div className="card loading-card">
            <div className="loading-moon-wrap"><div className="loading-moon">🌙</div></div>
            <div className="loading-dots"><span /><span /><span /></div>
            <p className="loading-message">{progress}</p>
            <p className="loading-subtitle">Claude is writing your 6-scene story — ~30s</p>
          </div>
        )}

        {stage === 'assembling' && (
          <div className="card loading-card">
            <div className="loading-moon-wrap"><div className="loading-moon">🎬</div></div>
            <div className="loading-dots"><span /><span /><span /></div>
            <p className="loading-message">{progress}</p>
            <p className="loading-subtitle">FFmpeg assembling your 1080p video in the browser — keep this tab open</p>
          </div>
        )}

        {error && (
          <div className="card error-card">
            <h3>Generation failed</h3>
            <p>{error}</p>
          </div>
        )}

        {storyData && stage === 'generating-assets' && (
          <KlingProgress statuses={clipStatuses} voiceoverDone={voiceoverDone} />
        )}

        {storyData && (stage === 'complete' || stage === 'assembling') && (
          <SceneCards
            scenes={storyData.scenes}
            voiceoverURL={voiceoverURL}
            voiceoverGenerating={false}
            youtubeTitle={storyData.youtubeTitle}
            youtubeDescription={storyData.youtubeDescription}
            youtubeTags={storyData.youtubeTags}
            bestUploadTime={storyData.bestUploadTime}
          />
        )}

        {stage === 'complete' && videoURL && thumbnailURL && (
          <DownloadSection videoURL={videoURL} thumbnailURL={thumbnailURL} storyTitle={submittedTitle} />
        )}
      </div>
    </>
  );
}
