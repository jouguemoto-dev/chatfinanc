import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Transaction, Card, Goal } from '../types';

interface FinanceContextType {
  transactions: Transaction[];
  cards: Card[];
  goals: Goal[];
  trashTransactions: Transaction[];
  trashCards: Card[];
  trashGoals: Goal[];
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  addCard: (data: Partial<Card>) => Promise<void>;
  updateCard: (id: string, data: Partial<Card>) => Promise<void>;
  addGoal: (data: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  moveToTrash: (type: 'transactions' | 'cards' | 'goals', id: string) => Promise<void>;
  restoreFromTrash: (type: 'transactions' | 'cards' | 'goals', id: string) => Promise<void>;
  permanentDelete: (type: 'transactions' | 'cards' | 'goals', id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType>({
  transactions: [],
  cards: [],
  goals: [],
  trashTransactions: [],
  trashCards: [],
  trashGoals: [],
  addTransaction: async () => {},
  updateTransaction: async () => {},
  addCard: async () => {},
  updateCard: async () => {},
  addGoal: async () => {},
  updateGoal: async () => {},
  moveToTrash: async () => {},
  restoreFromTrash: async () => {},
  permanentDelete: async () => {},
  emptyTrash: async () => {},
  clearAllData: async () => {},
});

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [trashTransactions, setTrashTransactions] = useState<Transaction[]>([]);
  const [trashCards, setTrashCards] = useState<Card[]>([]);
  const [trashGoals, setTrashGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCards([]);
      setGoals([]);
      setTrashTransactions([]);
      setTrashCards([]);
      setTrashGoals([]);
      return;
    }

    // Queries para dados ativos
    const tQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    const cQuery = query(collection(db, 'cards'), where('userId', '==', user.uid), where('isDeleted', '==', false));
    const gQuery = query(collection(db, 'goals'), where('userId', '==', user.uid), where('isDeleted', '==', false));

    // Queries para lixeira
    const tTrashQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid), where('isDeleted', '==', true), orderBy('deletedAt', 'desc'));
    const cTrashQuery = query(collection(db, 'cards'), where('userId', '==', user.uid), where('isDeleted', '==', true), orderBy('deletedAt', 'desc'));
    const gTrashQuery = query(collection(db, 'goals'), where('userId', '==', user.uid), where('isDeleted', '==', true), orderBy('deletedAt', 'desc'));

    const unsubscribeT = onSnapshot(tQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    const unsubscribeC = onSnapshot(cQuery, (snapshot) => {
      setCards(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Card)));
    });

    const unsubscribeG = onSnapshot(gQuery, (snapshot) => {
      setGoals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
    });

    const unsubscribeTT = onSnapshot(tTrashQuery, (snapshot) => {
      setTrashTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    const unsubscribeTC = onSnapshot(cTrashQuery, (snapshot) => {
      setTrashCards(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Card)));
    });

    const unsubscribeTG = onSnapshot(gTrashQuery, (snapshot) => {
      setTrashGoals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
    });

    return () => {
      unsubscribeT(); unsubscribeC(); unsubscribeG();
      unsubscribeTT(); unsubscribeTC(); unsubscribeTG();
    };
  }, [user]);

  const addTransaction = async (data: Partial<Transaction>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        ...data,
        userId: user.uid,
        isDeleted: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'transactions'); }
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      await updateDoc(doc(db, 'transactions', id), { ...data, updatedAt: serverTimestamp() });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `transactions/${id}`); }
  };

  const addCard = async (data: Partial<Card>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'cards'), {
        ...data,
        userId: user.uid,
        isDeleted: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'cards'); }
  };

  const updateCard = async (id: string, data: Partial<Card>) => {
    try {
      await updateDoc(doc(db, 'cards', id), { ...data, updatedAt: serverTimestamp() });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `cards/${id}`); }
  };

  const addGoal = async (data: Partial<Goal>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'goals'), {
        ...data,
        userId: user.uid,
        isDeleted: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'goals'); }
  };

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    try {
      await updateDoc(doc(db, 'goals', id), { ...data, updatedAt: serverTimestamp() });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `goals/${id}`); }
  };

  const moveToTrash = async (type: 'transactions' | 'cards' | 'goals', id: string) => {
    try {
      await updateDoc(doc(db, type, id), { isDeleted: true, deletedAt: serverTimestamp() });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `${type}/${id}`); }
  };

  const restoreFromTrash = async (type: 'transactions' | 'cards' | 'goals', id: string) => {
    try {
      await updateDoc(doc(db, type, id), { isDeleted: false, deletedAt: null });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `${type}/${id}`); }
  };

  const permanentDelete = async (type: 'transactions' | 'cards' | 'goals', id: string) => {
    try {
      await deleteDoc(doc(db, type, id));
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, `${type}/${id}`); }
  };

  const emptyTrash = async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const collections = ['transactions', 'cards', 'goals'];
      for (const colName of collections) {
        const snap = await getDocs(query(collection(db, colName), where('userId', '==', user.uid), where('isDeleted', '==', true)));
        for (const d of snap.docs) {
          batch.delete(d.ref);
        }
      }
      await batch.commit();
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, 'empty_trash'); }
  };

  const clearAllData = async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const collections = ['transactions', 'cards', 'goals', 'chats'];
      for (const colName of collections) {
        const snap = await getDocs(query(collection(db, colName), where('userId', '==', user.uid)));
        for (const d of snap.docs) {
          if (colName === 'chats') {
            const mSnap = await getDocs(collection(db, `chats/${d.id}/messages`));
            mSnap.forEach(m => batch.delete(m.ref));
          }
          batch.delete(d.ref);
        }
      }
      await batch.commit();
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, 'multiple_collections'); }
  };

  return (
    <FinanceContext.Provider value={{ 
      transactions, cards, goals, 
      trashTransactions, trashCards, trashGoals,
      addTransaction, updateTransaction,
      addCard, updateCard,
      addGoal, updateGoal,
      moveToTrash, restoreFromTrash, permanentDelete,
      emptyTrash,
      clearAllData 
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
