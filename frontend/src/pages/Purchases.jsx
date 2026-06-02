import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';

const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [cost, setCost] = useState(0);
    const [orderItems, setOrderItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [purRes, supRes, prodRes] = await Promise.all([
                api.get('/suppliers/purchases/all'),
                api.get('/suppliers'),
                api.get('/products')
            ]);
            setPurchases(purRes.data);
            setSuppliers(supRes.data);
            setProducts(prodRes.data);
        } catch (error) {
            toast.error('Failed to load purchase data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const addItem = () => {
        if (!selectedProduct || quantity <= 0 || cost < 0) return toast.error('Invalid item details');
        const prod = products.find(p => p.id == selectedProduct);
        setOrderItems([...orderItems, { product_id: prod.id, name: prod.name, quantity: Number(quantity), cost: Number(cost) }]);
        setSelectedProduct('');
        setQuantity(1);
        setCost(0);
    };

    const handleCreatePO = async () => {
        if (!selectedSupplier || orderItems.length === 0) return toast.error('Please select supplier and add items');
        const total = orderItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
        
        setIsSubmitting(true);
        try {
            await api.post('/suppliers/purchases/all', { supplier_id: selectedSupplier, total, items: orderItems });
            toast.success('Purchase Order Created & Stock Updated!');
            setIsModalOpen(false);
            setOrderItems([]);
            setSelectedSupplier('');
            fetchData();
        } catch (error) {
            toast.error('Failed to create purchase order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Purchase Orders</h1>
                    <p className="text-gray-500 mt-1">Manage vendor purchases and restock inventory.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all">
                    <Plus size={20} /> Create PO
                </button>
            </div>

            <div className="glass-card overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-500 text-sm uppercase">
                            <th className="px-6 py-4">PO Number</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {purchases.map(po => (
                            <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium dark:text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500"><ShoppingBag size={16}/></div>
                                    {po.purchase_number}
                                </td>
                                <td className="px-6 py-4 font-medium dark:text-white">{po.supplier_name}</td>
                                <td className="px-6 py-4 text-gray-500">{format(new Date(po.purchase_date || po.created_at || new Date()), 'MMM dd, yyyy')}</td>
                                <td className="px-6 py-4 font-bold dark:text-white">${Number(po.total || 0).toFixed(2)}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold">{po.status}</span></td>
                            </tr>
                        ))}
                        {purchases.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-gray-500">No purchase orders found.</td></tr>}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">New Purchase Order</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X/></button></div>
                            <div className="p-6 space-y-4 bg-gray-50/50 dark:bg-gray-950/30">
                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Select Supplier</label>
                                    <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="">Choose a supplier...</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl space-y-3 border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <h4 className="font-semibold text-sm dark:text-gray-300 mb-2">Add Item to Restock</h4>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Select Product...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <div className="flex gap-3">
                                            <input type="number" placeholder="Qty" value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 outline-none"/>
                                            <input type="number" placeholder="Cost" value={cost} onChange={e=>setCost(e.target.value)} className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 outline-none"/>
                                            <button onClick={addItem} className="px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 font-bold rounded-lg transition-colors">Add</button>
                                        </div>
                                    </div>
                                </div>

                                {orderItems.length > 0 && (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                        {orderItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <span className="font-medium dark:text-white">{item.name}</span>
                                                <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span>Cost: ${item.cost}</span>
                                                    <span className="font-bold text-gray-900 dark:text-white border-l pl-4 dark:border-gray-700">Total: ${(item.cost * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="font-bold text-xl dark:text-white bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg">Total PO Value: ${orderItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0).toFixed(2)}</div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 font-medium">Cancel</button>
                                        <button onClick={handleCreatePO} disabled={isSubmitting} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 font-bold flex items-center justify-center min-w-[200px]">
                                            {isSubmitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Confirm & Restock'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Purchases;
