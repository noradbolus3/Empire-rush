import * as Notifications from 'expo-notifications';

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
