export default function Footer() {
  return (
    <footer className="mt-32 border-t" style={{ borderColor: 'var(--pq-border)' }}>
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="20"
            height="20"
            aria-hidden="true"
            style={{ color: 'var(--pq-ink-1)' }}
          >
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeOpacity="0.45" />
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeOpacity="0.18" />
          </svg>
          <span
            className="pq-mono"
            style={{ color: 'var(--pq-ink-2)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}
          >
            Partiqle — Restore time2
          </span>
        </div>
        <div
          className="pq-mono"
          style={{ color: 'var(--pq-ink-3)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}
        >
          © {new Date().getFullYear()} · All systems nominal
        </div>
      </div>
    </footer>
  );
}
