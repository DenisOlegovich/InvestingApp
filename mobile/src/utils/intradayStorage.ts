import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyPoint {
  date: string;
  value: number;
}

const STORAGE_PREFIX = 'investor_portfolio_history_';
const DAYS_TO_KEEP = 31;

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function storageKey(userId?: string | number): string {
  return `${STORAGE_PREFIX}${userId ?? 'anon'}`;
}

export async function saveDailyPortfolioSnapshot(
  value: number,
  userId?: string | number
): Promise<void> {
  try {
    const key = storageKey(userId);
    const raw = await AsyncStorage.getItem(key);
    const byDate: Record<string, number> = raw ? JSON.parse(raw) : {};
    const today = dateKey(new Date());
    byDate[today] = value;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAYS_TO_KEEP);
    const cutoffKey = dateKey(cutoff);
    const filtered: Record<string, number> = {};
    for (const [d, v] of Object.entries(byDate)) {
      if (d >= cutoffKey) filtered[d] = v;
    }
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export async function getMonthlyPortfolioHistory(
  userId?: string | number
): Promise<DailyPoint[]> {
  try {
    const key = storageKey(userId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const byDate: Record<string, number> = JSON.parse(raw);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAYS_TO_KEEP);
    const cutoffKey = dateKey(cutoff);

    const points: DailyPoint[] = [];
    for (const [date, value] of Object.entries(byDate)) {
      if (date >= cutoffKey && value > 0) points.push({ date, value });
    }
    return points.sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}
