import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { WealthCard } from '../components/WealthCard';
import { formatCurrency } from '../utils/formatCurrency';
import { TAP_VALUE_CAP } from '../engine/tapUpgradeEngine';
import { designSystem } from '../theme/designSystem';
import type { BusinessEntity } from '../types/business';
import type { PortfolioPoint } from '../types/market';
import type { FounderProfile } from './FirstLaunchOnboarding';
import type { CanonicalBusiness } from '../engine/canonicalBusinessRegistry';
import { selectHomePortfolioBusinesses } from '../engine/homePortfolio';

type BadgeItem = { id: number; amount: number; lane: number };
type HomeScreenProps = { cash: number; netWorth: number; projectedHourlyIncome: number; settlementCountdown: string; clickValue: number; tapUpgradeLevel: number; clickUpgradeCost: number; tapUpgradeGain: number; loginStreak: number; tapsToday: number; tapCashToday: number; tapBoostMultiplier: number; tapBoostActive: boolean; dailyTapGoal: number; missionClaimed: boolean; rank: string; nextGoal: string; prestigeLevel: number; achievements: number; weeklyEvent: string; businesses: BusinessEntity[]; portfolioBusinesses?: readonly CanonicalBusiness[]; activeBusinessCount?: number; founderProfile: FounderProfile | null; portfolioHistory: PortfolioPoint[]; onPrestige: () => void; prestigeLocked: boolean; prestigeShortfall: number; hapticsEnabled: boolean; soundEnabled: boolean; onWatchBoost: () => void; onWatchTapBoost: () => void; onEarn: (amount: number) => void; onUpgrade: () => void; onClaimMission: () => void; onOpenBusiness: () => void; onOpenMarkets: () => void; onOpenLifestyle: () => void; onOpenBank: () => void; onOpenSettings: () => void; onOpenStore: () => void; onOpenNextGoal: () => void; onOpenEarnings: () => void };

const C = { bg: designSystem.colors.background, ink: designSystem.colors.textPrimary, panel: designSystem.colors.card, emerald: designSystem.colors.primary, lime: designSystem.colors.primary, green: designSystem.colors.primary, gold: designSystem.colors.gold, white: designSystem.colors.heading, text: designSystem.colors.heading, muted: designSystem.colors.secondary, cyan: designSystem.colors.cyan };

export function HomeScreen({ cash, netWorth, projectedHourlyIncome, settlementCountdown, clickValue, tapUpgradeLevel, clickUpgradeCost, tapUpgradeGain, loginStreak, tapsToday, tapCashToday, tapBoostMultiplier, tapBoostActive, dailyTapGoal, missionClaimed, rank, nextGoal, prestigeLevel, achievements, weeklyEvent, businesses, portfolioBusinesses, activeBusinessCount, founderProfile, portfolioHistory, onPrestige, prestigeLocked, prestigeShortfall, hapticsEnabled, soundEnabled, onWatchBoost, onWatchTapBoost, onEarn, onUpgrade, onClaimMission, onOpenBusiness, onOpenMarkets, onOpenLifestyle, onOpenBank, onOpenSettings, onOpenStore, onOpenNextGoal, onOpenEarnings }: HomeScreenProps) {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const nextId = useRef(0); const upgradeLock = useRef(false); const tapScale = useRef(new RNAnimated.Value(1)).current; const tapGlow = useRef(new RNAnimated.Value(0.7)).current; const pulse = useRef(new RNAnimated.Value(0)).current;
  const clickSound = useAudioPlayer(require('../../assets/click.wav'));
  const missionReady = tapsToday >= dailyTapGoal && !missionClaimed; const effectiveTapValue = clickValue * tapBoostMultiplier; const tapProgress = Math.min(1, tapsToday / Math.max(1, dailyTapGoal)); const levelProgress = Math.min(1, clickValue / TAP_VALUE_CAP);
  useEffect(() => { const loop = RNAnimated.loop(RNAnimated.sequence([RNAnimated.timing(tapGlow, { toValue: 1, duration: 1100, useNativeDriver: true }), RNAnimated.timing(tapGlow, { toValue: 0.58, duration: 1100, useNativeDriver: true })])); loop.start(); return () => loop.stop(); }, [tapGlow]);
  useEffect(() => { if (cash <= 0) return; RNAnimated.sequence([RNAnimated.timing(pulse, { toValue: 1, duration: 130, useNativeDriver: true }), RNAnimated.timing(pulse, { toValue: 0, duration: 300, useNativeDriver: true })]).start(); }, [cash, pulse]);
  const tap = useCallback(() => { if (soundEnabled) { clickSound.seekTo(0); clickSound.play(); } if (hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); const id = nextId.current++; setBadges(current => [...current.slice(-5), { id, amount: effectiveTapValue, lane: id % 3 }]); onEarn(clickValue); }, [clickSound, clickValue, effectiveTapValue, hapticsEnabled, onEarn, soundEnabled]);
  const pressTap = () => { RNAnimated.sequence([RNAnimated.spring(tapScale, { toValue: 0.92, speed: 42, bounciness: 3, useNativeDriver: true }), RNAnimated.spring(tapScale, { toValue: 1, speed: 24, bounciness: 12, useNativeDriver: true })]).start(); tap(); };
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.root, gameStyles.root]}
      showsVerticalScrollIndicator={false}
    >
      <DashboardOverview
        cash={cash}
        netWorth={netWorth}
        projectedHourlyIncome={projectedHourlyIncome}
        settlementCountdown={settlementCountdown}
        businesses={businesses}
        portfolioBusinesses={portfolioBusinesses}
        activeBusinessCount={activeBusinessCount}
        founderProfile={founderProfile}
        portfolioHistory={portfolioHistory}
        rank={rank}
        onOpenBusiness={onOpenBusiness}
        onOpenMarkets={onOpenMarkets}
        onOpenLifestyle={onOpenLifestyle}
        onOpenBank={onOpenBank}
        onOpenSettings={onOpenSettings}
        onOpenStore={onOpenStore}
        onOpenNextGoal={onOpenNextGoal}
        onOpenEarnings={onOpenEarnings}
      >
        <>
          <View style={[styles.controlPanel, gameStyles.controlPanel]}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.sectionKicker, gameStyles.sectionKicker]}>MAIN GAME LOOP</Text>
                <Text style={[styles.panelTitle, gameStyles.panelTitle]}>Tap to collect cash</Text>
              </View>
              <View style={[styles.livePill, gameStyles.livePill]}>
                <View style={[styles.liveDot, gameStyles.liveDot]} />
                <Text style={[styles.liveText, gameStyles.liveText]}>LIVE</Text>
              </View>
            </View>
            <Text style={[styles.tapCaption, gameStyles.tapCaption]}>
              Every tap earns <Text style={[styles.tapCaptionStrong, gameStyles.tapCaptionStrong]}>{formatCurrency(effectiveTapValue)}</Text>
            </Text>
            <View style={[styles.tapStage, gameStyles.tapStage]}>
              <View style={[styles.orbit, styles.orbitOuter, gameStyles.orbitOuter]} />
              <View style={[styles.orbit, styles.orbitInner, gameStyles.orbitInner]} />
              {badges.map(item => (
                <FloatingBadge
                  key={item.id}
                  amount={item.amount}
                  lane={item.lane}
                  onDone={() => setBadges(current => current.filter(badge => badge.id !== item.id))}
                />
              ))}
              <RNAnimated.View style={[styles.tapGlow, gameStyles.tapGlow, { opacity: tapGlow }]} />
              <RNAnimated.View style={{ transform: [{ scale: tapScale }] }}>
                <Pressable
                  onPress={pressTap}
                  style={({ pressed }) => [styles.tapButton, gameStyles.tapButton, pressed && styles.tapPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Tap to earn ${formatCurrency(effectiveTapValue)}`}
                >
                  <Text style={[styles.tapSymbol, gameStyles.tapSymbol]}>$</Text>
                  <Text style={[styles.tapAmount, gameStyles.tapAmount]}>+{formatCurrency(effectiveTapValue)}</Text>
                  <Text style={[styles.tapLabel, gameStyles.tapLabel]}>TAP TO EARN</Text>
                </Pressable>
              </RNAnimated.View>
            </View>
            <View style={[styles.budgetRow, gameStyles.budgetRow]}>
              <Text style={[styles.budgetLabel, gameStyles.budgetLabel]}>TAPS · {tapsToday} TODAY</Text>
              <Text style={[styles.budgetValue, gameStyles.budgetValue]}>{tapBoostActive ? '2× TAP BOOST' : `${Math.round(tapProgress * 100)}% DAILY GOAL`}</Text>
            </View>
            <View style={[styles.budgetTrack, gameStyles.budgetTrack]}>
              <View style={[styles.budgetFill, gameStyles.budgetFill, { width: `${Math.max(2, tapProgress * 100)}%` }]} />
            </View>
          </View>

          <View style={[styles.upgradeCard, gameStyles.upgradeCard]}>
            <View style={[styles.upgradeIcon, gameStyles.upgradeIcon]}><Text style={styles.upgradeIconText}>↑</Text></View>
            <View style={styles.upgradeCopy}>
              <Text style={[styles.sectionKicker, gameStyles.sectionKicker]}>NEXT UPGRADE</Text>
              <Text style={[styles.upgradeTitle, gameStyles.upgradeTitle]}>Tap value {formatCurrency(clickValue)} → {formatCurrency(Math.min(TAP_VALUE_CAP, clickValue + tapUpgradeGain))}</Text>
              <Text style={[styles.upgradeSub, gameStyles.upgradeSub]}>Level {tapUpgradeLevel} · +{formatCurrency(tapUpgradeGain)} per tap</Text>
            </View>
            <Pressable
              disabled={clickValue >= TAP_VALUE_CAP}
              onPress={() => {
                if (upgradeLock.current) return;
                upgradeLock.current = true;
                onUpgrade();
                setTimeout(() => { upgradeLock.current = false; }, 180);
              }}
              style={({ pressed }) => [styles.upgradeButton, gameStyles.upgradeButton, pressed && styles.pressed, clickValue >= TAP_VALUE_CAP && styles.disabled]}
            >
              <Text style={[styles.upgradeCost, gameStyles.upgradeCost]}>{clickValue >= TAP_VALUE_CAP ? 'MAX' : formatCurrency(clickUpgradeCost)}</Text>
              <Text style={[styles.upgradeLabel, gameStyles.upgradeLabel]}>{clickValue >= TAP_VALUE_CAP ? '$10 CAP' : 'UPGRADE'}</Text>
            </Pressable>
          </View>

          <View style={[styles.missionCard, gameStyles.missionCard]}>
            <View style={[styles.missionBadge, gameStyles.missionBadge]}><Text style={[styles.missionBadgeText, gameStyles.missionBadgeText]}>{missionClaimed ? '✓' : '★'}</Text></View>
            <View style={styles.missionCopy}>
              <Text style={[styles.sectionKicker, gameStyles.sectionKicker]}>DAILY MISSION</Text>
              <Text style={[styles.missionTitle, gameStyles.missionTitle]}>{missionClaimed ? 'Mission complete' : `Make ${dailyTapGoal} smart moves`}</Text>
              <Text style={[styles.missionSub, gameStyles.missionSub]}>{Math.min(tapsToday, dailyTapGoal)} / {dailyTapGoal} taps · reward {formatCurrency(1000)}</Text>
            </View>
            <Pressable disabled={!missionReady} onPress={onClaimMission} style={[styles.claimButton, gameStyles.claimButton, !missionReady && styles.disabled]}>
              <Text style={[styles.claimText, gameStyles.claimText]}>{missionClaimed ? 'DONE' : missionReady ? 'CLAIM' : 'GO'}</Text>
            </Pressable>
          </View>
        </>
      </DashboardOverview>

      <View style={gameStyles.boostRow}>
        <Pressable onPress={onWatchBoost} style={({ pressed }) => [styles.boost, gameStyles.boostCompact, pressed && styles.pressed]}>
          <View style={[styles.boostIcon, gameStyles.boostIcon]}><Text style={styles.boostIconText}>×2</Text></View>
          <View style={styles.boostCopy}>
            <Text style={[styles.boostTitle, gameStyles.boostTitle]}>INCOME BOOST</Text>
            <Text style={[styles.boostSub, gameStyles.boostSub]} numberOfLines={1}>Passive income · 30 min</Text>
          </View>
          <Text style={[styles.boostAction, gameStyles.boostAction]}>WATCH</Text>
        </Pressable>
        <Pressable onPress={onWatchTapBoost} style={({ pressed }) => [styles.tapBoostCard, gameStyles.boostCompact, tapBoostActive && styles.tapBoostActive, pressed && styles.pressed]}>
          <View style={[styles.tapBoostIcon, gameStyles.boostIcon]}><Text style={styles.tapBoostIconText}>T×2</Text></View>
          <View style={styles.boostCopy}>
            <Text style={[styles.boostTitle, gameStyles.boostTitle]}>TAP BOOST</Text>
            <Text style={[styles.boostSub, gameStyles.boostSub]} numberOfLines={1}>{tapBoostActive ? 'Active · 2× taps' : 'Tap value · 12 min'}</Text>
          </View>
          <Text style={[styles.boostAction, gameStyles.boostAction]}>{tapBoostActive ? 'LIVE' : 'WATCH'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => void Share.share({ message: `I just built a ${formatCurrency(netWorth)} empire in BuildBoss. Rank: ${rank}.` })} style={[styles.shareCard, gameStyles.shareCard]}>
        <View><Text style={styles.sectionKicker}>MILESTONE</Text><Text style={[styles.shareTitle, gameStyles.shareTitle]}>{formatCurrency(netWorth)} empire club</Text></View>
        <Text style={styles.shareAction}>SHARE ↗</Text>
      </Pressable>
    </ScrollView>
  );
}

type DashboardOverviewProps = Pick<HomeScreenProps, 'cash' | 'netWorth' | 'projectedHourlyIncome' | 'settlementCountdown' | 'businesses' | 'portfolioBusinesses' | 'activeBusinessCount' | 'founderProfile' | 'portfolioHistory' | 'rank' | 'onOpenBusiness' | 'onOpenMarkets' | 'onOpenLifestyle' | 'onOpenBank' | 'onOpenSettings' | 'onOpenStore' | 'onOpenNextGoal' | 'onOpenEarnings'> & { children?: React.ReactNode };

function DashboardOverview({ cash, netWorth, projectedHourlyIncome, settlementCountdown, businesses, portfolioBusinesses, activeBusinessCount, founderProfile, portfolioHistory, rank, onOpenBusiness, onOpenMarkets, onOpenLifestyle, onOpenBank, onOpenSettings, onOpenStore, onOpenNextGoal, onOpenEarnings, children }: DashboardOverviewProps) {
  const activeBusinesses = portfolioBusinesses
    ? selectHomePortfolioBusinesses(portfolioBusinesses)
    : businesses.filter((business) => business.isAcquired);
  const displayedActiveCount = activeBusinessCount ?? activeBusinesses.length;
  const totalAssets = Math.max(0, netWorth - cash);
  const growthPoints = portfolioHistory.filter((point) => Number.isFinite(point.value) && point.value >= 0).slice(-7);
  const hasChartData = growthPoints.length >= 2;
  const minValue = Math.min(...growthPoints.map((point) => point.value), netWorth);
  const maxValue = Math.max(...growthPoints.map((point) => point.value), netWorth, minValue + 1);
  const chartPath = growthPoints.map((point, index) => {
    const x = 8 + (index / Math.max(1, growthPoints.length - 1)) * 284;
    const y = 72 - ((point.value - minValue) / Math.max(1, maxValue - minValue)) * 56;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const founderAvatar = founderProfile?.avatarKey === 'founder-2' ? require('../../assets/onboarding/avatar-founder-2.png') : founderProfile?.avatarKey === 'founder-3' ? require('../../assets/onboarding/avatar-founder-3.png') : founderProfile?.avatarKey === 'founder-4' ? require('../../assets/onboarding/avatar-founder-4.png') : founderProfile?.avatarKey === 'founder-5' ? require('../../assets/onboarding/avatar-founder-5.png') : require('../../assets/onboarding/avatar-founder.png');

  return <>
    <View style={[styles.dashboardHeader, gameStyles.dashboardHeader]}>
      <View style={styles.dashboardGreeting}>
        <Text style={[styles.dashboardKicker, gameStyles.dashboardKicker]}>EMPIRE COMMAND</Text>
        <Text style={[styles.dashboardTitle, gameStyles.dashboardTitle]} numberOfLines={1}>{founderProfile?.founderName?.split(' ')[0] ? `${founderProfile.founderName.split(' ')[0]}'s empire` : 'Your empire'}</Text>
      </View>
      <Pressable onPress={onOpenSettings} style={[styles.dashboardProfile, gameStyles.dashboardProfile]}>
        <Image source={founderAvatar} style={[styles.dashboardAvatar, gameStyles.dashboardAvatar]} />
        <Text style={[styles.dashboardProfileName, gameStyles.dashboardProfileName]} numberOfLines={1}>{rank.replace('PUBLIC COMPANY ', '')}</Text>
        <Text style={styles.dashboardChevron}>⌄</Text>
      </Pressable>
    </View>

    <View style={[styles.hqHero, gameStyles.hqHero]}>
      <Image source={require('../../assets/holding/headquarters.webp')} style={styles.hqImage} />
      <View style={styles.hqShade} />
      <View style={[styles.hqOverlay, gameStyles.hqOverlay]}>
        <View>
          <Text style={[styles.hqKicker, gameStyles.hqKicker]}>HEADQUARTERS · LIVE</Text>
          <Text style={[styles.hqTitle, gameStyles.hqTitle]} numberOfLines={1}>{founderProfile?.companyName || 'Your Empire'}</Text>
          <Text style={[styles.hqSub, gameStyles.hqSub]} numberOfLines={1}>Grow your portfolio. Build your empire.</Text>
        </View>
        <View style={styles.hqBottom}>
          <View style={styles.hqValueBlock}>
            <Text style={[styles.hqValueLabel, gameStyles.hqValueLabel]}>EMPIRE VALUE</Text>
            <Text style={[styles.hqValue, gameStyles.hqValue]} numberOfLines={1}>{formatCurrency(netWorth)}</Text>
          </View>
          <View style={[styles.growthPill, gameStyles.growthPill]}>
            <Text style={[styles.growthValue, gameStyles.growthValue]} numberOfLines={1}>+{formatCurrency(projectedHourlyIncome)} / hr</Text>
            <Text style={[styles.growthLabel, gameStyles.growthLabel]}>PASSIVE INCOME</Text>
          </View>
        </View>
      </View>
    </View>

    <View style={[styles.statGrid, gameStyles.statGrid]}>
      <DashboardStat label="CASH" value={formatCurrency(cash)} icon="$" accent="#62D6B0" />
      <DashboardStat label="COMPANIES" value={String(displayedActiveCount)} icon="▦" accent="#F2BD3E" />
      <DashboardStat label="ASSETS" value={formatCurrency(totalAssets)} icon="◈" accent="#69B9FF" />
      <DashboardStat label="RANK" value={rank.replace('PUBLIC COMPANY ', '')} icon="♛" accent="#B49AFF" />
    </View>

    {children}

    <Pressable onPress={onOpenEarnings} style={({ pressed }) => [styles.dashboardCard, gameStyles.dashboardCard, pressed && styles.pressed]}>
      <View style={styles.cardHeader}>
        <View><Text style={[styles.cardKicker, gameStyles.cardKicker]}>EMPIRE GROWTH</Text><Text style={[styles.cardTitle, gameStyles.cardTitle]}>Net worth trajectory</Text></View>
        <Text style={[styles.cardMeta, gameStyles.cardMeta]}>{hasChartData ? 'LIVE' : 'NEW RUN'}</Text>
      </View>
      {hasChartData ? (
        <Svg width="100%" height={56} viewBox="0 0 300 84">
          <Line x1="8" y1="78" x2="292" y2="78" stroke="#DCE7F2" strokeWidth="1" />
          <Path d={chartPath} fill="none" stroke="#147BEA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="292" cy={72 - ((netWorth - minValue) / Math.max(1, maxValue - minValue)) * 56} r="4" fill="#D29B20" />
        </Svg>
      ) : (
        <View style={[styles.chartEmpty, gameStyles.chartEmpty]}>
          <Text style={[styles.chartEmptyTitle, gameStyles.chartEmptyTitle]}>Your empire chart unlocks after two settlements</Text>
        </View>
      )}
      <View style={[styles.chartFooter, gameStyles.chartFooter]}>
        <Text style={[styles.chartLabel, gameStyles.chartLabel]}>CURRENT VALUE</Text>
        <Text style={[styles.chartValue, gameStyles.chartValue]}>{formatCurrency(netWorth)}</Text>
        <Text style={[styles.chartHint, gameStyles.chartHint]}>{settlementCountdown} to payout</Text>
      </View>
    </Pressable>

    <Pressable onPress={onOpenNextGoal} style={({ pressed }) => [styles.goalStrip, gameStyles.goalStrip, pressed && styles.pressed]}>
      <Text style={[styles.goalStripIcon, gameStyles.goalStripIcon]}>⚑</Text>
      <View style={styles.goalStripCopy}>
        <Text style={[styles.cardKicker, gameStyles.cardKicker]}>NEXT OBJECTIVE</Text>
        <Text style={[styles.goalStripTitle, gameStyles.goalStripTitle]}>{displayedActiveCount ? 'Grow your strongest company' : 'Acquire your first company'}</Text>
        <Text style={[styles.goalStripSub, gameStyles.goalStripSub]} numberOfLines={1}>{displayedActiveCount ? `${activeBusinesses[0]?.name || 'Your portfolio'} · buy an upgrade` : 'Choose a sector and start earning.'}</Text>
      </View>
      <View style={[styles.goalStripButton, gameStyles.goalStripButton]}><Text style={styles.goalStripButtonText}>PLAY</Text></View>
    </Pressable>

    <View style={[styles.sectionHeadingRow, gameStyles.sectionHeadingRow]}>
      <View style={styles.sectionHeadingCopy}>
        <Text style={[styles.cardKicker, gameStyles.cardKicker]}>MY COMPANIES</Text>
        <Text style={[styles.cardTitle, gameStyles.sectionTitle]}>Operating portfolio</Text>
      </View>
      <Pressable onPress={onOpenBusiness}><Text style={styles.seeAll}>ALL ›</Text></Pressable>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.companyRail, gameStyles.companyRail]}>
      {activeBusinesses.map((business) => <CompanyPreview key={business.id} business={business} onPress={onOpenBusiness} />)}
      <Pressable onPress={onOpenBusiness} style={[styles.newCompanyCard, gameStyles.newCompanyCard]}>
        <Text style={styles.newCompanyPlus}>＋</Text>
        <Text style={[styles.newCompanyTitle, gameStyles.newCompanyTitle]}>START COMPANY</Text>
        <Text style={styles.newCompanySub}>Pick a sector · build income</Text>
      </Pressable>
    </ScrollView>

    <View style={[styles.dashboardCard, gameStyles.quickPanel]}>
      <Text style={[styles.cardKicker, gameStyles.cardKicker]}>GAME MENU</Text>
      <View style={[styles.quickGrid, gameStyles.quickGrid]}>
        <QuickAction label="Projects" icon="▣" onPress={onOpenBusiness} />
        <QuickAction label="Upgrades" icon="↗" onPress={onOpenBusiness} />
        <QuickAction label="Markets" icon="⌁" onPress={onOpenMarkets} />
        <QuickAction label="Lifestyle" icon="◇" onPress={onOpenLifestyle} />
        <QuickAction label="Bank" icon="▤" onPress={onOpenBank} />
        <QuickAction label="Store" icon="✦" onPress={onOpenStore} />
      </View>
    </View>

    <Pressable onPress={onOpenStore} style={[styles.storeBanner, gameStyles.storeBanner]}>
      <View><Text style={styles.storeKicker}>BUILDBOSS PREMIUM</Text><Text style={[styles.storeTitle, gameStyles.storeTitle]}>Power up your next move</Text><Text style={styles.storeSub}>Founder plans and time-saving boosts.</Text></View>
      <View style={styles.storeAction}><Text style={styles.storeActionText}>VIEW</Text><Text style={styles.storeArrow}>›</Text></View>
    </Pressable>
  </>;
}

function DashboardStat({ label, value, icon, accent }: { label: string; value: string; icon: string; accent: string }) { return <View style={[styles.dashboardStat, gameStyles.dashboardStat]}><View style={[styles.dashboardStatIcon, gameStyles.dashboardStatIcon, { backgroundColor: `${accent}20` }]}><Text style={[styles.dashboardStatIconText, gameStyles.dashboardStatIconText, { color: accent }]}>{icon}</Text></View><Text style={[styles.dashboardStatLabel, gameStyles.dashboardStatLabel]} numberOfLines={1}>{label}</Text><Text style={[styles.dashboardStatValue, gameStyles.dashboardStatValue]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{value}</Text></View>; }
function QuickAction({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, gameStyles.quickAction, pressed && styles.pressed]}><Text style={[styles.quickIcon, gameStyles.quickIcon]}>{icon}</Text><Text style={[styles.quickLabel, gameStyles.quickLabel]}>{label}</Text></Pressable>; }
function CompanyPreview({ business, onPress }: { business: BusinessEntity | CanonicalBusiness; onPress: () => void }) {
  const canonical = 'kind' in business;
  const name = business.name;
  const owned = canonical ? business.owned : business.isAcquired;
  const sector = canonical ? business.kind : business.sector.replace('_', ' ');
  const hourlyNet = canonical ? business.hourlyNet : business.hourlyNetProfit;
  const hint = canonical
    ? `${business.operating ? 'Operating' : 'Owned'} · ${formatCurrency(business.assetValue)} value`
    : `Level ${business.level || 1} · ${business.reputation || 0}% reputation`;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.companyCard, gameStyles.companyCard, pressed && styles.pressed]}><Image source={canonical ? canonicalCompanyVisual(business.kind) : companyVisual(business.sector)} style={[styles.companyImage, gameStyles.companyImage]} /><View style={[styles.companyCardBody, gameStyles.companyCardBody]}><View style={styles.companyCardTop}><Text style={styles.companyName} numberOfLines={1}>{name}</Text><Text style={styles.companyStatus}>{owned ? 'LIVE' : 'LOCKED'}</Text></View><Text style={styles.companySector} numberOfLines={1}>{sector.replace('_', ' ')}</Text><Text style={[styles.companyIncome, gameStyles.companyIncome]}>+{formatCurrency(Math.max(0, hourlyNet))}<Text style={styles.companyIncomeUnit}> / hr</Text></Text><Text style={styles.companyHint} numberOfLines={1}>{hint}</Text></View></Pressable>;
}
function companyVisual(sector: BusinessEntity['sector']): number { if (sector === 'Retail') return require('../../assets/stocks/marketnest.webp'); if (sector === 'Mobility') return require('../../assets/taxi/taxi-dashboard.webp'); if (sector === 'Tech_SaaS') return require('../../assets/it-company/it-company-hero.webp'); if (sector === 'Construction_Mega') return require('../../assets/construction/construction-project.webp'); if (sector === 'Banking') return require('../../assets/banking/banking-headquarters.webp'); if (sector === 'Airline') return require('../../assets/airline/headquarters.webp'); if (sector === 'Energy') return require('../../assets/oilgas/energy-group.webp'); if (sector === 'Real_Estate') return require('../../assets/holding/global-strategy.webp'); if (sector === 'Media') return require('../../assets/holding/headquarters.webp'); if (sector === 'Sports') return require('../../assets/dealership/dealership-dashboard.jpg'); if (sector === 'Pharma') return require('../../assets/banking/loan-credit.webp'); return require('../../assets/holding/headquarters.webp'); }
function canonicalCompanyVisual(kind: CanonicalBusiness['kind']): number { if (kind === 'taxi') return require('../../assets/taxi/taxi-dashboard.webp'); if (kind === 'shipping') return require('../../assets/shipping/shipping-dashboard.webp'); if (kind === 'factory') return require('../../assets/factory/production-line.jpg'); if (kind === 'construction') return require('../../assets/construction/construction-project.webp'); if (kind === 'dealership') return require('../../assets/dealership/dealership-dashboard.jpg'); if (kind === 'software') return require('../../assets/it-company/it-company-hero.webp'); if (kind === 'sports') return require('../../assets/sports/club-headquarters.webp'); if (kind === 'oilGas') return require('../../assets/oilgas/energy-group.webp'); if (kind === 'airline') return require('../../assets/airline/headquarters.webp'); if (kind === 'hotel') return require('../../assets/hotel/headquarters.webp'); if (kind === 'blockchain') return require('../../assets/blockchain/headquarters.webp'); if (kind === 'space') return require('../../assets/space/headquarters.webp'); if (kind === 'holding') return require('../../assets/holding/headquarters.webp'); return require('../../assets/holding/headquarters.webp'); }

function AnimatedWealthCard({ cash, netWorth, pulse }: { cash: number; netWorth: number; pulse: RNAnimated.Value }) { const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }); return <RNAnimated.View style={{ transform: [{ scale }] }}><WealthCard cash={cash} netWorth={netWorth} /></RNAnimated.View>; }
function StatChip({ label, value, accent }: { label: string; value: string; accent: string }) { return <View style={styles.statChip}><Text style={[styles.statLabel, { color: accent }]}>{label}</Text><Text style={styles.statValue} numberOfLines={1}>{value}</Text></View>; }
function DecorativeMoney() { return <View pointerEvents="none" style={StyleSheet.absoluteFill}><View style={styles.moneyOne}><Text style={styles.moneyText}>$</Text></View><View style={styles.moneyTwo}><Text style={styles.moneyText}>$</Text></View><View style={styles.moneyThree}><Text style={styles.moneyText}>$</Text></View><Svg width="100%" height="100%" style={StyleSheet.absoluteFill}><Line x1="12%" y1="26%" x2="35%" y2="7%" stroke="#2A6E4A" strokeWidth="1" /><Line x1="66%" y1="3%" x2="88%" y2="30%" stroke="#2A6E4A" strokeWidth="1" /><Path d="M 0 82 Q 100 55 200 82 T 400 82" fill="none" stroke="#1E5338" strokeWidth="1" opacity="0.7" /><Circle cx="92%" cy="64%" r="2" fill={C.gold} /><Circle cx="18%" cy="70%" r="2" fill={C.lime} /></Svg></View>; }
function FloatingBadge({ amount, lane, onDone }: { amount: number; lane: number; onDone: () => void }) { const translateY = useRef(new RNAnimated.Value(0)).current; const translateX = useRef(new RNAnimated.Value((lane - 1) * 38)).current; const opacity = useRef(new RNAnimated.Value(1)).current; useEffect(() => { RNAnimated.parallel([RNAnimated.timing(translateY, { toValue: -92, duration: 820, useNativeDriver: true }), RNAnimated.timing(translateX, { toValue: (lane - 1) * 62, duration: 820, useNativeDriver: true }), RNAnimated.timing(opacity, { toValue: 0, duration: 820, useNativeDriver: true })]).start(({ finished }) => { if (finished) onDone(); }); }, [lane, onDone, opacity, translateX, translateY]); return <RNAnimated.Text style={[styles.floatingBadge, { opacity, transform: [{ translateY }, { translateX }] }]}>+{formatCurrency(amount)}</RNAnimated.Text>; }

const styles = StyleSheet.create({
  scroll: { flex: 1, minHeight: 0, backgroundColor: C.bg }, root: { flexGrow: 1, backgroundColor: C.bg, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 126, gap: 11 }, hero: { minHeight: 196, overflow: 'hidden', borderRadius: 24, padding: 17, backgroundColor: designSystem.colors.highlight, borderWidth: 1, borderColor: designSystem.colors.border, shadowColor: C.emerald, shadowOpacity: 0.16, shadowRadius: 16, elevation: 5 }, epsCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: designSystem.colors.highlight, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: designSystem.colors.border }, epsIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' }, epsIconText: { color: C.ink, fontSize: 19, fontWeight: '900' }, epsCopy: { flex: 1 }, epsValue: { color: C.green, fontSize: 16, fontWeight: '900', marginTop: 3 }, epsSub: { color: C.muted, fontSize: 9, marginTop: 3 }, epsArrow: { color: C.lime, fontSize: 29, fontWeight: '200' }, heroTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, kicker: { color: C.text, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, opacity: 0.9 }, heroTitle: { color: C.text, fontSize: 28, lineHeight: 29, fontWeight: '900', letterSpacing: 0.5, marginTop: 8 }, heroCopy: { color: designSystem.colors.textSecondary, fontSize: 11, lineHeight: 16, fontWeight: '700', maxWidth: 280, marginTop: 10 }, heroLevel: { alignItems: 'center', backgroundColor: designSystem.colors.highlight, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: designSystem.colors.primaryBlue }, heroLevelLabel: { color: C.green, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, heroLevelValue: { color: C.text, fontSize: 22, fontWeight: '900', marginTop: 1 }, miniTrack: { width: 42, height: 4, backgroundColor: designSystem.colors.surfaceDark, borderRadius: 4, overflow: 'hidden', marginTop: 4 }, miniFill: { height: '100%', backgroundColor: C.lime, borderRadius: 4 }, heroStats: { flexDirection: 'row', gap: 7, marginTop: 16 }, statChip: { flex: 1, minWidth: 0, backgroundColor: designSystem.colors.surfaceLight, borderRadius: 11, paddingHorizontal: 8, paddingVertical: 8, borderWidth: 1, borderColor: designSystem.colors.border }, statLabel: { fontSize: 7, fontWeight: '900', letterSpacing: 0.8 }, statValue: { color: C.text, fontSize: 11, fontWeight: '900', marginTop: 3 }, boost: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: designSystem.colors.highlight, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: designSystem.colors.border },tapBoostCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: designSystem.colors.highlight, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: designSystem.colors.border, marginTop: 8 }, tapBoostActive: { backgroundColor: designSystem.colors.highlight, borderColor: C.lime }, tapBoostIcon: { width: 38, height: 35, borderRadius: 12, backgroundColor: C.cyan, justifyContent: 'center', alignItems: 'center' }, tapBoostIconText: { color: C.ink, fontSize: 11, fontWeight: '900' },  boostIcon: { width: 35, height: 35, borderRadius: 12, backgroundColor: C.gold, justifyContent: 'center', alignItems: 'center' }, boostIconText: { color: C.ink, fontSize: 15, fontWeight: '900' }, boostCopy: { flex: 1 }, boostTitle: { color: C.text, fontSize: 11, fontWeight: '900' }, boostSub: { color: C.muted, fontSize: 9, lineHeight: 13, marginTop: 3 }, boostAction: { color: C.lime, fontSize: 9, fontWeight: '900' }, goal: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: designSystem.colors.highlight, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: designSystem.colors.border }, goalIcon: { width: 37, height: 37, borderRadius: 13, backgroundColor: designSystem.colors.highlight, justifyContent: 'center', alignItems: 'center' }, goalIconText: { color: C.cyan, fontSize: 25, fontWeight: '300' }, goalCopy: { flex: 1 }, sectionKicker: { color: C.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, goalTitle: { color: C.text, fontSize: 13, lineHeight: 17, fontWeight: '900', marginTop: 3 }, goalSub: { color: C.muted, fontSize: 9, marginTop: 3 }, goalArrow: { color: C.cyan, fontSize: 30, fontWeight: '200' }, controlPanel: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 15, borderWidth: 1, borderColor: designSystem.colors.border }, panelHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, panelTitle: { color: C.text, fontSize: 19, fontWeight: '900', marginTop: 4 }, livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: designSystem.colors.primaryNavy, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10 }, liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime }, liveText: { color: C.lime, fontSize: 8, fontWeight: '900' }, tapCaption: { color: C.muted, fontSize: 10, marginTop: 8 }, tapCaptionStrong: { color: C.lime, fontWeight: '900' }, tapStage: { height: 158, alignItems: 'center', justifyContent: 'center', position: 'relative' }, orbit: { position: 'absolute', borderRadius: 999, borderWidth: 1 }, orbitOuter: { width: 146, height: 146, borderColor: designSystem.colors.border }, orbitInner: { width: 120, height: 120, borderColor: '#C8E5D2', borderStyle: 'dashed' }, tapGlow: { position: 'absolute', width: 116, height: 116, borderRadius: 58, backgroundColor: designSystem.colors.primaryBlue, shadowColor: C.emerald, shadowOpacity: 0.55, shadowRadius: 28, elevation: 12 }, tapButton: { width: 104, height: 104, borderRadius: 52, backgroundColor: C.emerald, alignItems: 'center', justifyContent: 'center', borderWidth: 7, borderColor: designSystem.colors.highlight, shadowColor: C.emerald, shadowOpacity: 0.55, shadowRadius: 22, elevation: 14 }, tapPressed: { transform: [{ scale: 0.95 }] }, tapSymbol: { color: C.ink, fontSize: 24, lineHeight: 25, fontWeight: '900' }, tapAmount: { color: C.ink, fontSize: 13, fontWeight: '900', marginTop: 1 }, tapLabel: { color: designSystem.colors.primaryNavy, fontSize: 8, fontWeight: '900', letterSpacing: 1.4, marginTop: 5 }, floatingBadge: { position: 'absolute', top: 50, color: C.lime, fontSize: 19, fontWeight: '900', zIndex: 3, textShadowColor: '#062B1A', textShadowRadius: 4 }, budgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, budgetLabel: { color: C.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, budgetValue: { color: C.cyan, fontSize: 10, fontWeight: '900' }, budgetTrack: { height: 6, backgroundColor: designSystem.colors.border, borderRadius: 6, overflow: 'hidden', marginTop: 8 }, budgetFill: { height: '100%', backgroundColor: C.lime, borderRadius: 6 }, momentumHint: { color: C.muted, fontSize: 8, marginTop: 7 }, upgradeCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 17, padding: 12, borderWidth: 1, borderColor: designSystem.colors.border }, upgradeIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: designSystem.colors.primaryNavy, justifyContent: 'center', alignItems: 'center' }, upgradeIconText: { color: C.lime, fontSize: 24, fontWeight: '900' }, upgradeCopy: { flex: 1 }, upgradeTitle: { color: C.text, fontSize: 12, fontWeight: '900', marginTop: 3 }, upgradeSub: { color: C.muted, fontSize: 9, marginTop: 3 }, upgradeButton: { minWidth: 70, backgroundColor: C.gold, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 8, alignItems: 'center' }, upgradeCost: { color: C.ink, fontSize: 12, fontWeight: '900' }, upgradeLabel: { color: '#4A3500', fontSize: 7, fontWeight: '900', marginTop: 2 }, missionCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EFF8FB', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#A8D5DD' }, missionBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: designSystem.colors.highlight, alignItems: 'center', justifyContent: 'center' }, missionBadgeText: { color: C.gold, fontSize: 20, fontWeight: '900' }, missionCopy: { flex: 1 }, missionTitle: { color: C.text, fontSize: 11, fontWeight: '900', marginTop: 3 }, missionSub: { color: C.muted, fontSize: 9, marginTop: 3 }, claimButton: { backgroundColor: C.lime, borderRadius: 9, paddingVertical: 9, paddingHorizontal: 9 }, claimText: { color: C.ink, fontSize: 8, fontWeight: '900' }, identityCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: designSystem.colors.surfaceLight, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: designSystem.colors.border }, identityMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: designSystem.colors.highlight, borderWidth: 1, borderColor: C.cyan, alignItems: 'center', justifyContent: 'center' }, identityMarkText: { color: C.cyan, fontSize: 20, fontWeight: '900' }, identityCopy: { flex: 1 }, identityTitle: { color: C.text, fontSize: 13, fontWeight: '900', marginTop: 3 }, identitySub: { color: C.muted, fontSize: 9, marginTop: 3 }, identityStreak: { alignItems: 'center' }, identityStreakValue: { color: C.lime, fontSize: 20, fontWeight: '900' }, identityStreakLabel: { color: C.muted, fontSize: 7, fontWeight: '900', marginTop: 2 }, eventCard: { backgroundColor: '#F3EEFF', borderRadius: 16, padding: 13, borderWidth: 1, borderColor: '#C3B0E9' }, eventTitle: { color: C.text, fontSize: 13, lineHeight: 17, fontWeight: '900', marginTop: 5 }, eventSub: { color: '#6B5D86', fontSize: 9, marginTop: 4 }, prestigeButton: { alignSelf: 'flex-start', backgroundColor: '#CC8EFF', borderRadius: 9, paddingVertical: 8, paddingHorizontal: 10, marginTop: 10 }, prestigeText: { color: '#21132F', fontSize: 8, fontWeight: '900' }, linkRow: { flexDirection: 'row', gap: 10 }, linkCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 15, padding: 12, borderWidth: 1, borderColor: designSystem.colors.border }, linkIcon: { color: C.gold, fontSize: 20 }, linkTitle: { color: C.text, fontSize: 10, fontWeight: '900', marginTop: 7 }, linkSub: { color: C.muted, fontSize: 8, marginTop: 3 }, shareCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: designSystem.colors.highlight, borderRadius: 15, padding: 13, borderWidth: 1, borderColor: designSystem.colors.border }, shareTitle: { color: C.text, fontSize: 16, fontWeight: '900', marginTop: 4 }, shareAction: { color: C.lime, fontSize: 10, fontWeight: '900' }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] }, disabled: { opacity: 0.45 }, moneyOne: { position: 'absolute', top: 19, right: 88, transform: [{ rotate: '18deg' }] }, moneyTwo: { position: 'absolute', bottom: 26, left: 22, transform: [{ rotate: '-24deg' }] }, moneyThree: { position: 'absolute', top: 88, left: 180, transform: [{ rotate: '10deg' }] }, moneyText: { color: designSystem.colors.primaryBlue, fontSize: 36, fontWeight: '900', opacity: 0.65 }, dashboardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 5, minWidth: 0 }, dashboardGreeting: { flex: 1, minWidth: 0, paddingRight: 8 }, dashboardKicker: { color: '#55708F', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 }, dashboardTitle: { color: '#102544', fontSize: 20, lineHeight: 24, fontWeight: '900', marginTop: 3 }, dashboardProfile: { width: '40%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', gap: 6, paddingLeft: 6 }, dashboardAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#D7A52A' }, dashboardProfileName: { color: '#1D3C67', fontSize: 9, lineHeight: 12, fontWeight: '900', flexShrink: 1, textAlign: 'right' }, dashboardChevron: { color: '#147BEA', fontSize: 17 }, hqHero: { height: 202, borderRadius: 22, overflow: 'hidden', position: 'relative', backgroundColor: '#17355B', shadowColor: '#17355B', shadowOpacity: 0.18, shadowRadius: 12, elevation: 4 }, hqImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%', resizeMode: 'cover' }, hqShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8, 31, 61, 0.43)' }, hqOverlay: { flex: 1, padding: 16, justifyContent: 'space-between' }, hqKicker: { color: '#BBD9FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 }, hqTitle: { color: '#FFF', fontSize: 25, lineHeight: 29, fontWeight: '900', marginTop: 42, maxWidth: '84%' }, hqSub: { color: '#E5F1FF', fontSize: 11, lineHeight: 16, maxWidth: '78%', marginTop: 4 }, hqBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 0 }, hqValueBlock: { flex: 1, minWidth: 0, paddingRight: 8 }, hqValueLabel: { color: '#BBD9FF', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, hqValue: { color: '#FFF', fontSize: 23, fontWeight: '900', marginTop: 3 }, growthPill: { maxWidth: '46%', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'flex-end' }, growthValue: { color: '#147BEA', fontSize: 11, fontWeight: '900' }, growthLabel: { color: '#60758F', fontSize: 7, fontWeight: '900', marginTop: 2 }, statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }, dashboardStat: { width: '48%', minHeight: 76, backgroundColor: '#FFF', borderRadius: 15, padding: 10, borderWidth: 1, borderColor: '#DDE8F2', shadowColor: '#7890A8', shadowOpacity: 0.07, shadowRadius: 7, elevation: 2 }, dashboardStatIcon: { width: 27, height: 27, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, dashboardStatIconText: { fontSize: 15, fontWeight: '900' }, dashboardStatLabel: { color: '#71839A', fontSize: 7, fontWeight: '900', letterSpacing: 0.8, marginTop: 5 }, dashboardStatValue: { color: '#102544', fontSize: 15, fontWeight: '900', marginTop: 2 }, dashboardCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#DDE8F2', shadowColor: '#7890A8', shadowOpacity: 0.07, shadowRadius: 7, elevation: 2 }, cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, cardKicker: { color: '#55708F', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, cardTitle: { color: '#102544', fontSize: 17, fontWeight: '900', marginTop: 3 }, cardMeta: { color: '#147BEA', fontSize: 8, fontWeight: '900', backgroundColor: '#EAF4FF', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 }, chartEmpty: { height: 92, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, chartEmptyTitle: { color: '#345272', fontSize: 12, fontWeight: '900', textAlign: 'center' }, chartEmptyCopy: { color: '#8090A1', fontSize: 9, textAlign: 'center', marginTop: 5 }, chartFooter: { flexDirection: 'row', alignItems: 'baseline', gap: 8, borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 8 }, chartLabel: { color: '#71839A', fontSize: 7, fontWeight: '900' }, chartValue: { color: '#102544', fontSize: 14, fontWeight: '900' }, chartHint: { color: '#8090A1', fontSize: 8, marginLeft: 'auto' }, goalStrip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EFF7FF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#CBE2FA' }, goalStripIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: '#147BEA', color: '#FFF', textAlign: 'center', textAlignVertical: 'center', fontSize: 17, fontWeight: '900' }, goalStripCopy: { flex: 1, minWidth: 0 }, goalStripTitle: { color: '#102544', fontSize: 12, fontWeight: '900', marginTop: 3 }, goalStripSub: { color: '#657A92', fontSize: 9, marginTop: 3 }, goalStripButton: { backgroundColor: '#147BEA', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 8 }, goalStripButtonText: { color: '#FFF', fontSize: 8, fontWeight: '900' }, storeBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#102544', borderRadius: 17, padding: 15, overflow: 'hidden' }, storeKicker: { color: '#D9A528', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }, storeTitle: { color: '#FFF', fontSize: 17, fontWeight: '900', marginTop: 4 }, storeSub: { color: '#BBD0E7', fontSize: 9, marginTop: 3 }, storeAction: { alignItems: 'center', backgroundColor: '#D9A528', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 8 }, storeActionText: { color: '#102544', fontSize: 7, fontWeight: '900' }, storeArrow: { color: '#102544', fontSize: 17, lineHeight: 17 }, sectionHeadingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 0 }, sectionHeadingCopy: { flex: 1, minWidth: 0, paddingRight: 8 }, seeAll: { color: '#147BEA', fontSize: 9, fontWeight: '900' }, companyRail: { gap: 10, paddingRight: 12 }, companyCard: { width: 248, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#DDE8F2', shadowColor: '#7890A8', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }, companyImage: { width: '100%', height: 96, resizeMode: 'cover' }, companyCardBody: { padding: 11, minHeight: 132 }, companyCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 }, companyName: { color: '#102544', fontSize: 12, lineHeight: 16, fontWeight: '900', flex: 1, minWidth: 0, paddingRight: 5 }, companyStatus: { color: '#147BEA', fontSize: 7, fontWeight: '900', flexShrink: 0 }, companySector: { color: '#71839A', fontSize: 8, marginTop: 4 }, companyIncome: { color: '#198754', fontSize: 16, fontWeight: '900', marginTop: 7 }, companyIncomeUnit: { color: '#71839A', fontSize: 9, fontWeight: '700' }, companyHint: { color: '#71839A', fontSize: 8, marginTop: 4 }, newCompanyCard: { width: 170, minHeight: 176, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: '#AFC7DE', backgroundColor: '#F8FBFF', alignItems: 'center', justifyContent: 'center', padding: 12 }, newCompanyPlus: { color: '#147BEA', fontSize: 28, fontWeight: '300' }, newCompanyTitle: { color: '#102544', fontSize: 11, fontWeight: '900', textAlign: 'center', marginTop: 6 }, newCompanySub: { color: '#71839A', fontSize: 8, textAlign: 'center', marginTop: 4 }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }, quickAction: { width: '31.5%', minHeight: 68, backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#DDE8F2', alignItems: 'center', justifyContent: 'center', padding: 8 }, quickIcon: { color: '#147BEA', fontSize: 20, fontWeight: '800' }, quickLabel: { color: '#233B5C', fontSize: 9, fontWeight: '900', marginTop: 6 }, activityCard: { backgroundColor: '#F8FBFF', borderRadius: 17, borderWidth: 1, borderColor: '#DDE8F2', padding: 14 }, activityBadge: { color: '#198754', backgroundColor: '#E7F7EF', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4, fontSize: 7, fontWeight: '900' }, activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 13 }, activityDot: { color: '#147BEA', fontSize: 11 }, activityDotGold: { color: '#D29B20', fontSize: 11 }, activityCopy: { color: '#4F6681', fontSize: 10, lineHeight: 15, flex: 1 },
});


const gameStyles = StyleSheet.create({
  root: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 104, gap: 7 },
  dashboardHeader: { alignItems: 'center', paddingVertical: 0, minHeight: 34 },
  dashboardKicker: { fontSize: 7, letterSpacing: 1.1 },
  dashboardTitle: { fontSize: 15, lineHeight: 18, marginTop: 1 },
  dashboardProfile: { width: '34%', alignItems: 'center', gap: 5, paddingLeft: 4 },
  dashboardAvatar: { width: 27, height: 27, borderWidth: 1.5 },
  dashboardProfileName: { fontSize: 8, lineHeight: 10 },
  hqHero: { height: 126, borderRadius: 16, elevation: 2, shadowOpacity: 0.12 },
  hqOverlay: { padding: 11 },
  hqKicker: { fontSize: 7, letterSpacing: 1.1 },
  hqTitle: { fontSize: 19, lineHeight: 22, marginTop: 5, maxWidth: '92%' },
  hqSub: { fontSize: 9, lineHeight: 12, maxWidth: '88%', marginTop: 1 },
  hqValueLabel: { fontSize: 7 },
  hqValue: { fontSize: 17, marginTop: 1 },
  growthPill: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9 },
  growthValue: { fontSize: 9 },
  growthLabel: { fontSize: 6, marginTop: 1 },
  statGrid: { flexWrap: 'nowrap', columnGap: 4, rowGap: 0 },
  dashboardStat: { width: '24%', minHeight: 58, padding: 6, borderRadius: 11, backgroundColor: '#142842', borderColor: '#2B4564', shadowOpacity: 0, elevation: 0 },
  dashboardStatIcon: { width: 18, height: 18, borderRadius: 6 },
  dashboardStatIconText: { fontSize: 10 },
  dashboardStatLabel: { color: '#B4C4D7', fontSize: 6, letterSpacing: 0.35, marginTop: 3 },
  dashboardStatValue: { color: '#FFFFFF', fontSize: 10, marginTop: 1 },
  controlPanel: { backgroundColor: '#10233D', borderColor: '#2A4668', borderRadius: 18, padding: 10, shadowColor: '#0A1728', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  sectionKicker: { color: '#7EC9E3' },
  cardKicker: { color: '#55708F' },
  cardTitle: { color: '#102544' },
  cardMeta: { color: '#147BEA', backgroundColor: '#EAF4FF' },
  panelTitle: { color: '#FFFFFF', fontSize: 15, marginTop: 2 },
  livePill: { backgroundColor: '#233B58', paddingHorizontal: 7, paddingVertical: 4 },
  liveDot: { backgroundColor: '#65E0AE' },
  liveText: { color: '#9BF0C8', fontSize: 7 },
  tapCaption: { color: '#B9C9DC', fontSize: 9, marginTop: 4 },
  tapCaptionStrong: { color: '#FFD45A' },
  tapStage: { height: 94 },
  orbitOuter: { width: 96, height: 96, borderColor: '#385471' },
  orbitInner: { width: 82, height: 82, borderColor: '#4D6B86' },
  tapGlow: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#F3BC36', shadowColor: '#F3BC36', shadowOpacity: 0.42, shadowRadius: 14, elevation: 8 },
  tapButton: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#F3BC36', borderWidth: 4, borderColor: '#FFE69B', shadowColor: '#F3BC36', shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  tapSymbol: { color: '#142238', fontSize: 19, lineHeight: 20 },
  tapAmount: { color: '#142238', fontSize: 10 },
  tapLabel: { color: '#142238', fontSize: 6, letterSpacing: 0.8, marginTop: 3 },
  floatingBadge: { top: 27, fontSize: 14, color: '#FFD45A' },
  budgetRow: { marginTop: 0 },
  budgetLabel: { color: '#B7C7DA', fontSize: 7, letterSpacing: 0.6 },
  budgetValue: { color: '#FFD45A', fontSize: 8 },
  budgetTrack: { height: 4, backgroundColor: '#314964', marginTop: 5 },
  budgetFill: { backgroundColor: '#FFD45A' },
  upgradeCard: { padding: 9, borderRadius: 13, backgroundColor: '#172D49', borderColor: '#2A4668' },
  upgradeIcon: { width: 31, height: 31, borderRadius: 9, backgroundColor: '#243E5C' },
  upgradeTitle: { color: '#FFFFFF', fontSize: 10, marginTop: 2 },
  upgradeSub: { color: '#AFC0D3', fontSize: 8, marginTop: 2 },
  upgradeButton: { minWidth: 60, borderRadius: 9, paddingVertical: 7, paddingHorizontal: 6 },
  upgradeCost: { fontSize: 10 },
  upgradeLabel: { fontSize: 6, marginTop: 1 },
  missionCard: { padding: 9, borderRadius: 13, backgroundColor: '#18374A', borderColor: '#2A6570' },
  missionBadge: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#224B59' },
  missionBadgeText: { fontSize: 17, color: '#FFD45A' },
  missionTitle: { color: '#FFFFFF', fontSize: 10, marginTop: 2 },
  missionSub: { color: '#B4C8D2', fontSize: 8, marginTop: 2 },
  claimButton: { backgroundColor: '#65D5AD', paddingVertical: 7, paddingHorizontal: 8 },
  claimText: { color: '#10233D', fontSize: 7 },
  dashboardCard: { padding: 10, borderRadius: 14 },
  chartEmpty: { height: 32, paddingHorizontal: 4 },
  chartEmptyTitle: { fontSize: 9 },
  chartFooter: { paddingTop: 6, gap: 5 },
  chartLabel: { fontSize: 6 },
  chartValue: { fontSize: 12 },
  chartHint: { fontSize: 7 },
  goalStrip: { padding: 9, borderRadius: 12 },
  goalStripIcon: { width: 28, height: 28, borderRadius: 9, fontSize: 14 },
  goalStripTitle: { fontSize: 10, marginTop: 2 },
  goalStripSub: { fontSize: 8, marginTop: 2 },
  goalStripButton: { paddingHorizontal: 8, paddingVertical: 7 },
  sectionHeadingRow: { alignItems: 'center' },
  sectionTitle: { fontSize: 14, marginTop: 2 },
  companyRail: { gap: 8 },
  companyCard: { width: 190, borderRadius: 13 },
  companyImage: { height: 68 },
  companyCardBody: { padding: 8, minHeight: 96 },
  companyName: { fontSize: 10, lineHeight: 13 },
  companyIncome: { fontSize: 13, marginTop: 5 },
  newCompanyCard: { width: 142, minHeight: 116, borderRadius: 13, padding: 8 },
  newCompanyPlus: { fontSize: 23 },
  newCompanyTitle: { fontSize: 9, marginTop: 3 },
  newCompanySub: { fontSize: 7, marginTop: 2 },
  quickPanel: { gap: 7 },
  quickGrid: { rowGap: 6 },
  quickAction: { minHeight: 49, borderRadius: 11, padding: 6 },
  quickIcon: { fontSize: 16 },
  quickLabel: { fontSize: 8, marginTop: 3 },
  storeBanner: { padding: 10, borderRadius: 13 },
  storeTitle: { fontSize: 13, marginTop: 3 },
  boostRow: { flexDirection: 'row', gap: 7 },
  boostCompact: { flex: 1, minWidth: 0, minHeight: 52, padding: 8, gap: 6, borderRadius: 12, marginTop: 0, backgroundColor: '#E7EFFC', borderColor: '#C8D9F0' },
  boostIcon: { width: 27, height: 27, borderRadius: 8 },
  boostTitle: { fontSize: 7 },
  boostSub: { fontSize: 7, lineHeight: 10, marginTop: 1 },
  boostAction: { fontSize: 7 },
  shareCard: { padding: 10, borderRadius: 12 },
  shareTitle: { fontSize: 13, marginTop: 2 },
  companyCardTop: { gap: 4 },
});
