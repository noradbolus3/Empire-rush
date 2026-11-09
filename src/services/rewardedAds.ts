import mobileAds, { AdEventType, AdsConsent, MaxAdContentRating, RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { ADMOB_REWARDED_UNIT_ID } from '../config/monetization';

let initStarted = false;
/** Ads are optional; request non-personalized inventory and a conservative Teen content rating. */
export async function initAds(): Promise<void> {
  if (initStarted) return;
  initStarted = true;
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.T,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    try { await AdsConsent.gatherConsent(); } catch { /* no form configured or offline */ }
    await mobileAds().initialize();
  } catch { /* ad failures must not block offline gameplay */ }
}

export async function showAdsPrivacyOptions(): Promise<boolean> {
  try { await AdsConsent.showPrivacyOptionsForm(); return true; }
  catch { return false; }
}

const unitId = () => (__DEV__ || !ADMOB_REWARDED_UNIT_ID ? TestIds.REWARDED : ADMOB_REWARDED_UNIT_ID);

export function showRewardedAd(onReward: () => void): Promise<boolean> {
  const rewarded = RewardedAd.createForAdRequest(unitId(), { requestNonPersonalizedAdsOnly: true });
  return new Promise(resolve => {
    let earned = false;
    let settled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const finish = (success: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      unsubscribeLoaded();
      unsubscribeReward();
      unsubscribeClosed();
      unsubscribeError();
      resolve(success);
    };
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => { void rewarded.show(); });
    const unsubscribeReward = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; onReward(); });
    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => finish(earned));
    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, () => finish(false));
    timeout = setTimeout(() => finish(false), 30_000);
    rewarded.load();
  });
}
/** Backwards-compatible name for existing callers. */
export const showTestRewardedAd = showRewardedAd;
