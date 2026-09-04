import { useEffect, useMemo, useState } from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { authService } from '../services/auth';
import { usersService } from '../services/users';
import {
  permissionsService,
  Permission,
} from '../services/permissions';

interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  status: string;
  role_id?: string;
}

const MODULE_ORDER = [
  'DASHBOARD',
  'ARTICLES',
  'CATEGORIES',
  'STOCK',
  'SUPPLIERS',
  'MOVEMENTS',
  'REQUESTS',
  'INVENTORY',
  'USERS',
  'REPORT',
  'AUDIT',
  'NOTIFICATIONS',
];

const MODULE_LABELS: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  ARTICLES: 'Articles',
  CATEGORIES: 'Categories',
  STOCK: 'Stock',
  SUPPLIERS: 'Suppliers',
  MOVEMENTS: 'Movements',
  REQUESTS: 'Requests',
  INVENTORY: 'Physical Inventory',
  USERS: 'Users',
  REPORT: 'Reports',
  AUDIT: 'Audit Logs',
  NOTIFICATIONS: 'Notifications',
};

function getModule(permissionName: string): string {
  return permissionName.split('_')[0];
}

function formatPermissionName(name: string): string {
  const parts = name.split('_');

  if (parts.length === 1) {
    return name;
  }

  return parts.slice(1).join(' ');
}

export default function Permissions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /*
   * Récupère ?user=xxxxxxxx depuis l'URL.
   *
   * Exemple :
   * /permissions?user=123456
   */
  const userIdFromUrl = searchParams.get('user');

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(
    userIdFromUrl || ''
  );

  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPermissions, setLoadingPermissions] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /*
   * Vérification ADMIN
   */
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser =
          await authService.getCurrentUser();

        if (currentUser.role_name !== 'ADMIN') {
          navigate('/dashboard', {
            replace: true,
          });
        }
      } catch {
        navigate('/login', {
          replace: true,
        });
      }
    };

    checkAdmin();
  }, [navigate]);

  /*
   * Si l'URL change :
   *
   * /permissions?user=AAA
   * /permissions?user=BBB
   *
   * on sélectionne automatiquement le nouvel utilisateur.
   */
  useEffect(() => {
    if (userIdFromUrl) {
      setSelectedUserId(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  /*
   * Chargement des utilisateurs
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError('');

        const data = await usersService.list();

        setUsers(data);

        /*
         * Si un utilisateur est indiqué dans l'URL
         * et qu'il existe, on le sélectionne.
         */
        if (
          userIdFromUrl &&
          data.some(
            (user: User) => user.id === userIdFromUrl
          )
        ) {
          setSelectedUserId(userIdFromUrl);
        }
        /*
         * Sinon, on sélectionne le premier utilisateur.
         */
        else if (data.length > 0) {
          setSelectedUserId(data[0].id);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ||
            'Impossible de charger les utilisateurs.'
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [userIdFromUrl]);

  /*
   * Chargement des permissions de l'utilisateur sélectionné
   */
  useEffect(() => {
    if (!selectedUserId) {
      setPermissions([]);
      return;
    }

    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);
        setError('');
        setSuccess('');

        const data =
          await permissionsService.getUserPermissions(
            selectedUserId
          );

        setPermissions(data.permissions);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ||
            'Impossible de charger les permissions.'
        );
      } finally {
        setLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [selectedUserId]);

  /*
   * Regrouper les permissions par module
   */
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};

    permissions.forEach((permission) => {
      const module = getModule(permission.name);

      if (!groups[module]) {
        groups[module] = [];
      }

      groups[module].push(permission);
    });

    return groups;
  }, [permissions]);

  /*
   * Activer / désactiver une permission
   */
  const togglePermission = (
    permissionId: string
  ) => {
    setPermissions((current) =>
      current.map((permission) =>
        permission.id === permissionId
          ? {
              ...permission,
              assigned: !permission.assigned,
            }
          : permission
      )
    );

    setSuccess('');
  };

  /*
   * Activer / désactiver toutes les permissions
   * d'un module
   */
  const toggleModule = (module: string) => {
    const modulePermissions =
      groupedPermissions[module] || [];

    const allSelected =
      modulePermissions.length > 0 &&
      modulePermissions.every(
        (permission) => permission.assigned
      );

    const moduleIds = new Set(
      modulePermissions.map(
        (permission) => permission.id
      )
    );

    setPermissions((current) =>
      current.map((permission) =>
        moduleIds.has(permission.id)
          ? {
              ...permission,
              assigned: !allSelected,
            }
          : permission
      )
    );

    setSuccess('');
  };

  /*
   * Enregistrer les permissions
   */
  const savePermissions = async () => {
    if (!selectedUserId) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const permissionIds = permissions
        .filter(
          (permission) => permission.assigned
        )
        .map((permission) => permission.id);

      const data =
        await permissionsService.updateUserPermissions(
          selectedUserId,
          permissionIds
        );

      setPermissions(data.permissions);

      setSuccess(
        'Les permissions ont été enregistrées avec succès.'
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          'Impossible d’enregistrer les permissions.'
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedUser = users.find(
    (user) => user.id === selectedUserId
  );

  const assignedCount = permissions.filter(
    (permission) => permission.assigned
  ).length;

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Gestion des accès
          </h2>

          <p className="text-muted mb-0">
            Configurez les permissions de chaque utilisateur.
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/users')}
        >
          ← Retour aux utilisateurs
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* User selection */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <div className="row align-items-end">

            <div className="col-md-6">

              <label className="form-label fw-semibold">
                Utilisateur
              </label>

              {loadingUsers ? (
                <div className="text-muted">
                  Chargement des utilisateurs...
                </div>
              ) : (
                <select
                  className="form-select"
                  value={selectedUserId}
                  onChange={(event) => {
                    const userId =
                      event.target.value;

                    setSelectedUserId(userId);

                    /*
                     * Met également à jour l'URL.
                     */
                    if (userId) {
                      navigate(
                        `/permissions?user=${userId}`,
                        { replace: true }
                      );
                    } else {
                      navigate(
                        '/permissions',
                        { replace: true }
                      );
                    }
                  }}
                >
                  <option value="">
                    Sélectionner un utilisateur
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.full_name ||
                        user.username}{' '}
                      — {user.email}
                    </option>
                  ))}
                </select>
              )}

            </div>

            {selectedUser && (
              <div className="col-md-6 mt-3 mt-md-0">

                <div className="border rounded p-3 bg-light">

                  <div className="fw-semibold">
                    {selectedUser.full_name ||
                      selectedUser.username}
                  </div>

                  <div className="text-muted small">
                    {selectedUser.email}
                  </div>

                  <div className="mt-2">

                    <span className="badge bg-primary">
                      {assignedCount} permission
                      {assignedCount > 1
                        ? 's'
                        : ''}{' '}
                      active
                    </span>

                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Permissions */}
      {selectedUserId && (
        <>
          {loadingPermissions ? (

            <div className="text-center py-5">

              <div
                className="spinner-border"
                role="status"
              >
                <span className="visually-hidden">
                  Chargement...
                </span>
              </div>

              <p className="text-muted mt-3">
                Chargement des permissions...
              </p>

            </div>

          ) : (
            <>

              {permissions.length === 0 ? (

                <div className="alert alert-warning">
                  Aucune permission disponible.
                </div>

              ) : (

                <div className="row g-4">

                  {Object.keys(groupedPermissions)
                    .sort((a, b) => {
                      const indexA =
                        MODULE_ORDER.indexOf(a);

                      const indexB =
                        MODULE_ORDER.indexOf(b);

                      if (
                        indexA === -1 &&
                        indexB === -1
                      ) {
                        return a.localeCompare(b);
                      }

                      if (indexA === -1) {
                        return 1;
                      }

                      if (indexB === -1) {
                        return -1;
                      }

                      return indexA - indexB;
                    })
                    .map((module) => {

                      const modulePermissions =
                        groupedPermissions[module];

                      const allSelected =
                        modulePermissions.length > 0 &&
                        modulePermissions.every(
                          (permission) =>
                            permission.assigned
                        );

                      return (
                        <div
                          className="col-12 col-md-6 col-xl-4"
                          key={module}
                        >

                          <div className="card h-100 shadow-sm">

                            <div className="card-header d-flex justify-content-between align-items-center">

                              <span className="fw-semibold">
                                {MODULE_LABELS[module] ||
                                  module}
                              </span>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  toggleModule(module)
                                }
                              >
                                {allSelected
                                  ? 'Tout retirer'
                                  : 'Tout sélectionner'}
                              </button>

                            </div>

                            <div className="card-body">

                              {modulePermissions.map(
                                (permission) => (

                                  <div
                                    className="form-check mb-3"
                                    key={permission.id}
                                  >

                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`permission-${permission.id}`}
                                      checked={
                                        permission.assigned
                                      }
                                      onChange={() =>
                                        togglePermission(
                                          permission.id
                                        )
                                      }
                                    />

                                    <label
                                      className="form-check-label"
                                      htmlFor={`permission-${permission.id}`}
                                    >

                                      <span className="fw-medium">
                                        {formatPermissionName(
                                          permission.name
                                        )}
                                      </span>

                                      {permission.description && (
                                        <small className="d-block text-muted">
                                          {
                                            permission.description
                                          }
                                        </small>
                                      )}

                                    </label>

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        </div>
                      );
                    })}

                </div>

              )}

              {/* Save */}
              <div className="d-flex justify-content-end mt-4">

                <button
                  className="btn btn-primary px-4"
                  onClick={savePermissions}
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les permissions'
                  )}

                </button>

              </div>

            </>
          )}
        </>
      )}

    </div>
  );
}