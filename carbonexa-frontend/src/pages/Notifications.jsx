import { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';

function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'High Dust Emission Alert', desc: 'Active mine sector 4 reported elevated particulate levels.', time: '10 mins ago', read: false },
    { id: 2, type: 'success', title: 'Monthly Report Generated', desc: 'CMPDI / CIL analytics report successfully compiled.', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'System Update Completed', desc: 'Carbonexa backend synchronized to v2.4.1.', time: '5 hours ago', read: false },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Notifications Center</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>Manage your active mine alerts and system updates.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div style={{ background: '#fff', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#64748b' }}>
            <Bell size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p>You have no new notifications.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                background: n.read ? '#fff' : '#f0f9ff',
                border: '1px solid',
                borderColor: n.read ? '#e2e8f0' : '#bae6fd',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {n.type === 'alert' && <AlertTriangle size={20} color="#f59e0b" />}
                {n.type === 'success' && <CheckCircle size={20} color="#10b981" />}
                {n.type === 'info' && <Info size={20} color="#0284c7" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{n.title}</h4>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{n.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{n.desc}</p>
              </div>

              <button 
                onClick={() => deleteNotification(n.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                title="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;