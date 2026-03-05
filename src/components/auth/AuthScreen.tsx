import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuthStore } from '@stores/authStore';

export default function AuthScreen() {
  const { t } = useTranslation();
  const { signInWithMagicLink, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    clearError();

    const result = await signInWithMagicLink(email.trim());
    setSending(false);

    if (!result.error) {
      setSent(true);
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
          {sent ? (
            // Success state
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-4xl mb-4">&#9993;</div>
              <h2 className="text-xl font-display font-bold text-ink mb-2">
                {t('auth.checkEmail', 'Check your email')}
              </h2>
              <p className="font-body text-concrete text-sm mb-4">
                {t('auth.magicLinkSent', 'We sent a sign-in link to')}
              </p>
              <p className="font-display font-bold text-partner-a mb-6">{email}</p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm font-body text-concrete underline hover:text-ink"
              >
                {t('auth.tryDifferentEmail', 'Try a different email')}
              </button>
            </motion.div>
          ) : (
            // Sign in form
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-display font-bold text-ink mb-4">
                {t('auth.signIn', 'Sign In')}
              </h2>

              <label className="block mb-1.5 text-xs font-display font-semibold text-ink">
                {t('auth.email', 'Email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-body text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent placeholder:text-concrete/50 transition-all"
                required
                autoFocus
                disabled={sending}
              />

              {error && (
                <motion.p
                  className="mt-2 text-sm font-body text-partner-a"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={sending || !email.trim()}
                className="mt-4 w-full px-6 py-3 bg-partner-a text-white font-display font-bold rounded-xl hover:shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!sending ? { scale: 1.02 } : {}}
                whileTap={!sending ? { scale: 0.98 } : {}}
              >
                {sending
                  ? t('auth.sending', 'Sending...')
                  : t('auth.sendMagicLink', 'Send magic link')}
              </motion.button>

              <p className="mt-4 text-xs font-body text-concrete text-center">
                {t('auth.magicLinkDesc', "We'll email you a sign-in link. No password needed.")}
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
