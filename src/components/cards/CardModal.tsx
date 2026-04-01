import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '@stores/index';
import { translateText } from '@services/translationService';
import { Button } from '@components/catalyst/button';
import { Field, Label, Description, ErrorMessage } from '@components/catalyst/fieldset';
import { Input } from '@components/catalyst/input';
import { Select } from '@components/catalyst/select';
import { Textarea } from '@components/catalyst/textarea';
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
    <Button
      plain
      type="button"
      onClick={handleTranslate}
      disabled={loading}
      className="!text-xs !px-2 !py-0.5 text-accent"
    >
      {loading ? '...' : `Translate ${arrow}`}
    </Button>
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
  const modalRef = useRef<HTMLDivElement>(null);

  const stableOnClose = useCallback(() => onClose(), [onClose]);

  // Focus trap and Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't close CardModal if a child Headless UI dialog (e.g. ConfirmDialog) is open
      if (e.key === 'Escape') {
        if (document.querySelector('[role="dialog"][data-headlessui-state]')) return;
        stableOnClose();
        return;
      }
      if (e.key === 'Tab' && focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    modal.addEventListener('keydown', handleKeyDown);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stableOnClose]);

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
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white dark:bg-[#252540] border border-gray-200 dark:border-white/10 rounded-2xl z-50 shadow-soft-lg overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-[#252540] border-b border-gray-200 dark:border-white/10 p-6 flex justify-between items-center rounded-t-2xl">
              <h2 id="modal-title" className="font-display text-xl font-bold text-ink">
                {card ? 'Edit Card' : 'Create New Card'}
              </h2>
              <Button
                plain
                onClick={onClose}
                aria-label="Close modal"
                className="!w-11 !h-11 !px-0"
              >
                &times;
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Category */}
              <Field>
                <Label className="font-display font-semibold">Category</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </Field>

              {/* English Title */}
              <Field>
                <Label className="font-display font-semibold">English Title *</Label>
                <Input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="e.g., Morning Dishes"
                  invalid={!!errors.titleEn}
                />
                {errors.titleEn && <ErrorMessage>{errors.titleEn}</ErrorMessage>}
              </Field>

              {/* Title translate */}
              <div className="flex gap-2 -mt-2 mb-1">
                <TranslateButton fromField="titleEn" toField="titleHe" from="en" to="he" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
                <TranslateButton fromField="titleHe" toField="titleEn" from="he" to="en" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
              </div>

              {/* Hebrew Title */}
              <Field>
                <Label className="font-display font-semibold">Hebrew Title *</Label>
                <Input
                  type="text"
                  value={formData.titleHe}
                  onChange={(e) => setFormData({ ...formData, titleHe: e.target.value })}
                  placeholder="כותרת בעברית"
                  dir="rtl"
                  invalid={!!errors.titleHe}
                />
                {errors.titleHe && <ErrorMessage>{errors.titleHe}</ErrorMessage>}
              </Field>

              {/* English Description */}
              <Field>
                <Label className="font-display font-semibold">English Description *</Label>
                <Textarea
                  value={formData.descEn}
                  onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                  placeholder="Brief description of the task"
                  rows={3}
                  resizable={false}
                  invalid={!!errors.descEn}
                />
                {errors.descEn && <ErrorMessage>{errors.descEn}</ErrorMessage>}
              </Field>

              {/* Description translate */}
              <div className="flex gap-2 -mt-2 mb-1">
                <TranslateButton fromField="descEn" toField="descHe" from="en" to="he" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
                <TranslateButton fromField="descHe" toField="descEn" from="he" to="en" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
              </div>

              {/* Hebrew Description */}
              <Field>
                <Label className="font-display font-semibold">Hebrew Description *</Label>
                <Textarea
                  value={formData.descHe}
                  onChange={(e) => setFormData({ ...formData, descHe: e.target.value })}
                  placeholder="תיאור קצר של המשימה"
                  rows={3}
                  dir="rtl"
                  resizable={false}
                  invalid={!!errors.descHe}
                />
                {errors.descHe && <ErrorMessage>{errors.descHe}</ErrorMessage>}
              </Field>

              {/* MSC Notes — English */}
              <Field>
                <Label className="font-display font-semibold">MSC Notes (English)</Label>
                <Description>What does "done right" look like for this card?</Description>
                <Textarea
                  value={formData.detailsEn}
                  onChange={(e) => setFormData({ ...formData, detailsEn: e.target.value })}
                  placeholder="e.g. Whites and darks separated, folded same day"
                  rows={2}
                  resizable={false}
                />
              </Field>

              {/* MSC translate */}
              <div className="flex gap-2 -mt-2 mb-1">
                <TranslateButton fromField="detailsEn" toField="detailsHe" from="en" to="he" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
                <TranslateButton fromField="detailsHe" toField="detailsEn" from="he" to="en" formData={formData as unknown as Record<string, unknown>} setFormData={(d) => setFormData(d as typeof formData)} />
              </div>

              {/* MSC Notes — Hebrew */}
              <Field>
                <Label className="font-display font-semibold">MSC Notes (Hebrew)</Label>
                <Description>מה זה נראה כשהכרטיס מבוצע כמו שצריך?</Description>
                <Textarea
                  value={formData.detailsHe}
                  onChange={(e) => setFormData({ ...formData, detailsHe: e.target.value })}
                  placeholder="לדוגמה: לבנים ובגדי צבע בנפרד, מקופלים באותו יום"
                  rows={2}
                  dir="rtl"
                  resizable={false}
                />
              </Field>

              {/* Metadata Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <Label className="font-display font-semibold">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </Select>
                </Field>

                <Field>
                  <Label className="font-display font-semibold">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) as DifficultyLevel })}
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>{'⚡'.repeat(diff)}</option>
                    ))}
                  </Select>
                </Field>

                <Field>
                  <Label className="font-display font-semibold">Time (min) *</Label>
                  <Input
                    type="number"
                    value={formData.timeEstimate}
                    onChange={(e) => setFormData({ ...formData, timeEstimate: parseInt(e.target.value) || 0 })}
                    min={5}
                    max={480}
                    invalid={!!errors.timeEstimate}
                  />
                  {errors.timeEstimate && <ErrorMessage>{errors.timeEstimate}</ErrorMessage>}
                </Field>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
                <Button color="partner-a" type="submit" className="flex-1">
                  {card ? 'Update Card' : 'Create Card'}
                </Button>

                <Button plain type="button" onClick={onClose} className="flex-1">
                  Cancel
                </Button>

                {card && (
                  <Button
                    color="destructive"
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    title="Delete this card"
                  >
                    Delete
                  </Button>
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
