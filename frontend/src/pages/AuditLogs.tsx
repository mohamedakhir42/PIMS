import { useEffect, useState } from 'react';
import { auditService } from '../services/audit';

export default function AuditLogs() {
  const [rows, setRows] = useState<any[]>([]);
  const [filters, setFilters] = useState({ action: '', entity: '', user_id: '' });

  const load = () => auditService.list(filters).then(setRows);
  useEffect(() => {
  load();
}, [filters]);
  return (
    <div>
      <h2 className="mb-4">Audit Logs</h2>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by action..."
                value={filters.action}
                onChange={e => setFilters({ ...filters, action: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by entity..."
                value={filters.entity}
                onChange={e => setFilters({ ...filters, entity: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by user ID..."
                value={filters.user_id}
                onChange={e => setFilters({ ...filters, user_id: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-secondary w-100" onClick={() => setFilters({ action: '', entity: '', user_id: '' })}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>{r.user_id}</td>
                  <td><span className="badge bg-secondary">{r.action}</span></td>
                  <td>{r.entity}</td>
                  <td>{r.entity_id || '-'}</td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>{r.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
