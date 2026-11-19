import { z } from "zod";

export const quoteRequestSchema = z.object({
  customer_name: z.string().trim().min(1, "Enter your name").max(100),
  phone: z
    .string()
    .trim()
    .min(6, "Enter your phone number")
    .max(30)
    .regex(/^[+\d\s()-]+$/, "Enter a valid phone number"),
  service: z.enum(["eft", "collect", "eco"]),
  usd_amount: z.number().positive("Enter an amount greater than zero").max(9999999999),
  payment_method: z.enum(["cash", "eco"]),
  message: z.string().max(4000),
});
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export const isStaff = (roles: { role: string }[]) =>
  roles.some(({ role }) => role === "staff" || role === "admin");
