import { onCallGenkit } from 'firebase-functions/https';
import { defineSecret } from 'firebase-functions/params';
import { translateFlow } from './flows/translate.js';
import { skipSuggestFlow, dealSuggestFlow, rebalanceFlow, mscSuggestFlow } from './flows/cards.js';
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const genkitOpts = { secrets: [geminiApiKey] };
// --- AI Flows exposed as callable Cloud Functions ---
export const translate = onCallGenkit(genkitOpts, translateFlow);
export const skipSuggest = onCallGenkit(genkitOpts, skipSuggestFlow);
export const dealSuggest = onCallGenkit(genkitOpts, dealSuggestFlow);
export const rebalance = onCallGenkit(genkitOpts, rebalanceFlow);
export const mscSuggest = onCallGenkit(genkitOpts, mscSuggestFlow);
//# sourceMappingURL=index.js.map