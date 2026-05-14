import React from 'react';
import { 
  BarChart3, 
  CreditCard, 
  MessageSquare, 
  Target, 
  History,
  LogOut,
  Trash2
} from 'lucide-react';
import { logout } from '../lib/firebase';
import { useFinance } from '../contexts/FinanceContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { clearAllData } = useFinance();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'IA Assistente', icon: MessageSquare, highlight: true },
    { id: 'transactions', label: 'Extrato', icon: History },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
  ];

  const handleReset = async () => {
    const confirmed = window.confirm('ATENÇÃO: Isso apagará TODOS os seus dados (transações, cartões, metas e histórico). Esta ação não pode ser desfeita. Deseja continuar?');
    if (confirmed) {
      await clearAllData();
      setActiveTab('dashboard');
    }
  };

  return (
    <aside className="w-20 h-screen bg-surface border-r border-white/5 flex flex-col items-center py-8 gap-10 z-40 shrink-0">
      <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45" />
      </div>

      <nav className="flex flex-col gap-8 text-slate-500">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-2 transition-all relative group
              ${activeTab === item.id 
                ? 'text-brand-primary border-r-2 border-brand-primary' 
                : 'hover:text-slate-200'
              }
            `}
            title={item.label}
          >
            <item.icon className="w-6 h-6 shrink-0" />
            
            {item.highlight && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-6">
        <button
          onClick={handleReset}
          className="p-2 text-slate-500 hover:text-rose-500 transition-all"
          title="Zerar Dados"
        >
          <Trash2 className="w-6 h-6" />
        </button>

        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-red-400 transition-all"
          title="Sair"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};
