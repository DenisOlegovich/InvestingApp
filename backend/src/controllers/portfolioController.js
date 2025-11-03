import Portfolio from '../models/Portfolio.js';

// Получить весь портфель пользователя
export const getPortfolio = (req, res) => {
  try {
    const portfolio = Portfolio.getByUserId(req.user.id);
    res.json(portfolio);
  } catch (error) {
    console.error('Ошибка получения портфеля:', error);
    res.status(500).json({ error: 'Ошибка при получении портфеля' });
  }
};

// Добавить ценную бумагу
export const addSecurity = (req, res) => {
  try {
    const securityId = Portfolio.addSecurity(req.user.id, req.body);
    res.status(201).json({ 
      message: 'Ценная бумага добавлена',
      id: securityId.toString()
    });
  } catch (error) {
    console.error('Ошибка добавления ценной бумаги:', error);
    res.status(500).json({ error: 'Ошибка при добавлении ценной бумаги' });
  }
};

// Обновить ценную бумагу
export const updateSecurity = (req, res) => {
  try {
    Portfolio.updateSecurity(req.params.id, req.user.id, req.body);
    res.json({ message: 'Ценная бумага обновлена' });
  } catch (error) {
    console.error('Ошибка обновления ценной бумаги:', error);
    res.status(500).json({ error: 'Ошибка при обновлении ценной бумаги' });
  }
};

// Удалить ценную бумагу
export const deleteSecurity = (req, res) => {
  try {
    Portfolio.deleteSecurity(req.params.id, req.user.id);
    res.json({ message: 'Ценная бумага удалена' });
  } catch (error) {
    console.error('Ошибка удаления ценной бумаги:', error);
    res.status(500).json({ error: 'Ошибка при удалении ценной бумаги' });
  }
};

// Методы для недвижимости
export const addRealEstate = (req, res) => {
  try {
    const id = Portfolio.addRealEstate(req.user.id, req.body);
    res.status(201).json({ 
      message: 'Недвижимость добавлена',
      id: id.toString()
    });
  } catch (error) {
    console.error('Ошибка добавления недвижимости:', error);
    res.status(500).json({ error: 'Ошибка при добавлении недвижимости' });
  }
};

export const deleteRealEstate = (req, res) => {
  try {
    Portfolio.deleteRealEstate(req.params.id, req.user.id);
    res.json({ message: 'Недвижимость удалена' });
  } catch (error) {
    console.error('Ошибка удаления недвижимости:', error);
    res.status(500).json({ error: 'Ошибка при удалении недвижимости' });
  }
};

// Методы для депозитов
export const addDeposit = (req, res) => {
  try {
    const id = Portfolio.addDeposit(req.user.id, req.body);
    res.status(201).json({ 
      message: 'Депозит добавлен',
      id: id.toString()
    });
  } catch (error) {
    console.error('Ошибка добавления депозита:', error);
    res.status(500).json({ error: 'Ошибка при добавлении депозита' });
  }
};

export const deleteDeposit = (req, res) => {
  try {
    Portfolio.deleteDeposit(req.params.id, req.user.id);
    res.json({ message: 'Депозит удален' });
  } catch (error) {
    console.error('Ошибка удаления депозита:', error);
    res.status(500).json({ error: 'Ошибка при удалении депозита' });
  }
};

// Методы для криптовалют
export const addCryptocurrency = (req, res) => {
  try {
    const id = Portfolio.addCryptocurrency(req.user.id, req.body);
    res.status(201).json({ 
      message: 'Криптовалюта добавлена',
      id: id.toString()
    });
  } catch (error) {
    console.error('Ошибка добавления криптовалюты:', error);
    res.status(500).json({ error: 'Ошибка при добавлении криптовалюты' });
  }
};

export const updateCryptocurrency = (req, res) => {
  try {
    Portfolio.updateCryptocurrency(req.params.id, req.user.id, req.body);
    res.json({ message: 'Криптовалюта обновлена' });
  } catch (error) {
    console.error('Ошибка обновления криптовалюты:', error);
    res.status(500).json({ error: 'Ошибка при обновлении криптовалюты' });
  }
};

export const deleteCryptocurrency = (req, res) => {
  try {
    Portfolio.deleteCryptocurrency(req.params.id, req.user.id);
    res.json({ message: 'Криптовалюта удалена' });
  } catch (error) {
    console.error('Ошибка удаления криптовалюты:', error);
    res.status(500).json({ error: 'Ошибка при удалении криптовалюты' });
  }
};

