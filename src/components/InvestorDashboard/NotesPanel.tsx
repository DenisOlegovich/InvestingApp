import React, { useState, useEffect } from 'react';
import { loadJson, saveJson } from '../../utils/storage';

const STORAGE_KEY = 'investor_notes';

export const NotesPanel: React.FC<{ userId?: number }> = ({ userId }) => {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}`;
  const [text, setText] = useState('');

  useEffect(() => {
    setText(loadJson<string>(key, ''));
  }, [key]);

  useEffect(() => {
    saveJson(key, text);
  }, [key, text]);

  return (
    <div className="panel">
      <h2>Инвест-дневник</h2>
      <div className="muted">Заметки, идеи, выводы. Сохраняются в браузере.</div>
      <textarea
        className="input notes-textarea"
        placeholder="Почему купил SBER? Какую стратегию придерживаюсь? Уроки от последней сделки..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
};
