import { z } from 'genkit';
export declare const chatFlow: import("genkit").Action<z.ZodObject<{
    message: z.ZodString;
    chatMode: z.ZodEnum<["private", "shared"]>;
    userId: z.ZodString;
    householdId: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    chatMode: "shared" | "private";
    userId: string;
    householdId: string;
}, {
    message: string;
    chatMode: "shared" | "private";
    userId: string;
    householdId?: string | undefined;
}>, z.ZodObject<{
    response: z.ZodString;
}, "strip", z.ZodTypeAny, {
    response: string;
}, {
    response: string;
}>, z.ZodTypeAny>;
//# sourceMappingURL=chat.d.ts.map