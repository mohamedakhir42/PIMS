import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoriesService } from '../services/inventories';

export default function Inventories() {
  const [rows, setRows] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ site_id: '', warehouse_id: '', notes: '' });

  const load = () => inventoriesService.list().then(setRows);
  useEffect(() => {
  load();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await inventoriesService.create(formData);
    setShowModal(false);
    setFormData({ site_id: '', warehouse_id: '', notes: '' });
    load();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Physical Inventories</h2>
        <button className="btn btn-primary" onClick={() => { setFormData({ site_id: '', warehouse_id: '', notes: '' }); setShowModal(true); }}>
          New Inventory
        </button>
      </div>
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Number</th>
                <th>Site</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.inventory_number}</td>
                  <td>{r.site_id}</td>
                  <td>{r.warehouse_id}</td>
                  <td>
                    <span className={`badge bg-${r.status === 'COMPLETED' ? 'success' : r.status === 'IN_PROGRESS' ? 'warning' : 'secondary'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>
                    <Link className="btn btn-sm btn-outline-primary" to={`/inventories/${r.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Inventory</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Site ID</label>
                    <input type="text" className="form-control" value={formData.site_id} onChange={e => setFormData({ ...formData, site_id: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Warehouse ID</label>
                    <input type="text" className="form-control" value={formData.warehouse_id} onChange={e => setFormData({ ...formData, warehouse_id: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
