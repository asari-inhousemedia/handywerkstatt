import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService.ts';
import { Order, OrderStatus } from '../types.ts';
import Logo from './Logo.tsx';
import { createClient } from "@supabase/supabase-js";
import LoginPage from './LoginPage.tsx';
import StatsDashboard from './StatsDashboard.tsx';

// Supabase
const SUPABASE_URL = "https://ikdlhrrjingkrddwbmuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_LKjR1Q0Lqf_ygoBuJVoumg_zr5IHLDG";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AdminPage: React.FC = () => {
  const [authRole, setAuthRole] = useState<'ADMIN' | 'STAFF' | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Check auth persistence
  useEffect(() => {
    const savedRole = sessionStorage.getItem('auth_role');
    if (savedRole === 'ADMIN' || savedRole === 'STAFF') {
      setAuthRole(savedRole as 'ADMIN' | 'STAFF');
    }
  }, []);

  const handleLoginSuccess = (role: 'ADMIN' | 'STAFF') => {
    setAuthRole(role);
    sessionStorage.setItem('auth_role', role);
  };

  const handleLogout = () => {
    setAuthRole(null);
    sessionStorage.removeItem('auth_role');
    setShowStats(false);
  };

  const loadOrders = useCallback(async () => {
    if (!authRole) return;
    const data = await storageService.getOrders();
    setOrders(data);
  }, [authRole]);

  useEffect(() => {
    if (authRole) {
      loadOrders();

      // Subscribe to real-time updates
      const subscription = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          loadOrders();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [authRole, loadOrders]);

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderNumber.trim()) {
      await storageService.addOrder(newOrderNumber.trim());
      setNewOrderNumber('');
      loadOrders();
    }
  };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    await storageService.updateStatus(id, status);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Auftrag löschen?')) {
      await storageService.deleteOrder(id);
    }
  };

  const handleDailyReset = async () => {
    const ok = window.confirm("Tagesabschluss durchführen? Alle aktuellen Aufträge werden ins ARCHIV verschoben.");
    if (!ok) return;

    setIsResetting(true);
    await storageService.archiveAllOrders();
    alert("Tagesabschluss erfolgreich!");
    loadOrders();
    setIsResetting(false);
  };

  const handleHardReset = async () => {
    if (authRole !== 'ADMIN') return;

    const confirm1 = window.confirm("⚠ WARNUNG: Möchten Sie wirklich ALLE DATEN LÖSCHEN?\n\nDies löscht sämtliche Aufträge aus der Datenbank. Auch die Statistik wird auf 0 gesetzt.\n\nDies kann NICHT rückgängig gemacht werden!");
    if (!confirm1) return;

    const confirm2 = window.prompt("Bitte geben Sie zur Bestätigung 'LÖSCHEN' ein:");
    if (confirm2 !== 'LÖSCHEN') {
      alert("Abgebrochen.");
      return;
    }

    setIsResetting(true);
    await storageService.deleteAllOrders();
    alert("Datenbank wurde vollständig zurückgesetzt.");
    loadOrders();
    setIsResetting(false);
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => {
        const isCorrectView = showArchived
          ? o.status === OrderStatus.ARCHIVED
          : o.status !== OrderStatus.ARCHIVED;

        const matchesSearch = o.pickupNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return isCorrectView && matchesSearch;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [orders, showArchived, searchTerm]);

  // If not authenticated, show Login Screen immediately
  if (!authRole) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  // Generator: Create unique random number
  const handleGenerateNumber = () => {
    let attempts = 0;
    let generatedNum = "";

    // Get all order numbers from today (active + archived + completed) 
    // Actually, we check ALL current orders to be safe for uniqueness
    const existingNumbers = new Set(orders.map(o => o.pickupNumber));

    do {
      // Generate random number up to 3 digits (1 - 999)
      generatedNum = Math.floor(1 + Math.random() * 999).toString();
      attempts++;
    } while (existingNumbers.has(generatedNum) && attempts < 100);

    if (attempts >= 100) {
      alert("Konnte keine eindeutige Nummer generieren. Bitte manuell eingeben.");
    } else {
      setNewOrderNumber(generatedNum);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex flex-col gap-2">
          <Logo className="h-10 md:h-12" />
          <p className="text-gray-500 font-medium ml-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#99bc1c] rounded-full animate-pulse"></span>
            Werkstatt-System Admin
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs uppercase tracking-widest font-bold ml-2">
              {authRole} Mode
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {authRole === 'ADMIN' && (
            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-5 py-3 text-sm font-bold rounded-2xl transition-all shadow-sm border ${showStats ? 'bg-gray-800 text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {showStats ? 'Zurück zur Übersicht' : '📊 Statistik (Admin)'}
            </button>
          )}

          <button
            onClick={() => window.open('/#/display', '_blank')}
            className="px-6 py-3 text-sm font-bold text-white bg-[#575756] hover:bg-black rounded-2xl transition-all shadow-lg"
          >
            Monitor öffnen
          </button>

          <button
            onClick={handleDailyReset}
            disabled={isResetting}
            className="px-6 py-3 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all shadow-lg"
          >
            Tagesabschluss
          </button>

          <button
            onClick={handleLogout}
            className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-wider ml-2"
          >
            Logout
          </button>
        </div>
      </header>

      {/* STATS VIEW */}
      {showStats ? (
        <StatsDashboard orders={orders} onHardReset={handleHardReset} />
      ) : (
        <>
          {/* Input Area */}
          <form onSubmit={handleAddOrder} className="mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newOrderNumber}
                  onChange={(e) => setNewOrderNumber(e.target.value)}
                  placeholder="Auftragsnummer..."
                  className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#99bc1c]/20 transition-all shadow-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleGenerateNumber}
                  className="bg-gray-100/50 text-gray-600 px-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all border border-gray-200"
                  title="Zufällige Nummer generieren"
                >
                  🎲 <span className="hidden sm:inline">Generator</span>
                </button>
              </div>
              <button
                type="submit"
                disabled={!newOrderNumber.trim()}
                className="bg-[#99bc1c] text-black px-8 py-4 rounded-2xl font-black uppercase text-lg hover:bg-[#88a818] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
              >
                Hinzufügen
              </button>
            </div>
          </form>

          {/* Filter & List */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-800">
                {showArchived ? 'Archiv' : 'Aktuelle Aufträge'}
                <span className="ml-3 text-gray-400 text-lg font-bold">({filteredOrders.length})</span>
              </h2>

              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-medium text-sm focus:outline-none focus:border-[#99bc1c]"
                />
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${showArchived ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {showArchived ? 'Zeige Aktive' : 'Zeige Archiv'}
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredOrders.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="font-medium">Keine Aufträge gefunden</p>
                </div>
              )}

              {filteredOrders.map((order) => (
                <div key={order.id} className="group flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Auftragsnummer</div>
                    <div className="text-3xl font-black text-gray-900">{order.pickupNumber}</div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      Erstellt: {new Date(order.createdAt || order.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-gray-200/50 rounded-xl">
                    <button
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.REPAIRING)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${order.status === OrderStatus.REPAIRING
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-gray-500 hover:bg-white/50'
                        }`}
                    >
                      In Arbeit
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.READY)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${order.status === OrderStatus.READY
                        ? 'bg-[#99bc1c] text-white shadow-md'
                        : 'text-gray-500 hover:bg-white/50'
                        }`}
                    >
                      Abholbereit
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.ARCHIVED)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${order.status === OrderStatus.ARCHIVED
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'text-gray-500 hover:bg-white/50'
                        }`}
                    >
                      Archivieren
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(order.id)}
                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Endgültig löschen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;
