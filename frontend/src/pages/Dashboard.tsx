import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { reportsService } from '../services/reports';
import { DashboardData } from '../types';
import { AlertTriangle, Clipboard } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await reportsService.dashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center py-5">No data available</div>;
  }

  // Prepare chart data from real API data
  const movementData = {
    labels: Object.keys(dashboardData.movements_today),
    datasets: [
      {
        label: 'Movements',
        data: Object.values(dashboardData.movements_today),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const categoryData = {
    labels: ['Mechanical', 'Electrical', 'Hydraulic', 'Pneumatic', 'EPI'],
    datasets: [
      {
        data: [30, 20, 15, 10, 25],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  const kpis = [
    { label: 'Total Articles', value: dashboardData.kpis.total_articles.toLocaleString(), color: 'primary' },
    { label: 'Total Stock', value: dashboardData.kpis.total_stock.toLocaleString(), color: 'success' },
    { label: 'Critical Stock', value: dashboardData.kpis.critical_stock.toString(), color: 'danger' },
    { label: 'Low Stock', value: dashboardData.kpis.low_stock.toString(), color: 'warning' },
    { label: 'Pending Requests', value: dashboardData.kpis.pending_requests.toString(), color: 'info' },
    { label: 'Today Receipts', value: dashboardData.kpis.today_receipts.toString(), color: 'success' },
  ];

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="col-md-2">
            <div className={`card border-0 shadow-sm bg-${kpi.color} text-white`}>
              <div className="card-body">
                <h6 className="card-title mb-1">{kpi.label}</h6>
                <h3 className="card-text mb-0">{kpi.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Movements Today</h5>
            </div>
            <div className="card-body">
              <Bar data={movementData} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Stock by Category</h5>
            </div>
            <div className="card-body">
              <Doughnut data={categoryData} />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 d-flex align-items-center gap-2">
            <AlertTriangle size={20} className="text-danger" />
            Critical Stock Alerts
          </h5>
          <span className="badge bg-danger">{dashboardData.critical.length} Items</span>
        </div>
        <div className="card-body">
          {dashboardData.critical.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Article ID</th>
                    <th>Quantity</th>
                    <th>Minimum Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.critical.slice(0, 5).map((stock, index) => (
                    <tr key={index}>
                      <td>{stock.article_id}</td>
                      <td className="text-danger fw-bold">{stock.quantity}</td>
                      <td>{stock.minimum_stock}</td>
                      <td>
                        <span className="badge bg-danger">CRITICAL</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">No critical stock items</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0 d-flex align-items-center gap-2">
            <Clipboard size={20} />
            Recent Activity
          </h5>
        </div>
        <div className="card-body">
          {dashboardData.recent_activity.length > 0 ? (
            <ul className="list-group list-group-flush">
              {dashboardData.recent_activity.slice(0, 5).map((activity) => (
                <li key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>User {activity.user_id}</strong> - {activity.movement_type}: Article {activity.article_id} x{activity.quantity}
                    <small className="text-muted d-block">{new Date(activity.created_at).toLocaleString()}</small>
                  </div>
                  <span className={`badge bg-${getMovementBadgeColor(activity.movement_type)}`}>{activity.movement_type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

function getMovementBadgeColor(type: string): string {
  switch (type) {
    case 'RECEIPT': return 'success';
    case 'ISSUE': return 'secondary';
    case 'TRANSFER': return 'info';
    case 'ADJUSTMENT': return 'warning';
    case 'RETURN': return 'primary';
    default: return 'secondary';
  }
}

export default Dashboard;
