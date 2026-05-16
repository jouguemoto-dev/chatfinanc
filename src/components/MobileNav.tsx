import React from 'react';
import { 
  BarChart3, 
  CreditCard, 
  MessageSquare, 
  Target, 
  History
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: BarChart3 },
    { id: 'transactions', label: 'Extrato', icon: History },
    { id: 'chat', label: 'Finai', icon: MessageSquare, highlight: true },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'goals', label: 'Metas', icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-50 lg:hidden">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center gap-1.5 min-w-[64px] h-full transition-all active:scale-90
            ${activeTab === item.id 
              ? 'text-indigo-400' 
              : 'text-slate-500'
            }
          `}
        >
          <div className={`p-1 relative ${activeTab === item.id ? 'bg-indigo-400/10 rounded-xl' : ''}`}>
            <item.icon className={`w-6 h-6 ${item.id === 'chat' && activeTab !== item.id ? 'text-indigo-400' : ''}`} />
            {item.highlight && activeTab !== item.id && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-black" />
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
