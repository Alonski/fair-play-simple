import { onCallGenkit } from 'firebase-functions/https';
import { defineSecret } from 'firebase-functions/params';
import { z } from 'genkit';
import { ai } from './genkit.js';
const geminiApiKey = defineSecret('GEMINI_API_KEY');
// --- Test flow: verify Genkit round-trip ---
const helloFlow = ai.defineFlow({
    name: 'helloFlow',
    inputSchema: z.object({ name: z.string() }),
    outputSchema: z.object({ greeting: z.string() }),
}, async ({ name }) => {
    const { text } = await ai.generate(`Say hello to ${name} in a friendly, brief way. One sentence only.`);
    return { greeting: text };
});
export const hello = onCallGenkit({
    secrets: [geminiApiKey],
}, helloFlow);
//# sourceMappingURL=index.js.map