import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Partner } from '@types';

interface PartnerFormProps {
  partner: Partner;
  onChange: (partner: Partner) => void;
  themeColors: string[];
  avatarIcons: string[];
  usedColor?: string;
}

export default function PartnerForm({
  partner,
  onChange,
  themeColors,
  avatarIcons,
  usedColor,
}: PartnerFormProps) {
  const { t } = useTranslation();

  const handleNameChange = (name: string) => {
    onChange({ ...partner, name });
  };

  const handleColorChange = (color: string) => {
    onChange({
      ...partner,
      theme: {
        ...partner.theme,
        color,
        pattern: { ...partner.theme.pattern, color },
      },
    });
  };

  const handleIconChange = (icon: string) => {
    onChange({
      ...partner,
      avatar: { ...partner.avatar, data: icon },
      theme: { ...partner.theme, icon },
    });
  };

  return (
    <div className="space-y-6">
      {/* Name input */}
      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          {t('partners.name')}
        </label>
        <input
          type="text"
          value={partner.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder={t('partnerSetup.namePlaceholder')}
          className="w-full px-4 py-3 bg-paper border-2 border-ink rounded-lg font-body text-ink placeholder:text-concrete/50 focus:outline-none focus:ring-2 focus:ring-partner-a focus:border-partner-a transition-all"
          maxLength={30}
          autoFocus
        />
      </div>

      {/* Avatar icon selector */}
      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          {t('partners.avatar')}
        </label>
        <div className="flex flex-wrap gap-3">
          {avatarIcons.map((icon) => (
            <motion.button
              key={icon}
              onClick={() => handleIconChange(icon)}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg transition-all ${
                partner.theme.icon === icon
                  ? 'text-paper shadow-brutal-sm ring-2 ring-offset-2 ring-ink'
                  : 'bg-concrete/20 text-ink hover:bg-concrete/30'
              }`}
              style={
                partner.theme.icon === icon
                  ? { backgroundColor: partner.theme.color }
                  : undefined
              }
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {icon}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Theme color selector */}
      <div>
        <label className="block text-sm font-display font-bold text-ink mb-2">
          {t('partners.theme')}
        </label>
        <div className="flex flex-wrap gap-3">
          {themeColors.map((color) => {
            const isUsed = color === usedColor;
            const isSelected = partner.theme.color === color;
            return (
              <motion.button
                key={color}
                onClick={() => !isUsed && handleColorChange(color)}
                className={`w-10 h-10 rounded-full transition-all ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-ink shadow-brutal-sm'
                    : isUsed
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:ring-2 hover:ring-offset-1 hover:ring-concrete'
                }`}
                style={{ backgroundColor: color }}
                whileHover={!isUsed ? { scale: 1.15 } : {}}
                whileTap={!isUsed ? { scale: 0.9 } : {}}
                disabled={isUsed}
                title={isUsed ? t('partnerSetup.colorTaken') : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t-2 border-ink/10">
        <label className="block text-xs font-display font-bold text-concrete mb-3">
          {t('partnerSetup.preview')}
        </label>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-paper font-display font-bold text-xl shadow-brutal-sm"
            style={{ backgroundColor: partner.theme.color }}
          >
            {partner.theme.icon}
          </div>
          <div>
            <p className="font-display font-bold text-ink text-lg">
              {partner.name || t('partnerSetup.namePlaceholder')}
            </p>
            <div
              className="h-1 w-16 rounded mt-1"
              style={{ backgroundColor: partner.theme.color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
