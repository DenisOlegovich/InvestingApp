import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Portfolio } from '../../types';
import type { ExchangeRates } from '../../services/currencyApi';
import { exportPortfolioToJson, exportPortfolioToExcel, exportPortfolioToPdf } from '../../utils/export';
import { parseSecuritiesCsv } from '../../utils/csvImport';
import { estimateAnnualDividendsRub } from '../../utils/investor';
import { calculateTotalPortfolioValueInRUB } from '../../utils/calculations';
import { portfolioAPI } from '../../services/api';
import { BondCalculatorPanel } from './BondCalculatorPanel';
import { BacktestPanel } from './BacktestPanel';
import './ToolsPanel.css';

interface ToolsPanelProps {
  portfolio: Portfolio;
  userName: string;
  rates?: ExchangeRates | null;
  onImportSecurities: (securities: Array<Omit<import('../../types').Security, 'id'>>) => void;
  onRestoreBackup?: (portfolio: Portfolio) => void;
}

const DEFAULT_INFLATION = 7.5;

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  portfolio,
  userName,
  rates,
  onImportSecurities,
  onRestoreBackup,
}) => {
  const portfolioValue = useMemo(
    () => (rates ? calculateTotalPortfolioValueInRUB(portfolio, rates) : 0),
    [portfolio, rates]
  );
  const annualDividends = useMemo(
    () => (rates ? estimateAnnualDividendsRub(portfolio.securities, rates) : 0),
    [portfolio.securities, rates]
  );
  const [calcSum, setCalcSum] = useState('');
  const [calcRate, setCalcRate] = useState('');
  const [calcYears, setCalcYears] = useState('');
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [iisSum, setIisSum] = useState('');
  const [iisYears, setIisYears] = useState('');
  const [iisResult, setIisResult] = useState<{ deduction: number; total: number } | null>(null);
  const [alertThreshold, setAlertThreshold] = useState(() => {
    return localStorage.getItem('investor_alert_threshold') || '5';
  });
  const [taxReport, setTaxReport] = useState<{
    buys: number;
    sells: number;
    realized: number;
    count: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    portfolioAPI.getTransactions().then((txs) => {
      let buys = 0;
      let sells = 0;
      for (const t of txs) {
        if (t.type === 'buy') buys += t.total;
        else sells += t.total;
      }
      setTaxReport({
        buys,
        sells,
        realized: Math.round((sells - buys) * 100) / 100,
        count: txs.length,
      });
    }).catch(() => setTaxReport({ buys: 0, sells: 0, realized: 0, count: 0 }));
  }, []);

  const handleExportJson = () => exportPortfolioToJson(portfolio, userName);
  const handleExportExcel = () => exportPortfolioToExcel(portfolio);
  const handleExportPdf = () => exportPortfolioToPdf(portfolio, userName);

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const parsed = parseSecuritiesCsv(text);
      if (parsed.length === 0) {
        alert('Не удалось распознать данные. Формат: Название,Тикер,Количество,Цена');
      } else {
        const securities = parsed.map((p) => ({
          name: p.name,
          ticker: p.ticker,
          type: 'stock' as const,
          currentPrice: p.currentPrice,
          previousPrice: p.previousPrice,
          quantity: p.quantity,
          expectedDividend: 0,
          dividendFrequency: 'yearly' as const,
          currency: p.currency,
        }));
        onImportSecurities(securities);
        alert(`Импортировано ${securities.length} бумаг`);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleRestoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onRestoreBackup) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const p = data.portfolio ?? data;
        if (p.securities || p.deposits || p.cryptocurrencies) {
          if (confirm('Заменить текущий портфель резервной копией?')) {
            onRestoreBackup(p);
          }
        }
      } catch {
        alert('Ошибка чтения файла');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleCalcCompound = () => {
    const sum = parseFloat(calcSum.replace(',', '.'));
    const rate = parseFloat(calcRate.replace(',', '.')) / 100;
    const years = parseFloat(calcYears.replace(',', '.'));
    if (!sum || !rate || !years) return;
    setCalcResult(sum * Math.pow(1 + rate, years));
  };

  const handleCalcIIS = () => {
    const sum = parseFloat(iisSum.replace(',', '.'));
    const years = parseFloat(iisYears.replace(',', '.'));
    if (!sum || !years) return;
    const totalContrib = sum * years;
    const totalDeduction = Math.min(totalContrib * 0.13, 52000 * years);
    setIisResult({ deduction: totalDeduction, total: totalContrib + totalDeduction });
  };

  const saveAlertThreshold = (v: string) => {
    setAlertThreshold(v);
    localStorage.setItem('investor_alert_threshold', v);
  };

  return (
    <div className="tools-panel">
      <h2>Инструменты</h2>

      <section className="tools-section">
        <h3>Экспорт</h3>
        <div className="tools-buttons">
          <button onClick={handleExportJson} className="tool-btn">Резервная копия (JSON)</button>
          <button onClick={handleExportExcel} className="tool-btn">Экспорт в Excel</button>
          <button onClick={handleExportPdf} className="tool-btn">Отчёт PDF</button>
        </div>
      </section>

      <section className="tools-section">
        <h3>Импорт</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleCsvChange}
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()} className="tool-btn">
          Импорт из CSV
        </button>
        <small className="tools-hint">Формат: Название,Тикер,Количество,Цена</small>
      </section>

      {onRestoreBackup && (
        <section className="tools-section">
          <h3>Восстановление</h3>
          <input
            ref={restoreInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreChange}
            style={{ display: 'none' }}
          />
          <button onClick={() => restoreInputRef.current?.click()} className="tool-btn">
            Восстановить из бэкапа
          </button>
        </section>
      )}

      <section className="tools-section">
        <h3>Калькулятор сложного процента</h3>
        <div className="tools-form">
          <label>Сумма (₽)</label>
          <input
            type="text"
            value={calcSum}
            onChange={(e) => setCalcSum(e.target.value)}
            placeholder="100000"
          />
          <label>Годовая доходность %</label>
          <input
            type="text"
            value={calcRate}
            onChange={(e) => setCalcRate(e.target.value)}
            placeholder="10"
          />
          <label>Лет</label>
          <input
            type="text"
            value={calcYears}
            onChange={(e) => setCalcYears(e.target.value)}
            placeholder="10"
          />
          <button onClick={handleCalcCompound} className="tool-btn">Рассчитать</button>
          {calcResult != null && (
            <div className="calc-result">
              Через {calcYears} лет: <strong>{calcResult.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</strong>
            </div>
          )}
        </div>
      </section>

      <section className="tools-section">
        <h3>Калькулятор ИИС</h3>
        <div className="tools-form">
          <label>Взнос за год (₽)</label>
          <input
            type="text"
            value={iisSum}
            onChange={(e) => setIisSum(e.target.value)}
            placeholder="400000"
          />
          <label>Лет на ИИС</label>
          <input
            type="text"
            value={iisYears}
            onChange={(e) => setIisYears(e.target.value)}
            placeholder="3"
          />
          <button onClick={handleCalcIIS} className="tool-btn">Рассчитать вычет</button>
          {iisResult && (
            <div className="calc-result">
              Вычет 13%: <strong>{iisResult.deduction.toLocaleString('ru-RU')} ₽</strong>
              <br />
              Итого с вычетом: <strong>{iisResult.total.toLocaleString('ru-RU')} ₽</strong>
            </div>
          )}
        </div>
      </section>

      <section className="tools-section">
        <h3>Налоговый отчёт</h3>
        {taxReport !== null ? (
          <div className="tax-report">
            <p>Сделок: {taxReport.count}</p>
            <p>Покупки: {taxReport.buys.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽</p>
            <p>Продажи: {taxReport.sells.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽</p>
            <p>Реализ. приб./убыток: <strong>{taxReport.realized.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽</strong></p>
            <p>НДФЛ 13%: <strong>{Math.max(0, taxReport.realized * 0.13).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽</strong></p>
            <small className="tools-hint">Ориентировочно. Для точного расчёта используйте FIFO.</small>
          </div>
        ) : (
          <p>Загрузка...</p>
        )}
      </section>

      {rates && (
        <section className="tools-section">
          <h3>Отчёт по дивидендам (год)</h3>
          <div className="tax-report">
            <p>Прогноз годовых дивидендов: <strong>{annualDividends.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</strong></p>
            <p>Див. доходность: {portfolioValue > 0 ? ((annualDividends / portfolioValue) * 100).toFixed(2) : 0}%</p>
          </div>
        </section>
      )}

      {rates && (
        <section className="tools-section">
          <h3>Сравнение с инфляцией</h3>
          <div className="tax-report">
            <p>Инфляция (ориентир): {DEFAULT_INFLATION}%</p>
            <p>Чтобы обогнать инфляцию, доходность портфеля должна быть &gt; {DEFAULT_INFLATION}% годовых.</p>
            <p>Текущая див. доходность: {portfolioValue > 0 ? ((annualDividends / portfolioValue) * 100).toFixed(2) : 0}%</p>
          </div>
        </section>
      )}

      <section className="tools-section">
        <h3>Калькулятор облигаций</h3>
        <BondCalculatorPanel />
      </section>

      <section className="tools-section">
        <h3>Backtesting DCA</h3>
        <BacktestPanel initialCapital={portfolioValue} />
      </section>

      <section className="tools-section">
        <h3>Алерты</h3>
        <label>Порог изменения % для уведомления</label>
        <input
          type="number"
          value={alertThreshold}
          onChange={(e) => saveAlertThreshold(e.target.value)}
          min={1}
          max={50}
        />
      </section>
    </div>
  );
};
