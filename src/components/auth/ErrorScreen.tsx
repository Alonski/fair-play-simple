import { useAuthStore } from '@stores/authStore';

export default function ErrorScreen() {
  const { error, initialize, enterReadOnlyMode } = useAuthStore();

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-display font-bold text-ink mb-2">
          Something went wrong
        </h1>
        <p className="text-sm font-body text-concrete mb-8 leading-relaxed">
          {error || 'Unable to connect. Check your internet connection and try again.'}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => initialize()}
            className="w-full px-6 py-3 bg-ink text-white font-display font-bold rounded-xl shadow-soft-sm active:scale-95 transition-transform"
          >
            Retry
          </button>
          <button
            onClick={() => enterReadOnlyMode()}
            className="w-full px-6 py-3 bg-gray-100 text-concrete font-display font-bold rounded-xl active:scale-95 transition-transform"
          >
            Continue offline (read-only)
          </button>
        </div>
      </div>
    </div>
  );
}
