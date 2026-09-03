import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articleService } from '../services/articles';
import { Article } from '../types';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadArticle(id);
    }
  }, [id]);

  const loadArticle = async (articleId: string) => {
    try {
      const data = await articleService.getArticle(articleId);
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
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
            <button className="btn btn-primary me-2">Edit Article</button>
            <button className="btn btn-outline-danger">Delete Article</button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0">Stock History</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">Stock history will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
