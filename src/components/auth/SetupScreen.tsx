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
  if (profile?.household_id && !profile?.partner_slot) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-display-md font-display font-bold text-ink mb-2">
              {t('setup.welcome', 'Welcome!')}
            </h1>
            <p className="font-body text-concrete">
              {t('setup.chooseSlot', 'Which partner are you?')}
            </p>
          </div>

          <div className="space-y-4">
            <motion.button
              onClick={() => handleChoose('partner-a')}
              disabled={choosing}
              className="w-full p-6 bg-partner-a/10 border-3 border-partner-a rounded-lg text-center hover:shadow-brutal transition-all disabled:opacity-50"
              whileHover={!choosing ? { scale: 1.02 } : {}}
              whileTap={!choosing ? { scale: 0.98 } : {}}
            >
              <span className="text-2xl font-display font-bold text-partner-a">
                {t('partners.partnerA', 'Partner A')}
              </span>
            </motion.button>

            <motion.button
              onClick={() => handleChoose('partner-b')}
              disabled={choosing}
              className="w-full p-6 bg-partner-b/10 border-3 border-partner-b rounded-lg text-center hover:shadow-brutal transition-all disabled:opacity-50"
              whileHover={!choosing ? { scale: 1.02 } : {}}
              whileTap={!choosing ? { scale: 0.98 } : {}}
            >
              <span className="text-2xl font-display font-bold text-partner-b">
                {t('partners.partnerB', 'Partner B')}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading / fallback
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-xl font-display font-bold text-concrete">
          {t('common.loading', 'Loading...')}
        </div>
      </div>
    </div>
  );
}
