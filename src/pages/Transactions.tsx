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
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white italic">Transações</h1>
          <p className="text-slate-500">Histórico detalhado de toda atividade operacional.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10 transition-colors"
          >
            Exportar CSV
          </button>
          <button 
            onClick={handleAddNew}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 rounded-lg text-sm font-semibold transition-colors"
          >
            + Nova Entrada
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row gap-4 items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:border-brand-primary/30 transition-all text-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            {/* Date Picker Range */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none focus:text-brand-primary transition-all [color-scheme:dark]"
                />
              </div>
              <span className="text-slate-600 text-[10px] font-bold uppercase">Até</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-white outline-none focus:text-brand-primary transition-all [color-scheme:dark]"
              />
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                  title="Limpar Datas"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5 min-w-[200px]">
            <CreditCard className="w-4 h-4 text-slate-500" />
            <select
              value={filterCardId}
              onChange={(e) => setFilterCardId(e.target.value)}
              className="w-full bg-transparent text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:text-brand-primary transition-all appearance-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Todos os Cartões</option>
              {cards.map(card => (
                <option key={card.id} value={card.id} className="bg-slate-900 text-white">{card.bank} - {card.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 ml-auto pointer-events-none" />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos Status' },
              { id: TransactionStatus.PENDING, label: 'Pendentes' },
              { id: TransactionStatus.CONFIRMED, label: 'Confirmadas' },
              { id: TransactionStatus.CANCELED, label: 'Canceladas' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id as any)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                  ${filterStatus === s.id 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-white/5 text-slate-500 hover:text-white'
                  }
                `}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Toda Freq.' },
              { id: 'recurring', label: 'Recorrentes' },
              { id: 'one-time', label: 'Únicas' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setFilterRecurring(r.id as any)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                  ${filterRecurring === r.id 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-white/5 text-slate-500 hover:text-white'
                  }
                `}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {['all', 'income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                  ${filterType === type 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-white/5 text-slate-500 hover:text-white'
                  }
                `}
              >
                {type === 'all' ? 'Ver Todos' : type === 'income' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
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
