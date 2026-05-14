import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../../types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Card | null;
}

export const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addCard, updateCard } = useFinance();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [limit, setLimit] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [bestDay, setBestDay] = useState('1');
  const [brand, setBrand] = useState('Visa');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (initialData) {
      setName(initialData.name);
      setBank(initialData.bank);
      setLimit(initialData.limit.toString());
      setDueDay(initialData.dueDay.toString());
      setBestDay(initialData.bestDay.toString());
      setBrand(initialData.brand);
    } else {
      setName('');
      setBank('');
      setLimit('');
      setDueDay('10');
      setBestDay('1');
      setBrand('Visa');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bank || !limit) return;

    const parsedLimit = parseFloat(limit);
    const parsedDueDay = parseInt(dueDay);
    const parsedBestDay = parseInt(bestDay);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('O limite deve ser um número positivo.');
      return;
    }
    
    if (isNaN(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
      setError('O dia do vencimento deve ser entre 1 e 31.');
      return;
    }
    
    if (isNaN(parsedBestDay) || parsedBestDay < 1 || parsedBestDay > 31) {
      setError('O melhor dia de compra deve ser entre 1 e 31.');
      return;
    }

    setError(null);
    const data = {
      name,
      bank,
      limit: parsedLimit,
      dueDay: parsedDueDay,
      bestDay: parsedBestDay,
      brand,
      color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    };

    if (initialData) {
      await updateCard(initialData.id, data);
    } else {
      await addCard(data);
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
                {initialData ? 'Editar Cartão' : 'Vincular Novo Cartão'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Nome do Cartão (Apelido)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all"
                  placeholder="Ex: Nubank Principal"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Instituição Financeira</label>
                <input
                  type="text"
                  required
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all"
                  placeholder="Ex: Itaú, Bradesco, Santander..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Limite Total</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all font-mono"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Bandeira</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Elo">Elo</option>
                    <option value="American Express">Amex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Dia do Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Melhor Dia Compra</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={bestDay}
                    onChange={(e) => setBestDay(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all font-mono"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"
                >
                  <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider text-center">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-primary/20 mt-4 active:scale-[0.98]"
              >
                {initialData ? 'Salvar Alterações' : 'Vincular Cartão'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
