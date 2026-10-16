import type { BankingData } from "../../../types/business";

export type BankingPageProps = {
  business: BankingData;
  cash: number;
  onCashChange: (updater: (value: number) => number) => void;
  onChange: (business: BankingData) => void;
};
