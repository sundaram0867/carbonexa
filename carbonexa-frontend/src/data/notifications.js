export const notificationsStorageKey = 'carbonexa-notifications';
export const notificationsUpdatedEvent = 'carbonexa-notifications-updated';

export const defaultNotifications = [
  { id: 1, type: 'alert', title: 'High Dust Emission Alert', desc: 'Active mine sector 4 reported elevated particulate levels.', time: '10 mins ago', read: false },
  { id: 2, type: 'success', title: 'Monthly Report Generated', desc: 'The mining analytics report was successfully compiled.', time: '1 hour ago', read: false },
  { id: 3, type: 'info', title: 'System Update Completed', desc: 'Carbonexa workspace data was synchronized.', time: '5 hours ago', read: false },
];

export function loadNotifications() {
  try {
    const savedNotifications = localStorage.getItem(notificationsStorageKey);
    if (!savedNotifications) return { notifications: defaultNotifications, error: '' };

    const parsedNotifications = JSON.parse(savedNotifications);
    const validNotifications = Array.isArray(parsedNotifications)
      && parsedNotifications.every((notification) => (
        (typeof notification.id === 'number' || typeof notification.id === 'string')
        && ['alert', 'success', 'info'].includes(notification.type)
        && typeof notification.title === 'string'
        && typeof notification.desc === 'string'
        && typeof notification.time === 'string'
        && typeof notification.read === 'boolean'
      ));

    if (!validNotifications) throw new Error('Saved notification data is invalid.');
    return { notifications: parsedNotifications, error: '' };
  } catch {
    return {
      notifications: defaultNotifications,
      error: 'Saved notification data could not be loaded. Showing sample notifications.'
    };
  }
}

export function saveNotifications(notifications) {
  localStorage.setItem(notificationsStorageKey, JSON.stringify(notifications));
  window.dispatchEvent(new Event(notificationsUpdatedEvent));
}
