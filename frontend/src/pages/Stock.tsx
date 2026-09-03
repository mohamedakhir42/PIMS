import React, { useState, useEffect } from 'react';
import { stockService } from '../services/stock';
import { Stock } from '../types';

const StockPage: React.FC = () => {
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      const data = await stockService.getStock();
      setStock(data);
    } catch (error) {
      console.error('Error loading stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: 'CRITICAL', color: 'danger' };
    if (quantity < 10) return { label: 'LOW', color: 'warning' };
    return { label: 'NORMAL', color: 'success' };
  };

  if (loading) {
    return <div className="text-center py-5">Loading stock...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock Overview</h2>
        <div>
          <button className="btn btn-success me-2">+ Receipt</button>
          <button className="btn btn-danger me-2">- Issue</button>
          <button className="btn btn-info">Transfer</button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Article ID</th>
                  <th>Location ID</th>
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
                      <td>{item.article_id}</td>
                      <td>{item.location_id}</td>
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
    </div>
  );
};

export default StockPage;