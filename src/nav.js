import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

// Navegador ligero (pila + pestañas) sin dependencias nativas adicionales.
const NavCtx = createContext(null);
let k = 0;

export function NavProvider({ initialTab, children }) {
  const [tab, setTab] = useState(initialTab);
  const [stack, setStack] = useState([]);
  const [tabParams, setTabParams] = useState({});
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const nav = useMemo(
    () => ({
      tab,
      tabParams,
      setTab: (t, params = {}) => {
        setStack([]);
        setTabParams({ ...params, _ts: Date.now() });
        setTab(t);
      },
      push: (name, params = {}) => setStack((s) => [...s, { name, params, key: `r${++k}` }]),
      replace: (name, params = {}) => setStack((s) => [...s.slice(0, -1), { name, params, key: `r${++k}` }]),
      back: () => setStack((s) => s.slice(0, -1)),
      popToRoot: () => setStack([]),
      stack,
    }),
    [tab, stack, tabParams]
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stackRef.current.length > 0) {
        setStack((s) => s.slice(0, -1));
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  return <NavCtx.Provider value={nav}>{children}</NavCtx.Provider>;
}

export const useNav = () => useContext(NavCtx);
