import { useEffect, useState } from 'react';
import { notificationsService } from '../services/notifications';

export default function Notifications() {
  const [rows, setRows] = useState<any[]>([]);

  const load = () => notificationsService.getAll().then(setRows);
  useEffect(() => {
  load();
}, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    load();
  };

  const getIconForType = (type: string) => {
    const icons: Record<string, string> = {
      'STOCK_CRITICAL': '⚠️',
      'NEW_REQUEST': '📋',
      'REQUEST_APPROVED': '✅',
      'REQUEST_REJECTED': '❌',
      'TRANSFER_RECEIVED': '📦',
      'INVENTORY_COMPLETED': '📊',
      'ANOMALY': '🔔'
    };
    return icons[type] || '🔔';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Notifications</h2>
        <span className="badge bg-primary">{rows.filter((r: any) => r.status === 'UNREAD').length} Unread</span>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className={r.status === 'UNREAD' ? 'table-light' : ''}>
                  <td style={{ fontSize: '1.5rem' }}>{getIconForType(r.type)}</td>
                  <td className="fw-bold">{r.title}</td>
                  <td>{r.message}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>
                    <span className={`badge bg-${r.status === 'UNREAD' ? 'primary' : 'secondary'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'UNREAD' && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleMarkAsRead(r.id)}>
                        Mark as Read
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">No notifications</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
