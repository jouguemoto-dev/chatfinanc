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
  const [installments, setInstallments] = useState('1');
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
      setInstallments(initialData.installments?.toString() || '1');
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
      setInstallments('1');
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
      installments: isRecurring ? parseInt(installments) : null,
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[400px] max-h-[92vh] sm:max-h-none sm:h-auto bg-[#080808] border-t sm:border border-white/5 rounded-t-[40px] sm:rounded-[32px] p-8 shadow-2xl overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">
                  {initialData ? 'Editar' : 'Lançar'}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Rede RAIXI Ativa</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white/40 hover:text-white transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Switcher */}
              <div className="flex bg-[#121212] p-1 rounded-2xl gap-1 border border-white/5">
                {[
                  { id: TransactionType.EXPENSE, label: 'Saída', color: 'rose' },
                  { id: TransactionType.INCOME, label: 'Entrada', color: 'emerald' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as TransactionType)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                      type === t.id 
                        ? t.color === 'rose' 
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                          : 'bg-[#00D084] text-white shadow-lg shadow-emerald-500/20'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Valor Principal */}
              <div className="text-center py-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-3">Montante</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-black text-white/20">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent outline-none font-mono text-5xl font-black text-white placeholder:text-white/5 w-full max-w-[200px] text-center"
                    placeholder="0,00"
                    autoFocus
                  />
                </div>
              </div>

              {/* Inputs Agrupados */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleAutoCategorize}
                    className="w-full bg-[#121212] border border-white/5 rounded-2xl py-5 px-6 outline-none focus:border-white/20 transition-all text-white/80 text-sm font-bold placeholder:text-white/10 uppercase tracking-tight"
                    placeholder="Descrição do Gasto"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    {isCategorizing ? (
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-indigo-500/30" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#121212] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-white/20 transition-all appearance-none text-white/40 text-[10px] font-black uppercase tracking-[0.2em]"
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
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#121212] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-white/20 transition-all text-white/40 text-[10px] font-black font-mono uppercase"
                  />
                </div>

                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full bg-[#121212] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-white/20 transition-all appearance-none text-white/40 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <option value="">Sem Cartão Associado</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>{card.bank} • {card.name}</option>
                  ))}
                </select>
              </div>

              {/* Advanced Config */}
              <div className="bg-[#121212]/30 border border-white/5 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <button 
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`flex items-center gap-3 transition-all ${isRecurring ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                  >
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isRecurring ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/20' : 'border-white/10'}`}>
                      {isRecurring && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recorrência</span>
                  </button>

                  <div className="flex bg-black/40 p-1.5 rounded-xl gap-1">
                    {[TransactionStatus.PENDING, TransactionStatus.CONFIRMED].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all ${
                          status === s 
                            ? 'bg-white text-black shadow-lg' 
                            : 'text-white/20 hover:text-white/40'
                        }`}
                      >
                        {s === TransactionStatus.PENDING ? 'Pend' : 'Conf'}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-6 border-t border-white/5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Nº de Parcelas</span>
                        <div className="flex items-center gap-1 bg-black/60 rounded-xl p-1">
                          <button 
                            type="button" 
                            onClick={() => setInstallments(Math.max(1, parseInt(installments) - 1).toString())}
                            className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={installments}
                            onChange={(e) => setInstallments(e.target.value)}
                            className="bg-transparent outline-none w-10 text-center text-sm font-black text-white"
                          />
                          <button 
                            type="button" 
                            onClick={() => setInstallments((parseInt(installments) + 1).toString())}
                            className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                className="w-full py-6 bg-white hover:bg-[#F5F5F5] text-black rounded-[32px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] text-[12px]"
              >
                {initialData ? 'Atualizar Dados' : 'Efetivar Lançamento'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
