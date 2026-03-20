import { Link, useRouterState } from '@tanstack/react-router';

const tabs = [
  { path: '/' as const, icon: '🃏', label: 'My Cards' },
  { path: '/deal' as const, icon: '⚖️', label: 'Deal' },
  { path: '/more' as const, icon: '⚙️', label: 'More' },
];

export default function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activeIndex = tabs.findIndex((tab) =>
    tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path)
  );

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-safe"
      style={{ background: 'color-mix(in srgb, var(--color-paper) 92%, transparent)', backdropFilter: 'blur(16px)', borderTop: '1px solid color-mix(in srgb, var(--color-ink) 7%, transparent)' }}
    >
      <div className="flex items-stretch h-16 max-w-lg mx-auto relative">
        {/* Sliding indicator */}
        <div
          className="absolute top-2 h-8 rounded-xl bg-partner-a/15 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: `calc(${100 / tabs.length}% - 24px)`,
            left: `calc(${activeIndex * (100 / tabs.length)}% + 12px)`,
          }}
        />
        {tabs.map((tab) => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              <span className="relative text-xl leading-none" aria-hidden="true">{tab.icon}</span>
              <span
                className={`relative text-xs font-display font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-partner-a' : 'text-concrete'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
