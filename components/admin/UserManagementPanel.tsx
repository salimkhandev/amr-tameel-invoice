'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2, Shield, User as UserIcon, Lock, Unlock } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'user'
  });

  // Edit user form state
  const [editUser, setEditUser] = useState({
    email: '',
    full_name: '',
    role: 'user',
    is_active: true,
    password: ''
  });

  // Load current user and users
  useEffect(() => {
    const sessionUser = localStorage.getItem('session:user');
    const sessionToken = localStorage.getItem('session:token');
    
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
    if (sessionToken) {
      setToken(sessionToken);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin' && token) {
      loadUsers();
    }
  }, [currentUser, token]);

  const loadUsers = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          loadUsers();
          setShowAddModal(false);
          setNewUser({ username: '', password: '', email: '', full_name: '', role: 'user' });
          alert('User created successfully');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUser)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          loadUsers();
          setShowEditModal(false);
          setSelectedUser(null);
          setEditUser({ email: '', full_name: '', role: 'user', is_active: true, password: '' });
          alert('User updated successfully');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadUsers();
        alert('User deleted successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role,
      is_active: user.is_active,
      password: ''
    });
    setShowEditModal(true);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Lock className="w-5 h-5" />
          <span>Admin access required to manage users</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#204978]" />
          <h3 className="font-bold text-lg text-[#204978]">User Management</h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#204978] hover:bg-[#18365a] text-white text-sm font-bold rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No users found. Add your first user to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#204978] text-white flex items-center justify-center font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500">
                    {user.full_name || 'No name'} • {user.email || 'No email'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    user.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {user.is_active ? <Unlock className="w-3 h-3 inline" /> : <Lock className="w-3 h-3 inline" />}
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="p-2 text-gray-600 hover:text-[#204978] hover:bg-blue-50 rounded transition-colors"
                  title="Edit user"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {user.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-cairo">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-[#204978] text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg">Add New User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-cairo">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-[#204978] text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg">Edit User: {selectedUser.username}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUser.full_name}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editUser.is_active ? 'true' : 'false'}
                  onChange={(e) => setEditUser({ ...editUser, is_active: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password (leave empty to keep current)</label>
                <input
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg transition-colors"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
