import { useEffect, useState } from 'react';
import { warehousesService, Warehouse } from '../services/warehouses';
import { sitesService, Site } from '../services/sites';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    site_id: '',
    manager: '',
    description: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [warehousesData, sitesData] = await Promise.all([
        warehousesService.getWarehouses(),
        sitesService.getSites(),
      ]);
      setWarehouses(warehousesData);
      setSites(sitesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await warehousesService.createWarehouse(formData);
      setShowModal(false);
      setFormData({ code: '', name: '', site_id: '', manager: '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      setError('Failed to create warehouse');
    }
  };

  const handleUpdate = async () => {
    if (!editingWarehouse) return;
    try {
      await warehousesService.updateWarehouse(editingWarehouse.id, formData);
      setShowModal(false);
      setEditingWarehouse(null);
      setFormData({ code: '', name: '', site_id: '', manager: '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      setError('Failed to update warehouse');
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      site_id: warehouse.site_id,
      manager: warehouse.manager || '',
      description: warehouse.description || '',
      status: warehouse.status,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Warehouses</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Warehouse
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Site</th>
                <th>Manager</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => {
                const site = sites.find((s) => s.id === warehouse.site_id);
                return (
                  <tr key={warehouse.id}>
                    <td>{warehouse.code}</td>
                    <td>{warehouse.name}</td>
                    <td>{site?.name || '-'}</td>
                    <td>{warehouse.manager || '-'}</td>
                    <td>{warehouse.description || '-'}</td>
                    <td>
                      <span className={`badge ${warehouse.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                        {warehouse.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(warehouse)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={!!editingWarehouse}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Site</label>
                  <select
                    className="form-select"
                    value={formData.site_id}
                    onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                    disabled={!!editingWarehouse}
                  >
                    <option value="">Select Site</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Manager</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={editingWarehouse ? handleUpdate : handleCreate}
                >
                  {editingWarehouse ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
