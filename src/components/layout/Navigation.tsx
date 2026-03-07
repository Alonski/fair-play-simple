import { Link, useRouterState } from '@tanstack/react-router';

const tabs = [
  { path: '/' as const, icon: '\uD83C\uDCCF', label: 'My Cards' },
  { path: '/deal' as const, icon: '\u2696\uFE0F', label: 'Deal' },
  { path: '/more' as const, icon: '\u2699\uFE0F', label: 'More' },
];

export default function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 pb-safe">
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-partner-a' : 'text-concrete hover:text-ink'
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-display font-bold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
