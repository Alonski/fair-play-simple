import { app } from './firebase';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

let model: ReturnType<typeof getGenerativeModel> | null = null;

function getModel() {
  if (model) return model;
  if (!app) return null;

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
  return model;
}

const langNames: Record<string, string> = {
  en: 'English',
  he: 'Hebrew',
};

export async function translateText(
  text: string,
  from: 'en' | 'he',
  to: 'en' | 'he',
): Promise<string> {
  if (!text.trim()) return '';

  const genModel = getModel();
  if (!genModel) {
    console.warn('Firebase AI not available — returning original text');
    return text;
  }

  const prompt = `Translate the following ${langNames[from]} text to ${langNames[to]}. Return ONLY the translation, no explanation or extra text.\n\n${text}`;

  try {
    const result = await genModel.generateContent(prompt);
    const translated = result.response.text();
    return translated?.trim() || text;
  } catch (err) {
    const code = (err as { status?: number }).status;
    if (code === 429) {
      console.warn('Translation rate limit hit');
    } else {
      console.error('Translation error:', err);
    }
    return text;
  }
}
