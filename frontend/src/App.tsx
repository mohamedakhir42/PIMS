import React from 'react'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory/articles" element={<Articles />} />
          <Route path="inventory/articles/:id" element={<ArticleDetail />} />
          <Route path="inventory/stock" element={<Stock />} />
          <Route path="categories" element={<Categories />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="movements" element={<Movements />} />
          <Route path="users" element={<Users />} />
          <Route path="inventories" element={<Inventories />} />
          <Route path="inventories/:id" element={<InventoryDetail />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="requests" element={<Requests />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
