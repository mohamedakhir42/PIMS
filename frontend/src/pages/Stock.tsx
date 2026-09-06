import React, { useState, useEffect } from 'react';
import { stockService } from '../services/stock';
import { articleService } from '../services/articles';
import { locationsService, Location } from '../services/locations';
import { Stock, Article } from '../types';

type StockStatus = 'CRITICAL' | 'LOW' | 'NORMAL';

interface StockStatusInfo {
  label: StockStatus;
  color: 'danger' | 'warning' | 'success';
}

const StockPage: React.FC = () => {
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [receiptForm, setReceiptForm] = useState({
    article_id: '',
    location_id: '',
    quantity: 0,
    reason: '',
    reference: ''
  });
  const [issueForm, setIssueForm] = useState({
    article_id: '',
    location_id: '',
    quantity: 0,
    reason: '',
    reference: ''
  });
  const [transferForm, setTransferForm] = useState({
    article_id: '',
    from_location_id: '',
    to_location_id: '',
    quantity: 0,
    reason: ''
  });


  useEffect(() => {
    loadStock();
    loadArticles();
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await locationsService.getLocations();
      setLocations(data);
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  };
  const loadStock = async () => {
    try {
      setError(null);
      const data = await stockService.getStock();
      setStock(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stock';
      setError(message);
      console.error('Error loading stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const data = await articleService.getArticles();
      setArticles(data);
    } catch (err) {
      console.error('Error loading articles:', err);
    }
  };

  const getStockStatus = (quantity: number): StockStatusInfo => {
    if (quantity <= 0) return { label: 'CRITICAL', color: 'danger' };
    if (quantity < 10) return { label: 'LOW', color: 'warning' };
    return { label: 'NORMAL', color: 'success' };
  };

  const handleReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await stockService.createReceipt(receiptForm);
      setShowReceiptModal(false);
      setReceiptForm({ article_id: '', location_id: '', quantity: 0, reason: '', reference: '' });
      loadStock();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create receipt';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await stockService.createIssue(issueForm);
      setShowIssueModal(false);
      setIssueForm({ article_id: '', location_id: '', quantity: 0, reason: '', reference: '' });
      loadStock();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create issue';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await stockService.createTransfer(transferForm);
      setShowTransferModal(false);
      setTransferForm({ article_id: '', from_location_id: '', to_location_id: '', quantity: 0, reason: '' });
      loadStock();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transfer';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading stock...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock Overview</h2>
        <div>
          <button className="btn btn-success me-2" onClick={() => setShowReceiptModal(true)}>+ Receipt</button>
          <button className="btn btn-danger me-2" onClick={() => setShowIssueModal(true)}>- Issue</button>
          <button className="btn btn-info" onClick={() => setShowTransferModal(true)}>Transfer</button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => {
                  const status = getStockStatus(item.quantity);
                  return (
                    <tr key={item.id}>
                      <td>
                        {item.article_designation || item.article_id}
                        {item.article_code && <small className="text-muted d-block">({item.article_code})</small>}
                      </td>
                      <td>
                        {item.location_name || item.location_id}
                        {item.location_code && <small className="text-muted d-block">({item.location_code})</small>}
                      </td>
                      <td className="fw-bold">{item.quantity}</td>
                      <td>
                        <span className={`badge bg-${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {stock.length === 0 && (
            <div className="text-center text-muted py-4">
              No stock data available
            </div>
          )}
        </div>
      </div>

      {showReceiptModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Stock Receipt</h5>
                <button type="button" className="btn-close" onClick={() => setShowReceiptModal(false)}></button>
              </div>
              <form onSubmit={handleReceipt}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Article *</label>
                    <select
                      className="form-select"
                      value={receiptForm.article_id}
                      onChange={(e) => setReceiptForm({ ...receiptForm, article_id: e.target.value })}
                      required
                    >
                      <option value="">Select Article</option>
                      {articles.map((article) => (
                        <option key={article.id} value={article.id}>{article.designation} ({article.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location *</label>

                    <select
                      className="form-select"
                      value={receiptForm.location_id}
                      onChange={(e) =>
                        setReceiptForm({
                          ...receiptForm,
                          location_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Location</option>

                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={receiptForm.quantity}
                      onChange={(e) => setReceiptForm({ ...receiptForm, quantity: parseInt(e.target.value) || 0 })}
                      required
                      min={1}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason</label>
                    <textarea
                      className="form-control"
                      value={receiptForm.reason}
                      onChange={(e) => setReceiptForm({ ...receiptForm, reason: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      value={receiptForm.reference}
                      onChange={(e) => setReceiptForm({ ...receiptForm, reference: e.target.value })}
                      placeholder="e.g., PO #12345"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReceiptModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Processing...' : 'Create Receipt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showIssueModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Stock Issue</h5>
                <button type="button" className="btn-close" onClick={() => setShowIssueModal(false)}></button>
              </div>
              <form onSubmit={handleIssue}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Article *</label>
                    <select
                      className="form-select"
                      value={issueForm.article_id}
                      onChange={(e) => setIssueForm({ ...issueForm, article_id: e.target.value })}
                      required
                    >
                      <option value="">Select Article</option>
                      {articles.map((article) => (
                        <option key={article.id} value={article.id}>{article.designation} ({article.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location *</label>

                    <select
                      className="form-select"
                      value={issueForm.location_id}
                      onChange={(e) =>
                        setIssueForm({
                          ...issueForm,
                          location_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Location</option>

                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={issueForm.quantity}
                      onChange={(e) => setIssueForm({ ...issueForm, quantity: parseInt(e.target.value) || 0 })}
                      required
                      min={1}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason</label>
                    <textarea
                      className="form-control"
                      value={issueForm.reason}
                      onChange={(e) => setIssueForm({ ...issueForm, reason: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      value={issueForm.reference}
                      onChange={(e) => setIssueForm({ ...issueForm, reference: e.target.value })}
                      placeholder="e.g., Request #12345"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowIssueModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Processing...' : 'Create Issue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Stock Transfer</h5>
                <button type="button" className="btn-close" onClick={() => setShowTransferModal(false)}></button>
              </div>
              <form onSubmit={handleTransfer}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Article *</label>
                    <select
                      className="form-select"
                      value={transferForm.article_id}
                      onChange={(e) => setTransferForm({ ...transferForm, article_id: e.target.value })}
                      required
                    >
                      <option value="">Select Article</option>
                      {articles.map((article) => (
                        <option key={article.id} value={article.id}>{article.designation} ({article.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">From Location ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={transferForm.from_location_id}
                        onChange={(e) => setTransferForm({ ...transferForm, from_location_id: e.target.value })}
                        required
                        placeholder="Source location UUID"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">To Location ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={transferForm.to_location_id}
                        onChange={(e) => setTransferForm({ ...transferForm, to_location_id: e.target.value })}
                        required
                        placeholder="Destination location UUID"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={transferForm.quantity}
                      onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) || 0 })}
                      required
                      min={1}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason</label>
                    <textarea
                      className="form-control"
                      value={transferForm.reason}
                      onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Processing...' : 'Create Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;