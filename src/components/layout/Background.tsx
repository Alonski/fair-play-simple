
/**
 * Background component with decorative gradient blobs
 */
export default function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-paper" />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-unassigned opacity-[0.08] rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-partner-a opacity-[0.08] rounded-full blur-[80px]" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-partner-b opacity-[0.08] rounded-full blur-[80px]" />
    </div>
  );
}
