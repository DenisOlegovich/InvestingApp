export interface ExchangeRates {
  USD_RUB: number;
  EUR_RUB: number;
  lastUpdate: Date;
}

// Получение курсов валют из ЦБ РФ
async function fetchCBRRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (!response.ok) return null;
    
    const data = await response.json();
    
    const usdRate = data.Valute?.USD?.Value || null;
    const eurRate = data.Valute?.EUR?.Value || null;
    
    if (usdRate && eurRate) {
      return {
        USD_RUB: Math.round(usdRate * 100) / 100,
        EUR_RUB: Math.round(eurRate * 100) / 100,
        lastUpdate: new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('CBR API error:', error);
    return null;
  }
}

// Получение курсов из exchangerate-api.com
async function fetchExchangeRateAPI(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.rates?.USD && data.rates?.EUR) {
      return {
        USD_RUB: Math.round((1 / data.rates.USD) * 100) / 100,
        EUR_RUB: Math.round((1 / data.rates.EUR) * 100) / 100,
        lastUpdate: new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('ExchangeRate API error:', error);
    return null;
  }
}

// Получение курсов из Frankfurter API (резервный источник)
async function fetchFrankfurterAPI(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=RUB&to=USD,EUR');
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.rates?.USD && data.rates?.EUR) {
      return {
        USD_RUB: Math.round((1 / data.rates.USD) * 100) / 100,
        EUR_RUB: Math.round((1 / data.rates.EUR) * 100) / 100,
        lastUpdate: new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Frankfurter API error:', error);
    return null;
  }
}

// Фоллбэк - фиксированные курсы
function getDefaultRates(): ExchangeRates {
  return {
    USD_RUB: 92.50,
    EUR_RUB: 100.00,
    lastUpdate: new Date(),
  };
}

// Основная функция для получения курсов валют
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  // Сначала пробуем ЦБ РФ (наиболее точный для рубля)
  const cbrRates = await fetchCBRRates();
  if (cbrRates) {
    console.log('Exchange rates from CBR:', cbrRates);
    return cbrRates;
  }

  // Затем пробуем exchangerate-api
  const exchangeRates = await fetchExchangeRateAPI();
  if (exchangeRates) {
    console.log('Exchange rates from ExchangeRate API:', exchangeRates);
    return exchangeRates;
  }

  // Затем пробуем Frankfurter
  const frankfurterRates = await fetchFrankfurterAPI();
  if (frankfurterRates) {
    console.log('Exchange rates from Frankfurter:', frankfurterRates);
    return frankfurterRates;
  }

  // Если все API недоступны, используем дефолтные курсы
  console.warn('All currency APIs failed, using default rates');
  return getDefaultRates();
}

// Конвертация валюты в рубли
export function convertToRUB(
  amount: number,
  currency: 'RUB' | 'USD' | 'EUR',
  rates: ExchangeRates
): number {
  switch (currency) {
    case 'USD':
      return amount * rates.USD_RUB;
    case 'EUR':
      return amount * rates.EUR_RUB;
    case 'RUB':
    default:
      return amount;
  }
}

