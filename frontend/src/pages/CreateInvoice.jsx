import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, FileText, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [invoiceData, setInvoiceData] = useState({
        client_id: '',
        invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Thank you for your business!',
        tax: 0,
        discount: 0
    });

    const [items, setItems] = useState([
        { description: '', quantity: 1, price: 0, total: 0 }
    ]);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const { data } = await api.get('/clients');
                setClients(data);
            } catch (error) {
                toast.error('Failed to load clients');
            }
        };
        fetchClients();
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        if (field === 'quantity' || field === 'price') {
            newItems[index].total = newItems[index].quantity * newItems[index].price;
        }
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, price: 0, total: 0 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * invoiceData.tax) / 100;
    const total = subtotal + taxAmount - invoiceData.discount;

    const generateAIDescription = async (index) => {
        try {
            const prompt = prompt("Enter a brief idea for the invoice item (e.g., 'Web Dev', 'Consulting'):", "Web Development Services");
            if (!prompt) return;
            toast.loading("Generating description...", { id: "ai-gen" });
            const { data } = await api.post('/ai/generate-description', { prompt });
            handleItemChange(index, 'description', data.description);
            toast.success("AI Generation complete!", { id: "ai-gen" });
        } catch (error) {
            toast.error("Failed to generate AI description", { id: "ai-gen" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!invoiceData.client_id) return toast.error('Please select a client');
        if (items.some(i => !i.description)) return toast.error('Please fill all item descriptions');

        setLoading(true);
        try {
            await api.post('/invoices', {
                ...invoiceData,
                subtotal,
                tax: taxAmount,
                total,
                items
            });
            toast.success('Invoice created successfully!');
            navigate('/invoices');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Generate a new professional invoice.</p>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => navigate('/invoices')} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/30">
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'Saving...' : 'Save Invoice'}</span>
                    </button>
                </div>
            </div>

            <div className="glass-card p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Client</label>
                        <select 
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                            value={invoiceData.client_id}
                            onChange={(e) => setInvoiceData({...invoiceData, client_id: e.target.value})}
                        >
                            <option value="">-- Choose Client --</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Number</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={invoiceData.invoice_number}
                            onChange={(e) => setInvoiceData({...invoiceData, invoice_number: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date</label>
                        <input 
                            type="date" 
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:[color-scheme:dark]"
                            value={invoiceData.issue_date}
                            onChange={(e) => setInvoiceData({...invoiceData, issue_date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                        <input 
                            type="date" 
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:[color-scheme:dark]"
                            value={invoiceData.due_date}
                            onChange={(e) => setInvoiceData({...invoiceData, due_date: e.target.value})}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Line Items</h3>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex-1 space-y-4">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Item Description" 
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => generateAIDescription(index)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                            title="AI Generate Description"
                                        >
                                            <Wand2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-24">
                                            <input 
                                                type="number" 
                                                min="1"
                                                placeholder="Qty" 
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input 
                                                type="number" 
                                                min="0"
                                                placeholder="Price" 
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="w-32 py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center font-semibold">
                                            ${item.total.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeItem(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={addItem}
                        className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>

                <div className="mt-8 flex justify-end">
                    <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-600 dark:text-gray-400">Tax (%)</span>
                            <input 
                                type="number" 
                                className="w-20 px-2 py-1 text-right rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                                value={invoiceData.tax}
                                onChange={(e) => setInvoiceData({...invoiceData, tax: parseFloat(e.target.value) || 0})}
                            />
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-600 dark:text-gray-400">Discount ($)</span>
                            <input 
                                type="number" 
                                className="w-24 px-2 py-1 text-right rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                                value={invoiceData.discount}
                                onChange={(e) => setInvoiceData({...invoiceData, discount: parseFloat(e.target.value) || 0})}
                            />
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Terms</label>
                    <textarea 
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                        value={invoiceData.notes}
                        onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                    ></textarea>
                </div>
            </div>
        </form>
    );
};

export default CreateInvoice;
