import type { BankingData } from "../../../types/business";
import type { BankLedgerEntry } from "../../../types/bank";

export type BankingPageProps = {
  business: BankingData;
  cash: number;
  onCashChange: (updater: (value: number) => number) => void;
  onChange: (business: BankingData) => void;
  onLedger: (entry: BankLedgerEntry) => void;
};
