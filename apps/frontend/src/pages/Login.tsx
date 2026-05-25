import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LoginResponse } from '../types';
import { LogIn, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email requerido').email('Email inválido'),
  password: z.string().min(1, 'Password requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>('/auth/login', data);
      const { token, user } = res.data.data;
      login(token, user);
      navigate('/admin');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center text-slate-400 hover:text-white mb-6 transition">
          <ArrowLeft size={20} className="mr-2" />
          Volver al Kiosko
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-emerald-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-emerald-400" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
            <p className="text-slate-400 text-sm mt-1">Ingrese sus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="bg-rose-950/50 border border-rose-800 rounded-xl p-3 text-rose-300 text-sm text-center">{serverError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input type="email" {...register('email')} placeholder="admin@attendance.com"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition ${errors.email ? 'border-rose-500' : 'border-slate-800'}`} />
              {errors.email && <p className="text-rose-400 text-xs mt-1 animate-fade-in">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
              <input type="password" {...register('password')} placeholder="••••••••"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition ${errors.password ? 'border-rose-500' : 'border-slate-800'}`} />
              {errors.password && <p className="text-rose-400 text-xs mt-1 animate-fade-in">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center">
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
