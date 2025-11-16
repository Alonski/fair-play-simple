import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Partner, PartnerId } from '@/types';

interface PartnerSetupWizardProps {
  isOpen: boolean;
  onComplete: (partners: Partner[]) => void;
  onClose: () => void;
}

interface PartnerFormData {
  id: PartnerId;
  name: string;
  color: string;
  avatarLetter: string;
}

const PRESET_COLORS = [
  { name: 'Red', value: '#E63946' },
  { name: 'Blue', value: '#06AED5' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
];

/**
 * PartnerSetupWizard - Multi-step wizard for setting up partner profiles
 * Steps:
 * 1. Partner A name and avatar
 * 2. Partner B name and avatar
 * 3. Review and confirm
 */
export default function PartnerSetupWizard({
  isOpen,
  onComplete,
  onClose,
}: PartnerSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [partnerA, setPartnerA] = useState<PartnerFormData>({
    id: 'partner-a',
    name: '',
    color: PRESET_COLORS[0].value,
    avatarLetter: 'A',
  });
  const [partnerB, setPartnerB] = useState<PartnerFormData>({
    id: 'partner-b',
    name: '',
    color: PRESET_COLORS[1].value,
    avatarLetter: 'B',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!partnerA.name.trim()) {
        newErrors.partnerAName = 'Partner name is required';
      }
    } else if (currentStep === 2) {
      if (!partnerB.name.trim()) {
        newErrors.partnerBName = 'Partner name is required';
      }
      if (partnerB.color === partnerA.color) {
        newErrors.partnerBColor = 'Partners should have different colors';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleComplete = () => {
    const partners: Partner[] = [
      {
        id: partnerA.id,
        name: partnerA.name,
        avatar: {
          type: 'avatar-builder',
          data: partnerA.avatarLetter,
        },
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
          color: partnerA.color,
          pattern: { type: 'solid', color: partnerA.color },
          icon: partnerA.avatarLetter,
        },
      },
      {
        id: partnerB.id,
        name: partnerB.name,
        avatar: {
          type: 'avatar-builder',
          data: partnerB.avatarLetter,
        },
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
          color: partnerB.color,
          pattern: { type: 'solid', color: partnerB.color },
          icon: partnerB.avatarLetter,
        },
      },
    ];

    onComplete(partners);
  };

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-display font-bold text-ink mb-2">
          Partner 1 Setup
        </h3>
        <p className="text-sm text-concrete">
          Let's start by setting up the first partner's profile
        </p>
      </div>

      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          Name
        </label>
        <input
          type="text"
          value={partnerA.name}
          onChange={(e) =>
            setPartnerA({ ...partnerA, name: e.target.value })
          }
          className="w-full px-4 py-2 border-2 border-ink rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-partner-a"
          placeholder="e.g., Alex"
        />
        {errors.partnerAName && (
          <p className="text-sm text-partner-a mt-1">{errors.partnerAName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          Avatar Letter
        </label>
        <input
          type="text"
          value={partnerA.avatarLetter}
          onChange={(e) =>
            setPartnerA({
              ...partnerA,
              avatarLetter: e.target.value.slice(0, 1).toUpperCase(),
            })
          }
          className="w-20 px-4 py-2 border-2 border-ink rounded-lg font-display text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-partner-a"
          maxLength={1}
        />
      </div>

      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          Theme Color
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setPartnerA({ ...partnerA, color: color.value })}
              className={`p-4 rounded-lg border-3 transition-all ${
                partnerA.color === color.value
                  ? 'border-ink shadow-brutal scale-105'
                  : 'border-concrete/30 hover:border-concrete'
              }`}
              style={{ backgroundColor: color.value }}
            >
              <span className="text-paper font-display font-bold">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-paper border-2 border-ink rounded-lg">
        <p className="text-sm font-display font-bold text-concrete mb-3">
          Preview
        </p>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-paper font-display text-2xl font-bold"
            style={{ backgroundColor: partnerA.color }}
          >
            {partnerA.avatarLetter}
          </div>
          <div>
            <p className="font-display font-bold text-ink">
              {partnerA.name || 'Partner Name'}
            </p>
            <p className="text-sm text-concrete">Partner 1</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-display font-bold text-ink mb-2">
          Partner 2 Setup
        </h3>
        <p className="text-sm text-concrete">
          Now let's set up the second partner's profile
        </p>
      </div>

      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          Name
        </label>
        <input
          type="text"
          value={partnerB.name}
          onChange={(e) =>
            setPartnerB({ ...partnerB, name: e.target.value })
          }
          className="w-full px-4 py-2 border-2 border-ink rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-partner-b"
          placeholder="e.g., Jordan"
        />
        {errors.partnerBName && (
          <p className="text-sm text-partner-a mt-1">{errors.partnerBName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          Avatar Letter
        </label>
        <input
          type="text"
          value={partnerB.avatarLetter}
          onChange={(e) =>
            setPartnerB({
              ...partnerB,
              avatarLetter: e.target.value.slice(0, 1).toUpperCase(),
            })
          }
          className="w-20 px-4 py-2 border-2 border-ink rounded-lg font-display text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-partner-b"
          maxLength={1}
        />
      </div>

      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          Theme Color
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setPartnerB({ ...partnerB, color: color.value })}
              className={`p-4 rounded-lg border-3 transition-all ${
                partnerB.color === color.value
                  ? 'border-ink shadow-brutal scale-105'
                  : 'border-concrete/30 hover:border-concrete'
              }`}
              style={{ backgroundColor: color.value }}
            >
              <span className="text-paper font-display font-bold">
                {color.name}
              </span>
            </button>
          ))}
        </div>
        {errors.partnerBColor && (
          <p className="text-sm text-partner-a mt-2">{errors.partnerBColor}</p>
        )}
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-paper border-2 border-ink rounded-lg">
        <p className="text-sm font-display font-bold text-concrete mb-3">
          Preview
        </p>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-paper font-display text-2xl font-bold"
            style={{ backgroundColor: partnerB.color }}
          >
            {partnerB.avatarLetter}
          </div>
          <div>
            <p className="font-display font-bold text-ink">
              {partnerB.name || 'Partner Name'}
            </p>
            <p className="text-sm text-concrete">Partner 2</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-display font-bold text-ink mb-2">
          Review & Confirm
        </h3>
        <p className="text-sm text-concrete">
          Check that everything looks good before we get started
        </p>
      </div>

      <div className="space-y-4">
        {/* Partner A Preview */}
        <div className="p-4 bg-paper border-3 border-ink rounded-lg">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-paper font-display text-3xl font-bold shadow-brutal"
              style={{ backgroundColor: partnerA.color }}
            >
              {partnerA.avatarLetter}
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-bold text-ink">
                {partnerA.name}
              </p>
              <p className="text-sm text-concrete">Partner 1</p>
              <div
                className="mt-2 inline-block px-3 py-1 rounded text-paper text-xs font-display font-bold"
                style={{ backgroundColor: partnerA.color }}
              >
                Theme Color
              </div>
            </div>
          </div>
        </div>

        {/* Partner B Preview */}
        <div className="p-4 bg-paper border-3 border-ink rounded-lg">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-paper font-display text-3xl font-bold shadow-brutal"
              style={{ backgroundColor: partnerB.color }}
            >
              {partnerB.avatarLetter}
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-bold text-ink">
                {partnerB.name}
              </p>
              <p className="text-sm text-concrete">Partner 2</p>
              <div
                className="mt-2 inline-block px-3 py-1 rounded text-paper text-xs font-display font-bold"
                style={{ backgroundColor: partnerB.color }}
              >
                Theme Color
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-unassigned/10 border-2 border-unassigned rounded-lg">
        <p className="text-sm text-ink">
          <strong>Next steps:</strong> After setup, you can start assigning Fair
          Play cards to each partner using drag-and-drop or the deal modes.
        </p>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-paper rounded-lg shadow-brutal max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-paper border-b-3 border-ink p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-ink">
              Partner Setup
            </h2>
            <p className="text-sm text-concrete mt-1">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-concrete hover:text-ink transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-partner-a' : 'bg-concrete/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-paper border-t-3 border-ink p-6 flex justify-between">
          <motion.button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-2 font-display font-bold rounded-lg transition-all ${
              step === 1
                ? 'bg-concrete/20 text-concrete/50 cursor-not-allowed'
                : 'bg-concrete text-paper hover:shadow-brutal'
            }`}
            whileHover={step > 1 ? { scale: 1.05 } : {}}
            whileTap={step > 1 ? { scale: 0.95 } : {}}
          >
            Back
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="px-6 py-2 bg-partner-a text-paper font-display font-bold rounded-lg hover:shadow-brutal transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {step === 3 ? 'Complete Setup' : 'Next'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
