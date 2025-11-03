import { useState } from 'react';
import { Portfolio, Security, RealEstate, Deposit, Crypto } from '../types';
import { portfolioAPI } from '../services/api';

export const usePortfolioAPI = (
  portfolio: Portfolio,
  setPortfolio: (portfolio: Portfolio) => void
) => {
  const [saving, setSaving] = useState(false);

  const addSecurity = async (security: Omit<Security, 'id'>) => {
    try {
      setSaving(true);
      const response = await portfolioAPI.addSecurity(security);
      
      // Обновляем локальное состояние
      const newSecurity: Security = {
        ...security,
        id: response.id,
      };
      
      setPortfolio({
        ...portfolio,
        securities: [...portfolio.securities, newSecurity],
      });
    } catch (error) {
      console.error('Ошибка добавления ценной бумаги:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateSecurity = async (id: string, updates: Partial<Security>) => {
    try {
      setSaving(true);
      await portfolioAPI.updateSecurity(id, updates);
      
      setPortfolio({
        ...portfolio,
        securities: portfolio.securities.map(s =>
          s.id === id ? { ...s, ...updates } : s
        ),
      });
    } catch (error) {
      console.error('Ошибка обновления ценной бумаги:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteSecurity = async (id: string) => {
    try {
      setSaving(true);
      await portfolioAPI.deleteSecurity(id);
      
      setPortfolio({
        ...portfolio,
        securities: portfolio.securities.filter(s => s.id !== id),
      });
    } catch (error) {
      console.error('Ошибка удаления ценной бумаги:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addRealEstate = async (realEstate: Omit<RealEstate, 'id'>) => {
    try {
      setSaving(true);
      const response = await portfolioAPI.addRealEstate(realEstate);
      
      const newRealEstate: RealEstate = {
        ...realEstate,
        id: response.id,
      };
      
      setPortfolio({
        ...portfolio,
        realEstate: [...portfolio.realEstate, newRealEstate],
      });
    } catch (error) {
      console.error('Ошибка добавления недвижимости:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteRealEstate = async (id: string) => {
    try {
      setSaving(true);
      await portfolioAPI.deleteRealEstate(id);
      
      setPortfolio({
        ...portfolio,
        realEstate: portfolio.realEstate.filter(r => r.id !== id),
      });
    } catch (error) {
      console.error('Ошибка удаления недвижимости:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addDeposit = async (deposit: Omit<Deposit, 'id'>) => {
    try {
      setSaving(true);
      const response = await portfolioAPI.addDeposit(deposit);
      
      const newDeposit: Deposit = {
        ...deposit,
        id: response.id,
      };
      
      setPortfolio({
        ...portfolio,
        deposits: [...portfolio.deposits, newDeposit],
      });
    } catch (error) {
      console.error('Ошибка добавления депозита:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteDeposit = async (id: string) => {
    try {
      setSaving(true);
      await portfolioAPI.deleteDeposit(id);
      
      setPortfolio({
        ...portfolio,
        deposits: portfolio.deposits.filter(d => d.id !== id),
      });
    } catch (error) {
      console.error('Ошибка удаления депозита:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addCryptocurrency = async (crypto: Omit<Crypto, 'id'>) => {
    try {
      setSaving(true);
      const response = await portfolioAPI.addCryptocurrency(crypto);
      
      const newCrypto: Crypto = {
        ...crypto,
        id: response.id,
      };
      
      setPortfolio({
        ...portfolio,
        cryptocurrencies: [...(portfolio.cryptocurrencies || []), newCrypto],
      });
    } catch (error) {
      console.error('Ошибка добавления криптовалюты:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateCryptocurrency = async (id: string, updates: Partial<Crypto>) => {
    try {
      setSaving(true);
      await portfolioAPI.updateCryptocurrency(id, updates);
      
      setPortfolio({
        ...portfolio,
        cryptocurrencies: (portfolio.cryptocurrencies || []).map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
      });
    } catch (error) {
      console.error('Ошибка обновления криптовалюты:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteCryptocurrency = async (id: string) => {
    try {
      setSaving(true);
      await portfolioAPI.deleteCryptocurrency(id);
      
      setPortfolio({
        ...portfolio,
        cryptocurrencies: (portfolio.cryptocurrencies || []).filter(c => c.id !== id),
      });
    } catch (error) {
      console.error('Ошибка удаления криптовалюты:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    addSecurity,
    updateSecurity,
    deleteSecurity,
    addRealEstate,
    deleteRealEstate,
    addDeposit,
    deleteDeposit,
    addCryptocurrency,
    updateCryptocurrency,
    deleteCryptocurrency,
  };
};

