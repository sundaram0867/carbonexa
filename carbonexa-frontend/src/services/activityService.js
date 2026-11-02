export const recentActivityUpdatedEvent = 'carbonexa-recent-activity-updated';
const recentActivityStorageKey = 'carbonexa-recent-activity';
const maxRecentActivity = 12;

export function loadRecentActivity() {
  try {
    const stored = localStorage.getItem(recentActivityStorageKey);
    if (!stored) return { items: [], error: '' };
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every((item) => (
      item
      && typeof item.id === 'string'
      && typeof item.type === 'string'
      && typeof item.title === 'string'
      && typeof item.path === 'string'
      && typeof item.viewedAt === 'string'
    ))) {
      throw new Error('Recent activity data has an invalid format.');
    }
    return { items: parsed.slice(0, maxRecentActivity), error: '' };
  } catch {
    return { items: [], error: 'Recent activity could not be loaded from this browser.' };
  }
}

export function recordRecentActivity({ id, type, title, path }) {
  if (!id || !type || !title || !path) return;
  const { items, error } = loadRecentActivity();
  if (error) throw new Error(error);
  const activityId = String(id);
  const activity = {
    id: activityId,
    type,
    title,
    path,
    viewedAt: new Date().toISOString(),
  };
  const nextItems = [activity, ...items.filter((item) => !(item.type === type && item.id === activityId))]
    .slice(0, maxRecentActivity);
  localStorage.setItem(recentActivityStorageKey, JSON.stringify(nextItems));
  window.dispatchEvent(new Event(recentActivityUpdatedEvent));
}
