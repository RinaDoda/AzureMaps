import { useState } from 'react';
import CopyButton from './CopyButton';

interface Props {
  id: string;
  icon: string;
  title: string;
  tool: string;
  copyAllText: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function SectionCard({
  id,
  icon,
  title,
  tool,
  copyAllText,
  children,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card section-card" id={id}>
      <div className="section-header" onClick={() => setOpen((v) => !v)}>
        <div className="section-title-group">
          <span className="section-icon">{icon}</span>
          <div className="section-label">
            <h3>{title}</h3>
            <span>{tool}</span>
          </div>
        </div>
        <div className="section-actions" onClick={(e) => e.stopPropagation()}>
          <CopyButton text={copyAllText} label="Copy All" />
          <span className={`chevron ${open ? 'open' : ''}`}>▼</span>
        </div>
      </div>

      {open && <div className="section-body">{children}</div>}
    </div>
  );
}
