import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Calendar, BarChart3, ShieldCheck, Zap, Info, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';
import { Card, Transaction, TransactionType } from '../../types';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  transactions: Transaction[];
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ isOpen, onClose, card, transactions }) => {
  if (!card) return null;

  const cardTransactions = transactions.filter(t => t.cardId === card.id);
  const totalSpent = cardTransactions.reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : 0), 0);
  const availableLimit = card.limit - totalSpent;
  const usagePercentage = Math.min(Math.round((totalSpent / card.limit) * 100), 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header / Card Preview Area */}
            <div className="p-8 pb-4 relative">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <CreditCard className="w-6 h-6 text-brand-primary" />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className={`p-8 rounded-3xl h-52 relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-brand-primary/10`} 
                   style={{ background: `linear-gradient(135deg, ${card.color || '#1e1e1e'} 0%, #000000 100%)`, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <CreditCard className="w-32 h-32" />
                </div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-1">{card.bank}</p>
                    <h3 className="text-xl font-mono tracking-widest text-white uppercase italic">{card.name}</h3>
                  </div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <p className="text-[10px] font-black text-white italic tracking-tighter uppercase">{card.brand}</p>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-white/40 leading-none mb-2">Limite Disponível</p>
                      <p className="text-3xl font-bold text-white">R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-white/40 leading-none mb-1 text-right">Limite Total</p>
                      <p className="text-sm font-bold text-white/80">R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Vencimento</span>
                  </div>
                  <p className="text-xl font-bold text-white">Todo dia {card.dueDay}</p>
                  <p className="text-[10px] text-slate-600 font-medium mt-1">Próximo: {new Date().toLocaleDateString('pt-BR', { month: 'long' })}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2 text-slate-500">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Melhor Compra</span>
                  </div>
                  <p className="text-xl font-bold text-white">Dia {card.bestDay}</p>
                  <p className="text-[10px] text-slate-600 font-medium mt-1">Cerca de 40 dias de prazo</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-primary/5 to-transparent border border-brand-primary/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-brand-primary" />
                  <h4 className="text-sm font-bold uppercase tracking-widest italic">Análise de Utilização</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uso do Limite</p>
                      <p className="text-xs font-bold text-slate-300">{usagePercentage}% Utilizado</p>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercentage}%` }}
                        className="h-full bg-brand-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-white/5 pt-4">
                    <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Gasto no Mês</p>
                      <p className="text-lg font-bold text-rose-400">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Transações</p>
                      <p className="text-lg font-bold text-white">{cardTransactions.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                    <Info className="w-4 h-4 text-brand-primary shrink-0" />
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                      {usagePercentage > 30 
                        ? "Atenção: Você ultrapassou 30% do limite. Isso pode impactar seu score de crédito." 
                        : "Excelente: Seu uso de limite está saudável e ajuda a construir um bom histórico."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <History className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Últimas Transações</h4>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {cardTransactions.length > 0 ? (
                    cardTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white truncate max-w-[150px]">{t.description}</p>
                            <p className="text-[8px] text-slate-500 uppercase tracking-tighter">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <p className={`text-xs font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-300'}`}>
                          {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-white/5 border border-dashed border-white/10 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nenhuma transação encontrada</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all mt-2 active:scale-95"
              >
                Fechar Visualização
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
