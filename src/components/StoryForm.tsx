import { useState } from 'react';

interface Props {
  anthropicKey: string;
  elevenLabsKey: string;
  storyTitle: string;
  characters: string;
  loading: boolean;
  onAnthropicKeyChange: (v: string) => void;
  onElevenLabsKeyChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onCharactersChange: (v: string) => void;
  onGenerate: () => void;
}

export default function StoryForm({
  anthropicKey,
  elevenLabsKey,
  storyTitle,
  characters,
  loading,
  onAnthropicKeyChange,
  onElevenLabsKeyChange,
  onTitleChange,
  onCharactersChange,
  onGenerate,
}: Props) {
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showEleven, setShowEleven] = useState(false);
  const canGenerate =
    anthropicKey.trim() && elevenLabsKey.trim() && storyTitle.trim() && characters.trim() && !loading;

  return (
    <div className="card form-card">
      <h2>✨ Story Details</h2>
      <div className="form-grid">
        <div className="field">
          <label>Anthropic API Key</label>
          <div className="api-key-row">
            <input
              type={showAnthropic ? 'text' : 'password'}
              value={anthropicKey}
              onChange={(e) => onAnthropicKeyChange(e.target.value)}
              placeholder="sk-ant-api03-..."
              spellCheck={false}
            />
            <button className="api-key-toggle" onClick={() => setShowAnthropic((v) => !v)} type="button">
              {showAnthropic ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="field">
          <label>ElevenLabs API Key</label>
          <div className="api-key-row">
            <input
              type={showEleven ? 'text' : 'password'}
              value={elevenLabsKey}
              onChange={(e) => onElevenLabsKeyChange(e.target.value)}
              placeholder="your-elevenlabs-key"
              spellCheck={false}
            />
            <button className="api-key-toggle" onClick={() => setShowEleven((v) => !v)} type="button">
              {showEleven ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="field-hint">Keys stored in session only — never saved to disk</span>
        </div>

        <div className="field">
          <label>Story Title</label>
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. The Sleepy Dragon's Big Adventure"
            disabled={loading}
          />
        </div>

        <div className="field">
          <label>Main Characters</label>
          <textarea
            rows={2}
            value={characters}
            onChange={(e) => onCharactersChange(e.target.value)}
            placeholder="e.g. Pip the little dragon, Luna the moonbeam fairy, and a friendly cloud named Fluffy"
            disabled={loading}
          />
          <span className="field-hint">Claude weaves them through all 6 scenes</span>
        </div>

        <button className="generate-btn" onClick={onGenerate} disabled={!canGenerate}>
          {loading ? '🌙 Generating...' : '🚀 Generate Story + Auto Voiceover'}
        </button>
      </div>
    </div>
  );
}
