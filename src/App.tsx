/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Cards } from './pages/Cards';
import { Goals } from './pages/Goals';
import { AIChat } from './pages/AIChat';
import { TrashPage } from './pages/Trash';
import { motion, AnimatePresence } from 'motion/react';
import { logout } from './lib/firebase';
import { LogOut } from 'lucide-react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white p-10 text-center">
          <h1 className="text-xl font-bold mb-4">Ops! Algo deu errado.</h1>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg max-w-lg overflow-auto">
            <code className="text-xs text-red-400">{this.state.error?.toString()}</code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-indigo-600 rounded-full text-sm font-bold"
          >
            Recarregar Aplicativo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  console.log('[AppContent] user:', !!user, 'loading:', loading);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#000000] text-white">
        <div className="w-12 h-12 border-2 border-indigo-600 border-t-white rounded-full animate-spin mb-8" />
        <h1 className="text-5xl font-black tracking-tighter italic mb-4 pr-6 uppercase select-none">RAIXI</h1>
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Dados</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'cards': return <Cards />;
      case 'goals': return <Goals />;
      case 'chat': return <AIChat />;
      case 'trash': return <TrashPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-dark flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-20 flex items-center justify-between px-6 bg-black border-b border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45" />
          </div>
          <span className="font-black tracking-tighter text-2xl bg-white bg-clip-text text-transparent italic pr-4 select-none">RAIXI</span>
        </div>
        <button onClick={logout} className="p-2 text-white/40 hover:text-white transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </header>

      <div className="hidden lg:flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 pb-24 lg:pb-8 relative border-r border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Right Sidebar for AI Assistant on Desktop (xl and above) */}
      <div className="hidden xl:block w-80 bg-surface flex flex-col border-l border-white/5">
        <AIChat isSidebar={true} />
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FinanceProvider>
          <AppContent />
        </FinanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
