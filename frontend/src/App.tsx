import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Stock from './pages/Stock'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import SupplierDetail from './pages/SupplierDetail'
import Movements from './pages/Movements'
import Users from './pages/Users'
import Inventories from './pages/Inventories'
import InventoryDetail from './pages/InventoryDetail'
import Reports from './pages/Reports'
import AuditLogs from './pages/AuditLogs'
import Requests from './pages/Requests'
import Notifications from './pages/Notifications'
import Layout from './layouts/Layout'
import Permissions from './pages/Permissions'
import ProtectedRoute from './components/ProtectedRoute'
import Sites from './pages/Sites'
import Warehouses from './pages/Warehouses'
import Zones from './pages/Zones'
import Locations from './pages/Locations'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute requiredPermission="DASHBOARD_READ"><Dashboard /></ProtectedRoute>} />
          <Route path="inventory/articles" element={<ProtectedRoute requiredPermission="ARTICLES_READ"><Articles /></ProtectedRoute>} />
          <Route path="inventory/articles/:id" element={<ProtectedRoute requiredPermission="ARTICLES_READ"><ArticleDetail /></ProtectedRoute>} />
          <Route path="inventory/stock" element={<ProtectedRoute requiredPermission="STOCK_READ"><Stock /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute requiredPermission="CATEGORIES_READ"><Categories /></ProtectedRoute>} />
          <Route path="suppliers" element={<ProtectedRoute requiredPermission="SUPPLIERS_READ"><Suppliers /></ProtectedRoute>} />
          <Route path="suppliers/:id" element={<ProtectedRoute requiredPermission="SUPPLIERS_READ"><SupplierDetail /></ProtectedRoute>} />
          <Route path="movements" element={<ProtectedRoute requiredPermission="STOCK_READ"><Movements /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute requiredPermission="USERS_READ"><Users /></ProtectedRoute>} />
          <Route path="inventories" element={<ProtectedRoute requiredPermission="INVENTORY_READ"><Inventories /></ProtectedRoute>} />
          <Route path="inventories/:id" element={<ProtectedRoute requiredPermission="INVENTORY_READ"><InventoryDetail /></ProtectedRoute>} />
          <Route path="permissions" element={<ProtectedRoute requiredPermission="PERMISSIONS_READ"><Permissions /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute requiredPermission="REPORT_READ"><Reports /></ProtectedRoute>} />
          <Route path="audit-logs" element={<ProtectedRoute requiredPermission="AUDIT_READ"><AuditLogs /></ProtectedRoute>} />
          <Route path="requests" element={<ProtectedRoute requiredPermission="REQUEST_READ"><Requests /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="organization/sites" element={<ProtectedRoute requiredPermission="SITES_READ"><Sites /></ProtectedRoute>} />
          <Route path="organization/warehouses" element={<ProtectedRoute requiredPermission="WAREHOUSES_READ"><Warehouses /></ProtectedRoute>} />
          <Route path="organization/zones" element={<ProtectedRoute requiredPermission="ZONES_READ"><Zones /></ProtectedRoute>} />
          <Route path="organization/locations" element={<ProtectedRoute requiredPermission="LOCATIONS_READ"><Locations /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
