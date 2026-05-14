import React from 'react';
import { 
  Trash2, 
  RotateCcw, 
  Trash, 
  ArrowLeft,
  CreditCard,
  Target,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../contexts/FinanceContext';
import { ConfirmModal } from '../components/modals/ConfirmModal';

export const TrashPage: React.FC = () => {
  const { 
    trashTransactions, 
    trashCards, 
    trashGoals, 
    restoreFromTrash, 
    permanentDelete,
    emptyTrash
  } = useFinance();

  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    type: 'transactions' | 'cards' | 'goals' | 'all';
    id: string;
    action: 'restore' | 'delete' | 'empty';
  }>({
    isOpen: false,
    type: 'transactions',
    id: '',
    action: 'restore'
  });

  const isEmpty = trashTransactions.length === 0 && trashCards.length === 0 && trashGoals.length === 0;

  const openConfirm = (type: 'transactions' | 'cards' | 'goals', id: string, action: 'restore' | 'delete') => {
    setConfirmConfig({ isOpen: true, type, id, action });
  };

  const handleEmptyTrash = () => {
    setConfirmConfig({ isOpen: true, type: 'all', id: '', action: 'empty' });
  };

  const handleAction = async () => {
    const { type, id, action } = confirmConfig;
    if (action === 'restore' && type !== 'all') {
      await restoreFromTrash(type, id);
    } else if (action === 'delete' && type !== 'all') {
      await permanentDelete(type, id);
    } else if (action === 'empty') {
      await emptyTrash();
    }
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white italic">Lixeira</h1>
          <p className="text-slate-500">Recupere itens excluídos ou apague-os permanentemente.</p>
        </div>
        {!isEmpty && (
          <button
            onClick={handleEmptyTrash}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold uppercase tracking-widest border border-rose-500/20 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Esvaziar Lixeira
          </button>
        )}
      </header>

      {isEmpty ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/5 border border-dashed border-white/10 rounded-3xl opacity-40">
          <Trash className="w-12 h-12" />
          <p className="text-xs font-bold uppercase tracking-widest leading-none">A lixeira está vazia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Transactions */}
          {trashTransactions.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <History className="w-4 h-4" /> Transações
              </h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-white/5">
                    {trashTransactions.map((t) => (
                      <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-white">{t.description}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{t.category}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openConfirm('transactions', t.id, 'restore')}
                              className="p-2 text-slate-500 hover:text-brand-primary transition-colors"
                              title="Restaurar"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openConfirm('transactions', t.id, 'delete')}
                              className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                              title="Excluir Permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Cards */}
          {trashCards.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Cartões
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trashCards.map((card) => (
                  <div key={card.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white">{card.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{card.bank}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openConfirm('cards', card.id, 'restore')}
                        className="p-2 text-slate-500 hover:text-brand-primary transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openConfirm('cards', card.id, 'delete')}
                        className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Goals */}
          {trashGoals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Target className="w-4 h-4" /> Metas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trashGoals.map((goal) => (
                  <div key={goal.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white">{goal.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Alvo: R$ {goal.targetAmount}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openConfirm('goals', goal.id, 'restore')}
                        className="p-2 text-slate-500 hover:text-brand-primary transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openConfirm('goals', goal.id, 'delete')}
                        className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleAction}
        title={
          confirmConfig.action === 'restore' ? "Restaurar Item?" : 
          confirmConfig.action === 'empty' ? "Esvaziar Lixeira?" :
          "Excluir Permanentemente?"
        }
        message={
          confirmConfig.action === 'restore' ? "Este item voltará para sua lista ativa imediatamente." :
          confirmConfig.action === 'empty' ? "Todos os itens na lixeira serão apagados para sempre. Esta ação não pode ser desfeita." :
          "ATENÇÃO: Esta ação não pode ser desfeita. O item será apagado para sempre."
        }
        confirmText={
          confirmConfig.action === 'restore' ? "Restaurar" : 
          confirmConfig.action === 'empty' ? "Esvaziar Agora" :
          "Excluir para Sempre"
        }
        type={confirmConfig.action === 'restore' ? 'warning' : 'danger'}
      />
    </div>
  );
};
