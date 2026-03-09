const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
};

export function formatCurrency(value: number, currency: string = 'RUB'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}
