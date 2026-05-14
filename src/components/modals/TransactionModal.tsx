import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction, TransactionType, TransactionStatus } from '../../types';
import { categorizeTransaction } from '../../services/aiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addTransaction, updateTransaction, transactions, cards } = useFinance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [subcategory, setSubcategory] = useState('');
  const [cardId, setCardId] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.CONFIRMED);
  const [isCategorizing, setIsCategorizing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setCategory(initialData.category);
      setSubcategory(initialData.subcategory || '');
      setCardId(initialData.cardId || '');
      setIsRecurring(initialData.isRecurring || false);
      setType(initialData.type);
      setDate(initialData.date);
      setStatus(initialData.status || TransactionStatus.CONFIRMED);
    } else {
      setAmount('');
      setDescription('');
      setCategory('Alimentação');
      setSubcategory('');
      setCardId('');
      setIsRecurring(false);
      setType(TransactionType.EXPENSE);
      setDate(new Date().toISOString().split('T')[0]);
      setStatus(TransactionStatus.CONFIRMED);
    }
  }, [initialData, isOpen]);

  const handleAutoCategorize = async () => {
    if (!description || description.length < 3 || isCategorizing) return;
    
    setIsCategorizing(true);
    try {
      const suggestedCategory = await categorizeTransaction(description, transactions);
      setCategory(suggestedCategory);
    } catch (error) {
      console.error('Falha na categorização automática:', error);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const data = {
      amount: parseFloat(amount),
      description,
      category,
      subcategory: subcategory || null,
      cardId: cardId || null,
      type,
      date,
      status,
      isRecurring,
    };

    if (initialData) {
      await updateTransaction(initialData.id, data);
    } else {
      await addTransaction(data);
    }
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-bg-dark border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold italic tracking-tight">
                {initialData ? 'Editar Transação' : 'Nova Transação'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full ring-offset-bg-dark focus:ring-2 ring-brand-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setType(TransactionType.EXPENSE)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    type === TransactionType.EXPENSE ? 'bg-rose-500 text-white' : 'text-slate-500'
                  }`}
                >
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() => setType(TransactionType.INCOME)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    type === TransactionType.INCOME ? 'bg-emerald-500 text-white' : 'text-slate-500'
                  }`}
                >
                  Entrada
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all font-mono"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Descrição</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleAutoCategorize}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-4 pr-10 outline-none focus:border-brand-primary/30 transition-all"
                    placeholder="Ex: Almoço, Salário..."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isCategorizing ? (
                      <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-brand-primary opacity-50" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all appearance-none"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Moradia">Moradia</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Subcategoria (Opcional)</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all"
                    placeholder="Ex: Mercado, Uber..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Cartão Associado</label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all appearance-none"
                  >
                    <option value="">Nenhum</option>
                    {cards.map(card => (
                      <option key={card.id} value={card.id}>{card.bank} - {card.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary accent-brand-primary"
                />
                <label htmlFor="isRecurring" className="text-xs font-medium text-slate-400 cursor-pointer">
                  Transação Recorrente
                </label>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Status</label>
                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                  {[
                    { id: TransactionStatus.PENDING, label: 'Pendente', color: 'bg-amber-500/20 text-amber-500', activeColor: 'bg-amber-500 text-white' },
                    { id: TransactionStatus.CONFIRMED, label: 'Confirmada', color: 'bg-emerald-500/20 text-emerald-500', activeColor: 'bg-emerald-500 text-white' },
                    { id: TransactionStatus.CANCELED, label: 'Cancelada', color: 'bg-rose-500/20 text-rose-500', activeColor: 'bg-rose-500 text-white' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        status === s.id ? s.activeColor : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-primary/20 mt-4 active:scale-[0.98]"
              >
                Confirmar Registro
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
