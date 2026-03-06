import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuthStore } from '@stores/authStore';

export default function SetupScreen() {
  const { t } = useTranslation();
  const { choosePartnerSlot, profile } = useAuthStore();
  const [choosing, setChoosing] = useState(false);

  const handleChoose = async (slot: 'partner-a' | 'partner-b') => {
    setChoosing(true);
    await choosePartnerSlot(slot);
    setChoosing(false);
  };

  // If profile has household but no partner slot, show slot picker
  if (profile?.householdId && !profile?.partnerSlot) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-display-md font-display font-bold text-ink mb-1">
              {t('setup.welcome', 'Welcome!')}
            </h1>
            <p className="font-body text-concrete text-sm">
              {t('setup.chooseSlot', 'Which partner are you?')}
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={() => handleChoose('partner-a')}
              disabled={choosing}
              className="w-full p-5 bg-partner-a-light border border-partner-a/30 rounded-2xl text-center hover:shadow-soft-lg transition-all disabled:opacity-50"
              whileHover={!choosing ? { scale: 1.02 } : {}}
              whileTap={!choosing ? { scale: 0.98 } : {}}
            >
              <span className="text-xl font-display font-bold text-partner-a">
                {t('partners.partnerA', 'Partner A')}
              </span>
            </motion.button>

            <motion.button
              onClick={() => handleChoose('partner-b')}
              disabled={choosing}
              className="w-full p-5 bg-partner-b-light border border-partner-b/30 rounded-2xl text-center hover:shadow-soft-lg transition-all disabled:opacity-50"
              whileHover={!choosing ? { scale: 1.02 } : {}}
              whileTap={!choosing ? { scale: 0.98 } : {}}
            >
              <span className="text-xl font-display font-bold text-partner-b">
                {t('partners.partnerB', 'Partner B')}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading / fallback — household assignment may still be in progress
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-xl font-display font-bold text-concrete mb-4">
          {t('common.loading', 'Loading...')}
        </div>
        <p className="text-sm font-body text-concrete">
          {t('setup.settingUp', 'Setting up your household...')}
        </p>
      </div>
    </div>
  );
}
