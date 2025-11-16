import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '@stores/index';
import type { Card, Category, Frequency, DifficultyLevel } from '@types';

interface CardModalProps {
  isOpen: boolean;
  card?: Card;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: Category[] = ['daily-grind', 'kids', 'home', 'magic', 'wild'];
const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly', 'occasional'];
const DIFFICULTIES: DifficultyLevel[] = [1, 2, 3];

/**
 * CardModal component for adding/editing cards
 * Features:
 * - Form for card title, description, details
 * - Category, frequency, difficulty selection
 * - English and Hebrew translations
 * - Time estimate input
 * - Delete functionality
 * - Form validation
 */
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
    category: 'daily-grind' as Category,
    frequency: 'weekly' as Frequency,
    difficulty: 1 as DifficultyLevel,
    timeEstimate: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form with card data if editing
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
      // Reset form for new card
      setFormData({
        titleEn: '',
        titleHe: '',
        descEn: '',
        descHe: '',
        detailsEn: '',
        detailsHe: '',
        category: 'daily-grind',
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
    if (!formData.detailsEn.trim()) newErrors.detailsEn = 'English details required';
    if (!formData.detailsHe.trim()) newErrors.detailsHe = 'Hebrew details required';
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

  const handleDelete = async () => {
    if (!card) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${formData.titleEn}"? This cannot be undone.`
      )
    ) {
      setIsDeleting(true);
      removeCard(card.id);
      onSuccess?.();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-paper border-4 border-ink rounded-lg z-50 shadow-brutal overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-paper border-b-4 border-ink p-6 flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-ink">
                {card ? 'Edit Card' : 'Create New Card'}
              </h2>
              <button
                onClick={onClose}
                className="text-2xl font-bold text-ink hover:text-partner-a transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block font-display font-bold text-ink mb-2">
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
                  className="w-full px-4 py-2 border-2 border-concrete rounded-lg font-body focus:outline-none focus:border-partner-a"
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
                <label className="block font-display font-bold text-ink mb-2">
                  English Title *
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) =>
                    setFormData({ ...formData, titleEn: e.target.value })
                  }
                  placeholder="e.g., Morning Dishes"
                  className={`w-full px-4 py-2 border-2 rounded-lg font-body focus:outline-none ${
                    errors.titleEn
                      ? 'border-partner-a focus:border-partner-a'
                      : 'border-concrete focus:border-partner-a'
                  }`}
                />
                {errors.titleEn && (
                  <p className="text-partner-a text-sm mt-1">{errors.titleEn}</p>
                )}
              </div>

              {/* Hebrew Title */}
              <div>
                <label className="block font-display font-bold text-ink mb-2">
                  Hebrew Title *
                </label>
                <input
                  type="text"
                  value={formData.titleHe}
                  onChange={(e) =>
                    setFormData({ ...formData, titleHe: e.target.value })
                  }
                  placeholder="כותרת בעברית"
                  className={`w-full px-4 py-2 border-2 rounded-lg font-body focus:outline-none text-right ${
                    errors.titleHe
                      ? 'border-partner-a focus:border-partner-a'
                      : 'border-concrete focus:border-partner-a'
                  }`}
                  dir="rtl"
                />
                {errors.titleHe && (
                  <p className="text-partner-a text-sm mt-1">{errors.titleHe}</p>
                )}
              </div>

              {/* English Description */}
              <div>
                <label className="block font-display font-bold text-ink mb-2">
                  English Description *
                </label>
                <textarea
                  value={formData.descEn}
                  onChange={(e) =>
                    setFormData({ ...formData, descEn: e.target.value })
                  }
                  placeholder="Brief description of the task"
                  rows={3}
                  className={`w-full px-4 py-2 border-2 rounded-lg font-body focus:outline-none resize-none ${
                    errors.descEn
                      ? 'border-partner-a focus:border-partner-a'
                      : 'border-concrete focus:border-partner-a'
                  }`}
                />
                {errors.descEn && (
                  <p className="text-partner-a text-sm mt-1">{errors.descEn}</p>
                )}
              </div>

              {/* Hebrew Description */}
              <div>
                <label className="block font-display font-bold text-ink mb-2">
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
                  className={`w-full px-4 py-2 border-2 rounded-lg font-body focus:outline-none resize-none text-right ${
                    errors.descHe
                      ? 'border-partner-a focus:border-partner-a'
                      : 'border-concrete focus:border-partner-a'
                  }`}
                />
                {errors.descHe && (
                  <p className="text-partner-a text-sm mt-1">{errors.descHe}</p>
                )}
              </div>

              {/* English Details */}
              <div>
                <label className="block font-display font-bold text-ink mb-2">
                  English Details *
                </label>
                <textarea
                  value={formData.detailsEn}
                  onChange={(e) =>
                    setFormData({ ...formData, detailsEn: e.target.value })
                  }
                  placeholder="Additional details (frequency, notes, etc.)"
                  rows={2}
                  className={`w-full px-4 py-2 border-2 rounded-lg font-body focus:outline-none resize-none ${
                    errors.detailsEn
                      ? 'border-partner-a focus:border-partner-a'
                      : 'border-concrete focus:border-partner-a'
                  }`}
                />
                {errors.detailsEn && (
                  <p className="text-partner-a text-sm mt-1">{errors.detailsEn}</p>
                )}
              </div>

              {/* Hebrew Details */}
              <div>
                <label className="block font-display font-bold text-ink mb-2">
                  Hebrew Details *
                </label>
                <textarea
                  value={formData.detailsHe}
                  onChange={(e) =>
                    setFormData({ ...formData, detailsHe: e.target.value })
                  }
                  placeholder="פרטים נוספים"
                  rows={2}
                  dir="rtl"
                  className={`w-full px-4 py-2 border-2 rounded-lg font-body focus:outline-none resize-none text-right ${
                    errors.detailsHe
                      ? 'border-partner-a focus:border-partner-a'
                      : 'border-concrete focus:border-partner-a'
                  }`}
                />
                {errors.detailsHe && (
                  <p className="text-partner-a text-sm mt-1">{errors.detailsHe}</p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Frequency */}
                <div>
                  <label className="block font-display font-bold text-ink mb-2 text-sm">
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
                    className="w-full px-3 py-2 border-2 border-concrete rounded-lg font-body text-sm focus:outline-none focus:border-partner-a"
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
                  <label className="block font-display font-bold text-ink mb-2 text-sm">
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
                    className="w-full px-3 py-2 border-2 border-concrete rounded-lg font-body text-sm focus:outline-none focus:border-partner-a"
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
                  <label className="block font-display font-bold text-ink mb-2 text-sm">
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
                    className={`w-full px-3 py-2 border-2 rounded-lg font-body text-sm focus:outline-none ${
                      errors.timeEstimate
                        ? 'border-partner-a focus:border-partner-a'
                        : 'border-concrete focus:border-partner-a'
                    }`}
                  />
                  {errors.timeEstimate && (
                    <p className="text-partner-a text-xs mt-1">
                      {errors.timeEstimate}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-concrete">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-partner-a text-paper font-display font-bold rounded-lg hover:shadow-brutal transition-all"
                >
                  {card ? 'Update Card' : 'Create Card'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-concrete/20 text-ink font-display font-bold rounded-lg hover:bg-concrete/30 transition-all"
                >
                  Cancel
                </button>

                {card && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-6 py-3 bg-partner-a/30 text-partner-a font-display font-bold rounded-lg hover:bg-partner-a/50 disabled:opacity-50 transition-all"
                    title="Delete this card"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
