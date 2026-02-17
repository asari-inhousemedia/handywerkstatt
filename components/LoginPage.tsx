import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Logo from './Logo.tsx';
import { Lock } from 'lucide-react';

const SUPABASE_URL = "https://ikdlhrrjingkrddwbmuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_LKjR1Q0Lqf_ygoBuJVoumg_zr5IHLDG";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check password against database setting
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "admin_password")
        .single();

      if (error) throw error;

      if (!data || data.value !== password) {
        setError('Ungültiges Kennwort');
        setLoading(false);
        return;
      }

      // Success
      onLogin();
    } catch (err) {
      console.error(err);
      // Fallback: Check against daily reset code if admin password not set or error
      // This is a temporary fallback, ideally admin_password should be set
      const { data: resetData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "daily_reset_code")
        .single();

      if (resetData && resetData.value === password) {
        onLogin();
      } else {
        setError('Login fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <div className="flex justify-center mb-8">
          <Logo className="h-16" />
        </div>

        <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Admin Login</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Bitte authentifizieren Sie sich</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Kennwort"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-[#99bc1c]/20 transition-all"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full bg-[#99bc1c] text-black py-4 rounded-2xl font-black uppercase text-lg hover:bg-[#88a818] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Prüfe...' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => window.open('/#/display', '_blank')} className="text-gray-400 text-xs font-bold hover:text-gray-600 uppercase tracking-widest">
            Zum Monitor
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;