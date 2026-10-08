import * as Notifications from 'expo-notifications';
import { BankState } from '../types/bank';

async function ensurePermission(): Promise<boolean> {
  const permissions = await Notifications.getPermissionsAsync();
  const granted = permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function syncFounderReminder(enabled: boolean): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;
  const permissions = await Notifications.getPermissionsAsync();
  const granted = permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync();
    if (!requested.granted && requested.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) return;
  }
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Empire Rush is waiting', body: 'Check your businesses, collect cashflow, and make your next smart move.', sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 18, minute: 0 },
  });
}

export async function syncBankNotifications(enabled: boolean, state: BankState, now: number): Promise<void> {
  if (!enabled || !(await ensurePermission())) return;
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const bankScheduled = existing.filter(item => String(item.content.data?.source || '').startsWith('bank'));
  await Promise.all(bankScheduled.map(item => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  const messages: Array<{ title: string; body: string }> = [];
  const nextMaturity = state.deposits.filter(item => item.status === 'ACTIVE').sort((a, b) => a.maturesAt - b.maturesAt)[0];
  if (nextMaturity) messages.push({ title: 'CD maturity approaching', body: `${nextMaturity.name} matures in the simulated Bank calendar.` });
  const offer = state.offers.find(item => Number(item.expiresAt) > now);
  if (offer) messages.push({ title: 'Investor offer expires soon', body: `${offer.title} is available before the next settlement.` });
  const loan = state.loans.filter(item => item.status === 'ACTIVE').sort((a, b) => a.nextDueAt - b.nextDueAt)[0];
  if (loan) messages.push({ title: 'EMI due soon', body: `${loan.name} payment is due in the simulated Bank calendar.` });
  for (const message of messages.slice(0, 3)) await Notifications.scheduleNotificationAsync({ content: { ...message, sound: 'default', data: { source: 'bank-phase2' } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 7200, repeats: false } });
}
