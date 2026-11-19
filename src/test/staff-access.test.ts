import { describe, expect, it } from "vitest";
import { isStaff, quoteRequestSchema } from "@/lib/quote-request";
describe("Staff quote request access", () => {
  it("does not grant inbox access to an ordinary signed-in account", () => {
    expect(isStaff([])).toBe(false);
    expect(isStaff([{ role: "user" }])).toBe(false);
  });
  it("allows approved staff to see requests", () => {
    expect(isStaff([{ role: "staff" }])).toBe(true);
  });
  it("accepts a quote request with contact details", () => {
    expect(
      quoteRequestSchema.safeParse({
        customer_name: "Test Customer",
        phone: "+263 786 439 800",
        service: "eft",
        usd_amount: 100,
        payment_method: "cash",
        message: "Quote request",
      }).success,
    ).toBe(true);
  });
});
