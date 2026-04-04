import { z } from 'genkit';
export declare const chatFlow: import("genkit").Action<z.ZodObject<{
    message: z.ZodString;
    chatMode: z.ZodEnum<["private", "shared"]>;
}, "strip", z.ZodTypeAny, {
    message: string;
    chatMode: "shared" | "private";
}, {
    message: string;
    chatMode: "shared" | "private";
}>, z.ZodObject<{
    response: z.ZodString;
}, "strip", z.ZodTypeAny, {
    response: string;
}, {
    response: string;
}>, z.ZodTypeAny>;
//# sourceMappingURL=chat.d.ts.map