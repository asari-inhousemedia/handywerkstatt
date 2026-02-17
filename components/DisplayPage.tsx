import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService.ts';
import { Order, OrderStatus } from '../types.ts';
import Logo from './Logo.tsx';
import { createClient } from "@supabase/supabase-js";

// Supabase
const SUPABASE_URL = "https://ikdlhrrjingkrddwbmuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_LKjR1Q0Lqf_ygoBuJVoumg_zr5IHLDG";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DisplayPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadOrders = useCallback(async () => {
    const data = await storageService.getOrders();
    setOrders(data);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    loadOrders();

    const subscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Real-time update received:', payload);
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [loadOrders]);

  const activeOrders = useMemo(() => orders.filter(o => o.status !== OrderStatus.ARCHIVED), [orders]);

  const groupedOrders = useMemo(() => {
    const ready = activeOrders.filter(o => o.status === OrderStatus.READY).sort((a, b) => b.updatedAt - a.updatedAt);
    const repairing = activeOrders.filter(o => o.status === OrderStatus.REPAIRING).sort((a, b) => b.updatedAt - a.updatedAt);
    return { ready, repairing };
  }, [activeOrders]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 flex flex-col font-sans overflow-hidden">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-center border-b border-white/5 pb-6 gap-6">
        <div className="flex-1 flex justify-start">
          <Logo className="h-12 md:h-20" inverse={true} />
        </div>

        <div className="flex-[2] text-center">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 text-3xl md:text-5xl font-black uppercase tracking-widest drop-shadow-sm">
            Ihr Auftragsstatus
          </h1>
        </div>

        <div className="flex-1 flex justify-end">
          <DateTime />
        </div>
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col min-h-0 pr-0 lg:pr-6 lg:border-r lg:border-white/10">
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase mb-4">Abholbereit</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {groupedOrders.ready.map(order => (
              <div key={order.id} className="bg-[#99bc1c] p-4 rounded-3xl shadow-xl flex flex-col justify-center items-center aspect-[4/3] relative overflow-hidden group">
                <div className="text-black/60 text-[10px] font-black uppercase tracking-widest text-center mb-0 absolute top-4">Auftragsnummer</div>
                <div className="text-black font-black text-center text-6xl md:text-7xl break-all leading-none pt-4">
                  {order.pickupNumber}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col min-h-0 pl-0 lg:pl-6">
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase mb-4">In Arbeit</h2>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
            {groupedOrders.repairing.map(order => (
              <div key={order.id} className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-center flex flex-col justify-center items-center aspect-square relative overflow-hidden">
                <div className="text-amber-500/60 text-[9px] font-black uppercase tracking-widest mb-0 absolute top-3">Auftragsnummer</div>
                <div className="text-amber-500 font-black text-center text-4xl md:text-5xl break-all leading-none pt-3">
                  {order.pickupNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="mt-auto pt-6 flex justify-between items-end px-2">
        <div className="text-gray-700 text-[10px] font-black uppercase tracking-[0.5em]">
          Sync: {lastUpdate.toLocaleTimeString()}
        </div>

        <div className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/5">
          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-tight">Powered by</div>
            <div className="text-blue-500 font-bold text-sm tracking-wide leading-tight">Inhouse Media</div>
          </div>
          <div className="h-10 w-10 bg-white p-0.5 rounded-lg overflow-hidden">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://inhousee.de"
              alt="Inhouse Media QR"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DateTime: React.FC = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
      <div className="text-gray-300 text-xs font-bold">{now.toLocaleDateString('de-DE')}</div>
      <div className="text-white text-2xl md:text-3xl font-black">{now.toLocaleTimeString('de-DE')}</div>
    </div>
  );
};

export default DisplayPage;
