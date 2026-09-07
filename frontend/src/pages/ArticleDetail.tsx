import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesService } from '../services/articles';
import { attachmentsService } from '../services/attachments';
import { stockService } from '../services/stock';
import { Article, StockMovement } from '../types';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  useEffect(() => {
    if (id) {
      loadArticle(id);
      loadAttachments(id);
      loadStockMovements(id);
    }
  }, [id]);

  const loadArticle = async (articleId: string) => {
    try {
      const data = await articlesService.getArticle(articleId);
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttachments = async (articleId: string) => {
    try {
      const data = await attachmentsService.list('Article', articleId);
      setAttachments(data);
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      await attachmentsService.upload('Article', id, file);
      loadAttachments(id);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await attachmentsService.delete(attachmentId);
      if (id) loadAttachments(id);
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const loadStockMovements = async (articleId: string) => {
    setLoadingMovements(true);
    try {
      const data = await stockService.getMovements();
      // Filter movements for this article
      const articleMovements = data.filter(m => m.article_id === articleId);
      setStockMovements(articleMovements);
    } catch (error) {
      console.error('Error loading stock movements:', error);
    } finally {
      setLoadingMovements(false);
    }
  };

  const handleEdit = () => {
    navigate(`/articles/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm(`Are you sure you want to delete article ${article?.code}?`)) {
      return;
    }
    try {
      await articlesService.deleteArticle(id);
      navigate('/articles');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete article';
      alert(message);
    }
  };

  const getMovementTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      RECEIPT: 'success',
      ISSUE: 'danger',
      TRANSFER: 'info',
      RETURN: 'warning',
      ADJUSTMENT: 'secondary',
      INVENTORY_ADJUSTMENT: 'dark',
    };
    return colors[type] || 'secondary';
  };

  if (loading) {
    return <div className="text-center py-5">Loading article...</div>;
  }

  if (!article) {
    return <div className="text-center py-5">Article not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Article Details</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3">{article.designation}</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>Code</th>
                    <td>{article.code}</td>
                  </tr>
                  <tr>
                    <th>Reference</th>
                    <td>{article.reference}</td>
                  </tr>
                  <tr>
                    <th>Category ID</th>
                    <td>{article.category_id}</td>
                  </tr>
                  <tr>
                    <th>Unit</th>
                    <td>{article.unit}</td>
                  </tr>
                  <tr>
                    <th>Stock Min</th>
                    <td>{article.stock_min}</td>
                  </tr>
                  <tr>
                    <th>Stock Max</th>
                    <td>{article.stock_max || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Reorder Point</th>
                    <td>{article.reorder_point || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <span className={`badge bg-${article.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                        {article.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              {article.image_url && (
                <div className="mb-3">
                  <img
                    src={article.image_url}
                    alt={article.designation}
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
              {article.description && (
                <div className="mb-3">
                  <h6>Description</h6>
                  <p>{article.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <button className="btn btn-primary me-2" onClick={handleEdit}>Edit Article</button>
            <button className="btn btn-outline-danger" onClick={handleDelete}>Delete Article</button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0">Stock History</h5>
        </div>
        <div className="card-body">
          {loadingMovements ? (
            <div className="text-center py-3">Loading stock movements...</div>
          ) : stockMovements.length === 0 ? (
            <p className="text-muted">No stock movements for this article</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Reference</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td>{new Date(movement.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`badge bg-${getMovementTypeBadge(movement.movement_type)}`}>
                          {movement.movement_type}
                        </span>
                      </td>
                      <td className={movement.movement_type === 'ISSUE' ? 'text-danger' : 'text-success'}>
                        {movement.movement_type === 'ISSUE' ? '-' : '+'}{movement.quantity}
                      </td>
                      <td>{movement.location_id || '-'}</td>
                      <td>{movement.reference || '-'}</td>
                      <td>{movement.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Attachments</h5>
          <input
            type="file"
            id="file-upload"
            className="d-none"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="btn btn-primary btn-sm">
            {uploading ? 'Uploading...' : 'Upload File'}
          </label>
        </div>
        <div className="card-body">
          {attachments.length === 0 ? (
            <p className="text-muted">No attachments</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map((att) => (
                  <tr key={att.id}>
                    <td>{att.file_name}</td>
                    <td>{att.file_size ? `${(att.file_size / 1024).toFixed(2)} KB` : 'N/A'}</td>
                    <td>{att.mime_type || 'Unknown'}</td>
                    <td>{new Date(att.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
