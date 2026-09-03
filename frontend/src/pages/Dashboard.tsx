import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { stockService } from '../services/stock';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard: React.FC = () => {
  const [criticalStock, setCriticalStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const critical = await stockService.getCriticalStock();
      setCriticalStock(critical);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const movementData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Receipts',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Issues',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
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
    { label: 'Total Articles', value: '8,421', color: 'primary' },
    { label: 'Total Stock', value: '154,820', color: 'success' },
    { label: 'Critical Stock', value: criticalStock.length.toString(), color: 'danger' },
    { label: 'Low Stock', value: '23', color: 'warning' },
    { label: 'Today Receipts', value: '12', color: 'info' },
    { label: 'Today Issues', value: '8', color: 'secondary' },
  ];

  if (loading) {
    return <div className="text-center py-5">Loading dashboard...</div>;
  }

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
              <h5 className="card-title mb-0">Movements by Period</h5>
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
          <h5 className="card-title mb-0">⚠️ Critical Stock Alerts</h5>
          <span className="badge bg-danger">{criticalStock.length} Items</span>
        </div>
        <div className="card-body">
          {criticalStock.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Article ID</th>
                    <th>Location ID</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalStock.slice(0, 5).map((stock) => (
                    <tr key={stock.id}>
                      <td>{stock.article_id}</td>
                      <td>{stock.location_id}</td>
                      <td className="text-danger fw-bold">{stock.quantity}</td>
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
          <h5 className="card-title mb-0">📋 Recent Activity</h5>
        </div>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>Ahmed</strong> - Issue: Roulement SKF 6205 x4
                <small className="text-muted d-block">10:42 AM</small>
              </div>
              <span className="badge bg-secondary">ISSUE</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>Youssef</strong> - Receipt: Filtre x50
                <small className="text-muted d-block">10:21 AM</small>
              </div>
              <span className="badge bg-success">RECEIPT</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>Karim</strong> - Transfer: Câble x20
                <small className="text-muted d-block">09:54 AM</small>
              </div>
              <span className="badge bg-info">TRANSFER</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
