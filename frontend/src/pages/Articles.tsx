import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articles';
import { Article, ArticleStatus } from '../types';
import BarcodeScanner from '../components/BarcodeScanner';
import { Camera } from 'lucide-react';

type BadgeColor = 'success' | 'secondary' | 'danger';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setError(null);
      const data = await articleService.getArticles();
      setArticles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      setError(message);
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.barcode && article.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBarcodeScan = (barcode: string) => {
    setSearchTerm(barcode);
    setShowScanner(false);
    
    const foundArticle = articles.find(a => a.barcode === barcode);
    if (foundArticle) {
      window.location.href = `/inventory/articles/${foundArticle.id}`;
    }
  };

  const getStatusBadge = (status: ArticleStatus): BadgeColor => {
    const colors: Record<ArticleStatus, BadgeColor> = {
      ACTIVE: 'success',
      INACTIVE: 'secondary',
      DISCONTINUED: 'danger',
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return <div className="text-center py-5">Loading articles...</div>;
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
        <h2>Articles</h2>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={() => setShowScanner(true)}>
            <Camera size={16} className="me-2" />
            Scan Barcode
          </button>
          <button className="btn btn-primary">+ New Article</button>
        </div>
      </div>

      {showScanner && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Reference</th>
                  <th>Designation</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Barcode</th>
                  <th>Stock Min</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Link to={`/inventory/articles/${article.id}`} className="text-decoration-none">
                        {article.code}
                      </Link>
                    </td>
                    <td>{article.reference}</td>
                    <td>{article.designation}</td>
                    <td>{article.category_id}</td>
                    <td>{article.unit}</td>
                    <td>{article.barcode || '-'}</td>
                    <td>{article.stock_min}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadge(article.status)}`}>
                        {article.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1">Edit</button>
                      <button className="btn btn-sm btn-outline-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center text-muted py-4">
              No articles found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Articles;
