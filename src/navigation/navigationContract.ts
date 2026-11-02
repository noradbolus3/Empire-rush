export type AppTab = "empire" | "business" | "markets" | "lifestyle" | "bank";

export type AppTabDefinition = {
  id: AppTab;
  icon: string;
  label: string;
  accessibilityLabel: string;
};

export const APP_TABS: readonly AppTabDefinition[] = [
  { id: "empire", icon: "⌂", label: "EMPIRE", accessibilityLabel: "Open Empire dashboard" },
  { id: "business", icon: "◈", label: "BUSINESS", accessibilityLabel: "Open Business portfolio" },
  { id: "markets", icon: "↗", label: "MARKETS", accessibilityLabel: "Open Markets" },
  { id: "lifestyle", icon: "◇", label: "LIFESTYLE", accessibilityLabel: "Open Lifestyle" },
  { id: "bank", icon: "▥", label: "BANK", accessibilityLabel: "Open Founder Bank" },
];

export const BOTTOM_NAV_HEIGHT = 54;
export const SCREEN_BOTTOM_PADDING = BOTTOM_NAV_HEIGHT + 24;
export const BUSINESS_BACK_LABEL = "‹ BUSINESS PORTFOLIO";
export const FOUNDER_BANK_LABEL = "FOUNDER BANK";
export const BANKING_COMPANY_LABEL = "BANKING COMPANY";
