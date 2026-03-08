import Transactions from '../models/Transactions.js';

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/[,;\t]/).map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

function mapBrokerRow(row) {
  const keys = Object.keys(row);
  const get = (variants) => {
    for (const v of variants) {
      const k = keys.find(x => x.toLowerCase().includes(v));
      if (k) return row[k];
    }
    return null;
  };
  const ticker = get(['ticker', 'symbol', 'тикер', 'paper', 'instrument']);
  const action = (get(['action', 'operation', 'type', 'операция']) || '').toLowerCase();
  const qty = parseFloat(get(['quantity', 'qty', 'amount', 'количество']) || 0);
  const price = parseFloat(get(['price', 'цена']) || 0);
  const date = get(['date', 'trade_date', 'дата', 'timestamp']);
  const currency = (get(['currency', 'валюта', 'curr']) || 'RUB').toUpperCase().slice(0, 3);
  const commission = parseFloat(get(['commission', 'comission', 'fee', 'комиссия']) || 0);
  const asset = (get(['asset_type', 'asset', 'asset_type']) || 'security').toLowerCase();
  const assetType = asset.includes('crypto') ? 'crypto' : 'security';
  let tradeAction = 'buy';
  if (action.includes('sell') || action.includes('продаж') || action.includes('s')) tradeAction = 'sell';
  else if (action.includes('buy') || action.includes('покуп') || action.includes('b')) tradeAction = 'buy';
  const tradeDate = date ? (date.includes('T') ? date.slice(0, 10) : date.split(/[ T]/)[0]) : new Date().toISOString().slice(0, 10);
  return { tickerOrSymbol: ticker || 'UNKNOWN', action: tradeAction, quantity: qty, price, currency, commission, assetType, tradeDate };
}

export const importCSV = (req, res) => {
  try {
    const { csv, format } = req.body;
    if (!csv || typeof csv !== 'string') {
      return res.status(400).json({ error: 'Нужно поле csv с текстом' });
    }
    const rows = parseCSV(csv);
    const results = { imported: 0, errors: [] };
    for (const row of rows) {
      try {
        const mapped = mapBrokerRow(row);
        if (mapped.tickerOrSymbol === 'UNKNOWN' && !mapped.quantity) continue;
        Transactions.create(req.user.id, mapped);
        results.imported++;
      } catch (e) {
        results.errors.push({ row: JSON.stringify(row), error: e.message });
      }
    }
    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка импорта' });
  }
};
