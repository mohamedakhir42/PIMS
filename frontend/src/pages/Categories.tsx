import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categories';
import { Category } from '../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center py-5">Loading categories...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <button className="btn btn-primary">+ New Category</button>
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
                      <button className="btn btn-sm btn-outline-primary me-1">Edit</button>
                      <button className="btn btn-sm btn-outline-danger">Delete</button>
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
    </div>
  );
};

export default Categories;
