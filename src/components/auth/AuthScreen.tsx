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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-display-lg font-display font-bold text-ink mb-1">
            {t('common.appName')}
          </h1>
          <p className="text-sm font-body text-concrete">
            {t('auth.subtitle', 'Fair division starts here')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-soft-lg">
          <h2 className="text-lg font-display font-bold text-ink mb-4 text-center">
            {t('auth.signIn', 'Sign In')}
          </h2>

          {error && (
            <motion.p
              className="mb-4 text-sm font-body text-partner-a text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full px-6 py-3 bg-partner-a text-white font-display font-bold rounded-xl hover:shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={!signingIn ? { scale: 1.02 } : {}}
            whileTap={!signingIn ? { scale: 0.98 } : {}}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {signingIn
              ? t('auth.signingIn', 'Signing in...')
              : t('auth.signInWithGoogle', 'Sign in with Google')}
          </motion.button>

          <p className="mt-4 text-xs font-body text-concrete text-center">
            {t('auth.googleDesc', 'Sign in with your Google account to get started.')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
