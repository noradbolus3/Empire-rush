import { AdEventType, RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

export function showTestRewardedAd(onReward: () => void): Promise<boolean> {
  const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, { requestNonPersonalizedAdsOnly: true });
  return new Promise(resolve => {
    let earned = false;
    let settled = false;
    const finish = (success: boolean) => {
      if (settled) return;
      settled = true;
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
    rewarded.load();
  });
}
