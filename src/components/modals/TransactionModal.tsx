import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, RefreshCcw, Check } from 'lucide-react';
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
  const [repetitionMode, setRepetitionMode] = useState<'none' | 'installments' | 'advanced'>('none');
  const [installments, setInstallments] = useState('1');
  const [startInstallment, setStartInstallment] = useState('1');
  const [repeatFrequency, setRepeatFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [repeatInterval, setRepeatInterval] = useState('1');
  const [isIndefinite, setIsIndefinite] = useState(false);
  const [totalOccurrences, setTotalOccurrences] = useState('1');
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
      
      if (initialData.installments && initialData.installments > 1 && !initialData.repeatFrequency) {
        setRepetitionMode('installments');
      } else if (initialData.repeatFrequency) {
        setRepetitionMode('advanced');
      } else {
        setRepetitionMode(initialData.isRecurring ? 'installments' : 'none');
      }

      setInstallments(initialData.installments?.toString() || '1');
      setStartInstallment(initialData.installmentNumber?.toString() || '1');
      setRepeatFrequency(initialData.repeatFrequency || 'monthly');
      setRepeatInterval(initialData.repeatInterval?.toString() || '1');
      setIsIndefinite(initialData.isIndefinite || false);
      setTotalOccurrences(initialData.totalOccurrences?.toString() || '1');
      
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
      setRepetitionMode('none');
      setInstallments('1');
      setStartInstallment('1');
      setRepeatFrequency('monthly');
      setRepeatInterval('1');
      setIsIndefinite(false);
      setTotalOccurrences('1');
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
      isRecurring: repetitionMode !== 'none',
      installments: repetitionMode === 'installments' ? parseInt(installments) : (repetitionMode === 'advanced' ? parseInt(totalOccurrences) : null),
      installmentNumber: repetitionMode === 'installments' ? parseInt(startInstallment) : null,
      repeatFrequency: repetitionMode === 'advanced' ? repeatFrequency : null,
      repeatInterval: repetitionMode === 'advanced' ? parseInt(repeatInterval) : null,
      isIndefinite: repetitionMode === 'advanced' ? isIndefinite : false,
      totalOccurrences: repetitionMode === 'advanced' ? (isIndefinite ? null : parseInt(totalOccurrences)) : null,
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black italic tracking-tighter text-white uppercase leading-none">
                  {initialData ? 'Editar' : 'Lançar'}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">RAIXI Core Sync</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-full text-white/30 hover:text-white transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Main Entry Section */}
              <div className="bg-[#121212]/50 border border-white/5 rounded-[28px] p-5">
                <div className="flex bg-black/40 p-1 rounded-xl mb-5 border border-white/5">
                  {[
                    { id: TransactionType.EXPENSE, label: 'Saída', color: 'rose' },
                    { id: TransactionType.INCOME, label: 'Entrada', color: 'emerald' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as TransactionType)}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        type === t.id 
                          ? t.color === 'rose' 
                            ? 'bg-rose-600 text-white shadow-lg' 
                            : 'bg-[#00D084] text-white shadow-lg'
                          : 'text-white/20 hover:text-white/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-black text-white/20">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent outline-none font-mono text-4xl font-black text-white placeholder:text-white/5 w-full max-w-[170px] text-center"
                      placeholder="0,00"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Data Fields */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleAutoCategorize}
                    className="w-full bg-[#121212] border border-white/5 rounded-xl py-3.5 px-5 outline-none focus:border-white/20 transition-all text-white/80 text-[11px] font-bold uppercase tracking-tight placeholder:text-white/10"
                    placeholder="Descrição"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isCategorizing ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500/20" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#121212] border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-white/20 appearance-none text-white/40 text-[9px] font-black uppercase tracking-[0.1em]"
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
                    className="w-full bg-[#121212] border border-white/5 rounded-xl py-3 px-5 outline-none focus:border-white/20 text-white/40 text-[9px] font-black uppercase font-mono"
                  />
                </div>

                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full bg-[#121212] border border-white/5 rounded-xl py-3 px-5 outline-none focus:border-white/20 appearance-none text-white/40 text-[9px] font-black uppercase tracking-[0.1em]"
                >
                  <option value="">Sem Cartão</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>{card.bank}</option>
                  ))}
                </select>
              </div>

              {/* Automation Section */}
              <div className="bg-[#121212]/30 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Repetição</span>
                    <div className="flex bg-black/40 p-1 rounded-lg gap-1 border border-white/5">
                      {[
                        { id: 'none', label: 'Não' },
                        { id: 'installments', label: 'Parc' },
                        { id: 'advanced', label: 'Avanç' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setRepetitionMode(m.id as any)}
                          className={`px-3 py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all ${
                            repetitionMode === m.id 
                              ? 'bg-indigo-600 text-white shadow-lg' 
                              : 'text-white/10 hover:text-white/20'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Status</span>
                    <div className="flex bg-black/40 p-1 rounded-lg gap-1 border border-white/5">
                      {[TransactionStatus.PENDING, TransactionStatus.CONFIRMED].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={`px-3 py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all ${
                            status === s 
                              ? 'bg-white text-black' 
                              : 'text-white/10 hover:text-white/20'
                          }`}
                        >
                          {s === TransactionStatus.PENDING ? 'Pend' : 'Conf'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {repetitionMode === 'installments' && (
                    <motion.div
                      key="installments"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-3 border-t border-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-white/10">Parcelas:</span>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-[6px] text-white/20 uppercase mb-1">Início</span>
                            <input type="number" value={startInstallment} onChange={(e) => setStartInstallment(e.target.value)} className="bg-black/60 outline-none w-10 py-1.5 rounded-lg text-center text-[10px] font-black text-white border border-white/5" />
                          </div>
                          <span className="text-[8px] font-black text-white/5 pt-4">/</span>
                          <div className="flex flex-col items-center">
                            <span className="text-[6px] text-white/20 uppercase mb-1">Total</span>
                            <input type="number" value={installments} onChange={(e) => setInstallments(e.target.value)} className="bg-black/60 outline-none w-10 py-1.5 rounded-lg text-center text-[10px] font-black text-white border border-white/5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {repetitionMode === 'advanced' && (
                    <motion.div
                      key="advanced"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-3 border-t border-white/5 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between bg-black/60 rounded-xl px-2.5 py-1.5 border border-white/5">
                          <span className="text-[7px] font-black uppercase text-white/20">Intervalo</span>
                          <input type="number" value={repeatInterval} onChange={(e) => setRepeatInterval(e.target.value)} className="bg-transparent outline-none w-6 text-center text-[9px] font-black text-white" />
                        </div>
                        <select value={repeatFrequency} onChange={(e) => setRepeatFrequency(e.target.value as any)} className="w-full bg-black/60 border border-white/5 rounded-xl px-2 py-1.5 outline-none text-white/40 text-[7px] font-black uppercase text-center appearance-none cursor-pointer">
                          <option value="daily">Dias</option>
                          <option value="weekly">Semanas</option>
                          <option value="monthly">Meses</option>
                          <option value="yearly">Anos</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <button type="button" onClick={() => setIsIndefinite(!isIndefinite)} className="flex items-center gap-2 group">
                          <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${isIndefinite ? 'bg-indigo-600 border-indigo-600' : 'border-white/10'}`}>
                            {isIndefinite && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-[7px] font-black uppercase tracking-[0.1em] text-white/20">Indefinido</span>
                        </button>
                        {!isIndefinite && (
                          <div className="flex items-center gap-3 bg-black/60 rounded-xl px-3 py-1.5 border border-white/5">
                            <span className="text-[7px] font-black uppercase text-white/10">Ocorrências:</span>
                            <input type="number" value={totalOccurrences} onChange={(e) => setTotalOccurrences(e.target.value)} className="bg-transparent outline-none w-6 text-center text-[9px] font-black text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-white hover:bg-[#F5F5F5] text-black rounded-2xl font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-[0.98] text-[10px] mt-2 mb-2"
              >
                {initialData ? 'Atualizar' : 'Efetivar Lançamento'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
