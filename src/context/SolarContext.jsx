import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchGridOverview, fetchWeather } from '../services/api';

const SolarContext = createContext(null);

export function SolarProvider({ children }) {
  const [overview, setOverview]   = useState(null);
  const [weather, setWeather]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(async () => {
    try {
      const [ov, wx] = await Promise.all([fetchGridOverview(), fetchWeather()]);
      setOverview(ov);
      setWeather(wx);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <SolarContext.Provider value={{ overview, weather, loading, refresh, lastRefresh }}>
      {children}
    </SolarContext.Provider>
  );
}

export const useSolar = () => useContext(SolarContext);
