import { type ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CardsIcon, DealIcon, MoreIcon } from '@components/ui/NavIcons';
import { useAuthStore } from '@stores/authStore';

const tabs: { path: '/' | '/deal' | '/more'; icon: ReactNode; labelKey: string }[] = [
  { path: '/', icon: <CardsIcon />, labelKey: 'navigation.myCards' },
  { path: '/deal', icon: <DealIcon />, labelKey: 'navigation.deal' },
  { path: '/more', icon: <MoreIcon />, labelKey: 'navigation.more' },
];

export default function Navigation() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const partnerSlot = useAuthStore((s) => s.profile?.partnerSlot) || 'partner-a';
  const activeColor = `var(--color-${partnerSlot})`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 px-3 pb-safe">
      <div
        className="mx-auto mb-2 max-w-lg rounded-[1.75rem] border p-2"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--color-paper) 95%, transparent) 0%, color-mix(in srgb, var(--color-paper) 88%, transparent) 100%)',
          borderColor: 'color-mix(in srgb, var(--color-ink) 12%, transparent)',
          backdropFilter: 'blur(22px)',
          boxShadow:
            '0 18px 42px color-mix(in srgb, var(--color-ink) 10%, transparent), inset 0 1px 0 color-mix(in srgb, white 16%, transparent)',
        }}
      >
        <div className="grid grid-cols-3 items-stretch gap-1.5">
          {tabs.map((tab) => {
            const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-current={isActive ? 'page' : undefined}
                className="flex min-w-0 items-center justify-center px-1 py-0.5"
              >
                <span
                  className="inline-flex min-w-[5.1rem] max-w-full flex-col items-center justify-center gap-1 rounded-[1.35rem] px-3 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    color: isActive ? activeColor : 'var(--color-concrete)',
                    background: isActive
                      ? `linear-gradient(180deg, color-mix(in srgb, ${activeColor} 18%, var(--color-paper)) 0%, color-mix(in srgb, ${activeColor} 9%, var(--color-paper)) 100%)`
                      : 'transparent',
                    border: isActive
                      ? `1px solid color-mix(in srgb, ${activeColor} 26%, transparent)`
                      : '1px solid transparent',
                    boxShadow: isActive
                      ? `0 12px 26px color-mix(in srgb, ${activeColor} 12%, transparent), inset 0 1px 0 color-mix(in srgb, white 16%, transparent)`
                      : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-2xl transition-all duration-300 [&>svg]:h-5 [&>svg]:w-5"
                    style={{
                      background: isActive
                        ? `color-mix(in srgb, ${activeColor} 16%, var(--color-paper))`
                        : 'color-mix(in srgb, var(--color-ink) 9%, transparent)',
                    }}
                  >
                    {tab.icon}
                  </span>
                  <span className="block max-w-full truncate text-[10.5px] leading-none font-display font-semibold tracking-[0.04em]">
                    {t(tab.labelKey)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
