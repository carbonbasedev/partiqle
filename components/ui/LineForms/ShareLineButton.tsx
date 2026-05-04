'use client';

import { useEffect, useState } from 'react';

export default function ShareLineButton({
  lineName,
  url
}: {
  lineName: string;
  url: string;
}) {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanShare(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    );
  }, []);

  const text = `Join the ${lineName} line:`;

  const handleClick = async () => {
    if (canShare) {
      try {
        await navigator.share({ title: lineName, text, url });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
        // fall through to clipboard fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="pq-mono w-full"
      style={{
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid var(--pq-border-strong)',
        background: 'transparent',
        color: 'var(--pq-ink-1)',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: 'pointer'
      }}
    >
      {copied
        ? '✓ Link copied'
        : canShare
          ? '↗ Share this line'
          : '⧉ Copy line link'}
    </button>
  );
}
