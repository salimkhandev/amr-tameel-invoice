'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2, Shield, User as UserIcon, Lock, Unlock, ArrowRight, ArrowLeft } from 'lucide-react';

interface User {
  id: string;
  username: string;
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

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [newUser, setNewUser] = useState({
    full_name: '',
    username: '',
    password: '',
    role: 'user'
  });

  // Edit user form state
  const [editUser, setEditUser] = useState({
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
          setCurrentStep(1);
          setNewUser({ full_name: '', username: '', password: '', role: 'user' });
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
          setEditUser({ full_name: '', role: 'user', is_active: true, password: '' });
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
      full_name: user.full_name || '',
      role: user.role,
      is_active: user.is_active,
      password: ''
    });
    setShowEditModal(true);
  };

  const nextStep = () => {
    if (currentStep === 1 && !newUser.full_name.trim()) {
      alert('Please enter full name');
      return;
    }
    if (currentStep === 2 && (!newUser.username.trim() || !newUser.password.trim())) {
      alert('Please enter username and password');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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
        <div className="text-xs text-gray-500">
          Seed users (like default admin) are hidden
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setCurrentStep(1);
          }}
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
          <p className="text-xs text-gray-400 mt-2">Note: Seed users (like the default admin) are hidden from this list.</p>
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
                    {user.full_name || 'No name'}
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
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-step Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-cairo">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-[#204978] text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg">Add New User</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setCurrentStep(1);
                  setNewUser({ full_name: '', username: '', password: '', role: 'user' });
                }}
                className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10"
              >
                ×
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-[#204978]' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 1 ? 'bg-[#204978] text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="text-xs font-semibold">Name</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-[#204978]' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-[#204978]' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 2 ? 'bg-[#204978] text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="text-xs font-semibold">Credentials</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-[#204978]' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-[#204978]' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 3 ? 'bg-[#204978] text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="text-xs font-semibold">Role</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {/* Step 1: Full Name */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 px-4 py-2 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Username and Password */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204978]"
                      placeholder="Enter username"
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
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 px-4 py-2 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Role Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
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
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg transition-colors"
                    >
                      <span>Create User</span>
                    </button>
                  </div>
                </div>
              )}
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
