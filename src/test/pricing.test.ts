import { describe, expect, it } from "vitest";
import { ecoCashFee, referenceRates, ecoCashSendLimit } from "@/lib/pricing";
describe("User supplied Zimbabwe pricing", () => {
  it("uses the supplied official USD/ZiG reference", () =>
    expect(referenceRates.official * 100).toBe(2663));
  it("uses bid and ask 25.88 and 27.21", () =>
    expect([referenceRates.bid, referenceRates.ask]).toEqual([25.88, 27.21]));
  it("uses business maximum 27.30", () => expect(referenceRates.businessMax * 100).toBe(2730));
  it("uses street range 30 to 33", () =>
    expect([referenceRates.streetLow, referenceRates.streetHigh]).toEqual([30, 33]));
  it("uses cash reference 40", () => expect(referenceRates.cash * 100).toBe(4000));
  it("charges 3.30 for sending 100 USD", () => expect(ecoCashFee(100, "send")).toBe(3.3));
  it("charges 16.50 for sending 500 USD", () => expect(ecoCashFee(500, "send")).toBe(16.5));
  it("cash out 100 costs 1.70", () => expect(ecoCashFee(100, "cashout")).toBe(1.7));
  it("merchant payment 100 costs 3.40", () => expect(ecoCashFee(100, "merchant")).toBe(3.4));
  it("sends 5 USD or less free", () => {
    expect(ecoCashFee(5, "send")).toBe(0);
    expect(ecoCashFee(5.01, "send")).toBe(0.17);
  });
  it("cash in is free", () => expect(ecoCashFee(100, "cashin")).toBe(0));
  it("bill payments are free", () => expect(ecoCashFee(100, "bill")).toBe(0));
  it("caps a send at 500 USD", () => expect(ecoCashSendLimit).toBe(500));
});
