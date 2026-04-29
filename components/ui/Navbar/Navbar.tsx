import { createClient } from '@/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <nav className={`${s.root} hidden md:block`}>
        <div className="max-w-6xl px-6 mx-auto">
          <Navlinks user={user} variant="desktop" />
        </div>
      </nav>
      <div className="md:hidden">
        <Navlinks user={user} variant="mobile" />
      </div>
    </>
  );
}
