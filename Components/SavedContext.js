// Components/SavedContext.js
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

const STORAGE_KEY = '@gomunkebjerg_saved_v1';

/**
 * Структура элемента:
 * {
 *   id: string,
 *   title: string,
 *   image?: string | number, // uri или require(id)
 *   coords?: { lat: number, lng: number },
 *   coordsText?: string,
 *   desc?: string,
 *   tags?: string[]
 * }
 */

export const SavedContext = createContext({
  saved: {},                 // { [id]: item }
  isReady: false,
  isSaved: (_id) => false,
  toggle: (_item) => {},     // добавить/удалить
  remove: (_itemOrId) => {},
  clear: () => {},
  reload: async () => {},
});

function normalizeItem(raw) {
  if (!raw) return null;
  const item = { ...raw };
  // Гарантируем id
  if (!item.id) {
    const lat = item.coords?.lat ?? '';
    const lng = item.coords?.lng ?? '';
    const base = (item.title || 'item').toString().trim().toLowerCase().replace(/\s+/g, '-');
    item.id = `${base}:${lat}:${lng}`;
  }
  // Приводим image к строковому uri (если это require)
  if (typeof item.image === 'number') {
    try {
      const src = Image.resolveAssetSource(item.image);
      if (src?.uri) item.image = src.uri;
    } catch {}
  }
  return item;
}

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState({});
  const [isReady, setReady] = useState(false);

  // загрузка из стораджа
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const obj = JSON.parse(json);
          // safety: только объекты с id
          const cleaned = {};
          Object.values(obj || {}).forEach((x) => {
            if (x?.id) cleaned[x.id] = x;
          });
          setSaved(cleaned);
        }
      } catch (e) {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setSaved(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const isSaved = useCallback((id) => !!saved[id], [saved]);

  const toggle = useCallback((raw) => {
    const item = normalizeItem(raw);
    if (!item?.id) return;
    const next = { ...saved };
    if (next[item.id]) {
      delete next[item.id];
    } else {
      next[item.id] = item;
    }
    persist(next);
  }, [saved, persist]);

  const remove = useCallback((itemOrId) => {
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;
    if (!id) return;
    if (!saved[id]) return;
    const next = { ...saved };
    delete next[id];
    persist(next);
  }, [saved, persist]);

  const clear = useCallback(async () => {
    await persist({});
  }, [persist]);

  const reload = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const obj = json ? JSON.parse(json) : {};
      setSaved(obj || {});
    } catch {}
  }, []);

  const value = useMemo(() => ({
    saved,
    isReady,
    isSaved,
    toggle,
    remove,
    clear,
    reload,
  }), [saved, isReady, isSaved, toggle, remove, clear, reload]);

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}
