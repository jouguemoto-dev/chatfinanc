import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight,
  TrendingUp,
  CreditCard as CardIcon
} from 'lucide-react';
import { motion } from 'motion/react';

export const BankSummary: React.FC = () => {
  const { transactions = [], cards = [] } = useFinance();

  // 1. Calculate Balance Evolution (Last 90 days)
  const last90Days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  let runningBalance = 0;
  // Separate transactions into those before the 90-day window and those within it
  const oldestDate = last90Days[0];
  
  const initialBalance = transactions
    .filter(t => t.date < oldestDate && !t.isDeleted)
    .reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0);

  runningBalance = initialBalance;

  const evolutionData = last90Days.map(date => {
    const dayTransactions = transactions.filter(t => t.date === date && !t.isDeleted);
    dayTransactions.forEach(t => {
      if (t.type === 'income') runningBalance += t.amount;
      if (t.type === 'expense') runningBalance -= t.amount;
    });
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      balance: runningBalance
    };
  });

  // Take only last 3 months (roughly 90 days, but labels every 15 days)
  const chartData = evolutionData;

  // 2. Upcoming Bills (Heuristic: Sum of current month's card expenses)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const cardSummaries = cards.map(card => {
    const monthlyExpenses = transactions
      .filter(t => t.cardId === card.id && !t.isDeleted)
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      ...card,
      currentBill: monthlyExpenses,
      availableLimit: card.limit - monthlyExpenses
    };
  });

  const totalCurrentBalance = transactions
    .filter(t => !t.isDeleted)
    .reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      {/* Balance Card & Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="xl:col-span-2 bg-gradient-to-br from-indigo-600/20 to-purple-600/5 border border-white/10 rounded-3xl p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Saldo Disponível</span>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter">
              R$ {totalCurrentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="flex gap-2">
             <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Evolução 3m</p>
                  <p className="text-xs font-bold text-emerald-400">+R$ {(chartData[chartData.length-1].balance - chartData[0].balance).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Saldo']}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#6366f1" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#balanceGrad)" 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Credit Cards Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold italic text-white">Cartões & Faturas</h3>
          <CardIcon className="w-5 h-5 text-slate-500" />
        </div>

        <div className="space-y-4 flex-1">
          {cardSummaries.map((card) => (
            <div key={card.id} className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-indigo-500/30 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-black italic text-brand-primary">{card.brand}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{card.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{card.bank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white">R$ {card.currentBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fatura Atual</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (card.currentBill / card.limit) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  <span>Limite Usado</span>
                  <span>{((card.currentBill / card.limit) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
          
          {cards.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
              <CardIcon className="w-10 h-10 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhum cartão ativo</p>
            </div>
          )}
        </div>

        <button className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
          Ver Faturas Detalhadas <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
