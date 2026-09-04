import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../services/users';

export default function Users() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role_id: '',
  });

  const load = () => {
    usersService.list().then(setRows);
    usersService.roles().then(setRoles);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      full_name: '',
      password: '',
      role_id: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await usersService.update(editingUser.id, {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          role_id: formData.role_id || null,
        });
      } else {
        await usersService.create({
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          role_id: formData.role_id || null,
        });
      }

      setShowModal(false);
      resetForm();
      load();
    } catch (error: any) {
      alert(
        error?.response?.data?.detail ||
          'An error occurred while saving the user.'
      );
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);

    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      password: '',
      role_id: user.role_id || '',
    });

    setShowModal(true);
  };

  const handleDisable = async (id: string) => {
    if (confirm('Are you sure you want to disable this user?')) {
      try {
        await usersService.disable(id);
        load();
      } catch (error: any) {
        alert(
          error?.response?.data?.detail ||
            'Unable to disable this user.'
        );
      }
    }
  };

  const handleAddUser = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Users</h2>

        <button
          className="btn btn-primary"
          onClick={handleAddUser}
        >
          Add User
        </button>
      </div>

      {/* Users table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-muted"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>

                    <td>{u.full_name || '-'}</td>

                    <td>{u.email}</td>

                    <td>
                      <span
                        className={`badge ${
                          u.status === 'ACTIVE'
                            ? 'bg-success'
                            : 'bg-secondary'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td>
                      {roles.find(
                        (r: any) => r.id === u.role_id
                      )?.name || '-'}
                    </td>

                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {/* Edit */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(u)}
                        >
                          Edit
                        </button>

                        {/* Manage permissions */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            navigate(
                              `/permissions?user=${u.id}`
                            )
                          }
                        >
                          Gérer les accès
                        </button>

                        {/* Disable */}
                        {u.status === 'ACTIVE' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDisable(u.id)
                            }
                          >
                            Disable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">

              {/* Modal header */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser
                    ? 'Edit User'
                    : 'Add User'}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="modal-body">

                  {/* Username */}
                  <div className="mb-3">
                    <label className="form-label">
                      Username
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value,
                        })
                      }
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* Full name */}
                  <div className="mb-3">
                    <label className="form-label">
                      Full Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          full_name: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Password */}
                  {!editingUser && (
                    <div className="mb-3">
                      <label className="form-label">
                        Password
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  )}

                  {/* Role */}
                  <div className="mb-3">
                    <label className="form-label">
                      Role
                    </label>

                    <select
                      className="form-select"
                      value={formData.role_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role_id: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Select Role
                      </option>

                      {roles.map((r) => (
                        <option
                          key={r.id}
                          value={r.id}
                        >
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingUser
                      ? 'Update'
                      : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}