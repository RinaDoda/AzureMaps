import { useState, useRef } from 'react';

interface Props {
  anthropicKey: string;
  elevenLabsKey: string;
  klingAccessKey: string;
  klingSecretKey: string;
  storyTitle: string;
  characters: string;
  backgroundMusic: File | null;
  loading: boolean;
  onAnthropicKeyChange: (v: string) => void;
  onElevenLabsKeyChange: (v: string) => void;
  onKlingAccessKeyChange: (v: string) => void;
  onKlingSecretKeyChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onCharactersChange: (v: string) => void;
  onMusicChange: (f: File | null) => void;
  onGenerate: () => void;
}

export default function StoryForm({
  anthropicKey, elevenLabsKey, klingAccessKey, klingSecretKey,
  storyTitle, characters, backgroundMusic, loading,
  onAnthropicKeyChange, onElevenLabsKeyChange, onKlingAccessKeyChange, onKlingSecretKeyChange,
  onTitleChange, onCharactersChange, onMusicChange, onGenerate,
}: Props) {
  const [show, setShow] = useState({ ant: false, el: false, ka: false, ks: false });
  const musicRef = useRef<HTMLInputElement>(null);

  const canGenerate =
    anthropicKey.trim() && elevenLabsKey.trim() &&
    klingAccessKey.trim() && klingSecretKey.trim() &&
    storyTitle.trim() && characters.trim() && !loading;

  const toggle = (k: keyof typeof show) => setShow((v) => ({ ...v, [k]: !v[k] }));

  return (
    <div className="card form-card">
      <h2>✨ Story Details</h2>
      <div className="form-grid">

        <div className="field">
          <label>Anthropic API Key</label>
          <div className="api-key-row">
            <input type={show.ant ? 'text' : 'password'} value={anthropicKey}
              onChange={(e) => onAnthropicKeyChange(e.target.value)} placeholder="sk-ant-api03-..." spellCheck={false} />
            <button className="api-key-toggle" onClick={() => toggle('ant')} type="button">
              {show.ant ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="field">
          <label>ElevenLabs API Key</label>
          <div className="api-key-row">
            <input type={show.el ? 'text' : 'password'} value={elevenLabsKey}
              onChange={(e) => onElevenLabsKeyChange(e.target.value)} placeholder="elevenlabs-key" spellCheck={false} />
            <button className="api-key-toggle" onClick={() => toggle('el')} type="button">
              {show.el ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="field">
          <label>Kling Access Key</label>
          <div className="api-key-row">
            <input type={show.ka ? 'text' : 'password'} value={klingAccessKey}
              onChange={(e) => onKlingAccessKeyChange(e.target.value)}
              placeholder="from app.klingai.com/global/dev" spellCheck={false} />
            <button className="api-key-toggle" onClick={() => toggle('ka')} type="button">
              {show.ka ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="field">
          <label>Kling Secret Key</label>
          <div className="api-key-row">
            <input type={show.ks ? 'text' : 'password'} value={klingSecretKey}
              onChange={(e) => onKlingSecretKeyChange(e.target.value)}
              placeholder="from app.klingai.com/global/dev" spellCheck={false} />
            <button className="api-key-toggle" onClick={() => toggle('ks')} type="button">
              {show.ks ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="field-hint">
            Get both keys at <strong>app.klingai.com → Developer → API Keys</strong> · Stored in session only
          </span>
        </div>

        <div className="field">
          <label>Story Title</label>
          <input type="text" value={storyTitle} onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. The Sleepy Dragon's Big Adventure" disabled={loading} />
        </div>

        <div className="field">
          <label>Main Characters</label>
          <textarea rows={2} value={characters} onChange={(e) => onCharactersChange(e.target.value)}
            placeholder="e.g. Pip the little dragon, Luna the moonbeam fairy, and a friendly cloud named Fluffy"
            disabled={loading} />
          <span className="field-hint">Claude weaves them through all 6 scenes</span>
        </div>

        <div className="field">
          <label>Background Music (optional)</label>
          <input ref={musicRef} type="file" accept="audio/*" style={{ display: 'none' }}
            onChange={(e) => onMusicChange(e.target.files?.[0] ?? null)} />
          <button className="upload-btn" onClick={() => musicRef.current?.click()} disabled={loading}>
            🎵 {backgroundMusic ? backgroundMusic.name : 'Upload lullaby MP3 (optional)'}
          </button>
          <span className="field-hint">Mixed at 15% volume under the voiceover</span>
        </div>

        <button className="generate-btn" onClick={onGenerate} disabled={!canGenerate}>
          {loading ? '🌙 Generating...' : '🚀 Generate Everything Automatically'}
        </button>
      </div>
    </div>
  );
}
