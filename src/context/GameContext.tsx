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
import { DEFAULT_FACTORY_COMPANY, FactoryCompanyState } from "../types/factory";
import {
  DEFAULT_CONSTRUCTION_COMPANY,
  ConstructionCompanyState,
} from "../types/construction";
import { DEFAULT_DEALERSHIP, DealershipState } from "../types/dealership";
import {
  DEFAULT_SOFTWARE_COMPANY,
  SoftwareCompanyState,
} from "../types/software";
import { SportsClubState } from "../types/sportsClub";
import { SPORTS_CLUB_SAVE, sanitizeSportsClub } from "../engine/sportsClubEngine";

export const TAXI_COMPANY_SAVE = "empire-rush-taxi-company-v1";
export const SHIPPING_COMPANY_SAVE = "empire-rush-shipping-company-v1";
export const FACTORY_COMPANY_SAVE = "empire-rush-factory-company-v1";
export const CONSTRUCTION_COMPANY_SAVE = "empire-rush-construction-company-v1";
export const DEALERSHIP_SAVE = "empire-rush-dealership-v1";
export const SOFTWARE_COMPANY_SAVE = "empire-rush-software-company-v1";
type GameContextValue = {
  businesses: BusinessEntity[];
  setBusinesses: React.Dispatch<React.SetStateAction<BusinessEntity[]>>;
  taxiCompany: TaxiCompanyState | null;
  setTaxiCompany: React.Dispatch<React.SetStateAction<TaxiCompanyState | null>>;
  shippingCompany: ShippingCompanyState | null;
  setShippingCompany: React.Dispatch<
    React.SetStateAction<ShippingCompanyState | null>
  >;
  factoryCompany: FactoryCompanyState | null;
  setFactoryCompany: React.Dispatch<
    React.SetStateAction<FactoryCompanyState | null>
  >;
  constructionCompany: ConstructionCompanyState | null;
  setConstructionCompany: React.Dispatch<
    React.SetStateAction<ConstructionCompanyState | null>
  >;
  dealership: DealershipState | null;
  setDealership: React.Dispatch<React.SetStateAction<DealershipState | null>>;
  softwareCompany: SoftwareCompanyState | null;
  setSoftwareCompany: React.Dispatch<
    React.SetStateAction<SoftwareCompanyState | null>
  >;
  sportsClub: SportsClubState | null;
  setSportsClub: React.Dispatch<React.SetStateAction<SportsClubState | null>>;
  resetBusinesses: () => void;
};
const GameContext = createContext<GameContextValue>({
  businesses: DEFAULT_BUSINESSES,
  setBusinesses: () => undefined,
  taxiCompany: null,
  setTaxiCompany: () => undefined,
  shippingCompany: null,
  setShippingCompany: () => undefined,
  factoryCompany: null,
  setFactoryCompany: () => undefined,
  constructionCompany: null,
  setConstructionCompany: () => undefined,
  dealership: null,
  setDealership: () => undefined,
  softwareCompany: null,
  setSoftwareCompany: () => undefined,
  sportsClub: null,
  setSportsClub: () => undefined,
  resetBusinesses: () => undefined,
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] =
    useState<BusinessEntity[]>(DEFAULT_BUSINESSES);
  const [taxiCompany, setTaxiCompany] = useState<TaxiCompanyState | null>(null);
  const [shippingCompany, setShippingCompany] =
    useState<ShippingCompanyState | null>(null);
  const [factoryCompany, setFactoryCompany] =
    useState<FactoryCompanyState | null>(null);
  const [constructionCompany, setConstructionCompany] =
    useState<ConstructionCompanyState | null>(null);
  const [dealership, setDealership] = useState<DealershipState | null>(null);
  const [softwareCompany, setSoftwareCompany] =
    useState<SoftwareCompanyState | null>(null);
  const [sportsClub, setSportsClub] = useState<SportsClubState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([
      loadBusinessSimulation(),
      AsyncStorage.getItem(TAXI_COMPANY_SAVE),
      AsyncStorage.getItem(SHIPPING_COMPANY_SAVE),
      AsyncStorage.getItem(FACTORY_COMPANY_SAVE),
      AsyncStorage.getItem(CONSTRUCTION_COMPANY_SAVE),
      AsyncStorage.getItem(DEALERSHIP_SAVE),
      AsyncStorage.getItem(SOFTWARE_COMPANY_SAVE),
      AsyncStorage.getItem(SPORTS_CLUB_SAVE),
    ]).then(
      ([
        loadedBusinesses,
        rawTaxi,
        rawShipping,
        rawFactory,
        rawConstruction,
        rawDealership,
        rawSoftware,
        rawSportsClub,
      ]) => {
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
        if (rawFactory) {
          try {
            const parsed = JSON.parse(rawFactory);
            if (parsed?.id === DEFAULT_FACTORY_COMPANY.id)
              setFactoryCompany({ ...DEFAULT_FACTORY_COMPANY, ...parsed });
          } catch {
            setFactoryCompany(null);
          }
        }
        if (rawConstruction) {
          try {
            const parsed = JSON.parse(rawConstruction);
            if (parsed?.id === DEFAULT_CONSTRUCTION_COMPANY.id)
              setConstructionCompany({
                ...DEFAULT_CONSTRUCTION_COMPANY,
                ...parsed,
              });
          } catch {
            setConstructionCompany(null);
          }
        }
        if (rawDealership) {
          try {
            const parsed = JSON.parse(rawDealership);
            if (parsed?.id === DEFAULT_DEALERSHIP.id)
              setDealership({ ...DEFAULT_DEALERSHIP, ...parsed });
          } catch {
            setDealership(null);
          }
        }
        if (rawSoftware) {
          try {
            const parsed = JSON.parse(rawSoftware);
            if (parsed?.id === DEFAULT_SOFTWARE_COMPANY.id)
              setSoftwareCompany({ ...DEFAULT_SOFTWARE_COMPANY, ...parsed });
          } catch {
            setSoftwareCompany(null);
          }
        }
        if (rawSportsClub) {
          try {
            setSportsClub(sanitizeSportsClub(JSON.parse(rawSportsClub)));
          } catch {
            setSportsClub(null);
          }
        }
        setHydrated(true);
      },
    );
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
    if (factoryCompany)
      void AsyncStorage.setItem(
        FACTORY_COMPANY_SAVE,
        JSON.stringify(factoryCompany),
      );
    else void AsyncStorage.removeItem(FACTORY_COMPANY_SAVE);
    if (constructionCompany)
      void AsyncStorage.setItem(
        CONSTRUCTION_COMPANY_SAVE,
        JSON.stringify(constructionCompany),
      );
    else void AsyncStorage.removeItem(CONSTRUCTION_COMPANY_SAVE);
    if (dealership)
      void AsyncStorage.setItem(DEALERSHIP_SAVE, JSON.stringify(dealership));
    else void AsyncStorage.removeItem(DEALERSHIP_SAVE);
    if (softwareCompany)
      void AsyncStorage.setItem(
        SOFTWARE_COMPANY_SAVE,
        JSON.stringify(softwareCompany),
      );
    else void AsyncStorage.removeItem(SOFTWARE_COMPANY_SAVE);
    if (sportsClub)
      void AsyncStorage.setItem(SPORTS_CLUB_SAVE, JSON.stringify(sportsClub));
    else void AsyncStorage.removeItem(SPORTS_CLUB_SAVE);
  }, [
    businesses,
    taxiCompany,
    shippingCompany,
    factoryCompany,
    constructionCompany,
    dealership,
    softwareCompany,
    sportsClub,
    hydrated,
  ]);
  const resetBusinesses = () => {
    setBusinesses(DEFAULT_BUSINESSES);
    setTaxiCompany(null);
    setShippingCompany(null);
    setFactoryCompany(null);
    setConstructionCompany(null);
    setDealership(null);
    setSoftwareCompany(null);
    setSportsClub(null);
    void AsyncStorage.setItem(
      BUSINESS_SIMULATION_SAVE,
      JSON.stringify({ schemaVersion: 2, businesses: DEFAULT_BUSINESSES }),
    );
    void AsyncStorage.removeItem(TAXI_COMPANY_SAVE);
    void AsyncStorage.removeItem(SHIPPING_COMPANY_SAVE);
    void AsyncStorage.removeItem(FACTORY_COMPANY_SAVE);
    void AsyncStorage.removeItem(CONSTRUCTION_COMPANY_SAVE);
    void AsyncStorage.removeItem(DEALERSHIP_SAVE);
    void AsyncStorage.removeItem(SOFTWARE_COMPANY_SAVE);
    void AsyncStorage.removeItem(SPORTS_CLUB_SAVE);
  };
  const value = useMemo(
    () => ({
      businesses: businesses.length ? businesses : DEFAULT_BUSINESSES,
      setBusinesses,
      taxiCompany,
      setTaxiCompany,
      shippingCompany,
      setShippingCompany,
      factoryCompany,
      setFactoryCompany,
      constructionCompany,
      setConstructionCompany,
      dealership,
      setDealership,
      softwareCompany,
      setSoftwareCompany,
      sportsClub,
      setSportsClub,
      resetBusinesses,
    }),
    [
      businesses,
      taxiCompany,
      shippingCompany,
      factoryCompany,
      constructionCompany,
      dealership,
      softwareCompany,
      sportsClub,
    ],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
export function useGame() {
  return useContext(GameContext);
}
