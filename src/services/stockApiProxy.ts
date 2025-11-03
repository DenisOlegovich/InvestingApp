/**
 * Альтернативный способ получения данных через публичные прокси
 * Используется как запасной вариант для популярных акций
 */

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dividendYield?: number;
  dividendFrequency?: 'monthly' | 'quarterly' | 'yearly';
  currency: 'RUB' | 'USD' | 'EUR';
}

/**
 * Получает данные через альтернативные публичные API
 */
export async function fetchStockDataViaProxy(ticker: string): Promise<StockQuote | null> {
  const normalizedTicker = ticker.toUpperCase().trim();
  
  // Пробуем через различные публичные сервисы
  try {
    // 1. Twelve Data API (бесплатный тариф)
    const twelveData = await fetchTwelveData(normalizedTicker);
    if (twelveData) return twelveData;
  } catch (e) {
    console.log('Twelve Data недоступен');
  }

  try {
    // 2. Polygon.io (бесплатный тариф)
    const polygonData = await fetchPolygon(normalizedTicker);
    if (polygonData) return polygonData;
  } catch (e) {
    console.log('Polygon.io недоступен');
  }

  return null;
}

async function fetchTwelveData(ticker: string): Promise<StockQuote | null> {
  try {
    // Используем бесплатный демо ключ (в production нужен реальный)
    const apiKey = 'demo';
    const url = `https://api.twelvedata.com/price?symbol=${ticker}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.price && parseFloat(data.price) > 0) {
      const price = parseFloat(data.price);
      // Для получения предыдущей цены нужен отдельный запрос
      return {
        symbol: ticker,
        name: ticker,
        price: Math.round(price * 100) / 100,
        previousClose: price,
        change: 0,
        changePercent: 0,
        currency: 'USD',
        dividendFrequency: 'quarterly',
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function fetchPolygon(ticker: string): Promise<StockQuote | null> {
  try {
    // Используем демо ключ (в production нужен реальный)
    const apiKey = 'demo';
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const price = result.c || result.close || 0;
      const previousPrice = result.o || result.open || price;
      const change = price - previousPrice;
      const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

      if (price > 0) {
        return {
          symbol: ticker,
          name: ticker,
          price: Math.round(price * 100) / 100,
          previousClose: Math.round(previousPrice * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          currency: 'USD',
          dividendFrequency: 'quarterly',
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

