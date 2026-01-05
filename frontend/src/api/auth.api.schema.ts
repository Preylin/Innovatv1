import z from "zod";

export const LoginInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export type LoginInType = z.infer<typeof LoginInSchema>;

export const TokenOutSchema = z.object({
    access_token: z.string(),
    token_type: z.string().default("bearer"),
});

export type TokenOutType = z.infer<typeof TokenOutSchema>;

export const ValidationErrorSchema = z.object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
});

export type ValidationErrorType = z.infer<typeof ValidationErrorSchema>;

const HTTPValidationErrorSchema = z.object({
    detail: z.array(ValidationErrorSchema).optional(),
});

export type HTTPValidationErrorType = z.infer<typeof HTTPValidationErrorSchema>;