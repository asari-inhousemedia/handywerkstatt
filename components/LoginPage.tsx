import React, { useState } from 'react';
import Logo from './Logo.tsx';

interface LoginPageProps {
  onLogin: (password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setError('');
    } else {
      setError('Falsches Passwort');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-[2rem] shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <Logo className="h-16 mb-4" />
          <h1 className="text-xl font-bold text-[#575756] uppercase tracking-wider">Werkstatt Zugang</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#99bc1c] outline-none font-bold text-lg"
            placeholder="Passwort"
            required
          />
          {error && <div className="text-rose-500 text-sm font-bold text-center">{error}</div>}
          <button type="submit" className="w-full bg-[#99bc1c] text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm">Anmelden</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;