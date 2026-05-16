import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Calendar,
  Tag,
  CreditCard,
  Trash2,
  ChevronDown,
  History,
  Edit2,
  X
} from 'lucide-react';
import { Transaction, TransactionStatus } from '../types';
import { TransactionModal } from '../components/modals/TransactionModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';

export const Transactions: React.FC = () => {
  const { transactions, cards, moveToTrash } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');
  const [filterCardId, setFilterCardId] = useState<string>('all');
  const [filterRecurring, setFilterRecurring] = useState<'all' | 'recurring' | 'one-time'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleMoveToTrash = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await moveToTrash('transactions', itemToDelete);
      setItemToDelete(null);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesStatus = filterStatus === 'all' || (t.status || TransactionStatus.CONFIRMED) === filterStatus;
    const matchesCard = filterCardId === 'all' || t.cardId === filterCardId;
    const matchesRecurring = filterRecurring === 'all' || 
                             (filterRecurring === 'recurring' ? t.isRecurring : !t.isRecurring);
    
    const tDate = new Date(t.date);
    const matchesStartDate = !startDate || tDate >= new Date(startDate);
    const matchesEndDate = !endDate || tDate <= new Date(endDate);
    
    return matchesSearch && matchesType && matchesStatus && matchesCard && matchesRecurring && matchesStartDate && matchesEndDate;
  });

  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description,
      t.category,
      t.type === 'income' ? 'Entrada' : 'Saída',
      t.amount.toString(),
      t.status || 'Confirmado'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white italic">Extrato</h1>
          <p className="text-sm text-slate-500">Histórico detalhado da sua vida financeira.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 sm:flex-none px-4 h-12 sm:h-10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-colors"
          >
            Exportar
          </button>
          <button 
            onClick={handleAddNew}
            className="flex-1 sm:flex-none px-6 h-12 sm:h-10 bg-brand-primary hover:bg-brand-primary/90 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/20"
          >
            + Lançamento
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 sm:h-10 bg-white/5 border border-white/5 rounded-xl py-2 pl-12 pr-4 outline-none focus:border-brand-primary/30 transition-all text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex flex-1 items-center gap-2 px-4 h-12 sm:h-10 bg-white/5 border border-white/5 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white outline-none [color-scheme:dark]"
              />
              <span className="text-slate-600 text-[10px] font-bold">A</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white outline-none [color-scheme:dark]"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 px-4 h-12 sm:h-10 rounded-xl border border-white/5">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <select
                value={filterCardId}
                onChange={(e) => setFilterCardId(e.target.value)}
                className="w-full bg-transparent text-[10px] font-bold uppercase tracking-widest text-white outline-none appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">Todos Cartões</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id} className="bg-slate-900">{card.bank}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
          {['all', 'income', 'expense'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0
                ${filterType === type 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                }
              `}
            >
              {type === 'all' ? 'Tudo' : type === 'income' ? 'Ganhos' : 'Gastos'}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-1 shrink-0 self-center" />
          {[
            { id: 'all', label: 'Toda Situação' },
            { id: TransactionStatus.PENDING, label: 'Pendentes' },
            { id: TransactionStatus.CONFIRMED, label: 'Confirmadas' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id as any)}
              className={`px-4 py-2 h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0
                ${filterStatus === s.id 
                  ? 'bg-indigo-400 text-white' 
                  : 'bg-white/5 text-slate-500 border border-white/5'
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile-Friendly List */}
      <div className="lg:hidden flex flex-col gap-3">
        {filteredTransactions.map((t) => (
          <motion.div 
            layout
            key={t.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-4 active:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{t.description}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                  {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => handleEdit(t)} className="p-2 text-slate-500"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleMoveToTrash(t.id)} className="p-2 text-rose-500/50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((t) => (
                <motion.tr 
                  layout
                  key={t.id} 
                  className="hover:bg-white/[0.02] group transition-colors"
                >
                  <td className="px-6 py-5 text-xs font-mono text-slate-400">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-bold text-white tracking-tight">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                      <Tag className="w-3 h-3" />
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-6 py-5 text-right font-bold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {(() => {
                      const status = t.status || TransactionStatus.CONFIRMED;
                      const config = {
                        [TransactionStatus.PENDING]: { label: 'Pendente', color: 'text-amber-500 bg-amber-500/5' },
                        [TransactionStatus.CONFIRMED]: { label: 'Confirmada', color: 'text-emerald-500 bg-emerald-500/5' },
                        [TransactionStatus.CANCELED]: { label: 'Cancelada', color: 'text-rose-500 bg-rose-500/5' }
                      };
                      const s = config[status];
                      return (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${s.color}`}>
                          {s.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(t)}
                        className="p-2 text-slate-600 hover:text-brand-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleMoveToTrash(t.id)}
                        className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4 opacity-40">
              <History className="w-12 h-12" />
              <p className="text-xs font-bold uppercase tracking-widest leading-none">Nenhum dado capturado</p>
            </div>
          )}
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }} 
        initialData={editingTransaction}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Mover para Lixeira?"
        message="Esta transação será movida para a lixeira e não aparecerá mais no dashboard."
        confirmText="Mover para Lixeira"
      />
    </div>
  );
};
