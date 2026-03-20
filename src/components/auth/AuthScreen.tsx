import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuthStore } from '@stores/authStore';

export default function AuthScreen() {
  const { t } = useTranslation();
  const { signInWithGoogle, error, clearError } = useAuthStore();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    clearError();
    const result = await signInWithGoogle();
    if (result.error) {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col overflow-hidden">
      {/* Hero area */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-10 overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, var(--color-partner-a-light) 0%, var(--color-partner-b-light) 50%, var(--color-paper) 100%)',
        }}
      >
        {/* Decorative card shapes */}
        <div
          className="absolute top-8 -left-6 w-28 h-40 rounded-2xl border-2 border-partner-a/20 bg-white/40"
          style={{ transform: 'rotate(-12deg)', animation: 'float 8s ease-in-out infinite', '--rotate': '-12deg', boxShadow: '0 8px 24px rgba(224,122,142,0.12)' } as React.CSSProperties}
        />
        <div
          className="absolute top-16 -right-4 w-24 h-36 rounded-2xl border-2 border-partner-b/20 bg-white/40"
          style={{ transform: 'rotate(10deg)', animation: 'float 9s ease-in-out infinite 2s', '--rotate': '10deg', boxShadow: '0 8px 24px rgba(127,182,158,0.12)' } as React.CSSProperties}
        />
        <div
          className="absolute bottom-4 left-8 w-20 h-32 rounded-2xl border-2 border-unassigned/40 bg-white/40"
          style={{ transform: 'rotate(6deg)', animation: 'float 7s ease-in-out infinite 4s', '--rotate': '6deg', boxShadow: '0 8px 24px rgba(245,216,154,0.15)' } as React.CSSProperties}
        />
        <div
          className="absolute bottom-12 right-10 w-16 h-24 rounded-2xl border-2 border-partner-a/15 bg-white/30"
          style={{ transform: 'rotate(-8deg)', animation: 'float 10s ease-in-out infinite 1s', '--rotate': '-8deg' } as React.CSSProperties}
        />

        {/* Brand */}
        <motion.div
          className="relative text-center z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl" aria-hidden="true">🃏</span>
          </div>
          <h1 className="font-display font-bold text-ink leading-none mb-3 text-4xl">
            {t('common.appName', 'Fair Play')}
          </h1>
          <p className="text-base font-body font-medium text-ink/50 leading-relaxed max-w-xs mx-auto">
            {t('auth.subtitle', 'Divide your household fairly, together.')}
          </p>
        </motion.div>
      </div>

      {/* Sign-in panel */}
      <motion.div
        className="bg-paper px-6 pt-8 pb-10"
        style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.06)' }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        {error && (
          <motion.p
            className="mb-4 text-sm font-body text-partner-a text-center bg-partner-a/8 rounded-xl py-3 px-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-ink text-white font-display font-bold rounded-2xl text-[15px] disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-lg"
          whileHover={!signingIn ? { scale: 1.015 } : {}}
          whileTap={!signingIn ? { scale: 0.975 } : {}}
          style={{ letterSpacing: '0.01em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {signingIn
            ? t('auth.signingIn', 'Signing in...')
            : t('auth.signInWithGoogle', 'Continue with Google')}
        </motion.button>

        <p className="mt-5 text-xs font-body text-concrete text-center leading-relaxed">
          {t('auth.googleDesc', 'Access is limited to authorized accounts.')}
        </p>
      </motion.div>
    </div>
  );
}
