import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '@stores/index';
import { translateText } from '@services/translationService';
import ConfirmDialog from '@components/ui/ConfirmDialog';
import type { Card, Category, Frequency, DifficultyLevel } from '@types';

function TranslateButton({ fromField, toField, from, to, formData, setFormData }: {
  fromField: string;
  toField: string;
  from: 'en' | 'he';
  to: 'en' | 'he';
  formData: Record<string, unknown>;
  setFormData: (data: Record<string, unknown>) => void;
}) {
  const [loading, setLoading] = useState(false);
  const sourceText = formData[fromField] as string;
  if (!sourceText?.trim()) return null;

  const handleTranslate = async () => {
    setLoading(true);
    const translated = await translateText(sourceText, from, to);
    setFormData({ ...formData, [toField]: translated });
    setLoading(false);
  };

  const arrow = from === 'en' ? '→ HE' : '→ EN';
  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={loading}
      className="text-[10px] px-2.5 py-1 bg-accent/10 text-accent font-display font-bold rounded-lg hover:bg-accent/20 disabled:opacity-50 transition-colors"
    >
      {loading ? '...' : `Translate ${arrow}`}
    </button>
  );
}

interface CardModalProps {
  isOpen: boolean;
  card?: Card;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: Category[] = ['home', 'out', 'caregiving', 'magic', 'wild', 'unicorn-space', 'custom'];
const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly', 'occasional'];
const DIFFICULTIES: DifficultyLevel[] = [1, 2, 3];

export default function CardModal({
  isOpen,
  card,
  onClose,
  onSuccess,
}: CardModalProps) {
  const { addCard, updateCard, removeCard } = useCardStore();

  const [formData, setFormData] = useState({
    titleEn: '',
    titleHe: '',
    descEn: '',
    descHe: '',
    detailsEn: '',
    detailsHe: '',
    category: 'home' as Category,
    frequency: 'weekly' as Frequency,
    difficulty: 1 as DifficultyLevel,
    timeEstimate: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData({
        titleEn: card.title.en,
        titleHe: card.title.he,
        descEn: card.description.en,
        descHe: card.description.he,
        detailsEn: card.details.en,
        detailsHe: card.details.he,
        category: card.category,
        frequency: card.metadata.frequency,
        difficulty: card.metadata.difficulty,
        timeEstimate: card.metadata.timeEstimate,
      });
      setErrors({});
    } else {
      setFormData({
        titleEn: '',
        titleHe: '',
        descEn: '',
        descHe: '',
        detailsEn: '',
        detailsHe: '',
        category: 'home',
        frequency: 'weekly',
        difficulty: 1,
        timeEstimate: 30,
      });
    }
  }, [card, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titleEn.trim()) newErrors.titleEn = 'English title required';
    if (!formData.titleHe.trim()) newErrors.titleHe = 'Hebrew title required';
    if (!formData.descEn.trim()) newErrors.descEn = 'English description required';
    if (!formData.descHe.trim()) newErrors.descHe = 'Hebrew description required';
    // MSC notes are optional — no validation required
    if (formData.timeEstimate < 5 || formData.timeEstimate > 480)
      newErrors.timeEstimate = 'Time estimate must be between 5-480 minutes';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const cardData: Card = {
      id: card?.id || `card-${Date.now()}`,
      category: formData.category,
      title: { en: formData.titleEn, he: formData.titleHe },
      description: { en: formData.descEn, he: formData.descHe },
      details: { en: formData.detailsEn, he: formData.detailsHe },
      holder: card?.holder || null,
      status: card?.status || 'unassigned',
      metadata: {
        createdAt: card?.metadata.createdAt || new Date(),
        modifiedAt: new Date(),
        isCustom: true,
        isActive: true,
        tags: card?.metadata.tags || [],
        difficulty: formData.difficulty,
        frequency: formData.frequency,
        timeEstimate: formData.timeEstimate,
      },
      history: card?.history || [],
    };

    if (card) {
      updateCard(cardData);
    } else {
      addCard(cardData);
    }

    onSuccess?.();
    onClose();
  };

  const handleDeleteConfirmed = () => {
    if (!card) return;
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    removeCard(card.id);
    onSuccess?.();
    onClose();
  };

  const inputClasses = (field?: string) =>
    `w-full px-4 py-2.5 border rounded-xl font-body bg-white dark:bg-white/10 text-ink focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all ${
      field && errors[field]
        ? 'border-partner-a'
        : 'border-gray-300 dark:border-white/15'
    }`;

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white dark:bg-[#252540] border border-gray-200 dark:border-white/10 rounded-2xl z-50 shadow-soft-lg overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-[#252540] border-b border-gray-200 dark:border-white/10 p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="font-display text-xl font-bold text-ink">
                {card ? 'Edit Card' : 'Create New Card'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 rounded-lg text-concrete text-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Category Selection */}
              <div>
                <label className="block font-display font-semibold text-ink mb-1.5 text-sm">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as Category,
                    })
                  }
                  className={inputClasses()}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* English Title */}
              <div>
                <label className="block font-display font-semibold text-ink mb-1.5 text-sm">
                  English Title *
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) =>
                    setFormData({ ...formData, titleEn: e.target.value })
                  }
                  placeholder="e.g., Morning Dishes"
                  className={inputClasses('titleEn')}
                />
                {errors.titleEn && (
                  <p className="text-partner-a text-sm mt-1">{errors.titleEn}</p>
                )}
              </div>

              {/* Title translate */}
              <div className="flex gap-2 -mt-2 mb-1">
                <TranslateButton fromField="titleEn" toField="titleHe" from="en" to="he" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
                <TranslateButton fromField="titleHe" toField="titleEn" from="he" to="en" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
              </div>

              {/* Hebrew Title */}
              <div>
                <label className="block font-display font-semibold text-ink mb-1.5 text-sm">
                  Hebrew Title *
                </label>
                <input
                  type="text"
                  value={formData.titleHe}
                  onChange={(e) =>
                    setFormData({ ...formData, titleHe: e.target.value })
                  }
                  placeholder="כותרת בעברית"
                  className={`${inputClasses('titleHe')} text-right`}
                  dir="rtl"
                />
                {errors.titleHe && (
                  <p className="text-partner-a text-sm mt-1">{errors.titleHe}</p>
                )}
              </div>

              {/* English Description */}
              <div>
                <label className="block font-display font-semibold text-ink mb-1.5 text-sm">
                  English Description *
                </label>
                <textarea
                  value={formData.descEn}
                  onChange={(e) =>
                    setFormData({ ...formData, descEn: e.target.value })
                  }
                  placeholder="Brief description of the task"
                  rows={3}
                  className={`${inputClasses('descEn')} resize-none`}
                />
                {errors.descEn && (
                  <p className="text-partner-a text-sm mt-1">{errors.descEn}</p>
                )}
              </div>

              {/* Description translate */}
              <div className="flex gap-2 -mt-2 mb-1">
                <TranslateButton fromField="descEn" toField="descHe" from="en" to="he" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
                <TranslateButton fromField="descHe" toField="descEn" from="he" to="en" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
              </div>

              {/* Hebrew Description */}
              <div>
                <label className="block font-display font-semibold text-ink mb-1.5 text-sm">
                  Hebrew Description *
                </label>
                <textarea
                  value={formData.descHe}
                  onChange={(e) =>
                    setFormData({ ...formData, descHe: e.target.value })
                  }
                  placeholder="תיאור קצר של המשימה"
                  rows={3}
                  dir="rtl"
                  className={`${inputClasses('descHe')} resize-none text-right`}
                />
                {errors.descHe && (
                  <p className="text-partner-a text-sm mt-1">{errors.descHe}</p>
                )}
              </div>

              {/* MSC Notes — English */}
              <div>
                <label className="block font-display font-semibold text-ink mb-0.5 text-sm">
                  MSC Notes (English)
                </label>
                <p className="text-xs text-concrete mb-1.5">What does "done right" look like for this card?</p>
                <textarea
                  value={formData.detailsEn}
                  onChange={(e) =>
                    setFormData({ ...formData, detailsEn: e.target.value })
                  }
                  placeholder="e.g. Whites and darks separated, folded same day"
                  rows={2}
                  className={`${inputClasses()} resize-none`}
                />
              </div>

              {/* MSC translate */}
              <div className="flex gap-2 -mt-2 mb-1">
                <TranslateButton fromField="detailsEn" toField="detailsHe" from="en" to="he" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
                <TranslateButton fromField="detailsHe" toField="detailsEn" from="he" to="en" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
              </div>

              {/* MSC Notes — Hebrew */}
              <div>
                <label className="block font-display font-semibold text-ink mb-0.5 text-sm">
                  MSC Notes (Hebrew)
                </label>
                <p className="text-xs text-concrete mb-1.5">מה זה נראה כשהכרטיס מבוצע כמו שצריך?</p>
                <textarea
                  value={formData.detailsHe}
                  onChange={(e) =>
                    setFormData({ ...formData, detailsHe: e.target.value })
                  }
                  placeholder="לדוגמה: לבנים ובגדי צבע בנפרד, מקופלים באותו יום"
                  rows={2}
                  dir="rtl"
                  className={`${inputClasses()} resize-none text-right`}
                />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Frequency */}
                <div>
                  <label className="block font-display font-semibold text-ink mb-1.5 text-xs">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequency: e.target.value as Frequency,
                      })
                    }
                    className={`${inputClasses()} text-sm`}
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block font-display font-semibold text-ink mb-1.5 text-xs">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: parseInt(e.target.value) as DifficultyLevel,
                      })
                    }
                    className={`${inputClasses()} text-sm`}
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>
                        {'⚡'.repeat(diff)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Estimate */}
                <div>
                  <label className="block font-display font-semibold text-ink mb-1.5 text-xs">
                    Time (min) *
                  </label>
                  <input
                    type="number"
                    value={formData.timeEstimate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeEstimate: parseInt(e.target.value) || 0,
                      })
                    }
                    min="5"
                    max="480"
                    className={`${inputClasses('timeEstimate')} text-sm`}
                  />
                  {errors.timeEstimate && (
                    <p className="text-partner-a text-xs mt-1">
                      {errors.timeEstimate}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
                <motion.button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-partner-a text-white font-display font-bold rounded-xl hover:shadow-soft-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {card ? 'Update Card' : 'Create Card'}
                </motion.button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/10 text-ink font-display font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
                >
                  Cancel
                </button>

                {card && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="px-6 py-3 bg-red-50 text-red-500 font-display font-bold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-all"
                    title="Delete this card"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this card?"
        message={`"${formData.titleEn}" will be removed. You can find it in the app history if needed.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
