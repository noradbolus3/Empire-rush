import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BUSINESS_SIMULATION_SAVE, DEFAULT_BUSINESSES, loadBusinessSimulation, persistBusinessSimulation } from '../engine/businessSimulation';
import { BusinessEntity } from '../types/business';

type GameContextValue = { businesses: BusinessEntity[]; setBusinesses: React.Dispatch<React.SetStateAction<BusinessEntity[]>>; resetBusinesses: () => void };
const GameContext = createContext<GameContextValue>({ businesses: DEFAULT_BUSINESSES, setBusinesses: () => undefined, resetBusinesses: () => undefined });
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<BusinessEntity[]>(DEFAULT_BUSINESSES);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { let active = true; void loadBusinessSimulation().then(value => { if (active) { setBusinesses(value); setHydrated(true); } }); return () => { active = false; }; }, []);
  useEffect(() => { if (hydrated) void persistBusinessSimulation(businesses).catch(() => undefined); }, [businesses, hydrated]);
  const resetBusinesses = () => { setBusinesses(DEFAULT_BUSINESSES); void AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify(DEFAULT_BUSINESSES)); };
  const value = useMemo(() => ({ businesses: businesses.length ? businesses : DEFAULT_BUSINESSES, setBusinesses, resetBusinesses }), [businesses]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
export function useGame() { return useContext(GameContext); }
