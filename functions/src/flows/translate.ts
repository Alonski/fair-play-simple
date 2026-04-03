import { z } from 'genkit';
import { ai } from '../genkit.js';

const langNames: Record<string, string> = {
  en: 'English',
  he: 'Hebrew',
};

export const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: z.object({
      text: z.string(),
      from: z.enum(['en', 'he']),
      to: z.enum(['en', 'he']),
    }),
    outputSchema: z.object({ translated: z.string() }),
  },
  async ({ text, from, to }) => {
    if (!text.trim()) return { translated: '' };

    const prompt = `Translate the following ${langNames[from]} text to ${langNames[to]}. Return ONLY the translation, no explanation or extra text.\n\n${text}`;
    const { text: result } = await ai.generate(prompt);
    return { translated: result?.trim() || text };
  },
);
