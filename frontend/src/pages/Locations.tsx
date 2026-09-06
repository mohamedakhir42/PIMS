import { useEffect, useState } from 'react';
import { locationsService, Location } from '../services/locations';
import { zonesService, Zone } from '../services/zones';

const Locations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    zone_id: '',
    capacity: '',
    description: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locationsData, zonesData] = await Promise.all([
        locationsService.getLocations(),
        zonesService.getZones(),
      ]);
      setLocations(locationsData);
      setZones(zonesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await locationsService.createLocation({
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      });
      setShowModal(false);
      setFormData({ code: '', name: '', zone_id: '', capacity: '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      setError('Failed to create location');
    }
  };

  const handleUpdate = async () => {
    if (!editingLocation) return;
    try {
      await locationsService.updateLocation(editingLocation.id, {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      });
      setShowModal(false);
      setEditingLocation(null);
      setFormData({ code: '', name: '', zone_id: '', capacity: '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      setError('Failed to update location');
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      code: location.code,
      name: location.name,
      zone_id: location.zone_id,
      capacity: location.capacity?.toString() || '',
      description: location.description || '',
      status: location.status,
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
        <h2>Locations</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Location
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Zone</th>
                <th>Capacity</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => {
                const zone = zones.find((z) => z.id === location.zone_id);
                return (
                  <tr key={location.id}>
                    <td>{location.code}</td>
                    <td>{location.name}</td>
                    <td>{zone?.name || '-'}</td>
                    <td>{location.capacity || '-'}</td>
                    <td>{location.description || '-'}</td>
                    <td>
                      <span className={`badge ${location.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                        {location.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(location)}>
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
                <h5 className="modal-title">{editingLocation ? 'Edit Location' : 'Add Location'}</h5>
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
                    disabled={!!editingLocation}
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
                  <label className="form-label">Zone</label>
                  <select
                    className="form-select"
                    value={formData.zone_id}
                    onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                    disabled={!!editingLocation}
                  >
                    <option value="">Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                  onClick={editingLocation ? handleUpdate : handleCreate}
                >
                  {editingLocation ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
