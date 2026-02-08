import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePartnerStore } from '@stores/partnerStore';
import PartnerForm from './PartnerForm';
import type { Partner, PartnerId } from '@types';

const THEME_COLORS = [
  '#E63946', // Red
  '#06AED5', // Blue
  '#2A9D8F', // Teal
  '#E9C46A', // Yellow
  '#F4A261', // Orange
  '#264653', // Dark teal
  '#9B5DE5', // Purple
  '#00BBF9', // Light blue
  '#F15BB5', // Pink
  '#4CAF50', // Green
];

const AVATAR_ICONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
];

function createDefaultPartner(id: PartnerId, name: string, color: string, icon: string): Partner {
  return {
    id,
    name,
    avatar: { type: 'avatar-builder', data: icon },
    preferences: {
      favoriteCards: [],
      avoidCards: [],
      strongSuits: [],
      availability: {},
    },
    stats: {
      currentCards: 0,
      totalTimeCommitment: 0,
      streaks: [],
      achievements: [],
    },
    theme: {
      color,
      pattern: { type: 'solid', color },
      icon,
    },
  };
}

export default function PartnerSetupWizard() {
  const { t } = useTranslation();
  const { setPartners, completeSetup } = usePartnerStore();

  const [step, setStep] = useState(0); // 0 = intro, 1 = partner A, 2 = partner B, 3 = confirm
  const [partnerA, setPartnerA] = useState<Partner>(
    createDefaultPartner('partner-a', '', THEME_COLORS[0], AVATAR_ICONS[0])
  );
  const [partnerB, setPartnerB] = useState<Partner>(
    createDefaultPartner('partner-b', '', THEME_COLORS[1], AVATAR_ICONS[1])
  );

  const handleNext = () => {
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleComplete = () => {
    const finalA = {
      ...partnerA,
      name: partnerA.name.trim() || t('partners.partnerA'),
    };
    const finalB = {
      ...partnerB,
      name: partnerB.name.trim() || t('partners.partnerB'),
    };
    setPartners([finalA, finalB]);
    completeSetup();
  };

  const canProceedFromPartnerA = partnerA.name.trim().length > 0;
  const canProceedFromPartnerB = partnerB.name.trim().length > 0;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    setDirection(1);
    handleNext();
  };

  const goBack = () => {
    setDirection(-1);
    handleBack();
  };

  return (
    <div className="relative z-10 min-h-full flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-4 py-12">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-partner-a'
                  : i < step
                    ? 'w-2 bg-partner-a/50'
                    : 'w-2 bg-concrete/30'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="intro"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="bg-paper border-3 border-ink rounded-lg p-8 shadow-brutal">
                <h2 className="text-display-md font-display font-bold text-ink mb-4">
                  {t('partnerSetup.title')}
                </h2>
                <p className="text-base font-body text-concrete mb-8">
                  {t('partnerSetup.subtitle')}
                </p>

                <div className="flex justify-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-partner-a rounded-full flex items-center justify-center text-paper font-display font-bold text-2xl shadow-brutal-sm">
                    A
                  </div>
                  <div className="w-16 h-16 bg-partner-b rounded-full flex items-center justify-center text-paper font-display font-bold text-2xl shadow-brutal-sm">
                    B
                  </div>
                </div>

                <motion.button
                  onClick={goNext}
                  className="px-8 py-3 bg-partner-a text-paper font-display font-bold rounded-lg hover:shadow-brutal transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('partnerSetup.letsStart')}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="partnerA"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="bg-paper border-3 border-ink rounded-lg p-8 shadow-brutal">
                <h3 className="text-display-sm font-display font-bold text-ink mb-2">
                  {t('partnerSetup.setupPartner', { number: 1 })}
                </h3>
                <p className="text-sm font-body text-concrete mb-6">
                  {t('partnerSetup.partnerDescription')}
                </p>

                <PartnerForm
                  partner={partnerA}
                  onChange={setPartnerA}
                  themeColors={THEME_COLORS}
                  avatarIcons={AVATAR_ICONS}
                  usedColor={partnerB.theme.color}
                />

                <div className="flex justify-between mt-8">
                  <motion.button
                    onClick={goBack}
                    className="px-6 py-2 bg-concrete/20 text-ink font-display font-bold rounded-lg hover:bg-concrete/30 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('common.back')}
                  </motion.button>
                  <motion.button
                    onClick={goNext}
                    disabled={!canProceedFromPartnerA}
                    className={`px-6 py-2 font-display font-bold rounded-lg transition-all ${
                      canProceedFromPartnerA
                        ? 'bg-partner-a text-paper hover:shadow-brutal'
                        : 'bg-concrete/30 text-concrete cursor-not-allowed'
                    }`}
                    whileHover={canProceedFromPartnerA ? { scale: 1.05 } : {}}
                    whileTap={canProceedFromPartnerA ? { scale: 0.95 } : {}}
                  >
                    {t('common.next')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="partnerB"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="bg-paper border-3 border-ink rounded-lg p-8 shadow-brutal">
                <h3 className="text-display-sm font-display font-bold text-ink mb-2">
                  {t('partnerSetup.setupPartner', { number: 2 })}
                </h3>
                <p className="text-sm font-body text-concrete mb-6">
                  {t('partnerSetup.partnerDescription')}
                </p>

                <PartnerForm
                  partner={partnerB}
                  onChange={setPartnerB}
                  themeColors={THEME_COLORS}
                  avatarIcons={AVATAR_ICONS}
                  usedColor={partnerA.theme.color}
                />

                <div className="flex justify-between mt-8">
                  <motion.button
                    onClick={goBack}
                    className="px-6 py-2 bg-concrete/20 text-ink font-display font-bold rounded-lg hover:bg-concrete/30 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('common.back')}
                  </motion.button>
                  <motion.button
                    onClick={goNext}
                    disabled={!canProceedFromPartnerB}
                    className={`px-6 py-2 font-display font-bold rounded-lg transition-all ${
                      canProceedFromPartnerB
                        ? 'bg-partner-b text-paper hover:shadow-brutal'
                        : 'bg-concrete/30 text-concrete cursor-not-allowed'
                    }`}
                    whileHover={canProceedFromPartnerB ? { scale: 1.05 } : {}}
                    whileTap={canProceedFromPartnerB ? { scale: 0.95 } : {}}
                  >
                    {t('common.next')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="confirm"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="bg-paper border-3 border-ink rounded-lg p-8 shadow-brutal">
                <h3 className="text-display-sm font-display font-bold text-ink mb-6 text-center">
                  {t('partnerSetup.reviewTitle')}
                </h3>

                {/* Partner A summary */}
                <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-ink/10 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-paper font-display font-bold text-lg shadow-brutal-sm"
                    style={{ backgroundColor: partnerA.theme.color }}
                  >
                    {partnerA.theme.icon}
                  </div>
                  <div>
                    <p className="font-display font-bold text-ink">
                      {partnerA.name || t('partners.partnerA')}
                    </p>
                    <p className="text-xs font-body text-concrete">
                      {t('partnerSetup.partner')} 1
                    </p>
                  </div>
                </div>

                {/* Partner B summary */}
                <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-ink/10 mb-8">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-paper font-display font-bold text-lg shadow-brutal-sm"
                    style={{ backgroundColor: partnerB.theme.color }}
                  >
                    {partnerB.theme.icon}
                  </div>
                  <div>
                    <p className="font-display font-bold text-ink">
                      {partnerB.name || t('partners.partnerB')}
                    </p>
                    <p className="text-xs font-body text-concrete">
                      {t('partnerSetup.partner')} 2
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <motion.button
                    onClick={goBack}
                    className="px-6 py-2 bg-concrete/20 text-ink font-display font-bold rounded-lg hover:bg-concrete/30 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('common.back')}
                  </motion.button>
                  <motion.button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-partner-a text-paper font-display font-bold rounded-lg hover:shadow-brutal transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('partnerSetup.startPlaying')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
