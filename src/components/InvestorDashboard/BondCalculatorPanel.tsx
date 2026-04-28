import React, { useState } from 'react';
import { calculateNKD, estimateYTM } from '../../utils/bondCalculations';
import { formatCurrencyRub } from '../../utils/formatNumber';

export const BondCalculatorPanel: React.FC = () => {
  const [nominal, setNominal] = useState('1000');
  const [price, setPrice] = useState('98');
  const [couponRate, setCouponRate] = useState('12');
  const [couponFreq, setCouponFreq] = useState('2');
  const [yearsToMaturity, setYearsToMaturity] = useState('2');
  const [daysSinceCoupon, setDaysSinceCoupon] = useState('90');
  const [daysInPeriod, setDaysInPeriod] = useState('182');

  const n = parseFloat(nominal) || 1000;
  const p = parseFloat(price) || 98;
  const cr = parseFloat(couponRate) || 12;
  const cf = parseInt(couponFreq, 10) || 2;
  const ytm = parseFloat(yearsToMaturity) || 2;
  const dsc = parseFloat(daysSinceCoupon) || 90;
  const dip = parseFloat(daysInPeriod) || 182;

  const priceRub = (n * p) / 100;
  const nkd = calculateNKD(n, cr, cf, dsc, dip);
  const totalPrice = priceRub + nkd;
  const ytmResult = estimateYTM(priceRub, n, cr, ytm);

  return (
    <div>
      <div className="muted">НКД, доходность к погашению (YTM).</div>
      <div style={{ height: 12 }} />
      <div className="form-row">
        <label>Номинал (₽)</label>
        <input
          type="number"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          placeholder="1000"
        />
      </div>
      <div className="form-row">
        <label>Цена (% от номинала)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="98"
        />
      </div>
      <div className="form-row">
        <label>Купон, % годовых</label>
        <input
          type="number"
          value={couponRate}
          onChange={(e) => setCouponRate(e.target.value)}
          placeholder="12"
        />
      </div>
      <div className="form-row">
        <label>Выплат купона в год</label>
        <input
          type="number"
          value={couponFreq}
          onChange={(e) => setCouponFreq(e.target.value)}
          placeholder="2"
        />
      </div>
      <div className="form-row">
        <label>Лет до погашения</label>
        <input
          type="number"
          value={yearsToMaturity}
          onChange={(e) => setYearsToMaturity(e.target.value)}
          placeholder="2"
        />
      </div>
      <div className="form-row">
        <label>Дней с последнего купона</label>
        <input
          type="number"
          value={daysSinceCoupon}
          onChange={(e) => setDaysSinceCoupon(e.target.value)}
          placeholder="90"
        />
      </div>
      <div className="form-row">
        <label>Дней в купонном периоде</label>
        <input
          type="number"
          value={daysInPeriod}
          onChange={(e) => setDaysInPeriod(e.target.value)}
          placeholder="182"
        />
      </div>
      <div style={{ height: 16 }} />
      <div className="kv">
        <span className="k">Цена без НКД</span>
        <span className="v">{formatCurrencyRub(priceRub)}</span>
        <span className="k">НКД</span>
        <span className="v">{formatCurrencyRub(nkd)}</span>
        <span className="k">К оплате (с НКД)</span>
        <span className="v">{formatCurrencyRub(totalPrice)}</span>
        <span className="k">YTM (оценка)</span>
        <span className="v pill positive">{ytmResult.toFixed(2)}%</span>
      </div>
    </div>
  );
};
