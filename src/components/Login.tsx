import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Sparkles, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  auth
} from '../lib/firebase';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-8 md:p-12 rounded-3xl max-w-md w-full border border-white/5 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/20">
            <div className="w-8 h-8 border-4 border-white rounded-md rotate-45" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 tracking-tighter text-white italic pr-5 uppercase">RAIXI</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-none">Inteligência Financeira Ativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Seu Nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isSignUp}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-primary/50 focus:ring-0 transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-primary/50 focus:ring-0 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-primary/50 focus:ring-0 transition-colors"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-xs font-bold uppercase tracking-wider text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-brand-primary/90 transition-all active:scale-95 shadow-xl shadow-brand-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Criar Minha Conta' : 'Acessar Plataforma'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none">ou conectar com</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              await signInWithGoogle();
            } catch (err: any) {
              console.error('[Google Login Error]', err);
              if (err.code === 'auth/popup-blocked') {
                setError('O popup foi bloqueado pelo navegador. Por favor, permita popups para este site.');
              } else if (err.code === 'auth/popup-closed-by-user') {
                setError('O login foi cancelado antes de ser concluído.');
              } else if (err.code === 'auth/unauthorized-domain') {
                setError(`Este domínio (${window.location.hostname}) não está autorizado no Console do Firebase.`);
              } else {
                setError(`Erro no Google Login: ${err.message || 'Erro desconhecido'}`);
              }
            } finally {
              setLoading(false);
            }
          }}
          type="button"
          disabled={loading}
          className="w-full py-4 px-6 bg-white/5 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 border border-white/10 disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 opacity-80" />
          Google
        </button>

        <div className="mt-8">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-500 hover:text-brand-primary transition-colors font-bold uppercase tracking-widest"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar conta agora'}
          </button>
        </div>

        <p className="mt-10 text-[10px] text-slate-700 uppercase tracking-widest font-bold">
          Sessão Protegida por Criptografia FIPS
        </p>
      </motion.div>
    </div>
  );
};
