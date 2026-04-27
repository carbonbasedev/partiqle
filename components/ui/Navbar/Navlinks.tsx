'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/supabase/auth-helpers/server';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/supabase/auth-helpers/settings';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
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

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

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
                href="/businesses"
                className={`${s.link} ${isActive('/businesses') ? s.linkActive : ''}`}
              >
                Businesses
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
