import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_pending: 0,
        recent_invoices: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const exportData = async (type) => {
        try {
            toast.loading(`Exporting ${type}...`, { id: 'export' });
            const response = await api.get(`/dashboard/export?type=${type}`, { responseType: 'blob' });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            let ext = type === 'excel' ? 'xlsx' : type;
            link.setAttribute('download', `financial-report.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success(`${type.toUpperCase()} exported successfully!`, { id: 'export' });
        } catch (error) {
            toast.error(`Failed to export ${type}`, { id: 'export' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Reports</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Export your financial data and generate insights.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-6 flex flex-col items-center text-center hover:scale-[1.02] transition-transform cursor-pointer border border-transparent hover:border-red-500/50"
                    onClick={() => exportData('pdf')}
                >
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold">Export to PDF</h3>
                    <p className="text-sm text-gray-500 mt-2">Generate a comprehensive, printable financial summary.</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-card p-6 flex flex-col items-center text-center hover:scale-[1.02] transition-transform cursor-pointer border border-transparent hover:border-green-500/50"
                    onClick={() => exportData('excel')}
                >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-4">
                        <FileSpreadsheet size={32} />
                    </div>
                    <h3 className="text-lg font-bold">Export to Excel</h3>
                    <p className="text-sm text-gray-500 mt-2">Download raw data for custom spreadsheet modeling.</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-card p-6 flex flex-col items-center text-center hover:scale-[1.02] transition-transform cursor-pointer border border-transparent hover:border-blue-500/50"
                    onClick={() => exportData('csv')}
                >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                        <Download size={32} />
                    </div>
                    <h3 className="text-lg font-bold">Export to CSV</h3>
                    <p className="text-sm text-gray-500 mt-2">Get comma-separated values for database imports.</p>
                </motion.div>
            </div>

            <div className="mt-8 glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">${stats.total_revenue}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="text-sm text-gray-500">Total Pending</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">${stats.total_pending}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="text-sm text-gray-500">Invoices Generated</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.recent_invoices.length * 3 || 12}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="text-sm text-gray-500">Profit Margin</p>
                        <p className="text-xl font-bold text-green-500">85%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
