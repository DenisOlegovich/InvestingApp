import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Portfolio } from '../types';

export function exportPortfolioToJson(portfolio: Portfolio, userName: string): void {
  const data = {
    exportDate: new Date().toISOString(),
    userName,
    portfolio,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPortfolioToExcel(portfolio: Portfolio): void {
  const wb = XLSX.utils.book_new();

  const securitiesData = [
    ['Название', 'Тикер', 'Тип', 'Цена', 'Кол-во', 'Стоимость', 'Валюта'],
    ...portfolio.securities.map((s) => [
      s.name,
      s.ticker,
      s.type,
      s.currentPrice,
      s.quantity,
      s.currentPrice * s.quantity,
      s.currency,
    ]),
  ];

  const depositsData = [
    ['Название', 'Банк', 'Сумма', 'Ставка %', 'Валюта'],
    ...portfolio.deposits.map((d) => [d.name, d.bank, d.amount, d.interestRate, d.currency]),
  ];

  const cryptosData = [
    ['Название', 'Символ', 'Кол-во', 'Цена', 'Стоимость'],
    ...portfolio.cryptocurrencies.map((c) => [
      c.name,
      c.symbol,
      c.amount,
      c.currentPrice,
      c.amount * c.currentPrice,
    ]),
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(securitiesData), 'Ценные бумаги');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(portfolio.realEstate.length ? [['Название', 'Локация', 'Стоимость'], ...portfolio.realEstate.map((r) => [r.name, r.location, r.currentValue])] : [['Нет данных']]), 'Недвижимость');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(depositsData), 'Депозиты');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cryptosData), 'Криптовалюты');

  XLSX.writeFile(wb, `portfolio-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportPortfolioToPdf(portfolio: Portfolio, userName: string): void {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Отчёт по портфелю', 14, 20);
  doc.setFontSize(10);
  doc.text(`Пользователь: ${userName}`, 14, 28);
  doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 34);

  let y = 45;

  if (portfolio.securities.length > 0) {
    doc.setFontSize(12);
    doc.text('Ценные бумаги', 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Название', 'Тикер', 'Цена', 'Кол-во', 'Стоимость']],
      body: portfolio.securities.map((s) => [
        s.name,
        s.ticker,
        s.currentPrice.toFixed(2),
        s.quantity,
        (s.currentPrice * s.quantity).toFixed(2),
      ]),
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (portfolio.deposits.length > 0) {
    doc.setFontSize(12);
    doc.text('Депозиты', 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Название', 'Банк', 'Сумма', 'Ставка %']],
      body: portfolio.deposits.map((d) => [d.name, d.bank, d.amount.toFixed(2), d.interestRate.toFixed(2)]),
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  doc.save(`portfolio-${new Date().toISOString().slice(0, 10)}.pdf`);
}
