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
    { id: 'dashboard', label: 'INÍCIO', icon: BarChart3 },
    { id: 'transactions', label: 'EXTRATO', icon: History },
    { id: 'chat', label: 'RAIXI', icon: MessageSquare, highlight: true },
    { id: 'cards', label: 'CARTÕES', icon: CreditCard },
    { id: 'goals', label: 'METAS', icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-2 z-[60] lg:hidden pb-4">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center gap-2 min-w-[64px] h-full transition-all active:scale-90
            ${activeTab === item.id 
              ? 'text-indigo-400' 
              : 'text-white/20 hover:text-white/40'
            }
          `}
        >
          <div className={`relative flex items-center justify-center ${item.id === 'chat' ? 'scale-110' : ''}`}>
            <item.icon className={`w-6 h-6 transition-transform ${activeTab === item.id ? 'scale-110' : ''} ${item.id === 'chat' ? 'text-indigo-400' : ''}`} />
            {item.highlight && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-black" />
            )}
          </div>
          <span className={`text-[9px] font-black tracking-[0.1em] transition-all ${
            activeTab === item.id ? 'text-indigo-400 opacity-100' : 'opacity-40'
          }`}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};
