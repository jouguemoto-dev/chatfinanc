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
  Eye
} from 'lucide-react';
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

  const getAvailableLimit = (card: Card) => {
    const spent = transactions
      .filter(t => t.cardId === card.id && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return card.limit - spent;
  };

  const getUsagePercentage = (card: Card) => {
    const spent = transactions
      .filter(t => t.cardId === card.id && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return Math.min(Math.round((spent / card.limit) * 100), 100);
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
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white italic">Gestão de Cartões</h1>
          <p className="text-slate-500">Control de limites e faturas centralizado.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Cartão
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const available = getAvailableLimit(card);
          const usage = getUsagePercentage(card);
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleViewDetail(card)}
              className={`card-gradient min-h-[220px] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-brand-primary/10 transition-all border border-white/5`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <CardIcon className="w-24 h-24" />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">{card.bank}</p>
                  <p className="text-lg font-mono tracking-widest text-white uppercase italic">{card.name}</p>
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

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-white/60 leading-none mb-1">Limite Disponível</p>
                    <p className="text-2xl font-bold text-white">R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-white/60 leading-none mb-1">Vencimento</p>
                    <p className="text-sm font-bold text-white">Dia {card.dueDay}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${usage}%` }}
                      className="h-full bg-white shadow-[0_0_10px_white]" 
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(card);
                      }}
                      className="flex-1 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-3 h-3" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={(e) => handleEdit(card, e)}
                      className="flex-1 py-2 bg-brand-primary/20 hover:bg-brand-primary/40 backdrop-blur-md border border-brand-primary/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
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
