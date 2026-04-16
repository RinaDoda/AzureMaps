import { useState } from 'react';

interface Props {
  apiKey: string;
  storyTitle: string;
  characters: string;
  loading: boolean;
  onApiKeyChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onCharactersChange: (v: string) => void;
  onGenerate: () => void;
}

export default function StoryForm({
  apiKey,
  storyTitle,
  characters,
  loading,
  onApiKeyChange,
  onTitleChange,
  onCharactersChange,
  onGenerate,
}: Props) {
  const [showKey, setShowKey] = useState(false);
  const canGenerate = apiKey.trim() && storyTitle.trim() && characters.trim() && !loading;

  return (
    <div className="card form-card">
      <h2>✨ Story Details</h2>

      <div className="form-grid">
        <div className="field">
          <label>Anthropic API Key</label>
          <div className="api-key-row">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-ant-api03-..."
              spellCheck={false}
            />
            <button
              className="api-key-toggle"
              onClick={() => setShowKey((v) => !v)}
              type="button"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="field-hint">Stored in session only — never persisted to disk</span>
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
          <span className="field-hint">Describe your characters — Claude will weave them into every section</span>
        </div>

        <button
          className="generate-btn"
          onClick={onGenerate}
          disabled={!canGenerate}
        >
          {loading ? '🌙 Generating your package...' : '🚀 Generate Complete Video Package'}
        </button>
      </div>
    </div>
  );
}
