export interface ParsedSecurity {
  name: string;
  ticker: string;
  quantity: number;
  currentPrice: number;
  previousPrice: number;
  currency: 'RUB' | 'USD' | 'EUR';
}

/**
 * Парсит CSV: Название,Тикер,Количество,Цена или ticker,name,quantity,price
 */
export function parseSecuritiesCsv(text: string): ParsedSecurity[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const result: ParsedSecurity[] = [];
  const sep = lines[0].includes(';') ? ';' : ',';

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 4) continue;

    const name = cols[0] || cols[1] || '';
    const ticker = (cols[1] || cols[0] || '').toUpperCase();
    const quantity = parseInt(cols[2].replace(/\s/g, ''), 10) || 0;
    const price = parseFloat(cols[3].replace(',', '.')) || 0;

    if (ticker && quantity > 0 && price > 0) {
      result.push({
        name: name || ticker,
        ticker,
        quantity,
        currentPrice: price,
        previousPrice: price,
        currency: 'RUB',
      });
    }
  }

  return result;
}

