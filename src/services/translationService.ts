import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = app ? getFunctions(app) : null;

export async function translateText(
  text: string,
  from: 'en' | 'he',
  to: 'en' | 'he',
): Promise<string> {
  if (!text.trim()) return '';
  if (!functions) {
    console.warn('Firebase not available — returning original text');
    return text;
  }

  try {
    const callable = httpsCallable<{ text: string; from: string; to: string }, { translated: string }>(functions, 'translate');
    const result = await callable({ text, from, to });
    return result.data.translated || text;
  } catch (err) {
    console.error('Translation error:', err);
    return text;
  }
}
