import React, { useState, useEffect, useRef } from "react";
import {
  Portfolio as PortfolioType,
  Security,
  RealEstate,
  Deposit,
  Crypto,
  User,
} from "../types";
import { SecuritiesTable } from "./SecuritiesTable";
import { RealEstateTable } from "./RealEstateTable";
import { DepositsTable } from "./DepositsTable";
import { CryptosTable } from "./CryptosTable";
import { PortfolioCharts } from "./PortfolioCharts";
import { AddSecurityForm } from "./AddSecurityForm";
import { AddRealEstateForm } from "./AddRealEstateForm";
import { AddDepositForm } from "./AddDepositForm";
import { AddCryptoForm } from "./AddCryptoForm";
import {
  calculateTotalPortfolioValueInRUB,
  calculateTotalExpectedIncomeInRUB,
} from "../utils/calculations";
import { updateMultipleStocks } from "../services/stockApi";
import { updateMultipleCryptos } from "../services/cryptoApi";
import { fetchExchangeRates, ExchangeRates } from "../services/currencyApi";
import { portfolioAPI } from "../services/api";
import "./Portfolio.css";
import "./InvestorDashboard/InvestorDashboard.css";
import { InvestorDashboard } from "./InvestorDashboard/InvestorDashboard";
import { AllocationPanel } from "./InvestorDashboard/AllocationPanel";
import { DividendCalendar } from "./InvestorDashboard/DividendCalendar";
import { IncomePanel } from "./InvestorDashboard/IncomePanel";
import { GoalsPanel } from "./InvestorDashboard/GoalsPanel";
import { WatchlistPanel } from "./InvestorDashboard/WatchlistPanel";
import { NotesPanel } from "./InvestorDashboard/NotesPanel";
import { ChecklistPanel } from "./InvestorDashboard/ChecklistPanel";
import { DCAPanel } from "./InvestorDashboard/DCAPanel";
import { ScenariosPanel } from "./InvestorDashboard/ScenariosPanel";
import { useTheme } from "../contexts/ThemeContext";
import type { AllocationTargets, Goal } from "../types/investor";
import { DEFAULT_TARGETS, normalizeTargets } from "../utils/investor";
import { loadJson, saveJson } from "../utils/storage";

interface PortfolioProps {
  portfolio: PortfolioType;
  onUpdatePortfolio: (portfolio: PortfolioType) => void;
  user?: User;
  onLogout?: () => void;
}

type PortfolioTab =
  | "dashboard"
  | "assets"
  | "charts"
  | "allocation"
  | "dividends"
  | "income"
  | "goals"
  | "watchlist"
  | "dca"
  | "scenarios"
  | "checklist"
  | "notes";

export const Portfolio: React.FC<PortfolioProps> = ({
  portfolio,
  onUpdatePortfolio,
  user,
  onLogout,
}) => {
  const [showAddSecurity, setShowAddSecurity] = useState(false);
  const [showAddRealEstate, setShowAddRealEstate] = useState(false);
  const [showAddDeposit, setShowAddDeposit] = useState(false);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [updatingCryptoPrices, setUpdatingCryptoPrices] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const hasInitialLoad = useRef(false);
  const [tab, setTab] = useState<PortfolioTab>("dashboard");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [targets, setTargets] = useState<AllocationTargets>(DEFAULT_TARGETS);
  const { theme, setTheme } = useTheme();

  const handleAddSecurity = async (securityData: Omit<Security, "id">) => {
    try {
      const response = await portfolioAPI.addSecurity(securityData);
      const newSecurity: Security = {
        ...securityData,
        id: response.id,
      };
      onUpdatePortfolio({
        ...portfolio,
        securities: [...portfolio.securities, newSecurity],
      });
    } catch (error) {
      console.error('Ошибка добавления ценной бумаги:', error);
      alert('Ошибка при добавлении ценной бумаги');
    }
  };

  const handleAddRealEstate = async (realEstateData: Omit<RealEstate, "id">) => {
    try {
      const response = await portfolioAPI.addRealEstate(realEstateData);
      const newRealEstate: RealEstate = {
        ...realEstateData,
        id: response.id,
      };
      onUpdatePortfolio({
        ...portfolio,
        realEstate: [...portfolio.realEstate, newRealEstate],
      });
    } catch (error) {
      console.error('Ошибка добавления недвижимости:', error);
      alert('Ошибка при добавлении недвижимости');
    }
  };

  const handleRemoveSecurity = async (id: string) => {
    try {
      await portfolioAPI.deleteSecurity(id);
      onUpdatePortfolio({
        ...portfolio,
        securities: portfolio.securities.filter((s) => s.id !== id),
      });
    } catch (error) {
      console.error('Ошибка удаления ценной бумаги:', error);
      alert('Ошибка при удалении ценной бумаги');
    }
  };

  const handleUpdateSecurityQuantity = async (id: string, newQuantity: number) => {
    const security = portfolio.securities.find(s => s.id === id);
    if (!security) return;

    try {
      await portfolioAPI.updateSecurity(id, {
        currentPrice: security.currentPrice,
        previousPrice: security.previousPrice,
        quantity: newQuantity,
      });
      
      onUpdatePortfolio({
        ...portfolio,
        securities: portfolio.securities.map((s) =>
          s.id === id ? { ...s, quantity: newQuantity } : s
        ),
      });
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      alert('Ошибка при обновлении количества');
    }
  };

  const handleUpdateRealEstateValue = async (id: string, newValue: number) => {
    const realEstate = portfolio.realEstate.find(r => r.id === id);
    if (!realEstate) return;

    try {
      await portfolioAPI.updateRealEstate(id, {
        currentValue: newValue,
      });
      
      onUpdatePortfolio({
        ...portfolio,
        realEstate: portfolio.realEstate.map((r) =>
          r.id === id ? { ...r, currentValue: newValue } : r
        ),
      });
    } catch (error) {
      console.error('Ошибка обновления стоимости недвижимости:', error);
      alert('Ошибка при обновлении стоимости');
    }
  };

  const handleRemoveRealEstate = async (id: string) => {
    try {
      await portfolioAPI.deleteRealEstate(id);
      onUpdatePortfolio({
        ...portfolio,
        realEstate: portfolio.realEstate.filter((r) => r.id !== id),
      });
    } catch (error) {
      console.error('Ошибка удаления недвижимости:', error);
      alert('Ошибка при удалении недвижимости');
    }
  };

  const handleAddDeposit = async (depositData: Omit<Deposit, "id">) => {
    try {
      const response = await portfolioAPI.addDeposit(depositData);
      const newDeposit: Deposit = {
        ...depositData,
        id: response.id,
      };
      onUpdatePortfolio({
        ...portfolio,
        deposits: [...(portfolio.deposits || []), newDeposit],
      });
    } catch (error) {
      console.error('Ошибка добавления депозита:', error);
      alert('Ошибка при добавлении депозита');
    }
  };

  const handleUpdateDepositAmount = async (id: string, newAmount: number) => {
    const deposit = (portfolio.deposits || []).find(d => d.id === id);
    if (!deposit) return;

    try {
      await portfolioAPI.updateDeposit(id, {
        amount: newAmount,
      });
      
      onUpdatePortfolio({
        ...portfolio,
        deposits: (portfolio.deposits || []).map((d) =>
          d.id === id ? { ...d, amount: newAmount } : d
        ),
      });
    } catch (error) {
      console.error('Ошибка обновления суммы депозита:', error);
      alert('Ошибка при обновлении суммы');
    }
  };

  const handleRemoveDeposit = async (id: string) => {
    try {
      await portfolioAPI.deleteDeposit(id);
      onUpdatePortfolio({
        ...portfolio,
        deposits: (portfolio.deposits || []).filter((d) => d.id !== id),
      });
    } catch (error) {
      console.error('Ошибка удаления депозита:', error);
      alert('Ошибка при удалении депозита');
    }
  };

  const handleAddCrypto = async (cryptoData: Omit<Crypto, "id">) => {
    try {
      const response = await portfolioAPI.addCryptocurrency(cryptoData);
      const newCrypto: Crypto = {
        ...cryptoData,
        id: response.id,
      };
      onUpdatePortfolio({
        ...portfolio,
        cryptocurrencies: [...(portfolio.cryptocurrencies || []), newCrypto],
      });
    } catch (error) {
      console.error('Ошибка добавления криптовалюты:', error);
      alert('Ошибка при добавлении криптовалюты');
    }
  };

  const handleRemoveCrypto = async (id: string) => {
    try {
      await portfolioAPI.deleteCryptocurrency(id);
      onUpdatePortfolio({
        ...portfolio,
        cryptocurrencies: (portfolio.cryptocurrencies || []).filter(
          (c) => c.id !== id
        ),
      });
    } catch (error) {
      console.error('Ошибка удаления криптовалюты:', error);
      alert('Ошибка при удалении криптовалюты');
    }
  };

  const handleUpdateCryptoAmount = async (id: string, newAmount: number) => {
    const crypto = (portfolio.cryptocurrencies || []).find(c => c.id === id);
    if (!crypto) return;

    try {
      await portfolioAPI.updateCryptocurrency(id, {
        currentPrice: crypto.currentPrice,
        previousPrice: crypto.previousPrice,
        amount: newAmount,
      });
      
      onUpdatePortfolio({
        ...portfolio,
        cryptocurrencies: (portfolio.cryptocurrencies || []).map((c) =>
          c.id === id ? { ...c, amount: newAmount } : c
        ),
      });
    } catch (error) {
      console.error('Ошибка обновления количества криптовалюты:', error);
      alert('Ошибка при обновлении количества');
    }
  };

  // Загрузка курсов валют при монтировании компонента
  useEffect(() => {
    const loadExchangeRates = async () => {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
    };
    
    loadExchangeRates();
    
    // Обновляем курсы каждый час
    const intervalId = setInterval(loadExchangeRates, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const updateAllPricesUnified = async () => {
    const hasSecurities = portfolio.securities.length > 0;
    const hasCryptos =
      portfolio.cryptocurrencies && portfolio.cryptocurrencies.length > 0;

    if (!hasSecurities && !hasCryptos) {
      return;
    }

    setUpdatingPrices(hasSecurities);
    setUpdatingCryptoPrices(hasCryptos);

    try {
      let updatedSecurities = portfolio.securities;
      let updatedCryptos = portfolio.cryptocurrencies || [];

      // Обновляем акции и криптовалюты параллельно
      const promises: Promise<void>[] = [];

      if (hasSecurities) {
        promises.push(
          (async () => {
            try {
              const tickers = portfolio.securities
                .map((s) => s.ticker)
                .filter(Boolean);

              if (tickers.length > 0) {
                const updatedData = await updateMultipleStocks(tickers);

                updatedSecurities = portfolio.securities.map((security) => {
                  const newData = updatedData.get(security.ticker);
                  if (newData) {
                    const oldCurrentPrice = security.currentPrice;
                    const shouldUseApiPreviousClose =
                      security.previousPrice === security.currentPrice ||
                      security.previousPrice === 0;

                    return {
                      ...security,
                      currentPrice: newData.price,
                      previousPrice: shouldUseApiPreviousClose
                        ? newData.previousClose
                        : oldCurrentPrice,
                      expectedDividend:
                        newData.dividendYield !== undefined
                          ? newData.dividendYield
                          : security.expectedDividend,
                      dividendFrequency:
                        newData.dividendFrequency || security.dividendFrequency,
                      name: newData.name || security.name,
                      currency: newData.currency || security.currency || "RUB",
                    };
                  }
                  return security;
                });
              }
            } catch (error) {
              console.error("Ошибка при обновлении цен акций:", error);
            }
          })()
        );
      }

      if (hasCryptos) {
        promises.push(
          (async () => {
            try {
              const symbols = portfolio
                .cryptocurrencies!.map((c) => c.symbol)
                .filter(Boolean);

              if (symbols.length > 0) {
                const updatedData = await updateMultipleCryptos(symbols);

                updatedCryptos = portfolio.cryptocurrencies!.map((crypto) => {
                  const newData = updatedData.get(crypto.symbol);
                  if (newData) {
                    return {
                      ...crypto,
                      currentPrice: newData.price,
                      previousPrice: crypto.currentPrice,
                      name: newData.name || crypto.name,
                    };
                  }
                  return crypto;
                });
              }
            } catch (error) {
              console.error("Ошибка при обновлении цен криптовалют:", error);
            }
          })()
        );
      }

      await Promise.allSettled(promises);

      // Обновляем портфель одним вызовом с обновленными данными
      onUpdatePortfolio({
        ...portfolio,
        securities: updatedSecurities,
        cryptocurrencies: updatedCryptos,
      });

    } catch (error) {
      console.error("Ошибка при обновлении цен:", error);
    } finally {
      setUpdatingPrices(false);
      setUpdatingCryptoPrices(false);
    }
  };

  // Автоматическое обновление при загрузке компонента (только один раз)
  useEffect(() => {
    const hasSecurities = portfolio.securities.length > 0;
    const hasCryptos =
      portfolio.cryptocurrencies && portfolio.cryptocurrencies.length > 0;

    if ((hasSecurities || hasCryptos) && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
      updateAllPricesUnified();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio.securities.length, portfolio.cryptocurrencies?.length]);

  // Используем дефолтные курсы, если еще не загружены
  const rates = exchangeRates || { USD_RUB: 92.50, EUR_RUB: 100.00, lastUpdate: new Date() };
  
  const totalValue = calculateTotalPortfolioValueInRUB(portfolio, rates);
  const monthlyIncome = calculateTotalExpectedIncomeInRUB(portfolio, rates);

  const storageKeyBase = `investor_v1_${user?.id ?? "anon"}`;

  // Локальные настройки (цели/таргеты) под пользователя
  useEffect(() => {
    const loadedGoals = loadJson<Goal[]>(`${storageKeyBase}_goals`, []);
    const loadedTargets = loadJson<AllocationTargets>(
      `${storageKeyBase}_targets`,
      DEFAULT_TARGETS
    );
    setGoals(Array.isArray(loadedGoals) ? loadedGoals : []);
    setTargets(normalizeTargets(loadedTargets));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKeyBase]);

  useEffect(() => {
    saveJson(`${storageKeyBase}_goals`, goals);
  }, [storageKeyBase, goals]);

  useEffect(() => {
    saveJson(`${storageKeyBase}_targets`, targets);
  }, [storageKeyBase, targets]);

  return (
    <div className='portfolio'>
      <div className='portfolio-header'>
        <div className="header-top">
          <h1>Мой инвестиционный портфель</h1>
          {user && (
            <div className="user-info">
              <button
                className="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <span className="user-name">👤 {user.name}</span>
              {onLogout && (
                <button className="logout-btn" onClick={onLogout}>
                  Выйти
                </button>
              )}
            </div>
          )}
        </div>
        <div className='portfolio-stats'>
          <div className='stat-card stat-card-portfolio'>
            <div className='stat-label'>Общая стоимость портфеля</div>
            <div className='stat-value'>
              {totalValue.toLocaleString("ru-RU", { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} ₽
            </div>
          </div>
          <div className='stat-card stat-card-income'>
            <div className='stat-label'>Ожидаемый месячный доход</div>
            <div className='stat-value income'>
              {monthlyIncome.toLocaleString("ru-RU", {
                maximumFractionDigits: 2,
              })}{" "}
              ₽
            </div>
          </div>
        </div>

        <div className="investor-tabs" role="tablist" aria-label="Навигация портфеля">
          <button
            className={`investor-tab ${tab === "dashboard" ? "active" : ""}`}
            onClick={() => setTab("dashboard")}
            role="tab"
            aria-selected={tab === "dashboard"}
          >
            Дашборд
          </button>
          <button
            className={`investor-tab ${tab === "assets" ? "active" : ""}`}
            onClick={() => setTab("assets")}
            role="tab"
            aria-selected={tab === "assets"}
          >
            Активы
          </button>
          <button
            className={`investor-tab ${tab === "charts" ? "active" : ""}`}
            onClick={() => setTab("charts")}
            role="tab"
            aria-selected={tab === "charts"}
          >
            Графики
          </button>
          <button
            className={`investor-tab ${tab === "allocation" ? "active" : ""}`}
            onClick={() => setTab("allocation")}
            role="tab"
            aria-selected={tab === "allocation"}
          >
            Аллокация
          </button>
          <button
            className={`investor-tab ${tab === "dividends" ? "active" : ""}`}
            onClick={() => setTab("dividends")}
            role="tab"
            aria-selected={tab === "dividends"}
          >
            Дивиденды
          </button>
          <button
            className={`investor-tab ${tab === "income" ? "active" : ""}`}
            onClick={() => setTab("income")}
            role="tab"
            aria-selected={tab === "income"}
          >
            Доход
          </button>
          <button
            className={`investor-tab ${tab === "goals" ? "active" : ""}`}
            onClick={() => setTab("goals")}
            role="tab"
            aria-selected={tab === "goals"}
          >
            Цели
          </button>
          <button
            className={`investor-tab ${tab === "watchlist" ? "active" : ""}`}
            onClick={() => setTab("watchlist")}
            role="tab"
            aria-selected={tab === "watchlist"}
          >
            Watchlist
          </button>
          <button
            className={`investor-tab ${tab === "dca" ? "active" : ""}`}
            onClick={() => setTab("dca")}
            role="tab"
            aria-selected={tab === "dca"}
          >
            DCA
          </button>
          <button
            className={`investor-tab ${tab === "scenarios" ? "active" : ""}`}
            onClick={() => setTab("scenarios")}
            role="tab"
            aria-selected={tab === "scenarios"}
          >
            Сценарии
          </button>
          <button
            className={`investor-tab ${tab === "checklist" ? "active" : ""}`}
            onClick={() => setTab("checklist")}
            role="tab"
            aria-selected={tab === "checklist"}
          >
            Чек-листы
          </button>
          <button
            className={`investor-tab ${tab === "notes" ? "active" : ""}`}
            onClick={() => setTab("notes")}
            role="tab"
            aria-selected={tab === "notes"}
          >
            Заметки
          </button>
        </div>
      </div>

      {tab === "assets" && (
        <div className='portfolio-actions'>
          <button className='add-btn' onClick={() => setShowAddSecurity(true)}>
            + Добавить ценную бумагу
          </button>
          <button className='add-btn' onClick={() => setShowAddRealEstate(true)}>
            + Добавить недвижимость
          </button>
          <button className='add-btn' onClick={() => setShowAddDeposit(true)}>
            + Добавить депозит
          </button>
          <button className='add-btn' onClick={() => setShowAddCrypto(true)}>
            + Добавить криптовалюту
          </button>
          <button
            className='add-btn update-btn'
            disabled={updatingPrices || updatingCryptoPrices}
            onClick={updateAllPricesUnified}
            title="Обновить котировки (акции и крипто)"
          >
            {updatingPrices || updatingCryptoPrices ? "Обновляем цены..." : "Обновить цены"}
          </button>
        </div>
      )}

      {tab === "dashboard" && (
        <InvestorDashboard portfolio={portfolio} rates={rates} userId={user?.id} />
      )}

      {tab === "allocation" && (
        <AllocationPanel
          portfolio={portfolio}
          rates={rates}
          targets={targets}
          onChangeTargets={setTargets}
        />
      )}

      {tab === "dividends" && <DividendCalendar portfolio={portfolio} rates={rates} />}

      {tab === "income" && <IncomePanel portfolio={portfolio} rates={rates} />}

      {tab === "goals" && <GoalsPanel goals={goals} onChange={setGoals} />}

      {tab === "watchlist" && <WatchlistPanel userId={user?.id} />}

      {tab === "dca" && (
        <DCAPanel currentPortfolioValue={calculateTotalPortfolioValueInRUB(portfolio, rates)} />
      )}

      {tab === "scenarios" && <ScenariosPanel portfolio={portfolio} rates={rates} />}

      {tab === "checklist" && <ChecklistPanel userId={user?.id} />}

      {tab === "notes" && <NotesPanel userId={user?.id} />}

      {tab === "charts" && (
        <PortfolioCharts portfolio={portfolio} exchangeRates={exchangeRates} />
      )}

      {tab === "assets" && (
        <>
          {portfolio.securities.length > 0 && (
            <SecuritiesTable
              securities={portfolio.securities}
              onRemove={handleRemoveSecurity}
              onUpdateQuantity={handleUpdateSecurityQuantity}
              updatingPrices={updatingPrices}
            />
          )}

          {portfolio.realEstate.length > 0 && (
            <RealEstateTable
              realEstate={portfolio.realEstate}
              onRemove={handleRemoveRealEstate}
              onUpdateValue={handleUpdateRealEstateValue}
            />
          )}

          {portfolio.deposits && portfolio.deposits.length > 0 && (
            <DepositsTable
              deposits={portfolio.deposits}
              onRemove={handleRemoveDeposit}
              onUpdateAmount={handleUpdateDepositAmount}
            />
          )}

          {portfolio.cryptocurrencies && portfolio.cryptocurrencies.length > 0 && (
            <CryptosTable
              cryptocurrencies={portfolio.cryptocurrencies}
              onRemove={handleRemoveCrypto}
              onUpdateAmount={handleUpdateCryptoAmount}
              updatingPrices={updatingCryptoPrices}
            />
          )}

          {portfolio.securities.length === 0 &&
            portfolio.realEstate.length === 0 &&
            (!portfolio.deposits || portfolio.deposits.length === 0) &&
            (!portfolio.cryptocurrencies ||
              portfolio.cryptocurrencies.length === 0) && (
              <div className='empty-state'>
                <p>
                  Ваш портфель пуст. Добавьте ценные бумаги, недвижимость, депозиты
                  или криптовалюты, чтобы начать отслеживать свои инвестиции.
                </p>
              </div>
            )}
        </>
      )}

      {showAddSecurity && (
        <AddSecurityForm
          onAdd={handleAddSecurity}
          onClose={() => setShowAddSecurity(false)}
        />
      )}

      {showAddRealEstate && (
        <AddRealEstateForm
          onAdd={handleAddRealEstate}
          onClose={() => setShowAddRealEstate(false)}
        />
      )}

      {showAddDeposit && (
        <AddDepositForm
          onAdd={handleAddDeposit}
          onClose={() => setShowAddDeposit(false)}
        />
      )}

      {showAddCrypto && (
        <AddCryptoForm
          onAdd={handleAddCrypto}
          onClose={() => setShowAddCrypto(false)}
        />
      )}
    </div>
  );
};
