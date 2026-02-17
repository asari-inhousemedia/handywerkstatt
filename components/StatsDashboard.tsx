import React, { useMemo, useState } from 'react';
import { Order, OrderStatus } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface StatsProps {
    orders: Order[];
    onHardReset: () => void;
}

const COLORS = ['#99bc1c', '#f59e0b', '#ef4444', '#1f2937'];

const StatsDashboard: React.FC<StatsProps> = ({ orders, onHardReset }) => {
    const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');

    const stats = useMemo(() => {
        const now = new Date();
        const currentOrders = orders.filter(o => {
            const date = new Date(o.createdAt); // Make sure created_at is available
            if (timeframe === 'day') return date.toDateString() === now.toDateString();
            if (timeframe === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return date > oneWeekAgo;
            }
            if (timeframe === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            if (timeframe === 'year') return date.getFullYear() === now.getFullYear();
            return true;
        });

        const total = currentOrders.length;
        const completed = currentOrders.filter(o => o.status === OrderStatus.ARCHIVED || o.status === OrderStatus.READY).length;

        return { total, completed, currentOrders };
    }, [orders, timeframe]);

    const chartData = useMemo(() => {
        // Group by day for the chart
        const groups: Record<string, number> = {};
        stats.currentOrders.forEach(o => {
            const date = new Date(o.createdAt).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit' });
            groups[date] = (groups[date] || 0) + 1;
        });
        return Object.entries(groups).map(([name, count]) => ({ name, count }));
    }, [stats]);

    const pieData = useMemo(() => {
        const statusCounts = {
            [OrderStatus.REPAIRING]: 0,
            [OrderStatus.READY]: 0,
            [OrderStatus.FAILED]: 0,
            [OrderStatus.ARCHIVED]: 0
        };

        stats.currentOrders.forEach(o => {
            if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
        });

        return [
            { name: 'In Arbeit', value: statusCounts[OrderStatus.REPAIRING] },
            { name: 'Abholbereit', value: statusCounts[OrderStatus.READY] },
            { name: 'Archiviert', value: statusCounts[OrderStatus.ARCHIVED] }
        ].filter(d => d.value > 0);
    }, [stats]);


    return (
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <TrendingUp className="text-[#99bc1c]" /> Statistik & Auswertung
                </h2>

                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                    {(['day', 'week', 'month', 'year'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${timeframe === t ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {t === 'day' ? 'Heute' : t === 'week' ? '7 Tage' : t === 'month' ? 'Monat' : 'Jahr'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Aufträge Gesamt</div>
                    <div className="text-4xl font-black text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Abgeschlossen</div>
                    <div className="text-4xl font-black text-[#99bc1c]">{stats.completed}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-80">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-gray-700 mb-4">Auftragseingang</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f9fafb' }}
                                />
                                <Bar dataKey="count" fill="#99bc1c" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-gray-700 mb-4">Status Verteilung</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        {pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-red-100">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-red-800 font-bold mb-1">Gefahrenzone: Datenbank zurücksetzen</h3>
                        <p className="text-red-600/80 text-sm">Diese Aktion löscht ALLE Aufträge (auch archivierte) unwiderruflich aus der Datenbank. Dies kann nicht rückgängig gemacht werden.</p>
                    </div>
                    <button
                        onClick={onHardReset}
                        className="whitespace-nowrap bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95"
                    >
                        ⚠ ALLES LÖSCHEN (HARD RESET)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
