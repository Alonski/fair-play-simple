import { z } from 'genkit';
export declare const translateFlow: import("genkit").Action<z.ZodObject<{
    text: z.ZodString;
    from: z.ZodEnum<["en", "he"]>;
    to: z.ZodEnum<["en", "he"]>;
}, "strip", z.ZodTypeAny, {
    text: string;
    from: "en" | "he";
    to: "en" | "he";
}, {
    text: string;
    from: "en" | "he";
    to: "en" | "he";
}>, z.ZodObject<{
    translated: z.ZodString;
}, "strip", z.ZodTypeAny, {
    translated: string;
}, {
    translated: string;
}>, z.ZodTypeAny>;
//# sourceMappingURL=translate.d.ts.map