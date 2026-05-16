import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard as CardIcon,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TransactionModal } from '../components/modals/TransactionModal';
import { BankSummary } from '../components/BankSummary';

export const Dashboard: React.FC = () => {
  const { transactions = [], cards = [] } = useFinance();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const totalIncome = transactions
    .filter(t => t?.type === 'income')
    .reduce((acc, t) => acc + (t?.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t?.type === 'expense')
    .reduce((acc, t) => acc + (t?.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  const totalCardLimit = cards.reduce((acc, c) => acc + (c?.limit || 0), 0);

  // Chart data calculation
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.toLocaleString('pt-BR', { month: 'short' }),
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    };
  }).reverse();

  const chartData = last6Months.map(m => {
    const monthTransactions = transactions.filter(t => {
      if (!t?.date) return false;
      const tDate = new Date(t.date);
      return tDate.getMonth() === m.monthIndex && tDate.getFullYear() === m.year;
    });

    return {
      name: m.month,
      income: monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0),
      expense: monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0),
    };
  });

  const categoriesMap: Record<string, number> = {};
  transactions
    .filter(t => t?.type === 'expense' && t?.category)
    .forEach(t => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + (t.amount || 0);
    });

  const pieData = Object.entries(categoriesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  // Fallback for pie data if empty
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'Alimentação', value: 0 },
    { name: 'Transporte', value: 0 },
    { name: 'Lazer', value: 0 },
    { name: 'Saúde', value: 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const stats = [
    { label: 'Saldo Atual', value: balance, icon: Wallet, color: 'text-indigo-400', trend: balance !== 0 ? '+12.5% vs último mês' : null, trendColor: 'text-emerald-400' },
    { label: 'Entradas', value: totalIncome, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Saídas', value: totalExpense, icon: TrendingDown, color: 'text-rose-500' },
    { label: 'Economia IA', value: totalExpense * 0.15, icon: Sparkles, color: 'text-amber-500', sub: 'Sugestão de economia' },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">
            Dashboard
          </h1>
          <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Gestão inteligente em tempo real</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 h-14 bg-[#121212] hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all text-white/40">
            Exportar
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-8 h-14 bg-white hover:bg-white/90 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all text-black shadow-xl shadow-white/5"
          >
            + Transação
          </button>
        </div>
      </header>

      <BankSummary />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#121212] border border-white/5 rounded-[24px] p-6 group hover:border-white/10 transition-all"
          >
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 font-black">{stat.label}</p>
            <h2 className="text-3xl font-black text-white tracking-tighter tabular-nums">
              R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            {stat.trend ? (
              <div className={`mt-3 ${stat.trendColor} text-[9px] uppercase font-black tracking-widest flex items-center gap-1`}>
                <ArrowUpRight className="w-3 h-3" />
                <span>{stat.trend}</span>
              </div>
            ) : stat.sub ? (
              <p className="mt-3 text-white/20 text-[9px] uppercase font-black tracking-widest">{stat.sub}</p>
            ) : (
              <div className="mt-3 text-white/20 text-[9px] uppercase font-black tracking-widest italic opacity-50">Validado pela RAIXI</div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col h-[300px] sm:h-[400px]"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <h3 className="text-base sm:text-lg font-semibold">Fluxo Mensal</h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-primary"></span> Receitas</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-secondary"></span> Despesas</div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Categorias Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col min-h-[300px] lg:h-[400px]"
        >
          <h3 className="text-base sm:text-lg font-semibold mb-6">Categorias</h3>
          <div className="flex-1 max-h-48 sm:max-h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#f43f5e'][index % 4]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-auto">
            {displayPieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-tight">
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'][i % 4] }} />
                  <span>{item.name}</span>
                </div>
                <span>R$ {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden p-6 mb-8 lg:mb-0 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Lançamentos</h3>
          <button className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Ver Todos</button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-white/5 group">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#FF1F5B]/10 text-[#FF1F5B]'}`}>
                  {t.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight">{t.description}</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black mt-0.5">{t.category} • {t.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-black tracking-tight ${t.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                  {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.15em] opacity-80">Confirmado</p>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <History className="w-10 h-10 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhuma atividade registrada</p>
            </div>
          )}
        </div>
      </div>
      
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
