import { useState } from 'react';

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label = 'Copy', className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`copy-btn ${copied ? 'copied' : ''} ${className}`}
      onClick={handleCopy}
    >
      {copied ? '✓ Copied!' : `⎘ ${label}`}
    </button>
  );
}
