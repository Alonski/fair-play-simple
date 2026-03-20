export default function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-paper" />
      {/* Warm rose — top right */}
      <div
        className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-partner-a opacity-[0.12] rounded-full blur-[100px]"
        style={{ animation: 'float 20s ease-in-out infinite', '--rotate': '0deg' } as React.CSSProperties}
      />
      {/* Sage — bottom left */}
      <div
        className="absolute -bottom-24 -left-24 w-[480px] h-[480px] bg-partner-b opacity-[0.12] rounded-full blur-[100px]"
        style={{ animation: 'float 25s ease-in-out infinite 5s', '--rotate': '0deg' } as React.CSSProperties}
      />
      {/* Warm gold — centre */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-unassigned opacity-[0.09] rounded-full blur-[80px]"
        style={{ animation: 'float 22s ease-in-out infinite 10s', '--rotate': '0deg' } as React.CSSProperties}
      />
    </div>
  );
}
