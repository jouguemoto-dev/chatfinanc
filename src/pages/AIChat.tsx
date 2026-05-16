import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User as UserIcon, Sparkles, Loader2, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { chatWithFinai } from '../services/gemini';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIChatProps {
  isSidebar?: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({ isSidebar }) => {
  const { user } = useAuth();
  const { 
    addTransaction, updateTransaction, addCard, addGoal, clearAllData,
    upsertMemory,
    transactions, cards, goals, memories 
  } = useFinance();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }
    setMessages([
      { role: 'assistant', content: `Olá ${user?.displayName || 'Usuário'}! Analisei seus registros financeiros e memórias. Estou pronto para ajudar com insights estratégicos. O que deseja fazer?`, timestamp: new Date() }
    ]);
  }, [user]);

  const getFinancialContext = () => {
    const activeTransactions = (transactions || []).slice(0, 30).map(t => 
      `- ID: ${t?.id} | ${t?.date}: ${t?.description} (R$ ${t?.amount}) [${t?.type === 'income' ? 'Receita' : 'Depesa'}] Category: ${t?.category}`
    ).join('\n');

    const activeCards = (cards || []).map(c => 
      `- ID: ${c?.id} | ${c?.name} (${c?.bank}): Limite R$ ${c?.limit}, Vence dia ${c?.dueDay}`
    ).join('\n');

    const activeGoals = (goals || []).map(g => 
      `- ID: ${g?.id} | ${g?.name}: Alvo R$ ${g?.targetAmount}, Atual R$ ${g?.currentAmount}, Vence em ${g?.dueDate}`
    ).join('\n');

    const learnedMemories = (memories || []).map(m => 
      `- [${m.category.toUpperCase()}]: ${m.fact} (Relevância: ${m.relevance})`
    ).join('\n');

    return `
    DADOS FINANCEIROS RECENTES:
    ${activeTransactions || 'Nenhuma transação registrada.'}

    ATIVOS (CARTÕES):
    ${activeCards || 'Nenhum cartão registrado.'}

    OBJETIVOS ESTRATÉGICOS:
    ${activeGoals || 'Nenhum objetivo registrado.'}

    MEMÓRIA DE LONGO PRAZO (Aprendizados):
    ${learnedMemories || 'Nenhum aprendizado prévio.'}
    `;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const context = getFinancialContext();
      const response = await chatWithFinai(currentInput, history, context);
      
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: response.text || (response.functionCalls && response.functionCalls.length > 0 ? "Processando e aprendendo com sua solicitação..." : ""), 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          const args = call.args as any;
          
          if (call.name === 'addTransaction') {
            await addTransaction({
              ...args,
              isRecurring: false
            });
          } else if (call.name === 'updateTransaction') {
            const { id, ...updateData } = args;
            await updateTransaction(id, updateData);
          } else if (call.name === 'addCard') {
            await addCard(args);
          } else if (call.name === 'addGoal') {
            await addGoal(args);
          } else if (call.name === 'clearAllData') {
            await clearAllData();
          } else if (call.name === 'upsertMemory') {
            await upsertMemory(args);
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Ops, tive um probleminha técnico. Pode repetir?';
      
      if (error?.message?.includes('GEMINI_API_KEY')) {
        errorMessage = 'A chave da API (GEMINI_API_KEY) não foi configurada. Se você estiver no Vercel, adicione-a nas variáveis de ambiente.';
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-surface ${isSidebar ? '' : 'rounded-2xl overflow-hidden shadow-2xl border border-white/5'}`}>
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-sm font-bold">Agente Inteligente</h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider leading-none">IA Operacional Ativa</p>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-none flex items-center gap-1">
                <Sparkles className="w-2 h-2 text-brand-primary" />
                Contexto Profundo
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{ role: 'assistant', content: 'Histórico limpo. Como posso ajudar com seus dados agora?', timestamp: new Date() }])}
            className="ml-auto p-2 text-slate-500 hover:text-white transition-colors"
            title="Limpar Chat"
          >
            <PlusCircle className="w-4 h-4 rotate-45" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
              {msg.role === 'assistant' ? 'Finai' : 'Você'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className={`p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-brand-primary rounded-tr-none text-white' 
                : 'bg-white/5 border border-white/10 rounded-tl-none text-slate-200'
            }`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10">
              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
            </div>
          </div>
        )}
        
        {isSidebar && (
          <div className="mt-auto bg-gradient-to-br from-indigo-500/10 to-brand-primary/10 border border-brand-primary/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-bold text-brand-primary uppercase tracking-tighter">Insight de Memória</span>
              </div>
              {memories.length > 0 && <span className="text-[8px] bg-brand-primary/20 px-1.5 py-0.5 rounded text-brand-primary font-bold uppercase">{memories.length} Ativos</span>}
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {memories.length > 0 
                ? memories[0].fact 
                : "Comece a conversar para que eu aprenda seus padrões e ofereça insights personalizados."}
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 pt-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Fale com o assistente..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-3 p-1.5 bg-brand-primary text-white rounded-lg disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
