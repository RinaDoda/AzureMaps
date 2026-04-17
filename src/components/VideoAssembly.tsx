import { useState, useRef } from 'react';
import { assembleVideo } from '../ffmpeg-assembly';
import { generateThumbnail } from '../thumbnail';

interface Props {
  voiceoverBlob: Blob | null;
  storyTitle: string;
  onComplete: (videoURL: string, thumbURL: string) => void;
}

export default function VideoAssembly({ voiceoverBlob, storyTitle, onComplete }: Props) {
  const [clips, setClips] = useState<File[]>([]);
  const [music, setMusic] = useState<File | null>(null);
  const [assembling, setAssembling] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const clipsRef = useRef<HTMLInputElement>(null);
  const musicRef = useRef<HTMLInputElement>(null);

  const handleClips = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setClips(files.slice(0, 6));
  };

  const handleAssemble = async () => {
    if (!voiceoverBlob || clips.length !== 6) return;
    setAssembling(true);
    setError('');
    try {
      const videoBlob = await assembleVideo(clips, voiceoverBlob, music, setProgress);
      const videoURL = URL.createObjectURL(videoBlob);
      const thumbURL = generateThumbnail(storyTitle);
      onComplete(videoURL, thumbURL);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assembly failed. Please try again.');
    } finally {
      setAssembling(false);
      setProgress('');
    }
  };

  const canAssemble = voiceoverBlob && clips.length === 6 && !assembling;

  return (
    <div className="card section-card">
      <div className="section-header">
        <div className="section-title-group">
          <span className="section-icon">🎞️</span>
          <div className="section-label">
            <h3>Video Assembly</h3>
            <span>Upload your 6 Kling clips → auto-assemble with FFmpeg</span>
          </div>
        </div>
      </div>

      <div className="section-body assembly-body">
        <div className="assembly-steps">
          <div className="assembly-step">
            <span className="step-num">1</span>
            <div className="step-content">
              <p>Go to <strong>klingai.com</strong>, paste each Kling prompt above, generate your 6 clips, download them.</p>
            </div>
          </div>
          <div className="assembly-step">
            <span className="step-num">2</span>
            <div className="step-content">
              <p>Upload all 6 clips here <em>(in scene order)</em>:</p>
              <input
                ref={clipsRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleClips}
                style={{ display: 'none' }}
              />
              <button className="upload-btn" onClick={() => clipsRef.current?.click()} disabled={assembling}>
                📁 {clips.length > 0 ? `${clips.length}/6 clips selected` : 'Select 6 Clips'}
              </button>
              {clips.length > 0 && clips.length < 6 && (
                <p className="field-hint warn">Need exactly 6 clips ({6 - clips.length} more needed)</p>
              )}
              {clips.length === 6 && (
                <ul className="clip-list">
                  {clips.map((f, i) => (
                    <li key={i}><span className="clip-num">Scene {i + 1}</span> {f.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="assembly-step">
            <span className="step-num">3</span>
            <div className="step-content">
              <p>Optional: upload background lullaby music (MP3):</p>
              <input
                ref={musicRef}
                type="file"
                accept="audio/*"
                onChange={(e) => setMusic(e.target.files?.[0] ?? null)}
                style={{ display: 'none' }}
              />
              <button className="upload-btn" onClick={() => musicRef.current?.click()} disabled={assembling}>
                🎵 {music ? music.name : 'Select Music (optional)'}
              </button>
              <span className="field-hint">Mixed at 15% volume under the voiceover</span>
            </div>
          </div>
        </div>

        {!voiceoverBlob && (
          <p className="field-hint warn">⏳ Waiting for voiceover to finish generating...</p>
        )}

        {assembling && (
          <div className="assembly-progress">
            <div className="loading-dots"><span /><span /><span /></div>
            <p className="loading-message">{progress}</p>
            <p className="field-hint">FFmpeg is running in your browser — do not close this tab</p>
          </div>
        )}

        {error && <p className="error-inline">{error}</p>}

        <button
          className="generate-btn"
          onClick={handleAssemble}
          disabled={!canAssemble}
          style={{ marginTop: '16px' }}
        >
          {assembling ? '⚙️ Assembling...' : '🎬 Assemble Final Video'}
        </button>

        <p className="field-hint">
          Output: 1080p MP4 · 1s crossfades · 2s fade in · 3s fade out · voiceover + music
        </p>
      </div>
    </div>
  );
}
