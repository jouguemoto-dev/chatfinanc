import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plane, Car, Home, ShieldCheck, Target } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Goal } from '../../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addGoal, updateGoal } = useFinance();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [category, setCategory] = useState('Viagem');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTargetAmount(initialData.targetAmount.toString());
      setCurrentAmount(initialData.currentAmount.toString());
      setCategory(initialData.category);
      setDueDate(initialData.dueDate);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setCategory('Viagem');
      setDueDate('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !dueDate) return;

    const data = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || '0'),
      category,
      dueDate,
    };

    if (initialData) {
      await updateGoal(initialData.id, data);
    } else {
      await addGoal(data);
    }
    
    onClose();
  };

  const categories = [
    { name: 'Viagem', icon: Plane },
    { name: 'Transporte', icon: Car },
    { name: 'Casa', icon: Home },
    { name: 'Segurança', icon: ShieldCheck },
    { name: 'Outros', icon: Target },
  ];

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
                {initialData ? 'Editar Objetivo' : 'Novo Objetivo'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Nome do Sonho</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all"
                  placeholder="Ex: Viagem Japão, Compra Carro..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Valor Meta</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all font-mono"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Valor Atual</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all font-mono"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Prazo Final</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-brand-primary/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Categoria</label>
                <div className="grid grid-cols-5 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${
                        category === cat.name 
                          ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                          : 'bg-white/5 border-transparent text-slate-500'
                      }`}
                    >
                      <cat.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-primary/20 mt-4 active:scale-[0.98]"
              >
                Planejar Objetivo
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
