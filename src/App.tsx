import { useState } from 'react';
import type { StoryData, AppStage } from './types';
import { generateStoryData } from './generate';
import { generateVoiceover } from './elevenlabs';
import StoryForm from './components/StoryForm';
import SceneCards from './components/SceneCards';
import VideoAssembly from './components/VideoAssembly';
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
  const [storyTitle, setStoryTitle] = useState('');
  const [characters, setCharacters] = useState('');
  const [stage, setStage] = useState<AppStage>('form');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [voiceoverBlob, setVoiceoverBlob] = useState<Blob | null>(null);
  const [voiceoverURL, setVoiceoverURL] = useState<string | null>(null);
  const [voiceoverGenerating, setVoiceoverGenerating] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [thumbnailURL, setThumbnailURL] = useState<string | null>(null);
  const [submittedTitle, setSubmittedTitle] = useState('');

  const handleAnthropicKey = (k: string) => { setAnthropicKey(k); sessionStorage.setItem('anthropic_key', k); };
  const handleElevenLabsKey = (k: string) => { setElevenLabsKey(k); sessionStorage.setItem('elevenlabs_key', k); };

  const handleGenerate = async () => {
    if (!anthropicKey.trim() || !elevenLabsKey.trim() || !storyTitle.trim() || !characters.trim()) return;
    setError(null);
    setStoryData(null);
    setVoiceoverBlob(null);
    setVoiceoverURL(null);
    setVideoURL(null);
    setThumbnailURL(null);
    setSubmittedTitle(storyTitle);
    setStage('generating-script');

    try {
      const data = await generateStoryData(anthropicKey, storyTitle, characters, setProgress);
      setStoryData(data);
      setStage('generating-voiceover');
      setVoiceoverGenerating(true);
      setProgress('🎙️ Sending to ElevenLabs Bella...');

      const blob = await generateVoiceover(elevenLabsKey, data.fullNarration, setProgress);
      const url = URL.createObjectURL(blob);
      setVoiceoverBlob(blob);
      setVoiceoverURL(url);
      setVoiceoverGenerating(false);
      setStage('ready-for-clips');
      setProgress('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
      setStage('form');
      setVoiceoverGenerating(false);
      setProgress('');
    }
  };

  const handleAssemblyComplete = (vid: string, thumb: string) => {
    setVideoURL(vid);
    setThumbnailURL(thumb);
    setStage('complete');
  };

  const isLoading = stage === 'generating-script' || stage === 'generating-voiceover';

  return (
    <>
      <div className="star-field" aria-hidden="true">
        {STARS.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--op': s.opacity,
              '--dur': `${s.dur}s`,
              '--delay': `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="app-wrapper">
        <header className="app-header">
          <span className="header-moon">🌙</span>
          <h1>Bedtime Story Video Generator</h1>
          <p>Script · Voiceover · Video Assembly · Thumbnail · YouTube — fully automated</p>
        </header>

        <StoryForm
          anthropicKey={anthropicKey}
          elevenLabsKey={elevenLabsKey}
          storyTitle={storyTitle}
          characters={characters}
          loading={isLoading}
          onAnthropicKeyChange={handleAnthropicKey}
          onElevenLabsKeyChange={handleElevenLabsKey}
          onTitleChange={setStoryTitle}
          onCharactersChange={setCharacters}
          onGenerate={handleGenerate}
        />

        {isLoading && (
          <div className="card loading-card">
            <div className="loading-moon-wrap">
              <div className="loading-moon">🌙</div>
            </div>
            <div className="loading-dots"><span /><span /><span /></div>
            <p className="loading-message">{progress}</p>
            <p className="loading-subtitle">
              {stage === 'generating-script'
                ? 'Claude is writing your 6-scene bedtime story — ~30s'
                : 'ElevenLabs Bella is recording your voiceover — ~20s'}
            </p>
          </div>
        )}

        {error && (
          <div className="card error-card">
            <h3>Generation failed</h3>
            <p>{error}</p>
          </div>
        )}

        {storyData && !isLoading && (
          <>
            <SceneCards
              scenes={storyData.scenes}
              voiceoverURL={voiceoverURL}
              voiceoverGenerating={voiceoverGenerating}
              youtubeTitle={storyData.youtubeTitle}
              youtubeDescription={storyData.youtubeDescription}
              youtubeTags={storyData.youtubeTags}
              bestUploadTime={storyData.bestUploadTime}
            />

            {(stage === 'ready-for-clips' || stage === 'assembling' || stage === 'complete') && (
              <VideoAssembly
                voiceoverBlob={voiceoverBlob}
                storyTitle={submittedTitle}
                onComplete={handleAssemblyComplete}
              />
            )}

            {stage === 'complete' && videoURL && thumbnailURL && (
              <DownloadSection
                videoURL={videoURL}
                thumbnailURL={thumbnailURL}
                storyTitle={submittedTitle}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
