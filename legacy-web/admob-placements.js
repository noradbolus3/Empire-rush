/*
 * Empire Rush monetization contract.
 *
 * The current repository is a browser/3D game, so this module is deliberately
 * an adapter contract rather than a browser ad SDK. The future React Native
 * shell should map these placement names to react-native-google-mobile-ads.
 * All IDs below are Google's official test IDs and must be replaced before
 * production release.
 */
(function () {
  "use strict";

  const TEST_IDS = {
    rewarded: "ca-app-pub-3940256099942544/5224354917",
    interstitial: "ca-app-pub-3940256099942544/1033173712"
  };

  const placements = {
    emergencyAngelFunding: {
      type: "rewarded",
      adUnitId: TEST_IDS.rewarded,
      reward: "stage-scaled cash grant"
    },
    businessBoost: {
      type: "rewarded",
      adUnitId: TEST_IDS.rewarded,
      reward: "2x customer footfall for 30 in-game minutes"
    },
    taxAuditShield: {
      type: "rewarded",
      adUnitId: TEST_IDS.rewarded,
      reward: "clear pending tax liabilities"
    },
    milestoneInterstitial: {
      type: "interstitial",
      adUnitId: TEST_IDS.interstitial,
      trigger: "milestone achievement only; never a timer"
    }
  };

  window.EmpireAdMobContract = {
    testIds: TEST_IDS,
    placements,
    getPlacement(name) { return placements[name] || null; },
    shouldShowInterstitial(eventName) {
      return ["business_category_unlocked", "major_upgrade_unlocked", "ipo_launched"].includes(eventName);
    }
  };
})();
