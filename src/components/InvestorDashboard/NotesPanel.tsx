import React, { useState, useEffect } from 'react';
import { loadJson, saveJson } from '../../utils/storage';
import { portfolioAPI, hasAuthToken } from '../../services/api';

const STORAGE_KEY = 'investor_notes';
const SAVE_DEBOUNCE_MS = 700;

export const NotesPanel: React.FC<{ userId?: number }> = ({ userId }) => {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}`;
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const useBackend = Boolean(userId && hasAuthToken());

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setSaveError(null);

    (async () => {
      if (useBackend) {
        try {
          const { content } = await portfolioAPI.getNotes();
          let next = content;
          const local = loadJson<string>(key, '');
          if (!next && local) {
            await portfolioAPI.saveNotes(local);
            next = local;
          }
          if (!cancelled) {
            setText(next);
            setLoaded(true);
          }
        } catch {
          if (!cancelled) {
            setText(loadJson<string>(key, ''));
            setLoaded(true);
          }
        }
      } else {
        if (!cancelled) {
          setText(loadJson<string>(key, ''));
          setLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, useBackend]);

  useEffect(() => {
    if (!loaded) return;
    setSaveError(null);
    if (useBackend) {
      const t = window.setTimeout(() => {
        portfolioAPI.saveNotes(text).catch(() => {
          setSaveError('Не удалось сохранить на сервере');
        });
      }, SAVE_DEBOUNCE_MS);
      return () => window.clearTimeout(t);
    }
    saveJson(key, text);
  }, [text, key, loaded, useBackend]);

  return (
    <div className="panel">
      <h2>Инвест-дневник</h2>
      <div className="muted">
        {useBackend
          ? 'Заметки сохраняются на сервере (синхронизация между устройствами).'
          : 'Заметки сохраняются в браузере. Войдите в аккаунт, чтобы хранить их на сервере.'}
      </div>
      {saveError && (
        <div className="muted" style={{ color: '#ffb3b3', marginTop: 8 }}>
          {saveError}
        </div>
      )}
      <textarea
        className="input notes-textarea"
        placeholder="Почему купил SBER? Какую стратегию придерживаюсь? Уроки от последней сделки..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!loaded}
      />
    </div>
  );
};
