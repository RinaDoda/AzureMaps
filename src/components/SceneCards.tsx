import type { Scene } from '../types';
import CopyButton from './CopyButton';

interface Props {
  scenes: Scene[];
  voiceoverURL: string | null;
  voiceoverGenerating: boolean;
  youtubeTitle: string;
  youtubeDescription: string;
  youtubeTags: string[];
  bestUploadTime: string;
}

export default function SceneCards({
  scenes,
  voiceoverURL,
  voiceoverGenerating,
  youtubeTitle,
  youtubeDescription,
  youtubeTags,
  bestUploadTime,
}: Props) {
  return (
    <div className="scenes-wrapper">
      {/* Voiceover */}
      <div className="card section-card">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-icon">🎙️</span>
            <div className="section-label">
              <h3>Voiceover (Bella · ElevenLabs)</h3>
              <span>Auto-generated · stability 0.75 · speed 0.82</span>
            </div>
          </div>
          {voiceoverURL && (
            <a className="copy-btn" href={voiceoverURL} download="voiceover.mp3">
              ⬇ Download MP3
            </a>
          )}
        </div>
        {voiceoverGenerating && (
          <div className="section-body">
            <p className="loading-message">🎙️ Generating voiceover with ElevenLabs Bella...</p>
          </div>
        )}
        {voiceoverURL && (
          <div className="section-body">
            <audio controls src={voiceoverURL} style={{ width: '100%' }} />
            <p className="field-hint" style={{ marginTop: '8px' }}>
              Download and use this as your voiceover track in the video assembly step below.
            </p>
          </div>
        )}
      </div>

      {/* Scenes */}
      {scenes.map((scene) => (
        <div className="card section-card" key={scene.sceneNumber}>
          <div className="section-header">
            <div className="section-title-group">
              <span className="section-icon">🎬</span>
              <div className="section-label">
                <h3>Scene {scene.sceneNumber}</h3>
                <span>~{scene.estimatedSeconds}s · watercolor animation</span>
              </div>
            </div>
            <div className="section-actions">
              <CopyButton text={scene.klingPrompt} label="Copy Kling" />
            </div>
          </div>
          <div className="section-body scene-body">
            <div className="scene-narration">
              <label>Narration</label>
              <p>{scene.narration}</p>
            </div>
            <div className="scene-kling">
              <label>Kling AI Prompt</label>
              <p className="kling-text">{scene.klingPrompt}</p>
            </div>
          </div>
        </div>
      ))}

      {/* YouTube */}
      <div className="card section-card">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-icon">📺</span>
            <div className="section-label">
              <h3>YouTube Package</h3>
              <span>Title · Description · Tags</span>
            </div>
          </div>
          <div className="section-actions">
            <CopyButton
              text={`${youtubeTitle}\n\n${youtubeDescription}\n\nTags: ${youtubeTags.join(', ')}`}
              label="Copy All"
            />
          </div>
        </div>
        <div className="section-body">
          <div className="yt-field">
            <div className="yt-field-header">
              <label>Title</label>
              <CopyButton text={youtubeTitle} label="Copy" />
            </div>
            <p className="yt-value">{youtubeTitle}</p>
          </div>
          <div className="yt-field">
            <div className="yt-field-header">
              <label>Description</label>
              <CopyButton text={youtubeDescription} label="Copy" />
            </div>
            <pre className="yt-description">{youtubeDescription}</pre>
          </div>
          <div className="yt-field">
            <div className="yt-field-header">
              <label>Tags</label>
              <CopyButton text={youtubeTags.join(', ')} label="Copy" />
            </div>
            <div className="yt-tags-block">
              {youtubeTags.map((t) => (
                <span key={t} className="yt-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="yt-field">
            <label>Best Upload Time</label>
            <p className="yt-value">{bestUploadTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
