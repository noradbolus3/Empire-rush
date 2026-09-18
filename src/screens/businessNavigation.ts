import { BusinessEntity } from '../types/game';
export type BusinessRouteActions = { cash: number; onCashChange: (next: (value: number) => number) => void; onChange: (business: BusinessEntity) => void };
export type BusinessStackParamList = {
  BusinessDetail: { business: BusinessEntity } & BusinessRouteActions;
  BusinessFinancials: { business: BusinessEntity } & BusinessRouteActions;
  BusinessSupplyChain: { business: BusinessEntity } & BusinessRouteActions;
  BusinessWorkforce: { business: BusinessEntity } & BusinessRouteActions;
  BusinessExpansion: { business: BusinessEntity } & BusinessRouteActions;
};
