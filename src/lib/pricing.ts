export const referenceRates = {
  official: 26.63,
  bid: 25.88,
  ask: 27.21,
  businessMax: 27.3,
  streetLow: 30,
  streetHigh: 33,
  cash: 40,
};
export function ecoCashFee(
  amount: number,
  service: "send" | "cashout" | "merchant" | "cashin" | "bill",
) {
  if (service === "cashin" || service === "bill" || (service === "send" && amount <= 5)) return 0;
  const rate = service === "send" ? 0.033 : service === "cashout" ? 0.017 : 0.034;
  return Math.round(amount * rate * 100) / 100;
}
export const ecoCashSendLimit = 500;
