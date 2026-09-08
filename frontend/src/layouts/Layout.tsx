import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import api, { API_ORIGIN } from '../services/api';
import { authService } from '../services/auth';
import {
  LayoutDashboard,
  Package,
  Tag,
  ClipboardList,
  Building2,
  Warehouse,
  MapPin,
  Map,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface MenuItem {
  path?: string;
  label?: string;
  icon?: React.ReactNode;
  header?: string;
  permission?: string;
  adminOnly?: boolean;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  /*
   * Chargement de l'utilisateur connecté
   */
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();

        setCurrentUser(user);
      } catch {
        authService.logout();
        navigate('/login', { replace: true });
      } finally {
        setLoadingUser(false);
      }
    };

    loadCurrentUser();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  /*
   * Menu de l'application
   *
   * Chaque page possède maintenant une permission.
   */
  const menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      permission: 'DASHBOARD_READ',
    },

    {
      header: 'INVENTORY',
    },

    {
      path: '/inventory/articles',
      label: 'Articles',
      icon: <Package size={20} />,
      permission: 'ARTICLES_READ',
    },

    {
      path: '/inventory/stock',
      label: 'Stock',
      icon: <ClipboardList size={20} />,
      permission: 'STOCK_READ',
    },

    {
      path: '/categories',
      label: 'Categories',
      icon: <Tag size={20} />,
      permission: 'CATEGORIES_READ',
    },

    {
      header: 'MOVEMENTS',
    },

    {
      path: '/movements',
      label: 'Movements',
      icon: <ClipboardList size={20} />,
      permission: 'MOVEMENTS_READ',
    },

    {
      path: '/requests',
      label: 'Requests',
      icon: <ClipboardList size={20} />,
      permission: 'REQUEST_READ',
    },

    {
      header: 'INVENTORY',
    },

    {
      path: '/inventories',
      label: 'Physical Inventory',
      icon: <LayoutDashboard size={20} />,
      permission: 'INVENTORY_READ',
    },

    {
      header: 'SUPPLIERS',
    },

    {
      path: '/suppliers',
      label: 'Suppliers',
      icon: <Building2 size={20} />,
      permission: 'SUPPLIERS_READ',
    },

    {
      header: 'ORGANIZATION',
    },

    {
      path: '/organization/sites',
      label: 'Sites',
      icon: <Building2 size={20} />,
      permission: 'SITES_READ',
    },

    {
      path: '/organization/warehouses',
      label: 'Warehouses',
      icon: <Warehouse size={20} />,
      permission: 'WAREHOUSES_READ',
    },

    {
      path: '/organization/zones',
      label: 'Zones',
      icon: <MapPin size={20} />,
      permission: 'ZONES_READ',
    },

    {
      path: '/organization/locations',
      label: 'Locations',
      icon: <Map size={20} />,
      permission: 'LOCATIONS_READ',
    },

    {
      header: 'ADMINISTRATION',
    },

    {
      path: '/users',
      label: 'Users',
      icon: <Users size={20} />,
      permission: 'USERS_READ',
    },

    {
      path: '/permissions',
      label: 'Permissions',
      icon: <Settings size={20} />,
      adminOnly: true,
    },

    {
      path: '/reports',
      label: 'Reports',
      icon: <LayoutDashboard size={20} />,
      permission: 'REPORT_READ',
    },

    {
      path: '/audit-logs',
      label: 'Audit Logs',
      icon: <ClipboardList size={20} />,
      permission: 'AUDIT_READ',
    },

    {
      path: '/notifications',
      label: 'Notifications',
      icon: <Settings size={20} />,
    },
  ];

  /*
   * Vérifie si l'utilisateur peut voir une entrée du menu.
   */
  const canSeeMenuItem = (item: MenuItem): boolean => {
    if (!currentUser) {
      return false;
    }

    /*
     * ADMIN voit tout.
     */
    if (currentUser.role_name === 'ADMIN') {
      return true;
    }

    /*
     * Page réservée aux ADMIN.
     */
    if (item.adminOnly) {
      return false;
    }

    /*
     * Notifications accessibles à tous
     * les utilisateurs authentifiés.
     */
    if (!item.permission) {
      return true;
    }

    /*
     * Permissions de l'utilisateur.
     */
    const permissions: string[] =
      currentUser.permissions || [];

    return permissions.includes(item.permission);
  };

  /*
   * Filtrer les éléments du menu.
   *
   * Les headers sont affichés uniquement s'ils
   * contiennent au moins une page accessible.
   */
  const visibleMenuItems = menuItems.filter(
    (item, index) => {
      if (!item.header) {
        return canSeeMenuItem(item);
      }

      /*
       * Cherche la prochaine page après le header.
       */
      for (
        let i = index + 1;
        i < menuItems.length;
        i++
      ) {
        const nextItem = menuItems[i];

        if (nextItem.header) {
          break;
        }

        if (canSeeMenuItem(nextItem)) {
          return true;
        }
      }

      return false;
    }
  );

  /*
   * Évite d'afficher le Layout pendant
   * la récupération de l'utilisateur.
   */
  if (loadingUser) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
          />

          <div className="mt-3 text-muted">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex"
      style={{ minHeight: '100vh' }}
    >

      {/* Sidebar */}
      <div
        className={`bg-dark text-white ${sidebarOpen ? 'col-md-2' : 'col-auto'
          } d-flex flex-column`}
        style={{
          minWidth: sidebarOpen
            ? '250px'
            : '60px',
          transition: 'width 0.3s',
        }}
      >

        {/* Logo */}
        <div
          className="p-3 border-bottom border-secondary"
          style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "flex-center" : "center",
            gap: "10px",
          }}
        >
          <img
            src="/assets/logo-ocp-1.png"
            alt="OCP Logo"
            style={{
              width: "42px",
              height: "42px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />

          {sidebarOpen && (
            <span
              style={{
                fontSize: "23px",
                fontFamily: "'Roboto Condensed', sans-serif",
                fontWeight: "500",
                lineHeight: "1",
                letterSpacing: "1px",
              }}
            >
              OCP
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 py-3">

          {visibleMenuItems.map(
            (item, index) => {

              /*
               * Section header
               */
              if (item.header) {
                return (
                  <div
                    key={`header-${index}`}
                    className={`px-3 py-2 text-muted small fw-bold ${!sidebarOpen
                      ? 'd-none'
                      : ''
                      }`}
                  >
                    {item.header}
                  </div>
                );
              }

              /*
               * Menu item
               */
              const isActive =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`d-flex align-items-center px-3 py-2 text-decoration-none ${isActive
                    ? 'bg-primary text-white'
                    : 'text-white hover-bg-secondary'
                    }`}
                  style={{
                    transition:
                      'background-color 0.2s',
                  }}
                >

                  <span className="fs-5">
                    {item.icon}
                  </span>

                  <span
                    className={`ms-2 ${!sidebarOpen
                      ? 'd-none'
                      : ''
                      }`}
                  >
                    {item.label}
                  </span>

                </Link>
              );
            }
          )}

        </nav>

        {/* Logout */}
        <div className="p-3 border-top border-secondary">

          <button
            onClick={handleLogout}
            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <LogOut size={16} />
            <span className={!sidebarOpen ? 'd-none' : ''}>Logout</span>
          </button>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">

        {/* Header */}
        <header className="bg-white shadow-sm p-3 d-flex align-items-center justify-content-between">

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="d-flex align-items-center gap-3">

            {currentUser && (
              <div className="d-flex align-items-center gap-2">
                {currentUser.avatar_url ? (
                  <img
                    src={`${API_ORIGIN}${currentUser.avatar_url}`}
                    alt={currentUser.username}
                    className="rounded-circle"
                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                    style={{ width: '32px', height: '32px', fontSize: '12px' }}
                  >
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="fw-semibold">
                  {currentUser.full_name ||
                    currentUser.username}
                </span>
              </div>
            )}

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