import type { StoryPackage } from '../types';
import SectionCard from './SectionCard';
import CopyButton from './CopyButton';

interface Props {
  result: StoryPackage;
  storyTitle: string;
}

// ── Format helpers ──────────────────────────────────────────────────────────

function formatNarrationAll(pkg: StoryPackage): string {
  return pkg.narrationScript
    .map(
      (s) =>
        `═══ SCENE ${s.scene}: ${s.title} (${s.duration}) ═══\n\n${s.narration}`,
    )
    .join('\n\n');
}

function formatKlingAll(pkg: StoryPackage): string {
  return pkg.klingPrompts
    .map(
      (k) =>
        `--- SCENE ${k.scene} ---\nPrompt:\n${k.prompt}\n\nNegative Prompt:\n${k.negativePrompt}`,
    )
    .join('\n\n');
}

function formatKlingOne(scene: number, prompt: string, negativePrompt: string): string {
  return `[Scene ${scene} — Kling AI Prompt]\n\n${prompt}\n\nNegative Prompt:\n${negativePrompt}`;
}

function formatElevenLabs(pkg: StoryPackage): string {
  const s = pkg.elevenLabsSettings;
  return `RECOMMENDED VOICE: ${s.recommendedVoice}
${s.voiceDescription}

SETTINGS
────────────────────
Stability:          ${s.stability}
Similarity Boost:   ${s.similarityBoost}
Style Exaggeration: ${s.styleExaggeration}
Speaker Boost:      ${s.speakerBoost ? 'Enabled' : 'Disabled'}
Speed:              ${s.speed}

DELIVERY NOTES
────────────────────
${s.notes}`;
}

function formatCapCut(pkg: StoryPackage): string {
  const t = pkg.capCutTimeline;
  const scenes = t.scenes
    .map(
      (s) =>
        `SCENE ${s.scene} | ${s.startTime} → ${s.endTime} (${s.clipDuration})
  Text: "${s.textOverlay.text}" | ${s.textOverlay.position} | ${s.textOverlay.fontSize}px | ${s.textOverlay.animation}
  Transition: ${s.transition}
  Audio: ${s.audioNote}`,
    )
    .join('\n\n');

  return `CAPCUT TIMELINE
════════════════════════════
Duration: ${t.totalDuration} | FPS: ${t.fps} | Resolution: ${t.resolution}

${scenes}

AUDIO MIX
────────────────────
Background Music: ${t.backgroundMusic}
Music Volume: ${t.musicVolume}
Voice Volume: ${t.voiceVolume}`;
}

function formatYouTubeAll(pkg: StoryPackage): string {
  const y = pkg.youtubePackage;
  return `TITLE:\n${y.title}\n\nDESCRIPTION:\n${y.description}\n\nTAGS:\n${y.tags.join(', ')}\n\nCategory: ${y.category} | Made for Kids: ${y.madeForKids ? 'Yes' : 'No'}`;
}

function formatCanvaAll(pkg: StoryPackage): string {
  const c = pkg.canvaThumbnailBrief;
  return `CANVA THUMBNAIL BRIEF
════════════════════════════
Dimensions: ${c.dimensions}
Background: ${c.backgroundColor}

BACKGROUND SCENE
${c.backgroundScene}

MAIN CHARACTER
${c.mainCharacterPlacement}

TITLE TEXT
  Text:   "${c.titleText.text}"
  Font:   ${c.titleText.font}
  Size:   ${c.titleText.size}
  Color:  ${c.titleText.color}
  Effect: ${c.titleText.effect}

COLOR PALETTE
${c.colorPalette.join('  ')}

STICKERS & ELEMENTS
${c.stickers}

MOOD: ${c.mood}

DESIGN TIPS
${c.designTips}`;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ResultsDisplay({ result, storyTitle }: Props) {
  return (
    <div>
      <nav className="section-nav">
        <a href="#narration">📖 Script</a>
        <a href="#kling">🎬 Kling AI</a>
        <a href="#elevenlabs">🎤 ElevenLabs</a>
        <a href="#capcut">✂️ CapCut</a>
        <a href="#youtube">📺 YouTube</a>
        <a href="#canva">🎨 Canva</a>
      </nav>

      {/* ── 1. Narration Script ── */}
      <SectionCard
        id="narration"
        icon="📖"
        title="Narration Script"
        tool="Read aloud · Voice record"
        copyAllText={formatNarrationAll(result)}
        defaultOpen={true}
      >
        <div className="scenes-list">
          {result.narrationScript.map((scene) => (
            <div key={scene.scene} className="scene-item">
              <div className="scene-item-header">
                <div className="scene-badge">
                  <span className="scene-number">Scene {scene.scene}</span>
                  <span className="scene-title">{scene.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="scene-duration">{scene.duration}</span>
                  <CopyButton
                    text={`Scene ${scene.scene}: ${scene.title}\n\n${scene.narration}`}
                    label="Copy"
                    className="copy-btn-sm"
                  />
                </div>
              </div>
              <p className="scene-narration">"{scene.narration}"</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 2. Kling AI Prompts ── */}
      <SectionCard
        id="kling"
        icon="🎬"
        title="Kling AI Video Prompts"
        tool="Paste each into Kling AI · One prompt per video clip"
        copyAllText={formatKlingAll(result)}
        defaultOpen={true}
      >
        <div className="scenes-list">
          {result.klingPrompts.map((k) => (
            <div key={k.scene} className="scene-item">
              <div className="scene-item-header">
                <div className="scene-badge">
                  <span className="scene-number">Scene {k.scene}</span>
                </div>
                <CopyButton
                  text={formatKlingOne(k.scene, k.prompt, k.negativePrompt)}
                  label="Copy Prompt"
                  className="copy-btn-sm"
                />
              </div>
              <p className="scene-prompt">{k.prompt}</p>
              <div className="negative-prompt">
                <strong>Negative:</strong> {k.negativePrompt}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 3. ElevenLabs ── */}
      <SectionCard
        id="elevenlabs"
        icon="🎤"
        title="ElevenLabs Voice Settings"
        tool="Configure in ElevenLabs Studio"
        copyAllText={formatElevenLabs(result)}
        defaultOpen={true}
      >
        <div className="voice-info">
          <div className="voice-name">🎙 {result.elevenLabsSettings.recommendedVoice}</div>
          <div className="voice-desc">{result.elevenLabsSettings.voiceDescription}</div>
        </div>

        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-label">Stability</div>
            <div className="setting-value">{result.elevenLabsSettings.stability}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">Similarity Boost</div>
            <div className="setting-value">{result.elevenLabsSettings.similarityBoost}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">Style Exaggeration</div>
            <div className="setting-value">{result.elevenLabsSettings.styleExaggeration}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">Speed</div>
            <div className="setting-value">{result.elevenLabsSettings.speed}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">Speaker Boost</div>
            <div className={`setting-value ${result.elevenLabsSettings.speakerBoost ? 'bool-true' : ''}`}>
              {result.elevenLabsSettings.speakerBoost ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        <div className="notes-box">
          <strong>Delivery Notes</strong>
          {result.elevenLabsSettings.notes}
        </div>
      </SectionCard>

      {/* ── 4. CapCut Timeline ── */}
      <SectionCard
        id="capcut"
        icon="✂️"
        title="CapCut Editing Timeline"
        tool="Follow scene by scene in CapCut"
        copyAllText={formatCapCut(result)}
        defaultOpen={true}
      >
        <div className="timeline-overview">
          <div className="timeline-stat">
            <strong>Total Duration</strong>
            <span>{result.capCutTimeline.totalDuration}</span>
          </div>
          <div className="timeline-stat">
            <strong>Frame Rate</strong>
            <span>{result.capCutTimeline.fps} FPS</span>
          </div>
          <div className="timeline-stat">
            <strong>Resolution</strong>
            <span>{result.capCutTimeline.resolution}</span>
          </div>
          <div className="timeline-stat">
            <strong>Music Volume</strong>
            <span>{result.capCutTimeline.musicVolume}</span>
          </div>
          <div className="timeline-stat">
            <strong>Voice Volume</strong>
            <span>{result.capCutTimeline.voiceVolume}</span>
          </div>
        </div>

        <div className="timeline-items">
          {result.capCutTimeline.scenes.map((s) => (
            <div key={s.scene} className="timeline-scene">
              <div className="timeline-scene-head">
                <div className="scene-badge">
                  <span className="scene-number">Scene {s.scene}</span>
                  <span className="scene-duration">{s.clipDuration}</span>
                </div>
                <span className="timeline-time">
                  {s.startTime} → {s.endTime}
                </span>
              </div>
              <div className="timeline-details">
                <div className="timeline-detail">
                  <strong>Text Overlay</strong>
                  <span>
                    "{s.textOverlay.text}" · {s.textOverlay.position} · {s.textOverlay.fontSize}px ·{' '}
                    {s.textOverlay.animation}
                  </span>
                </div>
                <div className="timeline-detail">
                  <strong>Transition</strong>
                  <span>{s.transition}</span>
                </div>
                <div className="timeline-detail">
                  <strong>Audio</strong>
                  <span>{s.audioNote}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="timeline-music">
          <strong>Background Music</strong>
          <p>{result.capCutTimeline.backgroundMusic}</p>
          <div className="timeline-mix">
            <div className="mix-item">
              Music: <span>{result.capCutTimeline.musicVolume}</span>
            </div>
            <div className="mix-item">
              Voice: <span>{result.capCutTimeline.voiceVolume}</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 5. YouTube Package ── */}
      <SectionCard
        id="youtube"
        icon="📺"
        title="YouTube Package"
        tool="Title · Description · Tags · Metadata"
        copyAllText={formatYouTubeAll(result)}
        defaultOpen={true}
      >
        <div className="yt-section">
          <div className="yt-title-block">
            <div className="yt-block-label">
              <span>Video Title</span>
              <CopyButton text={result.youtubePackage.title} label="Copy Title" className="copy-btn-sm" />
            </div>
            <div className="yt-title-text">{result.youtubePackage.title}</div>
          </div>

          <div className="yt-description-block">
            <div className="yt-block-label">
              <span>Description</span>
              <CopyButton
                text={result.youtubePackage.description}
                label="Copy Description"
                className="copy-btn-sm"
              />
            </div>
            <div className="yt-description-text">{result.youtubePackage.description}</div>
          </div>

          <div className="yt-tags-block">
            <div className="yt-block-label">
              <span>Tags ({result.youtubePackage.tags.length})</span>
              <CopyButton
                text={result.youtubePackage.tags.join(', ')}
                label="Copy Tags"
                className="copy-btn-sm"
              />
            </div>
            <div className="tags-wrap">
              {result.youtubePackage.tags.map((tag, i) => (
                <span key={i} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="yt-block-label" style={{ marginBottom: 10 }}>
              Metadata
            </div>
            <div className="yt-meta">
              <span className="yt-meta-item">Category: {result.youtubePackage.category}</span>
              <span className={`yt-meta-item ${result.youtubePackage.madeForKids ? 'highlight' : ''}`}>
                {result.youtubePackage.madeForKids ? '✓ Made for Kids' : 'Not for Kids'}
              </span>
              <span className="yt-meta-item">
                Thumbnail Text: "{result.youtubePackage.thumbnailText}"
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 6. Canva Thumbnail ── */}
      <SectionCard
        id="canva"
        icon="🎨"
        title="Canva Thumbnail Brief"
        tool="Design guide for Canva · 1280×720"
        copyAllText={formatCanvaAll(result)}
        defaultOpen={true}
      >
        <div className="canva-section">
          <div className="canva-text-preview">
            <div className="canva-preview-text">
              {result.canvaThumbnailBrief.titleText.text}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              Font: {result.canvaThumbnailBrief.titleText.font} · {result.canvaThumbnailBrief.titleText.effect}
            </div>
          </div>

          <div>
            <div className="canva-field-label" style={{ marginBottom: 8 }}>Color Palette</div>
            <div className="canva-palette">
              {result.canvaThumbnailBrief.colorPalette.map((hex, i) => (
                <div key={i} className="palette-swatch">
                  <div
                    className="swatch-color"
                    style={{ backgroundColor: hex.startsWith('#') ? hex : '#888' }}
                  />
                  <span className="swatch-hex">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="canva-field">
            <div className="canva-field-label">Background</div>
            <div className="canva-field-value">
              <strong style={{ color: 'var(--text)', fontWeight: 600 }}>
                {result.canvaThumbnailBrief.backgroundColor}
              </strong>
              <br />
              {result.canvaThumbnailBrief.backgroundScene}
            </div>
          </div>

          <div className="canva-field">
            <div className="canva-field-label">Main Character Placement</div>
            <div className="canva-field-value">{result.canvaThumbnailBrief.mainCharacterPlacement}</div>
          </div>

          <div className="canva-field">
            <div className="canva-field-label">Title Text Treatment</div>
            <div className="canva-field-value">
              <strong style={{ color: 'var(--text)' }}>"{result.canvaThumbnailBrief.titleText.text}"</strong>
              <br />
              Font: {result.canvaThumbnailBrief.titleText.font} ·{' '}
              Size: {result.canvaThumbnailBrief.titleText.size} ·{' '}
              Color: {result.canvaThumbnailBrief.titleText.color}
              <br />
              Effect: {result.canvaThumbnailBrief.titleText.effect}
            </div>
          </div>

          <div className="canva-field">
            <div className="canva-field-label">Stickers & Elements</div>
            <div className="canva-field-value">{result.canvaThumbnailBrief.stickers}</div>
          </div>

          <div className="canva-field">
            <div className="canva-field-label">Mood</div>
            <div className="canva-field-value" style={{ color: 'var(--gold)', fontStyle: 'italic' }}>
              {result.canvaThumbnailBrief.mood}
            </div>
          </div>

          <div className="canva-tips">
            <strong>Design Tips</strong>
            {result.canvaThumbnailBrief.designTips}
          </div>
        </div>
      </SectionCard>

      <div style={{ textAlign: 'center', paddingTop: 20, color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        Generated for "{storyTitle}" · Powered by Claude Opus 4.7
      </div>
    </div>
  );
}
