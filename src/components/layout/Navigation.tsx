import { Link, useRouterState } from '@tanstack/react-router';

const tabs = [
  { path: '/' as const, icon: '🃏', label: 'My Cards' },
  { path: '/deal' as const, icon: '⚖️', label: 'Deal' },
  { path: '/more' as const, icon: '⚙️', label: 'More' },
];

export default function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-safe"
      style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,0,0,0.07)' }}
    >
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {isActive && (
                <span
                  className="absolute top-2 inset-x-3 h-8 rounded-xl bg-partner-a/10"
                  style={{ transition: 'opacity 150ms' }}
                />
              )}
              <span className="relative text-xl leading-none">{tab.icon}</span>
              <span
                className={`relative text-[10px] font-display font-bold tracking-wide transition-colors ${
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
