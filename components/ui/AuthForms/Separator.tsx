interface SeparatorProps {
  text: string;
}

export default function Separator({ text }: SeparatorProps) {
  return (
    <div className="relative flex items-center py-4 my-2">
      <div className="grow" style={{ height: 1, background: 'var(--pq-border)' }} />
      <span
        className="mx-3 shrink pq-mono"
        style={{
          color: 'var(--pq-ink-3)',
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase'
        }}
      >
        {text}
      </span>
      <div className="grow" style={{ height: 1, background: 'var(--pq-border)' }} />
    </div>
  );
}
