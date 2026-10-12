import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BUSINESS_SIMULATION_SAVE,
  DEFAULT_BUSINESSES,
  loadBusinessSimulation,
  persistBusinessSimulation,
} from "../engine/businessSimulation";
import { BusinessEntity } from "../types/business";
import { DEFAULT_TAXI_COMPANY, TaxiCompanyState } from "../types/taxi";
import {
  DEFAULT_SHIPPING_COMPANY,
  ShippingCompanyState,
} from "../types/shipping";

export const TAXI_COMPANY_SAVE = "empire-rush-taxi-company-v1";
export const SHIPPING_COMPANY_SAVE = "empire-rush-shipping-company-v1";
type GameContextValue = {
  businesses: BusinessEntity[];
  setBusinesses: React.Dispatch<React.SetStateAction<BusinessEntity[]>>;
  taxiCompany: TaxiCompanyState | null;
  setTaxiCompany: React.Dispatch<React.SetStateAction<TaxiCompanyState | null>>;
  shippingCompany: ShippingCompanyState | null;
  setShippingCompany: React.Dispatch<
    React.SetStateAction<ShippingCompanyState | null>
  >;
  resetBusinesses: () => void;
};
const GameContext = createContext<GameContextValue>({
  businesses: DEFAULT_BUSINESSES,
  setBusinesses: () => undefined,
  taxiCompany: null,
  setTaxiCompany: () => undefined,
  shippingCompany: null,
  setShippingCompany: () => undefined,
  resetBusinesses: () => undefined,
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] =
    useState<BusinessEntity[]>(DEFAULT_BUSINESSES);
  const [taxiCompany, setTaxiCompany] = useState<TaxiCompanyState | null>(null);
  const [shippingCompany, setShippingCompany] =
    useState<ShippingCompanyState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([
      loadBusinessSimulation(),
      AsyncStorage.getItem(TAXI_COMPANY_SAVE),
      AsyncStorage.getItem(SHIPPING_COMPANY_SAVE),
    ]).then(([loadedBusinesses, rawTaxi, rawShipping]) => {
      if (!active) return;
      setBusinesses(loadedBusinesses);
      if (rawTaxi) {
        try {
          const parsed = JSON.parse(rawTaxi);
          if (parsed?.id === DEFAULT_TAXI_COMPANY.id)
            setTaxiCompany({ ...DEFAULT_TAXI_COMPANY, ...parsed });
        } catch {
          setTaxiCompany(null);
        }
      }
      if (rawShipping) {
        try {
          const parsed = JSON.parse(rawShipping);
          if (parsed?.id === DEFAULT_SHIPPING_COMPANY.id)
            setShippingCompany({ ...DEFAULT_SHIPPING_COMPANY, ...parsed });
        } catch {
          setShippingCompany(null);
        }
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    void persistBusinessSimulation(businesses).catch(() => undefined);
    if (taxiCompany)
      void AsyncStorage.setItem(TAXI_COMPANY_SAVE, JSON.stringify(taxiCompany));
    else void AsyncStorage.removeItem(TAXI_COMPANY_SAVE);
    if (shippingCompany)
      void AsyncStorage.setItem(
        SHIPPING_COMPANY_SAVE,
        JSON.stringify(shippingCompany),
      );
    else void AsyncStorage.removeItem(SHIPPING_COMPANY_SAVE);
  }, [businesses, taxiCompany, shippingCompany, hydrated]);
  const resetBusinesses = () => {
    setBusinesses(DEFAULT_BUSINESSES);
    setTaxiCompany(null);
    setShippingCompany(null);
    void AsyncStorage.setItem(
      BUSINESS_SIMULATION_SAVE,
      JSON.stringify({ schemaVersion: 2, businesses: DEFAULT_BUSINESSES }),
    );
    void AsyncStorage.removeItem(TAXI_COMPANY_SAVE);
    void AsyncStorage.removeItem(SHIPPING_COMPANY_SAVE);
  };
  const value = useMemo(
    () => ({
      businesses: businesses.length ? businesses : DEFAULT_BUSINESSES,
      setBusinesses,
      taxiCompany,
      setTaxiCompany,
      shippingCompany,
      setShippingCompany,
      resetBusinesses,
    }),
    [businesses, taxiCompany, shippingCompany],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
export function useGame() {
  return useContext(GameContext);
}
