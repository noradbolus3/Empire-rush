import React, { createContext, useContext, useMemo, useState } from 'react';
import { BUSINESS_CATALOG } from '../data/businesses';
import { BusinessEntity } from '../types/game';

type GameContextValue = { businesses: BusinessEntity[]; setBusinesses: React.Dispatch<React.SetStateAction<BusinessEntity[]>> };
const fallbackBusinesses = BUSINESS_CATALOG.filter(business => business.id === 'retail-shop' || business.id === 'taxi-mobility');
const GameContext = createContext<GameContextValue>({ businesses: fallbackBusinesses, setBusinesses: () => undefined });
export function GameProvider({ children }: { children: React.ReactNode }) { const [businesses, setBusinesses] = useState<BusinessEntity[]>(fallbackBusinesses); const value = useMemo(() => ({ businesses: businesses.length ? businesses : fallbackBusinesses, setBusinesses }), [businesses]); return <GameContext.Provider value={value}>{children}</GameContext.Provider>; }
export function useGame() { return useContext(GameContext); }
