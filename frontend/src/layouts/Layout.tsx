import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { header: 'INVENTORY' },
    { path: '/inventory/articles', label: 'Articles', icon: '📦' },
    { path: '/inventory/stock', label: 'Stock', icon: '📋' },
    { path: '/categories', label: 'Categories', icon: '🏷️' },
    { header: 'MOVEMENTS' },
    { path: '/movements', label: 'Movements', icon: '🔄' },
    { header: 'SUPPLIERS' },
    { path: '/suppliers', label: 'Suppliers', icon: '🏭' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div
        className={`bg-dark text-white ${sidebarOpen ? 'col-md-2' : 'col-auto'} d-flex flex-column`}
        style={{ minWidth: sidebarOpen ? '250px' : '60px', transition: 'width 0.3s' }}
      >
        <div className="p-3 border-bottom border-secondary">
          <h5 className={`mb-0 ${!sidebarOpen && 'd-none'}`}>PIMS</h5>
          <span className={`small ${!sidebarOpen && 'd-none'}`}>Phosboucraa Inventory</span>
        </div>
        
        <nav className="flex-grow-1 py-3">
          {menuItems.map((item, index) => {
            if (item.header) {
              return (
                <div
                  key={index}
                  className={`px-3 py-2 text-muted small fw-bold ${!sidebarOpen && 'd-none'}`}
                >
                  {item.header}
                </div>
              );
            }
            
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`d-flex align-items-center px-3 py-2 text-decoration-none ${
                  isActive ? 'bg-primary text-white' : 'text-white hover-bg-secondary'
                }`}
                style={{ transition: 'background-color 0.2s' }}
              >
                <span className="fs-5">{item.icon}</span>
                <span className={`ms-2 ${!sidebarOpen && 'd-none'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-top border-secondary">
          <button
            onClick={handleLogout}
            className="btn btn-outline-light btn-sm w-100"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <header className="bg-white shadow-sm p-3 d-flex align-items-center justify-content-between">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted">Phosboucraa Inventory Management</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
