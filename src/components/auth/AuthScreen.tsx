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
        <div className="text-center mb-8">
          <h1 className="text-display-lg font-display font-bold text-ink mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-lg font-body text-concrete">
            {t('auth.subtitle', 'Fair division starts here')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-paper border-3 border-ink rounded-lg p-6 shadow-brutal">
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
              <p className="font-body text-concrete mb-4">
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
              <h2 className="text-xl font-display font-bold text-ink mb-4">
                {t('auth.signIn', 'Sign In')}
              </h2>

              <label className="block mb-2 text-sm font-display font-bold text-ink">
                {t('auth.email', 'Email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                className="w-full px-4 py-3 border-2 border-ink rounded-lg font-body text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-partner-a focus:border-partner-a placeholder:text-concrete/50"
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
                className="mt-4 w-full px-6 py-3 bg-ink text-paper font-display font-bold rounded-lg hover:shadow-brutal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
