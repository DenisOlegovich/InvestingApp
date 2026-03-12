export interface ExchangeRates {
  USD_RUB: number;
  EUR_RUB: number;
  lastUpdate: Date;
}

const DEFAULT_RATES: ExchangeRates = {
  USD_RUB: 92.5,
  EUR_RUB: 100,
  lastUpdate: new Date(),
};

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (!res.ok) return DEFAULT_RATES;
    const data = await res.json();
    const usd = data.Valute?.USD?.Value;
    const eur = data.Valute?.EUR?.Value;
    if (usd && eur) {
      return {
        USD_RUB: Math.round(usd * 100) / 100,
        EUR_RUB: Math.round(eur * 100) / 100,
        lastUpdate: new Date(),
      };
    }
  } catch {}
  return DEFAULT_RATES;
}

export function convertToRUB(amount: number, currency: string, rates: ExchangeRates): number {
  if (currency === 'RUB') return amount;
  if (currency === 'USD') return amount * rates.USD_RUB;
  if (currency === 'EUR') return amount * rates.EUR_RUB;
  return amount;
}
