import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  CreditCard as CardIcon, 
  Tag, 
  Calendar,
  AlertCircle,
  MoreVertical,
  Wifi,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Trash2,
  Edit2,
  Eye,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Card } from '../types';
import { CardModal } from '../components/modals/CardModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { CardDetailModal } from '../components/modals/CardDetailModal';

export const Cards: React.FC = () => {
  const { cards, transactions, moveToTrash } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const getMonthlySpent = (card: Card) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
      .filter(t => t.cardId === card.id && t.type === 'expense' && !t.isDeleted)
      .filter(t => {
        if (!t.date) return false;
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getAvailableLimit = (card: Card) => {
    const spent = transactions
      .filter(t => t.cardId === card.id && t.type === 'expense' && !t.isDeleted)
      .reduce((acc, t) => acc + t.amount, 0);
    return Math.max(0, card.limit - spent);
  };

  const getUsagePercentage = (card: Card) => {
    const spent = transactions
      .filter(t => t.cardId === card.id && t.type === 'expense' && !t.isDeleted)
      .reduce((acc, t) => acc + t.amount, 0);
    return Math.min(Math.round((spent / card.limit) * 100), 100);
  };

  const getSpendingEvolution = (card: Card) => {
    const now = new Date();
    const months = [];
    
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      
      const total = transactions
        .filter(t => t.cardId === card.id && t.type === 'expense' && !t.isDeleted)
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === month && tDate.getFullYear() === year;
        })
        .reduce((acc, t) => acc + t.amount, 0);
        
      months.push({
        name: d.toLocaleDateString('pt-BR', { month: 'short' }),
        value: total
      });
    }
    return months;
  };

  const handleEdit = (card: Card, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleMoveToTrash = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleViewDetail = (card: Card) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await moveToTrash('cards', itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white italic">Seus Cartões</h1>
          <p className="text-sm text-slate-500">Gestão de limites e controle de faturas.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="w-full sm:w-auto h-12 sm:h-10 px-6 bg-brand-primary hover:bg-brand-primary/90 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Novo Cartão
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const available = getAvailableLimit(card);
          const usage = getUsagePercentage(card);
          const monthlySpent = getMonthlySpent(card);
          const evolution = getSpendingEvolution(card);
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ 
                y: -12,
                rotateX: 4,
                rotateY: -4,
                scale: 1.02,
                transition: { type: 'spring', stiffness: 300, damping: 20 }
              }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleViewDetail(card)}
              className="card-gradient min-h-[300px] rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-white/10 shadow-2xl transition-shadow duration-500 hover:shadow-brand-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.3)]"
            >
              {/* Inner Glow and Patterns */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute -inset-[50%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse pointer-events-none" />
              
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                <CardIcon className="w-32 h-32" />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">{card.bank}</p>
                  <p className="text-2xl font-mono tracking-widest text-white uppercase italic drop-shadow-lg">{card.name}</p>
                </div>
                <div className="flex gap-5 items-start">
                  <div className="h-12 w-28 bg-black/40 backdrop-blur-md rounded-2xl p-2 transition-all border border-white/5 flex flex-col justify-end group-hover:border-white/20">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={evolution}>
                          <Bar 
                            dataKey="value" 
                            radius={[2, 2, 0, 0]}
                            isAnimationActive={false}
                          >
                            {evolution.map((_entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index === 2 ? '#818cf8' : 'rgba(255,255,255,0.1)'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between px-1">
                      {evolution.map((m, idx) => (
                        <span key={idx} className="text-[6px] font-bold text-white/20 uppercase">{m.name.replace('.', '')}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleMoveToTrash(card.id, e)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/80 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                    <div className="w-12 h-8 bg-white/20 backdrop-blur-md rounded border border-white/30 flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-white/50 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-1">Gasto no Mês</p>
                    <p className="text-lg font-black text-white">R$ {monthlySpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-1">Disponível</p>
                    <p className="text-lg font-black text-indigo-300">R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40">Uso do Limite Total</p>
                      {evolution[2].value > evolution[1].value && (
                        <div className="flex items-center text-[8px] font-bold text-rose-400 gap-0.5">
                          <TrendingUp className="w-2 h-2" />
                          <span>+</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-white">R$ {card.limit.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${usage}%` }}
                      className={`h-full relative z-10 transition-colors duration-500 rounded-full ${
                        usage > 90 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : usage > 70 ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                    <span>{usage}% utilizado</span>
                    <span>Vence dia {card.dueDay}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(card);
                    }}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Expandir
                  </button>
                  <button
                    onClick={(e) => handleEdit(card, e)}
                    className="flex-1 py-2.5 bg-brand-primary/20 hover:bg-brand-primary/40 backdrop-blur-md border border-brand-primary/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Configurar
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {cards.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 bg-white/5 border border-dashed border-white/10 rounded-3xl opacity-40">
            <CardIcon className="w-12 h-12" />
            <p className="text-xs font-bold uppercase tracking-widest leading-none">Nenhum cartão vinculado</p>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <header className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-brand-primary" />
          <h3 className="text-lg font-semibold italic">Insights de Crédito</h3>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Dica de Score</p>
              <p className="text-xs font-medium text-slate-300">Seu uso de crédito está abaixo de 30%, o que é excelente para o seu Serasa Score.</p>
            </div>
          </div>
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Alerta de Fatura</p>
              <p className="text-xs font-medium text-slate-300">Uma de suas faturas vence em breve. O assistente pode agendar o pagamento para você.</p>
            </div>
          </div>
        </div>
      </div>

      <CardModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }} 
        initialData={editingCard}
      />

      <CardDetailModal 
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCard(null);
        }}
        card={selectedCard}
        transactions={transactions}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Cartão?"
        message="Tem certeza que deseja excluir este cartão? Ele será movido para a lixeira. As transações vinculadas a este cartão não serão afetadas."
        confirmText="Excluir Cartão"
      />
    </div>
  );
};
