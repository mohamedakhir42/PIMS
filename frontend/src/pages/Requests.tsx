import { useEffect, useState } from 'react';
import { requestsService } from '../services/requests';
import { articleService } from '../services/articles';

export default function Requests() {
  const [rows, setRows] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
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
  const loadArticles = () => articleService.getArticles().then(setArticles);

  useEffect(() => {
    load();
    loadArticles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestsService.create(formData);
    setShowModal(false);
    setFormData({ service: '', priority: 'NORMAL', reason: '', items: [{ article_id: '', quantity: 1 }] });
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
    if (confirm('Are you sure you want to approve this request?')) {
      await requestsService.approve(id);
      load();
    }
  };

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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING_APPROVAL': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'danger',
      'ISSUED': 'primary',
      'CANCELLED': 'secondary'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status}</span>;
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
                        <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleApprove(r.id)}>Approve</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => { setSelectedRequest(r); setRejectReason(''); }}>Reject</button>
                      </>
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

      {showModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Stock Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
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
                              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedRequest.status === 'REJECTED' ? 'Rejection Reason' : 'Reject Request'}</h5>
                <button type="button" className="btn-close" onClick={() => { setSelectedRequest(null); setRejectReason(''); }}></button>
              </div>
              <div className="modal-body">
                {selectedRequest.status === 'REJECTED' ? (
                  <p>{selectedRequest.rejection_reason}</p>
                ) : (
                  <textarea className="form-control" value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Please provide a reason for rejection..." required></textarea>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setSelectedRequest(null); setRejectReason(''); }}>Close</button>
                {selectedRequest.status !== 'REJECTED' && (
                  <button type="button" className="btn btn-danger" onClick={handleReject}>Reject</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
