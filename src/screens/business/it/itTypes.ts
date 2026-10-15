import { ITSoftwareData } from '../../../types/business';
import { ITCompanyStage } from '../../../types/itCompany';

export type ITPageProps = {
  business: ITSoftwareData;
  cash: number;
  netWorth: number;
  stage: ITCompanyStage;
  onCashChange: (updater: (value: number) => number) => void;
  onChange: (business: ITSoftwareData) => void;
  spend: (cost: number, update: (business: ITSoftwareData) => ITSoftwareData, label: string) => void;
};
