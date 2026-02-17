import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService.ts';
import { Order, OrderStatus } from '../types.ts';
import Logo from './Logo.tsx';

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
  }, [loadOrders]);

  const activeOrders = useMemo(() => orders.filter(o => o.status !== OrderStatus.ARCHIVED), [orders]);

  const groupedOrders = useMemo(() => {
    const ready = activeOrders.filter(o => o.status === OrderStatus.READY).sort((a,b) => b.updatedAt - a.updatedAt);
    const repairing = activeOrders.filter(o => o.status === OrderStatus.REPAIRING).sort((a,b) => b.updatedAt - a.updatedAt);
    return { ready, repairing };
  }, [activeOrders]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 flex flex-col font-sans overflow-hidden">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-center border-b border-white/5 pb-6 gap-6">
        <Logo className="h-12 md:h-20" inverse={true} />
        <DateTime />
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col min-h-0 pr-0 lg:pr-6 lg:border-r lg:border-white/10">
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase mb-4">Abholbereit</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            {groupedOrders.ready.map(order => (
              <div key={order.id} className="bg-[#99bc1c] p-4 md:p-6 rounded-3xl shadow-2xl flex flex-col justify-center">
                <div className="text-black/70 text-xs font-black uppercase tracking-widest text-center mb-1">Auftragsnummer</div>
                <div className="text-black font-black text-center" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
                  {order.pickupNumber}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col min-h-0 pl-0 lg:pl-6">
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase mb-4">In Arbeit</h2>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
            {groupedOrders.repairing.map(order => (
              <div key={order.id} className="bg-amber-500/10 border border-amber-500/20 p-3 md:p-4 rounded-2xl text-center flex flex-col justify-center">
                <div className="text-amber-500/80 text-[10px] font-black uppercase tracking-widest mb-1">Auftragsnummer</div>
                <div className="text-amber-500 font-black text-center" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)' }}>
                  {order.pickupNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="mt-3 text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.5em]">
        Sync: {lastUpdate.toLocaleTimeString()}
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
