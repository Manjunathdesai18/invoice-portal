import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, X, Building2, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact_person: '', email: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/suppliers', formData);
            toast.success('Supplier added successfully');
            setIsModalOpen(false);
            setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' });
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to add supplier');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this supplier?')) {
            try {
                await api.delete(`/suppliers/${id}`);
                toast.success('Supplier deleted');
                fetchSuppliers();
            } catch (error) {
                toast.error('Failed to delete supplier');
            }
        }
    };

    const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Suppliers</h1>
                    <p className="text-gray-500 mt-1">Manage your vendors and supply chain.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    <Plus size={20} /> Add Supplier
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Search suppliers..." className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-500 text-sm uppercase">
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Contact Person</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filtered.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium dark:text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Building2 size={20} /></div>
                                        {supplier.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{supplier.contact_person || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 space-y-1">
                                        {supplier.email && <div className="flex items-center gap-2"><Mail size={14}/>{supplier.email}</div>}
                                        {supplier.phone && <div className="flex items-center gap-2"><Phone size={14}/>{supplier.phone}</div>}
                                    </td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">{supplier.status}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(supplier.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-gray-500">No suppliers found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">Add Supplier</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X/></button></div>
                            <form onSubmit={handleAdd} className="p-6 space-y-4">
                                <div><label className="block mb-1 text-sm font-medium dark:text-gray-300">Company Name *</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block mb-1 text-sm font-medium dark:text-gray-300">Contact Person</label><input value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block mb-1 text-sm font-medium dark:text-gray-300">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                    <div><label className="block mb-1 text-sm font-medium dark:text-gray-300">Phone</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                </div>
                                <div><label className="block mb-1 text-sm font-medium dark:text-gray-300">Address</label><textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 h-24"></textarea></div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">Cancel</button><button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30">Save Supplier</button></div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Suppliers;
