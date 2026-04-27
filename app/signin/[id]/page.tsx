import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod
} from '@/utils/supabase/auth-helpers/settings';
import PasswordSignIn from '@/components/ui/AuthForms/PasswordSignIn';
import EmailSignIn from '@/components/ui/AuthForms/EmailSignIn';
import Separator from '@/components/ui/AuthForms/Separator';
import OauthSignIn from '@/components/ui/AuthForms/OauthSignIn';
import ForgotPassword from '@/components/ui/AuthForms/ForgotPassword';
import UpdatePassword from '@/components/ui/AuthForms/UpdatePassword';
import SignUp from '@/components/ui/AuthForms/Signup';

export default async function SignIn({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ disable_button: boolean }>;
}) {
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  let viewProp: string;

  if (typeof resolvedParams.id === 'string' && viewTypes.includes(resolvedParams.id)) {
    viewProp = resolvedParams.id;
  } else {
    const cookieStore = await cookies();
    const preferredSignInView =
      cookieStore.get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect('/');
  } else if (!user && viewProp === 'update_password') {
    return redirect('/signin');
  }

  const title =
    viewProp === 'forgot_password'
      ? 'Reset password'
      : viewProp === 'update_password'
        ? 'Update password'
        : viewProp === 'signup'
          ? 'Create account'
          : 'Sign in';

  const subtitle =
    viewProp === 'forgot_password'
      ? 'We\u2019ll send you a link to reset it.'
      : viewProp === 'update_password'
        ? 'Choose a new password for your account.'
        : viewProp === 'signup'
          ? 'Start managing your first queue in under a minute.'
          : 'Welcome back.';

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pq-grid-bg pointer-events-none" aria-hidden="true" />
      <div className="w-full max-w-md relative">
        <div className="pq-eyebrow mb-4">Partiqle · Access</div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--pq-ink-0)',
            lineHeight: 1.05
          }}
        >
          {title}
        </h1>
        <p className="mt-3 mb-8" style={{ color: 'var(--pq-ink-2)', fontSize: 15 }}>
          {subtitle}
        </p>
        <div className="pq-card p-6">
          {viewProp === 'password_signin' && (
            <PasswordSignIn
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
            />
          )}
          {viewProp === 'email_signin' && (
            <EmailSignIn
              allowPassword={allowPassword}
              redirectMethod={redirectMethod}
              disableButton={resolvedSearchParams.disable_button}
            />
          )}
          {viewProp === 'forgot_password' && (
            <ForgotPassword
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
              disableButton={resolvedSearchParams.disable_button}
            />
          )}
          {viewProp === 'update_password' && (
            <UpdatePassword redirectMethod={redirectMethod} />
          )}
          {viewProp === 'signup' && (
            <SignUp allowEmail={allowEmail} redirectMethod={redirectMethod} />
          )}
          {viewProp !== 'update_password' &&
            viewProp !== 'signup' &&
            allowOauth && (
              <>
                <Separator text="Or continue with" />
                <OauthSignIn />
              </>
            )}
        </div>
      </div>
    </div>
  );
}
