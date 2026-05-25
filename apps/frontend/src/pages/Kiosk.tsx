import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Keypad } from '../components/Keypad';
import { Clock, Maximize2, Minimize2, CheckCircle, XCircle } from 'lucide-react';

export const Kiosk: React.FC = () => {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSubmit = async () => {
    if (!dni) return;

    try {
      const res = await axios.post('http://localhost:3000/api/attendance/register', {
        dni,
      });
      const { type, user } = res.data.data;
      const tipoTexto = type === 'CHECK_IN' ? 'ENTRADA' : 'SALIDA';
      setFeedback({
        status: 'success',
        message: `${user.firstName} ${user.lastName}\n${tipoTexto} registrada con éxito`,
      });
      setDni('');
    } catch (err: any) {
      setFeedback({
        status: 'error',
        message: err.response?.data?.message || 'Error al conectar con el servidor',
      });
    }

    setTimeout(() => {
      setFeedback({ status: null, message: '' });
    }, 4000);
  };

  const formatearFecha = () => {
    return time.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
/*<button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 text-sm transition"
        >
          Admin
        </button>*/

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 select-none relative overflow-hidden">
      <div className="flex justify-between items-start">
        <button
          onClick={toggleFullscreen}
          className="p-3 bg-slate-900 hover:bg-slate-800 rounded-full text-slate-400 transition"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

  
      </div>

      <div className="text-center mt-10">
        <Clock className="mx-auto text-emerald-500 mb-2 animate-pulse" size={48} />
        <h1 className="text-6xl font-extrabold tracking-wider">
          {time.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
        </h1>
        <p className="text-slate-400 mt-2 text-lg capitalize">{formatearFecha()}</p>
      </div>

      <div className="my-auto max-w-md w-full mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">Registro de Asistencia</h2>
            <p className="text-slate-400 text-sm">
              Ingrese su número de DNI para marcar
            </p>
          </div>

          <div className="h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-4xl font-mono tracking-widest text-emerald-400 border border-slate-800">
            {dni || '\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014'}
          </div>

          <Keypad value={dni} onChange={setDni} onSubmit={handleSubmit} />
        </div>
      </div>

      <div />
      {feedback.status && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-6 animate-fade-in ${
            feedback.status === 'success'
              ? 'bg-emerald-950 text-emerald-100'
              : 'bg-rose-950 text-rose-100'
          }`}
        >
          {feedback.status === 'success' ? (
            <CheckCircle size={120} className="mb-6 animate-bounce" />
          ) : (
            <XCircle size={120} className="mb-6 animate-shake" />
          )}
          <p className="text-3xl md:text-4xl font-black whitespace-pre-line leading-relaxed px-4">
            {feedback.message}
          </p>
        </div>
      )}
    </div>
  );
};
