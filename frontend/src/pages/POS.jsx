import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const POS = () => {
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Tax and discount rates can be configured in real ERP settings
    const taxRate = 0.10; // 10%

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, clientRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/clients')
                ]);
                setProducts(prodRes.data.filter(p => p.status === 'ACTIVE' && p.stock_quantity > 0));
                setClients(clientRes.data);
                if (clientRes.data.length > 0) setSelectedClient(clientRes.data[0].id);
            } catch (error) {
                toast.error('Failed to load POS data');
            }
        };
        fetchData();
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock_quantity) {
                    toast.error('Not enough stock available');
                    return prev;
                }
                return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, max_stock: product.stock_quantity }];
        });
    };

    const updateQuantity = (id, change) => {
        setCart(prev => prev.map(item => {
            if (item.product_id === id) {
                const newQ = item.quantity + change;
                if (newQ > item.max_stock) {
                    toast.error('Exceeds available stock');
                    return item;
                }
                return newQ > 0 ? { ...item, quantity: newQ } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.product_id !== id));

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');
        if (!selectedClient) return toast.error('Please select a client');

        setIsProcessing(true);
        try {
            await api.post('/pos/checkout', {
                client_id: selectedClient,
                items: cart,
                subtotal,
                tax,
                discount: 0,
                total,
                payment_method: paymentMethod
            });
            toast.success('Checkout successful!');
            setCart([]);
            // Refresh products to show updated stock
            const prodRes = await api.get('/products');
            setProducts(prodRes.data.filter(p => p.status === 'ACTIVE' && p.stock_quantity > 0));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-[calc(100vh-6rem)] flex gap-6 -m-4">
            {/* Products Section */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 rounded-r-2xl shadow-sm border-r border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search products for checkout..." 
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <motion.div 
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product)}
                                key={product.id} 
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col"
                            >
                                <div className="h-24 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h4>
                                <div className="mt-auto pt-2 flex justify-between items-center">
                                    <span className="font-bold text-primary-600 dark:text-primary-400">${parseFloat(product.price).toFixed(2)}</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{product.stock_quantity} left</span>
                                </div>
                            </motion.div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">No available products match your search.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Section */}
            <div className="w-[400px] flex flex-col bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-800 overflow-hidden mr-4 rounded-l-2xl">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white"><ShoppingCart size={20} /> Current Order</h3>
                    <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold">{cart.length} Items</span>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Client / Customer</label>
                    <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none dark:text-white focus:ring-2 focus:ring-primary-500">
                        <option value="">Walk-in Customer...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950/30">
                    {cart.map(item => (
                        <div key={item.product_id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex-1">
                                <h4 className="font-medium text-sm line-clamp-1 dark:text-white">{item.name}</h4>
                                <p className="text-primary-600 dark:text-primary-400 font-bold text-sm">${parseFloat(item.price).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                                    <button onClick={() => updateQuantity(item.product_id, -1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"><Minus size={14} /></button>
                                    <span className="w-6 text-center text-sm font-medium dark:text-white">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product_id, 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"><Plus size={14} /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p className="font-medium">Cart is empty</p>
                            <p className="text-xs">Click on products to add them</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                    <div className="space-y-3 mb-6 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax (10%)</span><span className="font-medium text-gray-900 dark:text-white">${tax.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700 mt-2"><span>Total</span><span className="text-primary-600 dark:text-primary-400">${total.toFixed(2)}</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={() => setPaymentMethod('CASH')} className={`py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${paymentMethod === 'CASH' ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Banknote size={18}/> Cash</button>
                        <button onClick={() => setPaymentMethod('CARD')} className={`py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${paymentMethod === 'CARD' ? 'bg-blue-50 text-blue-700 border-2 border-blue-500 shadow-sm dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><CreditCard size={18}/> Card</button>
                    </div>

                    <button 
                        onClick={handleCheckout} 
                        disabled={isProcessing || cart.length === 0}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98]"
                    >
                        {isProcessing ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <><CheckCircle2 size={24} /> Complete Checkout</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
