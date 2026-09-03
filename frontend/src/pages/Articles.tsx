import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articles';
import { Article } from '../types';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await articleService.getArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      ACTIVE: 'success',
      INACTIVE: 'secondary',
      DISCONTINUED: 'danger',
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return <div className="text-center py-5">Loading articles...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Articles</h2>
        <button className="btn btn-primary">+ New Article</button>
      </div>

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
