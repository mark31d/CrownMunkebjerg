import React, {createContext, useContext, useMemo, useState} from 'react';

const SettingsCtx = createContext(undefined);

export function SettingsProvider({children, initial = {}}) {
  const [categoriesOn, setCategoriesOn] = useState(
    initial.categoriesOn ?? true
  );
  const [showLimit, setShowLimit] = useState(
    initial.showLimit ?? 'all' // 'all' | 3 | 5 | 10
  );

  const value = useMemo(
    () => ({ categoriesOn, setCategoriesOn, showLimit, setShowLimit }),
    [categoriesOn, showLimit]
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  return ctx; // пусть вернёт undefined, чтобы мы могли отловить это на экране
}
