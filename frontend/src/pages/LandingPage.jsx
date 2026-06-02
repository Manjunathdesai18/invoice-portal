import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Zap, BarChart3, Shield, Mail } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass-card rounded-none border-t-0 border-x-0 !bg-white/80 dark:!bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
                S
              </div>
              <span className="font-bold text-xl tracking-tight">SmartERP</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition">Pricing</a>
              <div className="flex items-center gap-4">
                <Link to="/login" className="font-medium text-gray-700 hover:text-primary-600 dark:text-gray-200 transition">Log in</Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-medium transition shadow-lg shadow-primary-500/30">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 z-0"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-semibold text-sm mb-6 border border-primary-100 dark:border-primary-800 shadow-sm">
              ✨ Introducing the Complete AI-Powered Business Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Manage your entire business <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-600">
                from one dashboard.
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Invoicing, POS Checkout, Inventory tracking, Supplier management, and predictive AI insights—all built for growing teams and ambitious professionals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl">
                Start for free <ArrowRight size={20} />
              </Link>
              <Link to="/demo" className="bg-white text-gray-900 border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Book a demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 mx-auto max-w-5xl rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
          >
            <div className="bg-gray-100 dark:bg-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Dashboard Preview" 
              className="w-full h-auto object-cover opacity-90"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Automate your workflow, get paid faster, and understand your business with our AI-powered suite.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-amber-500" size={32} />, title: 'POS Checkout', desc: 'Lightning-fast Point of Sale system with automatic inventory deduction.' },
              { icon: <BarChart3 className="text-blue-500" size={32} />, title: 'Advanced AI Analytics', desc: 'Predictive revenue forecasting and smart inventory restock alerts.' },
              { icon: <Shield className="text-green-500" size={32} />, title: 'Supplier Management', desc: 'Track POs and restock inventory instantly with transactional safety.' },
              { icon: <CheckCircle2 className="text-primary-500" size={32} />, title: 'Smart Invoicing', desc: 'Generate professional PDF invoices with AI-assisted item descriptions.' },
              { icon: <Mail className="text-purple-500" size={32} />, title: 'Client Portal', desc: 'Manage CRM contacts and track pending vs paid invoice history.' },
              { icon: <BarChart3 className="text-pink-500" size={32} />, title: 'Real-time WebSockets', desc: 'Live socket connections so your team sees updates instantly as sales happen.' },
            ].map((feature, idx) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={idx} 
                className="bg-white dark:bg-gray-800/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl backdrop-blur-sm"
              >
                <div className="mb-6 bg-gray-50 dark:bg-gray-900 w-16 h-16 rounded-xl flex items-center justify-center shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the plan that best fits your needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-2">Basic</h3>
              <p className="text-3xl font-bold mb-6">$0<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={20}/> 5 Invoices/month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={20}/> Basic Templates</li>
              </ul>
              <Link to="/register" className="block text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-full font-medium transition">Get Started</Link>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-8 rounded-2xl shadow-md border border-primary-200 dark:border-primary-800 relative">
              <div className="absolute top-0 right-0 -mt-3 mr-4 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <h3 className="text-xl font-bold mb-2 text-primary-700 dark:text-primary-300">Pro</h3>
              <p className="text-3xl font-bold mb-6">$15<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="text-primary-500" size={20}/> Unlimited Invoices</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-primary-500" size={20}/> AI Insights</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-primary-500" size={20}/> Custom Branding</li>
              </ul>
              <Link to="/register" className="block text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-medium transition shadow-lg shadow-primary-500/30">Upgrade to Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
              S
            </div>
            <span className="font-semibold text-xl tracking-tight">SmartERP</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 SmartERP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
