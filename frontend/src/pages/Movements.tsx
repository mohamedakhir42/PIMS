import React, { useState, useEffect } from 'react';
import { stockService } from '../services/stock';
import { StockMovement } from '../types';

const Movements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const data = await stockService.getMovements();
      setMovements(data);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementBadge = (type: string) => {
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
    return <div className="text-center py-5">Loading movements...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock Movements</h2>
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
                  <th>Movement #</th>
                  <th>Type</th>
                  <th>Article</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.movement_number}</td>
                    <td>
                      <span className={`badge bg-${getMovementBadge(movement.movement_type)}`}>
                        {movement.movement_type}
                      </span>
                    </td>
                    <td>{movement.article_id}</td>
                    <td className="fw-bold">{movement.quantity}</td>
                    <td>{movement.location_id || '-'}</td>
                    <td>{movement.reason || '-'}</td>
                    <td>{new Date(movement.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movements.length === 0 && (
            <div className="text-center text-muted py-4">
              No movements found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Movements;
