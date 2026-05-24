import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, ApiResponse, Schedule } from '../types';
import { Download, Users, Clock, Plus, Edit3, Trash2, LogOut, Search, X, ToggleLeft, ToggleRight, CheckCircle, XCircle, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

interface AdminProps {
  onNavigate: (page: 'kiosk' | 'login' | 'admin') => void;
}

const userSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  dni: z.string().length(8, 'El DNI debe tener exactamente 8 caracteres').regex(/^\d+$/, 'DNI debe contener solo números'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE']).default('EMPLOYEE'),
  isActive: z.boolean().default(true),
  scheduleId: z.string().optional().nullable(),
});

const scheduleSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  checkInTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM requerido'),
  checkOutTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM requerido'),
  toleranceMinutes: z.coerce.number().int().min(0, 'Mínimo 0'),
});

const justifySchema = z.object({
  checkOut: z.string().optional().or(z.literal('')),
  justifiedAbsence: z.boolean().default(true),
  justificationReason: z.string().min(1, 'Debe proveer una razón'),
});

export const AdminDashboard: React.FC<AdminProps> = ({ onNavigate }) => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'users' | 'schedules'>('history');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // State
  const [history, setHistory] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Search / Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  // Loading
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const userForm = useForm<any>({ resolver: zodResolver(userSchema), defaultValues: { role: 'EMPLOYEE', isActive: true } });
  const scheduleForm = useForm<any>({ resolver: zodResolver(scheduleSchema), defaultValues: { toleranceMinutes: 15 } });
  const justifyForm = useForm<any>({ resolver: zodResolver(justifySchema), defaultValues: { justifiedAbsence: true } });

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.get<ApiResponse<any[]>>('/attendance/history', { params: { search, startDate, endDate } });
      setHistory(res.data.data);
    } catch (err) {
      showToast('Error al cargar historial', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [search, startDate, endDate]);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await api.get<ApiResponse<User[]>>('/users');
      setUsers(res.data.data);
    } catch (err) {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setIsLoadingSchedules(true);
    try {
      const res = await api.get<ApiResponse<Schedule[]>>('/schedules');
      setSchedules(res.data.data);
    } catch (err) {
      showToast('Error al cargar turnos', 'error');
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchHistory();
      fetchUsers();
      fetchSchedules();
    }
  }, [token, fetchHistory, fetchUsers, fetchSchedules]);

  // Handlers for User
  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      userForm.reset({ ...user, password: '', scheduleId: user.scheduleId || '' });
    } else {
      setEditingUser(null);
      userForm.reset({ firstName: '', lastName: '', dni: '', email: '', password: '', role: 'EMPLOYEE', isActive: true, scheduleId: '' });
    }
    setShowUserModal(true);
  };

  const onSubmitUser = async (data: any) => {
    try {
      const payload: any = { ...data };
      if (!payload.email) delete payload.email;
      if (!payload.password) delete payload.password;
      if (!payload.scheduleId) payload.scheduleId = null;

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        showToast('Usuario actualizado', 'success');
      } else {
        await api.post('/users', payload);
        showToast('Usuario creado', 'success');
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  // Handlers for Schedule
  const openScheduleModal = (sch?: Schedule) => {
    if (sch) {
      setEditingSchedule(sch);
      scheduleForm.reset(sch);
    } else {
      setEditingSchedule(null);
      scheduleForm.reset({ name: '', checkInTime: '08:00', checkOutTime: '17:00', toleranceMinutes: 15 });
    }
    setShowScheduleModal(true);
  };

  const onSubmitSchedule = async (data: any) => {
    try {
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id}`, data);
        showToast('Turno actualizado', 'success');
      } else {
        await api.post('/schedules', data);
        showToast('Turno creado', 'success');
      }
      setShowScheduleModal(false);
      fetchSchedules();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('¿Eliminar este turno?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      showToast('Turno eliminado', 'success');
      fetchSchedules();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error');
    }
  };

  // Handlers for Justify
  const openJustifyModal = (record: any) => {
    setEditingRecord(record);
    const coTime = record.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '';
    justifyForm.reset({ checkOut: coTime, justifiedAbsence: record.justifiedAbsence || true, justificationReason: record.justificationReason || '' });
    setShowJustifyModal(true);
  };

  const onSubmitJustify = async (data: any) => {
    try {
      const payload: any = {
        justifiedAbsence: data.justifiedAbsence,
        justificationReason: data.justificationReason
      };
      if (data.checkOut) {
        payload.checkOut = new Date(data.checkOut).toISOString();
      }
      await api.put(`/attendance/records/${editingRecord.id}`, payload);
      showToast('Registro justificado', 'success');
      setShowJustifyModal(false);
      fetchHistory();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const filteredUsers = users.filter(u => u.dni.includes(userSearch) || u.firstName.toLowerCase().includes(userSearch.toLowerCase()) || u.lastName.toLowerCase().includes(userSearch.toLowerCase()));

  if (!token) { onNavigate('login'); return null; }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Toasts */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' : 'bg-rose-950/80 border-rose-800 text-rose-200'} backdrop-blur-md`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Control de Asistencia</h1>
          <p className="text-slate-400 text-xs mt-0.5">Panel de Administración</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('kiosk')} className="text-sm font-medium text-slate-400 hover:text-white transition">Ir al Kiosko</button>
          <div className="w-px h-6 bg-slate-800" />
          <button onClick={() => { logout(); onNavigate('kiosk'); }} className="flex items-center gap-2 text-sm font-medium text-rose-400 hover:text-rose-300 transition bg-rose-400/10 hover:bg-rose-400/20 px-3 py-1.5 rounded-lg"><LogOut size={16} /> Salir</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-4 md:px-8 bg-slate-900/50 overflow-x-auto">
        <button onClick={() => setActiveTab('history')} className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 relative whitespace-nowrap ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}><Clock size={16} /> Historial Diario{activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 relative whitespace-nowrap ${activeTab === 'users' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}><Users size={16} /> Usuarios & Empleados{activeTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}</button>
        <button onClick={() => setActiveTab('schedules')} className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 relative whitespace-nowrap ${activeTab === 'schedules' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}><Calendar size={16} /> Turnos & Horarios{activeTab === 'schedules' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}</button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" placeholder="Buscar por nombre o DNI..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition text-sm" /></div>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition text-sm" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition text-sm" />
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">DNI</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">Empleado</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">Fecha</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">Entrada / Salida</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">Estado</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {isLoadingHistory ? <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div></td></tr> : history.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500"><div className="flex flex-col items-center gap-3"><Clock size={40} className="text-slate-700" /><p>No hay registros</p></div></td></tr> : history.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 font-mono text-slate-300">{rec.user.dni}</td>
                        <td className="px-6 py-4 font-medium text-white">{rec.user.firstName} {rec.user.lastName}</td>
                        <td className="px-6 py-4 text-slate-400">{rec.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-mono text-xs">{new Date(rec.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="text-slate-500">-</span>
                            {rec.checkOut ? <span className="text-rose-400 font-mono text-xs">{new Date(rec.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span> : <span className="text-slate-500 text-xs italic">Sin marcar</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {rec.isLate && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 w-fit">Tardanza ({rec.minutesLate}m)</span>}
                            {rec.justifiedAbsence && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 w-fit flex items-center gap-1"><CheckCircle size={10}/> Justificado</span>}
                            {!rec.isLate && !rec.justifiedAbsence && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 w-fit">OK</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => openJustifyModal(rec)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5"><Edit3 size={14} /> Justificar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between gap-4">
              <div className="relative flex-1 max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" placeholder="Buscar usuarios..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none transition text-sm" /></div>
              <button onClick={() => openUserModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm"><Plus size={18} /> Nuevo Usuario</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">DNI</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">Empleado</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">Rol</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase">Estado</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {isLoadingUsers ? <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div></td></tr> : filteredUsers.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Sin usuarios</td></tr> : filteredUsers.map((user) => {
                      const isEditable = user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN';
                      return (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition group">
                          <td className="px-6 py-4 font-mono text-slate-300">{user.dni}</td>
                          <td className="px-6 py-4 font-medium text-white">{user.firstName} {user.lastName}<div className="text-xs text-slate-500 font-normal">{user.email}</div></td>
                          <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">{user.role}</span></td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}><div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />{user.isActive ? 'Activo' : 'Inactivo'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isEditable ? (
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={async () => { await api.put(`/users/${user.id}`, { isActive: !user.isActive }); fetchUsers(); }} className="p-2 text-slate-400 hover:text-white rounded-lg transition" title="Cambiar Estado">{user.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}</button>
                                <button onClick={() => openUserModal(user)} className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg transition" title="Editar"><Edit3 size={18} /></button>
                                <button onClick={async () => { if(confirm('¿Eliminar?')){ await api.delete(`/users/${user.id}`); fetchUsers(); } }} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg transition" title="Eliminar"><Trash2 size={18} /></button>
                              </div>
                            ) : <span className="text-xs text-slate-500 italic">No editable</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end">
              <button onClick={() => openScheduleModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm"><Plus size={18} /> Nuevo Turno</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-xs uppercase">Nombre</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase">Entrada</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase">Salida</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase">Tolerancia</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {isLoadingSchedules ? <tr><td colSpan={5} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div></td></tr> : schedules.length === 0 ? <tr><td colSpan={5} className="py-12 text-center text-slate-500">Sin turnos</td></tr> : schedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-800/30 transition group">
                      <td className="px-6 py-4 font-medium text-white">{sch.name}</td>
                      <td className="px-6 py-4 font-mono text-emerald-400">{sch.checkInTime}</td>
                      <td className="px-6 py-4 font-mono text-rose-400">{sch.checkOutTime}</td>
                      <td className="px-6 py-4 text-slate-400">{sch.toleranceMinutes} min</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openScheduleModal(sch)} className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg"><Edit3 size={18} /></button>
                          <button onClick={() => handleDeleteSchedule(sch.id)} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingUser ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
              <button onClick={() => setShowUserModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl transition"><X size={20} /></button>
            </div>
            <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-300 mb-1">Nombres</label><input {...userForm.register('firstName')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Apellidos</label><input {...userForm.register('lastName')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /></div>
              </div>
              <div><label className="block text-sm text-slate-300 mb-1">DNI (8 dígitos)</label><input {...userForm.register('dni')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono" maxLength={8} /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Email</label><input type="email" {...userForm.register('email')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /></div>
              <div><label className="block text-sm text-slate-300 mb-1">Contraseña</label><input type="password" {...userForm.register('password')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-300 mb-1">Rol</label><select {...userForm.register('role')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white"><option value="EMPLOYEE">Empleado</option><option value="HR">RR.HH</option><option value="ADMIN">Admin</option></select></div>
                <div><label className="block text-sm text-slate-300 mb-1">Turno</label><select {...userForm.register('scheduleId')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white"><option value="">Ninguno</option>{schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-5 py-2 rounded-xl text-slate-300 hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingSchedule ? 'Editar Turno' : 'Nuevo Turno'}</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl transition"><X size={20} /></button>
            </div>
            <form onSubmit={scheduleForm.handleSubmit(onSubmitSchedule)} className="space-y-4">
              <div><label className="block text-sm text-slate-300 mb-1">Nombre del Turno</label><input {...scheduleForm.register('name')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" placeholder="Ej. Turno Mañana" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-300 mb-1">Entrada (HH:MM)</label><input type="time" {...scheduleForm.register('checkInTime')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Salida (HH:MM)</label><input type="time" {...scheduleForm.register('checkOutTime')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /></div>
              </div>
              <div><label className="block text-sm text-slate-300 mb-1">Tolerancia (minutos)</label><input type="number" {...scheduleForm.register('toleranceMinutes')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-5 py-2 rounded-xl text-slate-300 hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Justify Modal */}
      {showJustifyModal && editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><AlertCircle className="text-amber-400"/> Justificar Registro</h2>
              <button onClick={() => setShowJustifyModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl transition"><X size={20} /></button>
            </div>
            <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300">
              <p><span className="font-semibold text-white">Empleado:</span> {editingRecord.user.firstName} {editingRecord.user.lastName}</p>
              <p><span className="font-semibold text-white">Fecha:</span> {editingRecord.date}</p>
            </div>
            <form onSubmit={justifyForm.handleSubmit(onSubmitJustify)} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Forzar/Asignar Hora de Salida (Opcional)</label>
                <input type="datetime-local" {...justifyForm.register('checkOut')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" />
                <p className="text-xs text-slate-500 mt-1">Si el empleado no marcó salida, puedes registrarla manualmente aquí.</p>
              </div>
              <div className="flex items-center gap-2 mt-4 mb-2">
                <input type="checkbox" id="justifiedAbsence" {...justifyForm.register('justifiedAbsence')} className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-500" />
                <label htmlFor="justifiedAbsence" className="text-sm font-medium text-slate-300">Marcar como justificado (limpia tardanzas/faltas)</label>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Razón de la Justificación</label>
                <textarea {...justifyForm.register('justificationReason')} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" placeholder="Ej. Permiso médico, problema técnico..."></textarea>
                {justifyForm.formState.errors.justificationReason && <p className="text-rose-400 text-xs mt-1">{String(justifyForm.formState.errors.justificationReason.message)}</p>}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowJustifyModal(false)} className="px-5 py-2 rounded-xl text-slate-300 hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl">Guardar Justificación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
