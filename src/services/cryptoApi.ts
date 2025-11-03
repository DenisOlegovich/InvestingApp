export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume24h?: number;
}

/**
 * Получает данные о криптовалюте по символу
 */
export async function fetchCryptoData(symbol: string): Promise<CryptoQuote | null> {
  const normalizedSymbol = symbol.toUpperCase().trim();
  
  if (!normalizedSymbol) {
    return null;
  }

  // Пробуем несколько источников для получения данных о криптовалютах
  // 1. CoinGecko API (бесплатный, надежный)
  try {
    const coinGeckoData = await fetchCoinGeckoData(normalizedSymbol);
    if (coinGeckoData) {
      return coinGeckoData;
    }
  } catch (e) {
    console.log('CoinGecko API недоступен:', e);
  }

  // 2. Binance API (для популярных криптовалют)
  try {
    const binanceData = await fetchBinanceData(normalizedSymbol);
    if (binanceData) {
      return binanceData;
    }
  } catch (e) {
    console.log('Binance API недоступен:', e);
  }

  // 3. CryptoCompare API
  try {
    const cryptoCompareData = await fetchCryptoCompareData(normalizedSymbol);
    if (cryptoCompareData) {
      return cryptoCompareData;
    }
  } catch (e) {
    console.log('CryptoCompare API недоступен:', e);
  }

  return null;
}

/**
 * Получает данные через CoinGecko API
 */
async function fetchCoinGeckoData(symbol: string): Promise<CryptoQuote | null> {
  try {
    // CoinGecko использует ID вместо символа, пробуем прямые символы
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    
    const response = await fetch(url);
    if (!response.ok) {
      // Пробуем получить по символу через поиск
      return await fetchCoinGeckoBySymbol(symbol);
    }

    const data = await response.json();
    const cryptoData = data[symbol.toLowerCase()];
    
    if (cryptoData && cryptoData.usd) {
      const price = cryptoData.usd;
      const changePercent = cryptoData.usd_24h_change || 0;
      const previousPrice = price / (1 + changePercent / 100);
      const change = price - previousPrice;

      return {
        symbol: symbol,
        name: symbol,
        price: Math.round(price * 100) / 100,
        previousPrice: Math.round(previousPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        marketCap: cryptoData.usd_market_cap,
        volume24h: cryptoData.usd_24h_vol,
      };
    }

    return await fetchCoinGeckoBySymbol(symbol);
  } catch (error) {
    console.error('Ошибка CoinGecko API:', error);
    return null;
  }
}

/**
 * Получает данные через поиск по символу в CoinGecko
 */
async function fetchCoinGeckoBySymbol(symbol: string): Promise<CryptoQuote | null> {
  try {
    // Маппинг популярных символов на ID CoinGecko
    const symbolMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'ETC': 'ethereum-classic',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
    };

    const coinId = symbolMap[symbol.toUpperCase()];
    if (!coinId) return null;

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const cryptoData = data[coinId];
    
    if (cryptoData && cryptoData.usd) {
      const price = cryptoData.usd;
      const changePercent = cryptoData.usd_24h_change || 0;
      const previousPrice = price / (1 + changePercent / 100);
      const change = price - previousPrice;

      return {
        symbol: symbol,
        name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
        price: Math.round(price * 100) / 100,
        previousPrice: Math.round(previousPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        marketCap: cryptoData.usd_market_cap,
        volume24h: cryptoData.usd_24h_vol,
      };
    }

    return null;
  } catch (error) {
    console.error('Ошибка CoinGecko поиск:', error);
    return null;
  }
}

/**
 * Получает данные через Binance API
 */
async function fetchBinanceData(symbol: string): Promise<CryptoQuote | null> {
  try {
    // Binance использует пары типа BTCUSDT
    const pair = `${symbol}USDT`;
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.lastPrice && data.priceChangePercent) {
      const price = parseFloat(data.lastPrice);
      const changePercent = parseFloat(data.priceChangePercent);
      const previousPrice = price / (1 + changePercent / 100);
      const change = price - previousPrice;

      return {
        symbol: symbol,
        name: symbol,
        price: Math.round(price * 100) / 100,
        previousPrice: Math.round(previousPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume24h: parseFloat(data.quoteVolume),
      };
    }

    return null;
  } catch (error) {
    console.error('Ошибка Binance API:', error);
    return null;
  }
}

/**
 * Получает данные через CryptoCompare API
 */
async function fetchCryptoCompareData(symbol: string): Promise<CryptoQuote | null> {
  try {
    // Используем бесплатный API ключ (в production лучше использовать свой)
    const apiKey = 'demo';
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD&api_key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.USD && data.USD > 0) {
      // Для получения изменения цены нужен отдельный запрос
      const price = data.USD;
      
      // Пробуем получить данные с изменением
      const changeUrl = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbol}&tsyms=USD&api_key=${apiKey}`;
      try {
        const changeResponse = await fetch(changeUrl);
        if (changeResponse.ok) {
          const changeData = await changeResponse.json();
          const raw = changeData.RAW?.[symbol]?.USD;
          if (raw) {
            const changePercent = raw.CHANGEPCT24HOUR || 0;
            const previousPrice = price / (1 + changePercent / 100);
            const change = price - previousPrice;

            return {
              symbol: symbol,
              name: symbol,
              price: Math.round(price * 100) / 100,
              previousPrice: Math.round(previousPrice * 100) / 100,
              change: Math.round(change * 100) / 100,
              changePercent: Math.round(changePercent * 100) / 100,
              marketCap: raw.MKTCAP,
              volume24h: raw.VOLUME24HOUR,
            };
          }
        }
      } catch (e) {
        // Если не удалось получить изменение, возвращаем базовые данные
      }

      // Возвращаем базовые данные без изменения
      return {
        symbol: symbol,
        name: symbol,
        price: Math.round(price * 100) / 100,
        previousPrice: price,
        change: 0,
        changePercent: 0,
      };
    }

    return null;
  } catch (error) {
    console.error('Ошибка CryptoCompare API:', error);
    return null;
  }
}

/**
 * Обновляет данные для списка криптовалют
 */
export async function updateMultipleCryptos(
  symbols: string[]
): Promise<Map<string, CryptoQuote>> {
  const results = new Map<string, CryptoQuote>();
  
  if (!symbols || symbols.length === 0) {
    return results;
  }

  // Загружаем данные параллельно для всех символов
  const promises = symbols.map(async (symbol) => {
    try {
      const data = await fetchCryptoData(symbol);
      if (data) {
        results.set(symbol, data);
      }
    } catch (error) {
      console.error(`Ошибка при загрузке данных для ${symbol}:`, error);
    }
  });

  await Promise.allSettled(promises);
  return results;
}

