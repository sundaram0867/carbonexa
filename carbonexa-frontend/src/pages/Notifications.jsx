import { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, Check, MailOpen } from 'lucide-react';
import { loadNotifications, saveNotifications } from '../data/notifications';

function Notifications() {
  const [initialState] = useState(loadNotifications);
  const [notifications, setNotifications] = useState(initialState.notifications);
  const [filter, setFilter] = useState('all');
  const [storageError, setStorageError] = useState(initialState.error);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const visibleNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'alerts') return notification.type === 'alert';
    return true;
  });

  const updateNotifications = (nextNotifications) => {
    try {
      saveNotifications(nextNotifications);
      setNotifications(nextNotifications);
      setStorageError('');
    } catch {
      setStorageError('Your changes could not be saved in this browser. Check available storage and try again.');
    }
  };

  const markAllAsRead = () => {
    updateNotifications(notifications.map((notification) => ({ ...notification, read: true })));
  };

  const deleteNotification = (id) => {
    updateNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const toggleRead = (id) => {
    updateNotifications(notifications.map((notification) => (
      notification.id === id ? { ...notification, read: !notification.read } : notification
    )));
  };

  const clearRead = () => {
    updateNotifications(notifications.filter((notification) => !notification.read));
  };

  return (
    <div className="workspace-page notifications-page">
      <header className="notifications-header">
        <div className="notifications-heading">
          <h2>Notifications Center</h2>
          <p>Manage your mine alerts and workspace updates. Your changes are saved in this browser.</p>
        </div>
        <div className="notifications-actions">
          <button type="button" onClick={clearRead} disabled={!notifications.some((notification) => notification.read)}>
            <Trash2 size={15} aria-hidden="true" />
            Clear read
          </button>
          <button type="button" className="workspace-primary-action" onClick={markAllAsRead} disabled={!unreadCount}>
            <Check size={15} aria-hidden="true" />
            Mark all as read
          </button>
        </div>
      </header>

      {storageError && <p className="notifications-storage-error" role="status">{storageError}</p>}

      <div className="notifications-summary">
        <div className="notifications-unread-count" aria-live="polite">
          <span>{unreadCount}</span>
          <div><strong>Unread</strong><small>{unreadCount === 1 ? 'notification needs' : 'notifications need'} your attention</small></div>
        </div>
        <div className="notifications-filter" role="group" aria-label="Filter notifications">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'alerts', label: `Alerts (${notifications.filter((notification) => notification.type === 'alert').length})` },
          ].map((option) => (
            <button
              type="button"
              key={option.id}
              className={filter === option.id ? 'active' : ''}
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="notifications-list">
        {visibleNotifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={30} aria-hidden="true" />
            <strong>{notifications.length === 0 ? 'You’re all caught up' : 'No notifications in this view'}</strong>
            <p>{notifications.length === 0 ? 'New alerts and updates will appear here.' : 'Try a different filter to see more notifications.'}</p>
          </div>
        ) : (
          visibleNotifications.map((notification) => (
            <article key={notification.id} className={`notification-card${notification.read ? ' is-read' : ''}`}>
              <div className={`notification-type-icon ${notification.type}`} aria-hidden="true">
                {notification.type === 'alert' && <AlertTriangle size={19} />}
                {notification.type === 'success' && <CheckCircle size={19} />}
                {notification.type === 'info' && <Info size={19} />}
              </div>
              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{notification.title}</h3>
                  {!notification.read && <span className="notification-unread-label">New</span>}
                </div>
                <p>{notification.desc}</p>
                <time>{notification.time}</time>
              </div>
              <div className="notification-card-actions">
                <button type="button" onClick={() => toggleRead(notification.id)} aria-label={notification.read ? 'Mark as unread' : 'Mark as read'} title={notification.read ? 'Mark as unread' : 'Mark as read'}>
                  {notification.read ? <MailOpen size={16} /> : <Check size={16} />}
                </button>
                <button type="button" onClick={() => deleteNotification(notification.id)} aria-label="Delete notification" title="Delete notification">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;