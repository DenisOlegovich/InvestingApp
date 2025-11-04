// Форматирует число с пробелами для отображения
export const formatNumberWithSpaces = (value: string): string => {
  // Удаляем все кроме цифр и точки
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Разделяем на целую и дробную части
  const parts = cleaned.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Форматируем целую часть с пробелами
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Возвращаем с дробной частью, если есть
  return decimalPart !== undefined ? `${formatted}.${decimalPart}` : formatted;
};

// Удаляет пробелы из форматированного числа для парсинга
export const parseFormattedNumber = (value: string): string => {
  return value.replace(/\s/g, '');
};

// Обработчик изменения для input с форматированием
export const handleNumberInputChange = (
  value: string,
  setter: (value: string) => void
) => {
  const formatted = formatNumberWithSpaces(value);
  setter(formatted);
};

