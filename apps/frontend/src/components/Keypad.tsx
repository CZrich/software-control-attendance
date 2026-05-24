import React from 'react';
import { Delete, Check } from 'lucide-react';

interface KeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ value, onChange, onSubmit }) => {
  const handlePress = (char: string) => {
    if (value.length < 12) {
      onChange(value + char);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => handlePress(num.toString())}
          className="h-16 w-full text-2xl font-bold bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition rounded-2xl shadow-lg border border-slate-700"
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        onClick={handleDelete}
        className="h-16 w-full flex items-center justify-center bg-rose-900/40 text-rose-200 hover:bg-rose-900/60 active:scale-95 transition rounded-2xl border border-rose-800"
      >
        <Delete size={24} />
      </button>
      <button
        type="button"
        onClick={() => handlePress('0')}
        className="h-16 w-full text-2xl font-bold bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition rounded-2xl shadow-lg border border-slate-700"
      >
        0
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={value.length === 0}
        className="h-16 w-full flex items-center justify-center bg-emerald-600 disabled:opacity-50 text-white hover:bg-emerald-500 active:scale-95 transition rounded-2xl shadow-lg font-bold"
      >
        <Check size={28} />
      </button>
    </div>
  );
};
