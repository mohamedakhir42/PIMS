import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesService } from '../services/articles';
import { categoryService } from '../services/categories';
import { supplierService } from '../services/suppliers';
import { Article, ArticleStatus, Category, Supplier } from '../types';
import BarcodeScanner from '../components/BarcodeScanner';
import { Camera } from 'lucide-react';

type BadgeColor = 'success' | 'secondary' | 'danger';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    reference: '',
    designation: '',
    description: '',
    category_id: '',
    unit: '',
    stock_min: 0,
    stock_max: '',
    reorder_point: '',
    main_supplier_id: '',
    barcode: '',
    status: ArticleStatus.ACTIVE
  });

  useEffect(() => {
    loadArticles();
    loadCategories();
    loadSuppliers();
  }, []);

  const loadArticles = async () => {
    try {
      setError(null);
      const data = await articlesService.getArticles();
      setArticles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      setError(message);
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error('Error loading suppliers:', err);
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

  const handleNewArticle = () => {
    setEditingArticle(null);
    setFormData({
      code: '',
      reference: '',
      designation: '',
      description: '',
      category_id: '',
      unit: '',
      stock_min: 0,
      stock_max: '',
      reorder_point: '',
      main_supplier_id: '',
      barcode: '',
      status: ArticleStatus.ACTIVE
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      code: article.code,
      reference: article.reference,
      designation: article.designation,
      description: article.description || '',
      category_id: article.category_id,
      unit: article.unit,
      stock_min: article.stock_min,
      stock_max: article.stock_max?.toString() || '',
      reorder_point: article.reorder_point?.toString() || '',
      main_supplier_id: article.main_supplier_id || '',
      barcode: article.barcode || '',
      status: article.status
    });
    setImagePreview(article.image_url || null);
    setShowModal(true);
  };

  const handleDeleteArticle = async (article: Article) => {
    if (!window.confirm(`Are you sure you want to delete article ${article.code}?`)) {
      return;
    }
    try {
      await articlesService.deleteArticle(article.id);
      loadArticles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete article';
      alert(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        stock_max: formData.stock_max ? parseInt(formData.stock_max) : null,
        reorder_point: formData.reorder_point ? parseInt(formData.reorder_point) : null
      };
      if (editingArticle) {
        await articlesService.updateArticle(editingArticle.id, submitData);
      } else {
        await articlesService.createArticle(submitData);
      }
      setShowModal(false);
      loadArticles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save article';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingArticle) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const updatedArticle = await articleService.uploadImage(editingArticle.id, file);
      setImagePreview(updatedArticle.image_url || null);
      setEditingArticle(updatedArticle);
      alert('Image uploaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      alert(message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!editingArticle) return;

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const updatedArticle = await articleService.deleteImage(editingArticle.id);
      setImagePreview(null);
      setEditingArticle(updatedArticle);
      alert('Image deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete image';
      alert(message);
    }
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
          <button className="btn btn-primary" onClick={handleNewArticle}>+ New Article</button>
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
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditArticle(article)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteArticle(article)}>Delete</button>
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

      {showModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingArticle ? 'Edit Article' : 'New Article'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                        disabled={!!editingArticle}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Reference *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Designation *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name} ({cat.code})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Unit *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        required
                        placeholder="e.g., PCS, KG, L"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Stock Min *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.stock_min}
                        onChange={(e) => setFormData({ ...formData, stock_min: parseInt(e.target.value) || 0 })}
                        required
                        min={0}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Stock Max</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.stock_max}
                        onChange={(e) => setFormData({ ...formData, stock_max: e.target.value })}
                        min={0}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Reorder Point</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.reorder_point}
                        onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Main Supplier</label>
                      <select
                        className="form-select"
                        value={formData.main_supplier_id}
                        onChange={(e) => setFormData({ ...formData, main_supplier_id: e.target.value })}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map((sup) => (
                          <option key={sup.id} value={sup.id}>{sup.name} ({sup.code})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Barcode</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status *</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                      required
                    >
                      <option value={ArticleStatus.ACTIVE}>Active</option>
                      <option value={ArticleStatus.INACTIVE}>Inactive</option>
                      <option value={ArticleStatus.DISCONTINUED}>Discontinued</option>
                    </select>
                  </div>
                  {editingArticle && (
                    <div className="mb-3">
                      <label className="form-label">Image</label>
                      {imagePreview ? (
                        <div className="border rounded p-3">
                          <img
                            src={`http://localhost:8000${imagePreview}`}
                            alt="Article"
                            className="img-fluid mb-2"
                            style={{ maxHeight: '200px' }}
                          />
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={handleImageDelete}
                              disabled={uploadingImage}
                            >
                              Delete Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border rounded p-3 text-center">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="form-control"
                          />
                          <small className="text-muted">
                            Max size: 5MB. Formats: JPEG, PNG, WebP, GIF
                          </small>
                        </div>
                      )}
                      {uploadingImage && (
                        <div className="text-center mt-2">
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span className="ms-2">Uploading...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingArticle ? 'Update' : 'Create')}
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

export default Articles;
