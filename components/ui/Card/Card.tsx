import { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, description, footer, children, className }: Props) {
  return (
    <div
      className={
        className ?? 'w-full max-w-3xl m-auto my-8 pq-card overflow-hidden'
      }
    >
      <div className="px-6 py-5">
        <div className="pq-eyebrow mb-3">Partiqle</div>
        <h3
          className="text-2xl"
          style={{
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--pq-ink-0)'
          }}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-2" style={{ color: 'var(--pq-ink-2)', fontSize: 14 }}>
            {description}
          </p>
        )}
        {children}
      </div>
      {footer && (
        <div
          className="px-6 py-4"
          style={{
            borderTop: '1px solid var(--pq-border)',
            background: 'var(--pq-surface-0)',
            color: 'var(--pq-ink-2)',
            fontSize: 13
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
