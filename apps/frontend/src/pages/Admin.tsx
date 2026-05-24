import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Attendance, ApiResponse } from '../types';
import {
  Download,
  Users,
  Clock,
  Plus,
  Edit3,
  Trash2,
  LogOut,
  Search,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface AdminProps {
  onNavigate: (page: 'kiosk' | 'login' | 'admin') => void;
}

export const AdminDashboard: React.FC<AdminProps> = ({ onNavigate }) => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'users'>('history');

  // History state
  const [history, setHistory] = useState<Attendance[]>([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    dni: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE' as 'ADMIN' | 'EMPLOYEE',
    isActive: true,
  });

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Attendance[]>>('/attendance/history', {
        params: { search, startDate, endDate },
      });
      setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [search, startDate, endDate]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<User[]>>('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchHistory();
      fetchUsers();
    }
  }, [token, fetchHistory, fetchUsers]);

  const handleExportCSV = () => {
    const headers = ['DNI', 'Empleado', 'Rol', 'Tipo', 'Fecha', 'Hora'];
    const rows = history.map((att) => [
      att.user.dni,
      `${att.user.firstName} ${att.user.lastName}`,
      att.user.role === 'ADMIN' ? 'Admin' : 'Empleado',
      att.type === 'CHECK_IN' ? 'Entrada' : 'Salida',
      new Date(att.timestamp).toLocaleDateString(),
      new Date(att.timestamp).toLocaleTimeString(),
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((v) => `"${v}"`).join(','))].join(
        '\n',
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `asistencias_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setUserForm({
      dni: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'EMPLOYEE',
      isActive: true,
    });
    setShowUserModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      dni: user.dni,
      email: user.email || '',
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        dni: userForm.dni,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        role: userForm.role,
        isActive: userForm.isActive,
      };
      if (userForm.email) payload.email = userForm.email;
      if (userForm.password) payload.password = userForm.password;

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.dni.includes(userSearch) ||
      u.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.lastName.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const handleLogout = () => {
    logout();
    onNavigate('kiosk');
  };

  if (!token) {
    onNavigate('login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-emerald-400">
            Control de Asistencia
          </h1>
          <p className="text-slate-400 text-xs">Panel de Administración</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('kiosk')}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Kiosko
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-rose-400 hover:text-rose-300 transition"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-4 md:px-8">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock size={16} />
          Asistencias
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={16} />
          Usuarios
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o DNI..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition text-sm"
                  />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition text-sm"
                />
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold px-5 py-3 rounded-2xl shadow-lg transition text-sm"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-4 font-bold">DNI</th>
                      <th className="p-4 font-bold">Empleado</th>
                      <th className="p-4 font-bold">Rol</th>
                      <th className="p-4 font-bold">Tipo</th>
                      <th className="p-4 font-bold">Fecha</th>
                      <th className="p-4 font-bold">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No se encontraron registros
                        </td>
                      </tr>
                    ) : (
                      history.map((att) => (
                        <tr
                          key={att.id}
                          className="hover:bg-slate-800/40 transition"
                        >
                          <td className="p-4 font-mono">{att.user.dni}</td>
                          <td className="p-4 font-medium">
                            {att.user.firstName} {att.user.lastName}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                att.user.role === 'ADMIN'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {att.user.role === 'ADMIN' ? 'Admin' : 'Empleado'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                att.type === 'CHECK_IN'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-sky-500/10 text-sky-400'
                              }`}
                            >
                              {att.type === 'CHECK_IN' ? 'Entrada' : 'Salida'}
                            </span>
                          </td>
                          <td className="p-4">
                            {new Date(att.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-mono">
                            {new Date(att.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition text-sm"
                />
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold px-5 py-3 rounded-2xl shadow-lg transition text-sm"
              >
                <Plus size={18} />
                Nuevo Usuario
              </button>
            </div>

            <div className="grid gap-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No se encontraron usuarios
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-400">
                          DNI: {user.dni}
                          {user.email && ` | ${user.email}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              user.role === 'ADMIN'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {user.role === 'ADMIN' ? 'Admin' : 'Empleado'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              user.isActive
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className="p-2 text-slate-400 hover:text-white transition"
                        title="Activar/Desactivar"
                      >
                        {user.isActive ? (
                          <ToggleRight size={20} />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-slate-400 hover:text-emerald-400 transition"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, firstName: e.target.value })
                    }
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, lastName: e.target.value })
                    }
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  DNI
                </label>
                <input
                  type="text"
                  value={userForm.dni}
                  onChange={(e) =>
                    setUserForm({ ...userForm, dni: e.target.value })
                  }
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  placeholder={
                    editingUser
                      ? 'Dejar vacío para no cambiar'
                      : 'Mínimo 6 caracteres'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Rol
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        role: e.target.value as 'ADMIN' | 'EMPLOYEE',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition text-sm"
                  >
                    <option value="EMPLOYEE">Empleado</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={userForm.isActive ? 'true' : 'false'}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        isActive: e.target.value === 'true',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition text-sm"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-3 rounded-2xl transition text-sm"
              >
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
