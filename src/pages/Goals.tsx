import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { motion } from 'motion/react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Trophy,
  Plane,
  Car,
  Home,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Trash2,
  Edit2
} from 'lucide-react';
import { Goal } from '../types';
import { GoalModal } from '../components/modals/GoalModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';

export const Goals: React.FC = () => {
  const { goals, trashGoals, moveToTrash } = useFinance();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null);
  const [hiddenMockIds, setHiddenMockIds] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('hidden_mock_goals');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('hidden_mock_goals', JSON.stringify(hiddenMockIds));
  }, [hiddenMockIds]);

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleMoveToTrash = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      if (['1', '2', '3'].includes(itemToDelete)) {
        setHiddenMockIds(prev => [...prev, itemToDelete]);
        setItemToDelete(null);
        return;
      }
      await moveToTrash('goals', itemToDelete);
      setItemToDelete(null);
    }
  };

  // Mock goals if empty to show the design
  const allMockGoals = [
    { id: '1', name: 'Viagem Japão', targetAmount: 20000, currentAmount: 8500, category: 'Viagem', dueDate: '2026-12-01', icon: Plane },
    { id: '2', name: 'Novo Carro', targetAmount: 85000, currentAmount: 15000, category: 'Transporte', dueDate: '2027-06-01', icon: Car },
    { id: '3', name: 'Reserva Emergência', targetAmount: 15000, currentAmount: 12000, category: 'Segurança', dueDate: '2026-08-01', icon: ShieldCheck },
  ];

  const visibleMockGoals = allMockGoals.filter(m => !hiddenMockIds.includes(m.id));
  const hasAnyRealGoal = goals.length > 0 || trashGoals.length > 0;
  const displayGoals = hasAnyRealGoal ? goals : visibleMockGoals;

  const getIcon = (category: string) => {
    switch (category) {
      case 'Viagem': return Plane;
      case 'Transporte': return Car;
      case 'Segurança': return ShieldCheck;
      default: return Target;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white italic">Objetivos Financeiros</h1>
          <p className="text-slate-500">Metas de curto, médio e longo prazo validadas.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayGoals.map((goal, i) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const Icon = (goal as any).icon || getIcon(goal.category);
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{goal.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Prazo: {new Date(goal.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-xl font-bold text-white leading-none">R$ {goal.targetAmount.toLocaleString('pt-BR')}</p>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-1">Objetivo</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {('userId' in goal) ? (
                      <>
                        <button 
                          onClick={() => handleEdit(goal as Goal)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-primary/20 text-slate-600 hover:text-brand-primary transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMoveToTrash(goal.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleMoveToTrash(goal.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight text-slate-400">
                  <span>Progresso Realizado</span>
                  <span className="text-indigo-400">{Math.round(progress)}% Completado</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">
                  <span>Atual: R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
                  <span>Restam R$ {(goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
                <p className="text-[10px] font-bold text-slate-300 leading-tight uppercase tracking-wider uppercase">
                  Aportando R$ 500/mês, você atinge o objetivo {progress > 50 ? 'antes do prazo' : 'conforme planejado'}.
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {displayGoals.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/5 border border-dashed border-white/10 rounded-3xl opacity-40">
          <Target className="w-12 h-12" />
          <p className="text-xs font-bold uppercase tracking-widest leading-none">Nenhum objetivo definido</p>
          <button 
            onClick={handleAddNew}
            className="mt-2 text-brand-primary text-[10px] font-bold uppercase tracking-widest hover:underline"
          >
            Começar a Planejar
          </button>
        </div>
      )}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
             <Trophy className="w-10 h-10 text-brand-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2 tracking-tighter italic">Estratégia Operacional</h3>
            <p className="text-slate-400 max-w-2xl text-sm font-medium">
              Sua taxa de economia atual de <span className="text-emerald-400 font-bold tracking-widest">R$ 1.850,00</span> acelerou suas metas em 15%. 
              Recomendamos o rebalanceamento de ativos para manter este ritmo sem comprometer a liquidez.
            </p>
          </div>
          <button className="bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20">
            Análise Avançada
          </button>
        </div>
      </div>

      <GoalModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }} 
        initialData={editingGoal}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Mover Objetivo p/ Lixeira?"
        message="Este sonho será movido para a lixeira temporariamente."
        confirmText="Mover para Lixeira"
      />
    </div>
  );
};
