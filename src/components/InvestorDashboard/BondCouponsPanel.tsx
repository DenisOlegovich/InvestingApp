import React, { useState, useEffect, useMemo } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import { convertToRUB } from '../../services/currencyApi';
import { extendedAPI } from '../../services/api';
import type { BondCoupon } from '../../types/investor';

function fmtRub(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

function computeYTM(price: number, coupon: number, yearsToMaturity: number, faceValue = 1000): number {
  if (yearsToMaturity <= 0) return 0;
  const couponPerYear = coupon;
  let ytm = coupon / price;
  for (let i = 0; i < 20; i++) {
    let pv = 0;
    for (let t = 1; t <= Math.ceil(yearsToMaturity); t++) {
      pv += couponPerYear / Math.pow(1 + ytm, t);
    }
    pv += faceValue / Math.pow(1 + ytm, yearsToMaturity);
    const diff = pv - price;
    if (Math.abs(diff) < 0.01) break;
    ytm += diff / (price * 100);
  }
  return ytm * 100;
}

export const BondCouponsPanel: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
}> = ({ portfolio, rates }) => {
  const [coupons, setCoupons] = useState<BondCoupon[]>([]);

  useEffect(() => {
    extendedAPI.bondCoupons.get().then((r: any) => setCoupons(r));
  }, []);

  const bonds = portfolio.securities.filter((s) => s.type === 'bond');
  const couponSchedule = useMemo(() => {
    const list: { date: string; ticker: string; amount: number; amountRub: number }[] = [];
    for (const b of bonds) {
      const perCoupon = b.couponRate
        ? (b.currentPrice * b.quantity * (b.couponRate / 100)) / (b.couponFrequency === 'quarterly' ? 4 : b.couponFrequency === 'semi-annual' ? 2 : 1)
        : 0;
      const freq = b.couponFrequency === 'quarterly' ? 3 : b.couponFrequency === 'semi-annual' ? 6 : 12;
      let d = new Date();
      for (let i = 0; i < 24; i++) {
        d.setMonth(d.getMonth() + freq);
        list.push({
          date: d.toISOString().slice(0, 10),
          ticker: b.ticker,
          amount: perCoupon,
          amountRub: convertToRUB(perCoupon, b.currency, rates),
        });
      }
    }
    const fromApi = coupons.map((c) => {
      const sec = bonds.find((b) => b.id === c.securityId);
      return {
        date: c.paymentDate,
        ticker: c.ticker,
        amount: c.couponAmount,
        amountRub: sec ? convertToRUB(c.couponAmount, sec.currency, rates) : c.couponAmount,
      };
    });
    return [...fromApi, ...list].slice(0, 60).sort((a, b) => a.date.localeCompare(b.date));
  }, [bonds, coupons, rates]);

  return (
    <div className="panel">
      <h2>Купоны облигаций</h2>
      <div className="muted">Календарь купонов, YTM (доходность к погашению), график выплат.</div>

      {bonds.length === 0 ? (
        <div className="muted" style={{ marginTop: 16 }}>Нет облигаций в портфеле.</div>
      ) : (
        <>
          <div style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Облигации и YTM</h3>
            <div className="list">
              {bonds.map((b) => {
                const years = b.maturityDate
                  ? (new Date(b.maturityDate).getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000)
                  : 5;
                const ytm = b.couponRate
                  ? computeYTM(b.currentPrice * 10, b.couponRate * 10, years)
                  : 0;
                return (
                  <div key={b.id} className="list-item">
                    <div className="left">
                      <div className="title">{b.ticker}</div>
                      <div className="sub">
                        Купон {b.couponRate?.toFixed(2) ?? '—'}% • Погашение {b.maturityDate || '—'}
                      </div>
                    </div>
                    <div className="right">YTM ≈ {ytm.toFixed(2)}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 8 }}>График выплат (прогноз + факт)</h3>
            <div className="list">
              {couponSchedule.slice(0, 24).map((s, i) => (
                <div key={i} className="list-item">
                  <div className="left">
                    <div className="title">{s.date}</div>
                    <div className="sub">{s.ticker}</div>
                  </div>
                  <div className="right">{fmtRub(s.amountRub)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
