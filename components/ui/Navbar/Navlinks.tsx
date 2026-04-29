'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/supabase/auth-helpers/server';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/supabase/auth-helpers/settings';
import { useEffect, useState } from 'react';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
  variant?: 'desktop' | 'mobile';
}

function LogoMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={s.logoMark}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <circle
        cx="12"
        cy="12"
        r="7"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function Navlinks({ user, variant = 'desktop' }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 45,
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(7,7,10,0.72)',
            backdropFilter: 'saturate(140%) blur(12px)',
            WebkitBackdropFilter: 'saturate(140%) blur(12px)',
            border: '1px solid var(--pq-border)',
            color: 'var(--pq-ink-0)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        {open && (
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)'
            }}
          />
        )}

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            zIndex: 51,
            width: 'min(82vw, 320px)',
            background: 'var(--pq-bg)',
            borderLeft: '1px solid var(--pq-border)',
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 220ms ease',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 18px'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className={s.logo} aria-label="Partiqle">
              <LogoMark />
              <span className={s.logoWord}>Partiqle</span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--pq-border)',
                background: 'transparent',
                color: 'var(--pq-ink-2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              className={`${s.link} ${isActive('/') ? s.linkActive : ''}`}
              style={{ padding: '10px 12px', fontSize: 15 }}
            >
              Pricing
            </Link>
            {user && (
              <>
                <Link
                  href="/manage"
                  className={`${s.link} ${isActive('/manage') ? s.linkActive : ''}`}
                  style={{ padding: '10px 12px', fontSize: 15 }}
                >
                  Lines
                </Link>
                <Link
                  href="/account"
                  className={`${s.link} ${isActive('/account') ? s.linkActive : ''}`}
                  style={{ padding: '10px 12px', fontSize: 15 }}
                >
                  Account
                </Link>
              </>
            )}
          </nav>

          <div className="mt-auto pt-6" style={{ borderTop: '1px solid var(--pq-border)' }}>
            {user ? (
              <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                <input type="hidden" name="pathName" value={pathname} />
                <button
                  type="submit"
                  className={s.link}
                  style={{ padding: '10px 12px', fontSize: 15, width: '100%', justifyContent: 'flex-start' }}
                >
                  Sign out
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/signin"
                  className={s.link}
                  style={{ padding: '10px 12px', fontSize: 15 }}
                >
                  Sign in
                </Link>
                <Link
                  href="/signin/signup"
                  className="pq-btn pq-btn-primary"
                  style={{ justifyContent: 'center' }}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </aside>
      </>
    );
  }

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href="/" className={s.logo} aria-label="Partiqle">
          <LogoMark />
          <span className={s.logoWord}>Partiqle</span>
        </Link>
        <nav className="ml-8 flex items-center gap-1">
          <Link
            href="/"
            className={`${s.link} ${isActive('/') ? s.linkActive : ''}`}
          >
            Pricing
          </Link>
          {user && (
            <>
              <Link
                href="/manage"
                className={`${s.link} ${isActive('/manage') ? s.linkActive : ''}`}
              >
                Lines
              </Link>
              <Link
                href="/account"
                className={`${s.link} ${isActive('/account') ? s.linkActive : ''}`}
              >
                Account
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={pathname} />
            <button type="submit" className={s.link}>
              Sign out
            </button>
          </form>
        ) : (
          <>
            <Link href="/signin" className={s.link}>
              Sign in
            </Link>
            <Link href="/signin/signup" className="pq-btn pq-btn-primary">
              Get started
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
