import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../services/users';
import { User } from '../types';

export default function Users() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
    setAvatarPreview(null);
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

  const handleEdit = (user: User) => {
    setEditingUser(user);

    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      password: '',
      role_id: user.role_id || '',
    });
    setAvatarPreview(user.avatar_url || null);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingUser) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const updatedUser = await usersService.uploadAvatar(editingUser.id, file);
      setAvatarPreview(updatedUser.avatar_url || null);
      setEditingUser(updatedUser);
      alert('Avatar uploaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload avatar';
      alert(message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!editingUser) return;

    if (!window.confirm('Are you sure you want to delete this avatar?')) {
      return;
    }

    try {
      const updatedUser = await usersService.deleteAvatar(editingUser.id);
      setAvatarPreview(null);
      setEditingUser(updatedUser);
      alert('Avatar deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete avatar';
      alert(message);
    }
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
                <th>Avatar</th>
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
                    colSpan={7}
                    className="text-center py-4 text-muted"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {u.avatar_url ? (
                        <img
                          src={`http://localhost:8000${u.avatar_url}`}
                          alt={u.username}
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                          style={{ width: '40px', height: '40px', fontSize: '14px' }}
                        >
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
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

                  {/* Avatar */}
                  {editingUser && (
                    <div className="mb-3">
                      <label className="form-label">Avatar</label>
                      {avatarPreview ? (
                        <div className="border rounded p-3 text-center">
                          <img
                            src={`http://localhost:8000${avatarPreview}`}
                            alt="Avatar"
                            className="rounded-circle mb-2"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={handleAvatarDelete}
                              disabled={uploadingAvatar}
                            >
                              Delete Avatar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border rounded p-3 text-center">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="form-control"
                          />
                          <small className="text-muted">
                            Max size: 5MB. Formats: JPEG, PNG, WebP, GIF
                          </small>
                        </div>
                      )}
                      {uploadingAvatar && (
                        <div className="text-center mt-2">
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span className="ms-2">Uploading...</span>
                        </div>
                      )}
                    </div>
                  )}
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