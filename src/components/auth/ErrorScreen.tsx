import { useAuthStore } from '@stores/authStore';

/** Map Firebase / network error codes to user-friendly messages */
function friendlyMessage(error: string | null): string {
  if (!error) return 'Unable to connect. Check your internet connection and try again.';

  const lower = error.toLowerCase();

  // Firebase Auth errors
  if (lower.includes('auth/network-request-failed') || lower.includes('network'))
    return 'It looks like you are offline. Check your connection and try again.';
  if (lower.includes('auth/popup-closed-by-user') || lower.includes('popup'))
    return 'The sign-in window was closed before finishing. Please try again.';
  if (lower.includes('auth/user-disabled'))
    return 'This account has been disabled. Please contact support.';
  if (lower.includes('auth/too-many-requests'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (lower.includes('auth/unauthorized-domain'))
    return 'Sign-in is not available from this domain. Please use the official app URL.';
  if (lower.includes('permission-denied') || lower.includes('permissions'))
    return 'You do not have permission to access this household. Check that you are using the right Google account.';
  if (lower.includes('unavailable') || lower.includes('deadline-exceeded'))
    return 'The server is temporarily unavailable. Please try again in a moment.';

  // If the raw error is already user-friendly (no slashes or code-like patterns), show it directly
  if (!error.includes('/') && error.length < 200) return error;

  // Fallback
  return 'Something unexpected happened. Please try again or check your connection.';
}

export default function ErrorScreen() {
  const { error, initialize, enterReadOnlyMode } = useAuthStore();
  const message = friendlyMessage(error);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-5xl mb-6" aria-hidden="true">&#x26A0;&#xFE0F;</div>
        <h1 className="text-2xl font-display font-bold text-ink mb-2">
          Something went wrong
        </h1>
        <p className="text-sm font-body text-concrete mb-8 leading-relaxed">
          {message}
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
