import { z } from 'genkit';
export declare const skipSuggestFlow: import("genkit").Action<z.ZodObject<{
    cards: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        category: z.ZodString;
        frequency: z.ZodOptional<z.ZodString>;
        timeEstimate: z.ZodOptional<z.ZodNumber>;
        holder: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        category: string;
        id: string;
        title: string;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
        holder?: string | null | undefined;
    }, {
        category: string;
        id: string;
        title: string;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
        holder?: string | null | undefined;
    }>, "many">;
    householdContext: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cards: {
        category: string;
        id: string;
        title: string;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
        holder?: string | null | undefined;
    }[];
    householdContext: string;
}, {
    cards: {
        category: string;
        id: string;
        title: string;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
        holder?: string | null | undefined;
    }[];
    householdContext: string;
}>, z.ZodObject<{
    suggestions: z.ZodArray<z.ZodObject<{
        cardId: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        cardId: string;
        reason: string;
    }, {
        cardId: string;
        reason: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    suggestions: {
        cardId: string;
        reason: string;
    }[];
}, {
    suggestions: {
        cardId: string;
        reason: string;
    }[];
}>, z.ZodTypeAny>;
export declare const dealSuggestFlow: import("genkit").Action<z.ZodObject<{
    cards: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        category: z.ZodString;
        frequency: z.ZodOptional<z.ZodString>;
        timeEstimate: z.ZodOptional<z.ZodNumber>;
        holder: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        category: string;
        id: string;
        title: string;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
        holder?: string | null | undefined;
    }, {
        category: string;
        id: string;
        title: string;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
        holder?: string | null | undefined;
    }>, "many">;
    partnerAName: z.ZodString;
    partnerBName: z.ZodString;
    householdContext: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cards: {
        category: string;
        id: string;
        title: string;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
        holder?: string | null | undefined;
    }[];
    householdContext: string;
    partnerAName: string;
    partnerBName: string;
}, {
    cards: {
        category: string;
        id: string;
        title: string;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
        holder?: string | null | undefined;
    }[];
    householdContext: string;
    partnerAName: string;
    partnerBName: string;
}>, z.ZodObject<{
    suggestions: z.ZodArray<z.ZodObject<{
        cardId: z.ZodString;
        suggestedHolder: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        cardId: string;
        reason: string;
        suggestedHolder: string;
    }, {
        cardId: string;
        reason: string;
        suggestedHolder: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    suggestions: {
        cardId: string;
        reason: string;
        suggestedHolder: string;
    }[];
}, {
    suggestions: {
        cardId: string;
        reason: string;
        suggestedHolder: string;
    }[];
}>, z.ZodTypeAny>;
export declare const rebalanceFlow: import("genkit").Action<z.ZodObject<{
    cards: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        category: z.ZodString;
        frequency: z.ZodOptional<z.ZodString>;
        timeEstimate: z.ZodOptional<z.ZodNumber>;
    } & {
        holder: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        category: string;
        id: string;
        title: string;
        holder: string | null;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
    }, {
        category: string;
        id: string;
        title: string;
        holder: string | null;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
    }>, "many">;
    partnerAName: z.ZodString;
    partnerBName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cards: {
        category: string;
        id: string;
        title: string;
        holder: string | null;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
    }[];
    partnerAName: string;
    partnerBName: string;
}, {
    cards: {
        category: string;
        id: string;
        title: string;
        holder: string | null;
        frequency?: string | undefined;
        timeEstimate?: number | undefined;
    }[];
    partnerAName: string;
    partnerBName: string;
}>, z.ZodObject<{
    suggestions: z.ZodArray<z.ZodObject<{
        cardId: z.ZodString;
        suggestedHolder: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        cardId: string;
        reason: string;
        suggestedHolder: string;
    }, {
        cardId: string;
        reason: string;
        suggestedHolder: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    suggestions: {
        cardId: string;
        reason: string;
        suggestedHolder: string;
    }[];
}, {
    suggestions: {
        cardId: string;
        reason: string;
        suggestedHolder: string;
    }[];
}>, z.ZodTypeAny>;
export declare const mscSuggestFlow: import("genkit").Action<z.ZodObject<{
    cardTitle: z.ZodString;
    cardDescription: z.ZodString;
    cardCategory: z.ZodString;
    language: z.ZodEnum<["en", "he"]>;
}, "strip", z.ZodTypeAny, {
    cardTitle: string;
    cardDescription: string;
    cardCategory: string;
    language: "en" | "he";
}, {
    cardTitle: string;
    cardDescription: string;
    cardCategory: string;
    language: "en" | "he";
}>, z.ZodObject<{
    mscNote: z.ZodString;
}, "strip", z.ZodTypeAny, {
    mscNote: string;
}, {
    mscNote: string;
}>, z.ZodTypeAny>;
//# sourceMappingURL=cards.d.ts.map