import type { ClipStatus } from '../types';

interface Props {
  statuses: ClipStatus[];
  voiceoverDone: boolean;
}

const STATUS_LABEL: Record<ClipStatus, string> = {
  pending: '⏳ Pending',
  submitting: '📤 Submitting...',
  generating: '🎬 Generating...',
  downloading: '⬇ Downloading...',
  done: '✅ Ready',
  error: '❌ Error',
};

const STATUS_CLASS: Record<ClipStatus, string> = {
  pending: 'clip-pending',
  submitting: 'clip-active',
  generating: 'clip-active',
  downloading: 'clip-active',
  done: 'clip-done',
  error: 'clip-error',
};

export default function KlingProgress({ statuses, voiceoverDone }: Props) {
  const doneCount = statuses.filter((s) => s === 'done').length;

  return (
    <div className="card section-card">
      <div className="section-header">
        <div className="section-title-group">
          <span className="section-icon">🎞️</span>
          <div className="section-label">
            <h3>Generating Assets</h3>
            <span>Videos {doneCount}/6 · Voiceover {voiceoverDone ? '✅' : '⏳'}</span>
          </div>
        </div>
      </div>
      <div className="section-body kling-progress-body">
        <div className="kling-grid">
          {statuses.map((status, i) => (
            <div key={i} className={`kling-clip-card ${STATUS_CLASS[status]}`}>
              <span className="kling-clip-num">Scene {i + 1}</span>
              <span className="kling-clip-status">{STATUS_LABEL[status]}</span>
              {(status === 'generating' || status === 'submitting' || status === 'downloading') && (
                <div className="kling-pulse" />
              )}
            </div>
          ))}
        </div>
        <p className="field-hint" style={{ marginTop: 12 }}>
          Each Kling clip takes ~3–5 minutes · all 6 run in parallel · do not close this tab
        </p>
      </div>
    </div>
  );
}
