import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supplierService } from '../services/suppliers';
import { Supplier } from '../types';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSupplier(id);
    }
  }, [id]);

  const loadSupplier = async (supplierId: string) => {
    try {
      const data = await supplierService.getSupplier(supplierId);
      setSupplier(data);
    } catch (error) {
      console.error('Error loading supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading supplier...</div>;
  }

  if (!supplier) {
    return <div className="text-center py-5">Supplier not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Supplier Details</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">{supplier.name}</h5>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Code</th>
                <td>{supplier.code}</td>
              </tr>
              <tr>
                <th>ICE</th>
                <td>{supplier.ice || 'N/A'}</td>
              </tr>
              <tr>
                <th>Contact Person</th>
                <td>{supplier.contact_person || 'N/A'}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{supplier.email || 'N/A'}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{supplier.phone || 'N/A'}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{supplier.address || 'N/A'}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  <span className={`badge bg-${supplier.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                    {supplier.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4">
            <button className="btn btn-primary me-2">Edit Supplier</button>
            <button className="btn btn-outline-danger">Delete Supplier</button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0">Supplied Articles</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">Articles supplied by this supplier will be displayed here</p>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0">Delivery History</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">Delivery history will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
