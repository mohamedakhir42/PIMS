import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supplierService } from '../services/suppliers';
import { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
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
    return <div className="text-center py-5">Loading suppliers...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Suppliers</h2>
        <button className="btn btn-primary">+ New Supplier</button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <Link to={`/suppliers/${supplier.id}`} className="text-decoration-none">
                        {supplier.code}
                      </Link>
                    </td>
                    <td>{supplier.name}</td>
                    <td>{supplier.contact_person || '-'}</td>
                    <td>{supplier.email || '-'}</td>
                    <td>{supplier.phone || '-'}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadge(supplier.status)}`}>
                        {supplier.status}
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

          {suppliers.length === 0 && (
            <div className="text-center text-muted py-4">
              No suppliers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
