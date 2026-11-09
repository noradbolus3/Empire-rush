/**
 * Release monetization configuration.
 * Paste the real AdMob rewarded ad unit ID here (and the real AdMob app ID in app.json).
 * While this is empty, Google's test ad unit is used so the build still works.
 */
export const ADMOB_REWARDED_UNIT_ID: string = '';

/** Play Console in-app product IDs (managed, one-time products). Must match exactly. */
export const PRODUCT_IDS = ['ad_free', 'executive_boost'] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];
