import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BUSINESS_CATALOG } from '../data/businesses';
import { BusinessEntity } from '../types/game';

const SAVE = 'empire-rush-game-businesses-v1';
const fallbackBusinesses: BusinessEntity[] = BUSINESS_CATALOG.length > 0 ? BUSINESS_CATALOG : [];
type GameContextValue = { businesses: BusinessEntity[]; setBusinesses: React.Dispatch<React.SetStateAction<BusinessEntity[]>> };
const GameContext = createContext<GameContextValue>({ businesses: fallbackBusinesses, setBusinesses: () => undefined });
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<BusinessEntity[]>(fallbackBusinesses);
  useEffect(() => { let active = true; AsyncStorage.getItem(SAVE).then(raw => { if (!active) return; try { const parsed = raw ? JSON.parse(raw) : []; if (Array.isArray(parsed) && parsed.length > 0) setBusinesses(parsed); else { setBusinesses(fallbackBusinesses); void AsyncStorage.setItem(SAVE, JSON.stringify(fallbackBusinesses)); } } catch { setBusinesses(fallbackBusinesses); void AsyncStorage.setItem(SAVE, JSON.stringify(fallbackBusinesses)); } }).catch(() => { if (active) setBusinesses(fallbackBusinesses); }); return () => { active = false; }; }, []);
  const value = useMemo(() => ({ businesses: businesses.length > 0 ? businesses : fallbackBusinesses, setBusinesses }), [businesses]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
export function useGame() { return useContext(GameContext); }
