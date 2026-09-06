import { useEffect, useState } from 'react';
import { zonesService, Zone } from '../services/zones';
import { warehousesService, Warehouse } from '../services/warehouses';

const Zones = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    warehouse_id: '',
    description: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [zonesData, warehousesData] = await Promise.all([
        zonesService.getZones(),
        warehousesService.getWarehouses(),
      ]);
      setZones(zonesData);
      setWarehouses(warehousesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await zonesService.createZone(formData);
      setShowModal(false);
      setFormData({ code: '', name: '', warehouse_id: '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      setError('Failed to create zone');
    }
  };

  const handleUpdate = async () => {
    if (!editingZone) return;
    try {
      await zonesService.updateZone(editingZone.id, formData);
      setShowModal(false);
      setEditingZone(null);
      setFormData({ code: '', name: '', warehouse_id: '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      setError('Failed to update zone');
    }
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      code: zone.code,
      name: zone.name,
      warehouse_id: zone.warehouse_id,
      description: zone.description || '',
      status: zone.status,
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
        <h2>Zones</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Zone
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Warehouse</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const warehouse = warehouses.find((w) => w.id === zone.warehouse_id);
                return (
                  <tr key={zone.id}>
                    <td>{zone.code}</td>
                    <td>{zone.name}</td>
                    <td>{warehouse?.name || '-'}</td>
                    <td>{zone.description || '-'}</td>
                    <td>
                      <span className={`badge ${zone.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                        {zone.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(zone)}>
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
                <h5 className="modal-title">{editingZone ? 'Edit Zone' : 'Add Zone'}</h5>
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
                    disabled={!!editingZone}
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
                  <label className="form-label">Warehouse</label>
                  <select
                    className="form-select"
                    value={formData.warehouse_id}
                    onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                    disabled={!!editingZone}
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
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
                  onClick={editingZone ? handleUpdate : handleCreate}
                >
                  {editingZone ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Zones;
