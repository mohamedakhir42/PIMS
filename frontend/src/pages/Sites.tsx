import { useEffect, useState } from 'react';
import { sitesService, Site } from '../services/sites';

const Sites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    address: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await sitesService.getSites();
      setSites(data);
    } catch (err) {
      setError('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await sitesService.createSite(formData);
      setShowModal(false);
      setFormData({ code: '', name: '', description: '', address: '', status: 'ACTIVE' });
      loadSites();
    } catch (err) {
      setError('Failed to create site');
    }
  };

  const handleUpdate = async () => {
    if (!editingSite) return;
    try {
      await sitesService.updateSite(editingSite.id, formData);
      setShowModal(false);
      setEditingSite(null);
      setFormData({ code: '', name: '', description: '', address: '', status: 'ACTIVE' });
      loadSites();
    } catch (err) {
      setError('Failed to update site');
    }
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setFormData({
      code: site.code,
      name: site.name,
      description: site.description || '',
      address: site.address || '',
      status: site.status,
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
        <h2>Sites</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Site
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id}>
                  <td>{site.code}</td>
                  <td>{site.name}</td>
                  <td>{site.description || '-'}</td>
                  <td>{site.address || '-'}</td>
                  <td>
                    <span className={`badge ${site.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                      {site.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(site)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingSite ? 'Edit Site' : 'Add Site'}</h5>
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
                    disabled={!!editingSite}
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
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  onClick={editingSite ? handleUpdate : handleCreate}
                >
                  {editingSite ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites;
