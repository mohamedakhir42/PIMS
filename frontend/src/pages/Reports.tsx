import { useEffect, useState } from 'react';
import { reportsService } from '../services/reports';

type ReportType = 'stock' | 'movements' | 'critical' | 'inventory';

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('stock');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReport = () => {
    setLoading(true);
    const service = reportsService[reportType as keyof typeof reportsService] as () => Promise<any>;
    if (typeof service === 'function') {
      service().then(setRows).finally(() => setLoading(false));
    }
  };

  useEffect(loadReport, [reportType]);

  const getColumns = () => {
    switch (reportType) {
      case 'stock':
        return ['Code', 'Article', 'Category', 'Location', 'Stock', 'Status'];
      case 'movements':
        return ['Movement #', 'Article', 'Type', 'Quantity', 'User', 'Date', 'Location'];
      case 'critical':
        return ['Code', 'Article', 'Category', 'Current Stock', 'Min Stock', 'Status'];
      case 'inventory':
        return ['Inventory #', 'Site', 'Warehouse', 'Status', 'Date', 'Items'];
      default:
        return [];
    }
  };

  const renderRow = (row: any) => {
    switch (reportType) {
      case 'stock':
        return (
          <>
            <td>{row.code}</td>
            <td>{row.name}</td>
            <td>{row.category || '-'}</td>
            <td>{row.location_id}</td>
            <td>{row.quantity}</td>
            <td><span className={`badge bg-${row.status === 'CRITICAL' ? 'danger' : row.status === 'LOW' ? 'warning' : 'success'}`}>{row.status}</span></td>
          </>
        );
      case 'movements':
        return (
          <>
            <td>{row.movement_number}</td>
            <td>{row.article_name}</td>
            <td><span className={`badge bg-${row.type === 'RECEIPT' ? 'success' : row.type === 'ISSUE' ? 'danger' : 'info'}`}>{row.type}</span></td>
            <td>{row.quantity}</td>
            <td>{row.user_name}</td>
            <td>{new Date(row.date).toLocaleDateString()}</td>
            <td>{row.location_id}</td>
          </>
        );
      case 'critical':
        return (
          <>
            <td>{row.code}</td>
            <td>{row.name}</td>
            <td>{row.category}</td>
            <td className="text-danger fw-bold">{row.quantity}</td>
            <td>{row.min_stock}</td>
            <td><span className="badge bg-danger">CRITICAL</span></td>
          </>
        );
      case 'inventory':
        return (
          <>
            <td>{row.inventory_number}</td>
            <td>{row.site_id}</td>
            <td>{row.warehouse_id}</td>
            <td><span className={`badge bg-${row.status === 'COMPLETED' ? 'success' : 'warning'}`}>{row.status}</span></td>
            <td>{new Date(row.created_at).toLocaleDateString()}</td>
            <td>{row.items_count || 0}</td>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports</h2>
        <button className="btn btn-outline-primary" onClick={() => window.print()}>Export / Print</button>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group" role="group">
            <button className={`btn ${reportType === 'stock' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setReportType('stock')}>Stock Report</button>
            <button className={`btn ${reportType === 'movements' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setReportType('movements')}>Movements</button>
            <button className={`btn ${reportType === 'critical' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setReportType('critical')}>Critical Stock</button>
            <button className={`btn ${reportType === 'inventory' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setReportType('inventory')}>Inventory</button>
          </div>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  {getColumns().map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={reportType === 'stock' ? `${r.article_id}-${r.location_id}` : r.id || idx}>
                    {renderRow(r)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
