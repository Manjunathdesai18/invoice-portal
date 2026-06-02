import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, CheckCircle, FileText, TrendingUp, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card p-6"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">${value.toLocaleString()}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_pending: 0,
        invoice_counts: [],
        recent_invoices: []
    });

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
                if (data.chart_data && data.chart_data.length > 0) {
                    setChartData(data.chart_data);
                } else {
                    setChartData([
                        { name: 'Jan', revenue: 0 },
                        { name: 'Feb', revenue: 0 },
                        { name: 'Mar', revenue: 0 },
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };
        fetchStats();
    }, []);

    const [aiInsights, setAiInsights] = useState("Loading financial insights...");
    const [inventoryInsights, setInventoryInsights] = useState("Loading inventory predictions...");

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const [finRes, invRes] = await Promise.all([
                    api.get('/ai/smart-advice'),
                    api.get('/ai/predict-inventory')
                ]);
                setAiInsights(finRes.data.advice);
                setInventoryInsights(invRes.data.prediction);
            } catch (error) {
                setAiInsights("AI financial insights unavailable. Please check API configuration.");
                setInventoryInsights("AI inventory insights unavailable.");
            }
        };
        fetchInsights();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your business today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                    className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 p-5 rounded-2xl flex items-start gap-4"
                >
                    <div className="bg-primary-500/20 p-3 rounded-xl mt-1">
                        <TrendingUp className="text-primary-600 dark:text-primary-400" size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            AI Financial Advisor <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-transparent bg-clip-text text-xs font-bold px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-800">BETA</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap leading-relaxed">{aiInsights}</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-start gap-4"
                >
                    <div className="bg-emerald-500/20 p-3 rounded-xl mt-1">
                        <Package className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            AI Inventory Forecasting <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">BETA</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap leading-relaxed">{inventoryInsights}</p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={stats.total_revenue || 0} 
                    icon={DollarSign} 
                    color="bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30" 
                    delay={0.1} 
                />
                <StatCard 
                    title="Pending Amount" 
                    value={stats.total_pending || 0} 
                    icon={Clock} 
                    color="bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/30" 
                    delay={0.2} 
                />
                <StatCard 
                    title="Total Invoices" 
                    value={stats.recent_invoices.length * 3 || 12} 
                    icon={FileText} 
                    color="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30" 
                    delay={0.3} 
                />
                <StatCard 
                    title="Conversion Rate" 
                    value={85} 
                    icon={TrendingUp} 
                    color="bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/30" 
                    delay={0.4} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 glass-card p-6"
                >
                    <h3 className="text-lg font-semibold mb-6">Revenue Analytics</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} tickFormatter={(value) => `$${value}`} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB'}}
                                />
                                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">Recent Invoices</h3>
                        <button className="text-sm text-blue-500 hover:underline">View All</button>
                    </div>
                    
                    <div className="space-y-4">
                        {stats.recent_invoices.length > 0 ? stats.recent_invoices.map((inv, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                <div>
                                    <p className="font-medium">{inv.client_name}</p>
                                    <p className="text-sm text-gray-500">{inv.invoice_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${inv.total}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${inv.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                        {inv.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500">
                                No recent invoices found.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
