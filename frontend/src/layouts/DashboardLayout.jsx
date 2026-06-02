import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  Sun,
  Moon,
  BarChart3,
  Package,
  MonitorSmartphone,
  Truck,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SidebarLink = ({ icon, label, to, active }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-semibold' 
          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full" />
      )}
    </motion.div>
  </Link>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socket.on('notification', (data) => {
      const newNotification = { id: Date.now(), ...data, read: false };
      setNotifications(prev => [newNotification, ...prev].slice(0, 5)); // Keep last 5

      if (data.type === 'success') {
        toast.success(`${data.title}: ${data.message}`, { duration: 5000, icon: '🎉' });
      } else {
        toast(`${data.title}: ${data.message}`, { duration: 5000, icon: '🔔' });
      }
    });

    return () => socket.disconnect();
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-200">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-10 shadow-sm"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-bold text-xl dark:text-white">Smart</span>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label={isSidebarOpen ? "Dashboard" : ""} active={location.pathname === '/dashboard'} />
          <SidebarLink to="/pos" icon={<MonitorSmartphone size={20} />} label={isSidebarOpen ? "POS System" : ""} active={location.pathname.startsWith('/pos')} />
          <SidebarLink to="/products" icon={<Package size={20} />} label={isSidebarOpen ? "Products" : ""} active={location.pathname.startsWith('/products')} />
          <SidebarLink to="/purchases" icon={<ShoppingCart size={20} />} label={isSidebarOpen ? "Purchases" : ""} active={location.pathname.startsWith('/purchases')} />
          <SidebarLink to="/suppliers" icon={<Truck size={20} />} label={isSidebarOpen ? "Suppliers" : ""} active={location.pathname.startsWith('/suppliers')} />
          <SidebarLink to="/invoices" icon={<FileText size={20} />} label={isSidebarOpen ? "Invoices" : ""} active={location.pathname.startsWith('/invoices')} />
          <SidebarLink to="/clients" icon={<Users size={20} />} label={isSidebarOpen ? "Clients" : ""} active={location.pathname.startsWith('/clients')} />
          <SidebarLink to="/reports" icon={<BarChart3 size={20} />} label={isSidebarOpen ? "Reports" : ""} active={location.pathname === '/reports'} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <SidebarLink to="/settings" icon={<Settings size={20} />} label={isSidebarOpen ? "Settings" : ""} active={location.pathname === '/settings'} />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-2"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 glass-card !rounded-none !border-t-0 !border-x-0 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 w-96 border border-gray-200 dark:border-gray-700">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search invoices, clients..." 
              className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm dark:text-white placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition relative">
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold dark:text-white">Notifications</h3>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 text-sm ${!n.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                          <p className="font-semibold text-gray-900 dark:text-white">{n.title}</p>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 text-white flex items-center justify-center font-bold shadow-md cursor-pointer border-2 border-white dark:border-gray-800">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
