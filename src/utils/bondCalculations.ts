/** НКД — накопленный купонный доход */
export function calculateNKD(
  nominal: number,
  couponRate: number,
  couponFrequency: number,
  daysSinceLastCoupon: number,
  daysInPeriod: number
): number {
  if (daysInPeriod <= 0) return 0;
  const couponPerPeriod = (nominal * couponRate) / 100 / couponFrequency;
  return (couponPerPeriod * daysSinceLastCoupon) / daysInPeriod;
}

/** Упрощённая доходность к погашению (YTM) */
export function estimateYTM(
  price: number,
  nominal: number,
  couponRate: number,
  yearsToMaturity: number
): number {
  if (yearsToMaturity <= 0 || price <= 0) return 0;
  const annualCoupon = (nominal * couponRate) / 100;
  const capitalGain = (nominal - price) / yearsToMaturity;
  const avgPrice = (nominal + price) / 2;
  return ((annualCoupon + capitalGain) / avgPrice) * 100;
}
