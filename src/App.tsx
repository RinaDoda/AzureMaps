import { useState } from 'react';
import type { StoryPackage } from './types';
import { generateStoryPackage } from './generate';
import StoryForm from './components/StoryForm';
import ResultsDisplay from './components/ResultsDisplay';

// Generate a static star field (deterministic to avoid re-renders)
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
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('anthropic_key') ?? '');
  const [storyTitle, setStoryTitle] = useState('');
  const [characters, setCharacters] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<StoryPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedTitle, setSubmittedTitle] = useState('');

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem('anthropic_key', key);
  };

  const handleGenerate = async () => {
    if (!apiKey.trim() || !storyTitle.trim() || !characters.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSubmittedTitle(storyTitle);

    try {
      const pkg = await generateStoryPackage(apiKey, storyTitle, characters, setProgress);
      setResult(pkg);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <>
      {/* Star field background */}
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
        {/* Header */}
        <header className="app-header">
          <span className="header-moon">🌙</span>
          <h1>Bedtime Story Video Generator</h1>
          <p>Complete YouTube video packages for toddlers — powered by Claude AI</p>
        </header>

        {/* Input form */}
        <StoryForm
          apiKey={apiKey}
          storyTitle={storyTitle}
          characters={characters}
          loading={loading}
          onApiKeyChange={handleApiKeyChange}
          onTitleChange={setStoryTitle}
          onCharactersChange={setCharacters}
          onGenerate={handleGenerate}
        />

        {/* Loading state */}
        {loading && (
          <div className="card loading-card">
            <div className="loading-moon-wrap">
              <div className="loading-moon">🌙</div>
            </div>
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <p className="loading-message">{progress}</p>
            <p className="loading-subtitle">
              Claude is crafting a complete production package — this takes about 30–60 seconds
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="card error-card">
            <h3>Generation failed</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <ResultsDisplay result={result} storyTitle={submittedTitle} />
        )}
      </div>
    </>
  );
}
