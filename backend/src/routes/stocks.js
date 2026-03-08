import express from 'express';

const router = express.Router();

/**
 * Поиск тикеров по названию (прокси для Yahoo Finance — обход CORS)
 */
router.get('/search', async (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) {
    return res.json({ quotes: [] });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=15&newsCount=0`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Finance/1.0)' },
    });
    if (!response.ok) {
      return res.json({ quotes: [] });
    }
    const data = await response.json();
    const quotes = (data?.quotes || [])
      .filter((item) => {
        const t = item.quoteType || '';
        if (t === 'CRYPTOCURRENCY') return false;
        return ['EQUITY', 'ETF', 'FUND'].includes(t) || !t;
      })
      .map((item) => ({
        symbol: item.symbol || '',
        shortname: item.shortname || item.longname || '',
        longname: item.longname || item.shortname,
        exchange: item.exchange || '',
        typeDisp: item.typeDisp || '',
        quoteType: item.quoteType || '',
      }))
      .filter((item) => item.symbol);
    res.json({ quotes });
  } catch (err) {
    console.error('Stocks search error:', err);
    res.status(500).json({ error: 'Ошибка поиска', quotes: [] });
  }
});

export default router;
