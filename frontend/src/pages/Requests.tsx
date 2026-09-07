import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { requestsService } from '../services/requests';
import { articlesService } from '../services/articles';
import { sitesService } from '../services/sites';
import { warehousesService } from '../services/warehouses';
import { zonesService } from '../services/zones';
import { locationsService } from '../services/locations';
import { Article, StockRequest, Site, Warehouse, Zone, Location } from '../types';

export default function Requests() {
  const [rows, setRows] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    service: '',
    priority: 'NORMAL',
    reason: '',
    items: [{ article_id: '', quantity: 1 }]
  });
  const [rejectReason, setRejectReason] = useState('');

  const load = () => requestsService.list().then(setRows);
  const loadArticles = () => articlesService.getArticles().then(setArticles);
  const loadSites = () => sitesService.getSites().then(setSites);

  const loadWarehouses = async (siteId: string) => {
    const all = await warehousesService.getWarehouses();
    setWarehouses(all.filter(w => w.site_id === siteId));
  };

  const loadZones = async (warehouseId: string) => {
    const all = await zonesService.getZones();
    setZones(all.filter(z => z.warehouse_id === warehouseId));
  };

  const loadLocations = async (zoneId: string) => {
    const all = await locationsService.getLocations();
    setLocations(all.filter(l => l.zone_id === zoneId));
  };

  useEffect(() => {
    load();
    loadArticles();
    loadSites();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdRequest = await requestsService.create(formData);
    setShowModal(false);
    setFormData({ service: '', priority: 'NORMAL', reason: '', items: [{ article_id: '', quantity: 1 }] });
    // Submit the request after creation
    await requestsService.submit(createdRequest.id);
    load();
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { article_id: '', quantity: 1 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleApprove = async (id: string) => {
    await requestsService.approve(id);
    load();
  };

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveRequestId, setApproveRequestId] = useState<string | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueRequestId, setIssueRequestId] = useState<string | null>(null);
  const [issueForm, setIssueForm] = useState({
    site_id: '',
    warehouse_id: '',
    zone_id: '',
    location_id: ''
  });

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    await requestsService.reject(selectedRequest.id, rejectReason);
    setSelectedRequest(null);
    setRejectReason('');
    load();
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueRequestId) return;
    try {
      await requestsService.issue(issueRequestId, issueForm);
      setShowIssueModal(false);
      setIssueRequestId(null);
      setIssueForm({ location_id: '', warehouse_id: '', site_id: '',zone_id: '' });
      load();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to issue material';
      alert(message);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'secondary',
      'SUBMITTED': 'info',
      'PENDING_APPROVAL': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'danger',
      'READY_FOR_ISSUE': 'primary',
      'PARTIALLY_FULFILLED': 'info',
      'FULFILLED': 'success',
      'CANCELLED': 'secondary'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status.replace(/_/g, ' ')}</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock Requests</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>New Request</button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Service</th>
                <th>Priority</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.request_number}</td>
                  <td>{r.service}</td>
                  <td><span className={`badge bg-${r.priority === 'HIGH' ? 'danger' : r.priority === 'LOW' ? 'info' : 'secondary'}`}>{r.priority}</span></td>
                  <td>{r.reason}</td>
                  <td>{getStatusBadge(r.status)}</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    {r.status === 'PENDING_APPROVAL' && (
                      <>
                        <button className="btn btn-sm btn-outline-success me-1" onClick={() => { setApproveRequestId(r.id); setShowApproveModal(true); }}>Approve</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => { setSelectedRequest(r); setRejectReason(''); }}>Reject</button>
                      </>
                    )}
                    {(r.status === 'DRAFT' || r.status === 'SUBMITTED') && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => requestsService.cancel(r.id).then(load)}>Cancel</button>
                    )}
                    {r.status === 'READY_FOR_ISSUE' && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => { setIssueRequestId(r.id); setShowIssueModal(true); }}>Issue Material</button>
                    )}
                    {r.status === 'REJECTED' && r.rejection_reason && (
                      <button className="btn btn-sm btn-outline-info" onClick={() => { setSelectedRequest(r); setRejectReason(r.rejection_reason); }}>View Reason</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="New Stock Request"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Service</label>
              <input type="text" className="form-control" value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Priority</label>
              <select className="form-select" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Reason</label>
            <textarea className="form-control" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} rows={2} required></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Items</label>
            {formData.items.map((item, index) => (
              <div key={index} className="row mb-2 align-items-end">
                <div className="col-md-6">
                  <select className="form-select" value={item.article_id} onChange={e => updateItem(index, 'article_id', e.target.value)} required>
                    <option value="">Select Article</option>
                    {articles.map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.designation}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <input type="number" className="form-control" placeholder="Quantity" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))} min={1} required />
                </div>
                <div className="col-md-3">
                  {formData.items.length > 1 && (
                    <button type="button" className="btn btn-outline-danger w-100" onClick={() => removeItem(index)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addItem}>+ Add Item</button>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>

      <Modal
        show={showApproveModal}
        onHide={() => { setShowApproveModal(false); setApproveRequestId(null); }}
        title="Approve Request"
        size="sm"
      >
        <p>Are you sure you want to approve this request?</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => { setShowApproveModal(false); setApproveRequestId(null); }}>Cancel</button>
          <button className="btn btn-success" onClick={() => { if (approveRequestId) { handleApprove(approveRequestId); setShowApproveModal(false); setApproveRequestId(null); } }}>Confirm Approval</button>
        </div>
      </Modal>

      <Modal
        show={!!selectedRequest}
        onHide={() => { setSelectedRequest(null); setRejectReason(''); }}
        title={selectedRequest?.status === 'REJECTED' ? 'Rejection Reason' : 'Reject Request'}
        size="sm"
      >
        {selectedRequest?.status === 'REJECTED' ? (
          <p>{selectedRequest.rejection_reason}</p>
        ) : (
          <>
            <textarea className="form-control" value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Please provide a reason for rejection..." required></textarea>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setSelectedRequest(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Reject</button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        show={showIssueModal}
        onHide={() => { setShowIssueModal(false); setIssueRequestId(null); setIssueForm({ location_id: '', warehouse_id: '', site_id: '' }); setWarehouses([]); setZones([]); setLocations([]); }}
        title="Issue Material"
        size="sm"
      >
        <form onSubmit={handleIssue}>
          <div className="mb-3">
            <label className="form-label">Site</label>
            <select className="form-select" value={issueForm.site_id} onChange={e => { setIssueForm({ ...issueForm, site_id: e.target.value, warehouse_id: '', location_id: '' }); if (e.target.value) loadWarehouses(e.target.value); }} required>
              <option value="">Select Site</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Warehouse</label>
            <select className="form-select" value={issueForm.warehouse_id} onChange={e => { setIssueForm({ ...issueForm, warehouse_id: e.target.value, location_id: '' }); if (e.target.value) loadZones(e.target.value); }} disabled={!issueForm.site_id} required>
              <option value="">Select Warehouse</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Zone</label>
            <select className="form-select" value={issueForm.zone_id || ''} onChange={e => { setIssueForm({ ...issueForm, zone_id: e.target.value, location_id: '' }); if (e.target.value) loadLocations(e.target.value); }} disabled={!issueForm.warehouse_id}>
              <option value="">Select Zone</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.code} - {z.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Location</label>
            <select className="form-select" value={issueForm.location_id} onChange={e => setIssueForm({ ...issueForm, location_id: e.target.value })} disabled={!issueForm.zone_id} required>
              <option value="">Select Location</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowIssueModal(false); setIssueRequestId(null); setIssueForm({ location_id: '', warehouse_id: '', site_id: '' }); setWarehouses([]); setZones([]); setLocations([]); }}>Cancel</button>
            <button type="submit" className="btn btn-primary">Issue Material</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
