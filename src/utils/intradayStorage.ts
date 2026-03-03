export interface DailyPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

const DATE_KEY = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const STORAGE_PREFIX = 'investor_portfolio_history_';
const DAYS_TO_KEEP = 31;

function storageKey(userId?: string | number): string {
  const id = userId ?? 'anon';
  return `${STORAGE_PREFIX}${id}`;
}

export function saveDailyPortfolioSnapshot(value: number, userId?: string | number): void {
  try {
    const key = storageKey(userId);
    const raw = localStorage.getItem(key);
    const byDate: Record<string, number> = raw ? JSON.parse(raw) : {};
    const today = DATE_KEY(new Date());
    byDate[today] = value;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAYS_TO_KEEP);
    const cutoffKey = DATE_KEY(cutoff);
    const filtered: Record<string, number> = {};
    for (const [d, v] of Object.entries(byDate)) {
      if (d >= cutoffKey) filtered[d] = v;
    }
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // ignore storage errors
  }
}

export function getMonthlyPortfolioHistory(userId?: string | number): DailyPoint[] {
  try {
    const key = storageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const byDate: Record<string, number> = JSON.parse(raw);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAYS_TO_KEEP);
    const cutoffKey = DATE_KEY(cutoff);

    const points: DailyPoint[] = [];
    for (const [date, value] of Object.entries(byDate)) {
      if (date >= cutoffKey && value > 0) {
        points.push({ date, value });
      }
    }
    return points.sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}
