import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const emptyForm = { name: '', price: '', cost_price: '', stock_quantity: '', sku: '', category_id: '', description: '', status: 'ACTIVE' };

const Products = () => {
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Add modal
    const [isAddOpen, setIsAddOpen]   = useState(false);
    const [addForm, setAddForm]       = useState(emptyForm);
    const [isAdding, setIsAdding]     = useState(false);

    // Edit modal
    const [isEditOpen, setIsEditOpen]   = useState(false);
    const [editForm, setEditForm]       = useState(emptyForm);
    const [editingId, setEditingId]     = useState(null);
    const [isEditing, setIsEditing]     = useState(false);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/products/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ── ADD ──────────────────────────────────────────────────────────
    const handleAdd = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            await api.post('/products', addForm);
            toast.success('Product added successfully');
            setIsAddOpen(false);
            setAddForm(emptyForm);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add product');
        } finally {
            setIsAdding(false);
        }
    };

    // ── OPEN EDIT ────────────────────────────────────────────────────
    const openEdit = (product) => {
        setEditingId(product.id);
        setEditForm({
            name:           product.name          || '',
            price:          product.price         || '',
            cost_price:     product.cost_price    || '',
            stock_quantity: product.stock_quantity ?? '',
            sku:            product.sku           || '',
            category_id:    product.category_id   || '',
            description:    product.description   || '',
            status:         product.status        || 'ACTIVE',
        });
        setIsEditOpen(true);
    };

    // ── SAVE EDIT ────────────────────────────────────────────────────
    const handleEdit = async (e) => {
        e.preventDefault();
        setIsEditing(true);
        try {
            await api.put(`/products/${editingId}`, editForm);
            toast.success('Product updated successfully');
            setIsEditOpen(false);
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setIsEditing(false);
        }
    };

    // ── DELETE ───────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product? This cannot be undone.')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // ── SHARED FORM FIELDS ───────────────────────────────────────────
    const ProductForm = ({ form, setForm, onSubmit, isLoading, onClose, title }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Product Name *</label>
                            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">SKU</label>
                            <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Selling Price (₹) *</label>
                            <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cost Price (₹)</label>
                            <input type="number" step="0.01" min="0" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock Quantity</label>
                            <input type="number" min="0" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
                            <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white">
                                <option value="">Select Category...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="OUT_OF_STOCK">Out of Stock</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                            <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 mt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={isLoading}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center min-w-[130px] transition-colors">
                            {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : title}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );

    const statusBadge = (status) => {
        const map = {
            ACTIVE:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            INACTIVE:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            OUT_OF_STOCK: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return map[status] || map.ACTIVE;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products & Inventory</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your catalog, stock levels, and pricing.</p>
                </div>
                <button onClick={() => { setAddForm(emptyForm); setIsAddOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/30">
                    <Plus className="w-5 h-5" /><span>Add Product</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                    <h3 className="text-2xl font-bold mt-1 dark:text-white">{products.length}</h3>
                </div>
                <div className="glass-card p-6 border-l-4 border-green-500">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stock Value</p>
                    <h3 className="text-2xl font-bold mt-1 dark:text-white">
                        ₹{products.reduce((acc, p) => acc + (parseFloat(p.price) * p.stock_quantity), 0).toLocaleString('en-IN')}
                    </h3>
                </div>
                <div className="glass-card p-6 border-l-4 border-red-500">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Alerts</p>
                    <h3 className="text-2xl font-bold mt-1 text-red-500">{products.filter(p => p.stock_quantity < 10).length}</h3>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Search by name or SKU..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">SKU</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading products...</td></tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((product, idx) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.category_name || 'General'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-sm">{product.sku || '—'}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">₹{parseFloat(product.price).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={product.stock_quantity < 10 ? 'text-red-500 font-bold' : 'dark:text-white'}>
                                                    {product.stock_quantity}
                                                </span>
                                                {product.stock_quantity < 10 && <AlertTriangle className="w-4 h-4 text-red-500" title="Low Stock" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(product.status)}`}>
                                                {product.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(product)}
                                                    title="Edit product"
                                                    className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    title="Delete product"
                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <ProductForm
                        form={addForm} setForm={setAddForm}
                        onSubmit={handleAdd} isLoading={isAdding}
                        onClose={() => setIsAddOpen(false)}
                        title="Save Product"
                    />
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditOpen && (
                    <ProductForm
                        form={editForm} setForm={setEditForm}
                        onSubmit={handleEdit} isLoading={isEditing}
                        onClose={() => { setIsEditOpen(false); setEditingId(null); }}
                        title="Update Product"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;
