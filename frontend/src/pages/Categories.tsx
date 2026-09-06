import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categories';
import { Category, CategoryStatus } from '../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parent_id: '',
    status: 'ACTIVE' as CategoryStatus
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      ACTIVE: 'success',
      INACTIVE: 'secondary',
    };
    return colors[status] || 'secondary';
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      parent_id: '',
      status: 'ACTIVE' as CategoryStatus
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
      status: category.status
    });
    setShowModal(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to delete category ${category.code}?`)) {
      return;
    }
    try {
      await categoryService.deleteCategory(category.id);
      loadCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      alert(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save category';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading categories...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <button className="btn btn-primary" onClick={handleNewCategory}>+ New Category</button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Parent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.code}</td>
                    <td>{category.name}</td>
                    <td>{category.description || '-'}</td>
                    <td>{category.parent_id || '-'}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadge(category.status)}`}>
                        {category.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditCategory(category)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCategory(category)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center text-muted py-4">
              No categories found
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingCategory ? 'Edit Category' : 'New Category'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      disabled={!!editingCategory}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <div className="mb-3">
                    <label className="form-label">Parent Category</label>
                    <select
                      className="form-select"
                      value={formData.parent_id}
                      onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    >
                      <option value="">No Parent (Root Category)</option>
                      {categories
                        .filter(c => !editingCategory || c.id !== editingCategory.id)
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name} ({cat.code})</option>
                        ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status *</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CategoryStatus })}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
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

export default Categories;
