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
} from "../engine/businessSimulation";
import { coordinatedWrite, recoverPendingSave } from "../engine/saveCoordinator";
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
import { OIL_GAS_SAVE, sanitizeOilGas } from "../engine/oilGasEngine";
import { OilGasState } from "../types/oilGas";
import { AirlineState } from "../types/airline";
import { AIRLINE_SAVE, sanitizeAirline } from "../engine/airlineEngine";
import { HotelState } from "../types/hotel";
import { HOTEL_SAVE, sanitizeHotel } from "../engine/hotelEngine";
import { BlockchainState } from "../types/blockchain";
import { BLOCKCHAIN_SAVE, sanitizeBlockchain } from "../engine/blockchainEngine";
import { SpaceState } from "../types/space";
import { SPACE_SAVE, sanitizeSpace } from "../engine/spaceEngine";
import { HoldingState } from "../types/holding";
import { HOLDING_SAVE, sanitizeHolding } from "../engine/holdingEngine";

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
  oilGas: OilGasState | null;
  setOilGas: React.Dispatch<React.SetStateAction<OilGasState | null>>;
  airline: AirlineState | null;
  setAirline: React.Dispatch<React.SetStateAction<AirlineState | null>>;
  hotel: HotelState | null;
  setHotel: React.Dispatch<React.SetStateAction<HotelState | null>>;
  blockchain: BlockchainState | null;
  setBlockchain: React.Dispatch<React.SetStateAction<BlockchainState | null>>;
  space: SpaceState | null;
  setSpace: React.Dispatch<React.SetStateAction<SpaceState | null>>;
  holding: HoldingState | null;
  setHolding: React.Dispatch<React.SetStateAction<HoldingState | null>>;
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
  oilGas: null,
  setOilGas: () => undefined,
  airline: null,
  setAirline: () => undefined,
  hotel: null,
  setHotel: () => undefined,
  blockchain: null,
  setBlockchain: () => undefined,
  space: null,
  setSpace: () => undefined,
  holding: null,
  setHolding: () => undefined,
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
  const [oilGas, setOilGas] = useState<OilGasState | null>(null);
  const [airline, setAirline] = useState<AirlineState | null>(null);
  const [hotel, setHotel] = useState<HotelState | null>(null);
  const [blockchain, setBlockchain] = useState<BlockchainState | null>(null);
  const [space, setSpace] = useState<SpaceState | null>(null);
  const [holding, setHolding] = useState<HoldingState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    void recoverPendingSave()
      .catch(() => false)
      .then(() => Promise.all([
        loadBusinessSimulation(),
        AsyncStorage.getItem(TAXI_COMPANY_SAVE),
        AsyncStorage.getItem(SHIPPING_COMPANY_SAVE),
        AsyncStorage.getItem(FACTORY_COMPANY_SAVE),
        AsyncStorage.getItem(CONSTRUCTION_COMPANY_SAVE),
        AsyncStorage.getItem(DEALERSHIP_SAVE),
        AsyncStorage.getItem(SOFTWARE_COMPANY_SAVE),
        AsyncStorage.getItem(SPORTS_CLUB_SAVE),
        AsyncStorage.getItem(OIL_GAS_SAVE),
        AsyncStorage.getItem(AIRLINE_SAVE),
        AsyncStorage.getItem(HOTEL_SAVE),
        AsyncStorage.getItem(BLOCKCHAIN_SAVE),
        AsyncStorage.getItem(SPACE_SAVE),
        AsyncStorage.getItem(HOLDING_SAVE),
      ]))
      .then(
      ([
        loadedBusinesses,
        rawTaxi,
        rawShipping,
        rawFactory,
        rawConstruction,
        rawDealership,
        rawSoftware,
        rawSportsClub,
        rawOilGas,
        rawAirline,
        rawHotel,
        rawBlockchain,
        rawSpace,
        rawHolding,
      ]) => {
        if (!active) return;
        setBusinesses(loadedBusinesses);
        if (rawTaxi) {
          try {
            const parsed = JSON.parse(rawTaxi);
            if (parsed?.id === DEFAULT_TAXI_COMPANY.id)
              setTaxiCompany({
                ...DEFAULT_TAXI_COMPANY,
                ...parsed,
                name:
                  parsed.name === "Empire Taxi Co."
                    ? DEFAULT_TAXI_COMPANY.name
                    : parsed.name || DEFAULT_TAXI_COMPANY.name,
              });
          } catch {
            setTaxiCompany(DEFAULT_TAXI_COMPANY);
          }
        }
        if (rawShipping) {
          try {
            const parsed = JSON.parse(rawShipping);
            if (parsed?.id === DEFAULT_SHIPPING_COMPANY.id)
              setShippingCompany({ ...DEFAULT_SHIPPING_COMPANY, ...parsed });
          } catch {
            setShippingCompany(DEFAULT_SHIPPING_COMPANY);
          }
        }
        if (rawFactory) {
          try {
            const parsed = JSON.parse(rawFactory);
            if (parsed?.id === DEFAULT_FACTORY_COMPANY.id)
              setFactoryCompany({ ...DEFAULT_FACTORY_COMPANY, ...parsed });
          } catch {
            setFactoryCompany(DEFAULT_FACTORY_COMPANY);
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
            setConstructionCompany(DEFAULT_CONSTRUCTION_COMPANY);
          }
        }
        if (rawDealership) {
          try {
            const parsed = JSON.parse(rawDealership);
            if (parsed?.id === DEFAULT_DEALERSHIP.id)
              setDealership({ ...DEFAULT_DEALERSHIP, ...parsed });
          } catch {
            setDealership(DEFAULT_DEALERSHIP);
          }
        }
        if (rawSoftware) {
          try {
            const parsed = JSON.parse(rawSoftware);
            if (parsed?.id === DEFAULT_SOFTWARE_COMPANY.id)
              setSoftwareCompany({ ...DEFAULT_SOFTWARE_COMPANY, ...parsed });
          } catch {
            setSoftwareCompany(DEFAULT_SOFTWARE_COMPANY);
          }
        }
        if (rawSportsClub) {
          try {
            setSportsClub(sanitizeSportsClub(JSON.parse(rawSportsClub)));
          } catch {
            setSportsClub(sanitizeSportsClub({}));
          }
        }
        if (rawOilGas) {
          try {
            setOilGas(sanitizeOilGas(JSON.parse(rawOilGas)));
          } catch {
            setOilGas(sanitizeOilGas({}));
          }
        }
        if (rawAirline) {
          try {
            setAirline(sanitizeAirline(JSON.parse(rawAirline)));
          } catch {
            setAirline(sanitizeAirline({}));
          }
        }
        if (rawHotel) {
          try {
            setHotel(sanitizeHotel(JSON.parse(rawHotel)));
          } catch {
            setHotel(sanitizeHotel({}));
          }
        }
        if (rawBlockchain) {
          try {
            setBlockchain(sanitizeBlockchain(JSON.parse(rawBlockchain)));
          } catch {
            setBlockchain(sanitizeBlockchain({}));
          }
        }
        if (rawSpace) {
          try {
            setSpace(sanitizeSpace(JSON.parse(rawSpace)));
          } catch {
            setSpace(sanitizeSpace({}));
          }
        }
        if (rawHolding) {
          try {
            setHolding(sanitizeHolding(JSON.parse(rawHolding)));
          } catch {
            setHolding(sanitizeHolding({}));
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
    const specializedEntry = (key: string, value: unknown) => ({
      key,
      value: value == null ? null : JSON.stringify(value),
    });
    void coordinatedWrite([
      {
        key: BUSINESS_SIMULATION_SAVE,
        value: JSON.stringify({ schemaVersion: 4, businesses }),
      },
      specializedEntry(TAXI_COMPANY_SAVE, taxiCompany),
      specializedEntry(SHIPPING_COMPANY_SAVE, shippingCompany),
      specializedEntry(FACTORY_COMPANY_SAVE, factoryCompany),
      specializedEntry(CONSTRUCTION_COMPANY_SAVE, constructionCompany),
      specializedEntry(DEALERSHIP_SAVE, dealership),
      specializedEntry(SOFTWARE_COMPANY_SAVE, softwareCompany),
      specializedEntry(SPORTS_CLUB_SAVE, sportsClub),
      specializedEntry(OIL_GAS_SAVE, oilGas),
      specializedEntry(AIRLINE_SAVE, airline),
      specializedEntry(HOTEL_SAVE, hotel),
      specializedEntry(BLOCKCHAIN_SAVE, blockchain),
      specializedEntry(SPACE_SAVE, space),
      specializedEntry(HOLDING_SAVE, holding),
    ]).catch(() => undefined);
  }, [
    businesses,
    taxiCompany,
    shippingCompany,
    factoryCompany,
    constructionCompany,
    dealership,
    softwareCompany,
    sportsClub,
    oilGas,
    airline,
    hotel,
    blockchain,
    space,
    holding,
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
    setOilGas(null);
    setAirline(null);
    setHotel(null);
    setBlockchain(null);
    setSpace(null);
    setHolding(null);
    void coordinatedWrite([
      { key: BUSINESS_SIMULATION_SAVE, value: JSON.stringify({ schemaVersion: 4, businesses: DEFAULT_BUSINESSES }) },
      ...[
      TAXI_COMPANY_SAVE,
      SHIPPING_COMPANY_SAVE,
      FACTORY_COMPANY_SAVE,
      CONSTRUCTION_COMPANY_SAVE,
      DEALERSHIP_SAVE,
      SOFTWARE_COMPANY_SAVE,
      SPORTS_CLUB_SAVE,
      OIL_GAS_SAVE,
      AIRLINE_SAVE,
      HOTEL_SAVE,
      BLOCKCHAIN_SAVE,
      SPACE_SAVE,
      HOLDING_SAVE,
      ].map((key) => ({ key, value: null })),
    ]).catch(() => undefined);
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
      oilGas,
      setOilGas,
      airline,
      setAirline,
      hotel,
      setHotel,
      blockchain,
      setBlockchain,
      space,
      setSpace,
      holding,
      setHolding,
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
      oilGas,
      airline,
      hotel,
      blockchain,
      space,
      holding,
    ],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
export function useGame() {
  return useContext(GameContext);
}
