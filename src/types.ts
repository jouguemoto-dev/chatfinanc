export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  INVESTMENT = 'investment'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled'
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  date: string;
  description: string;
  status: TransactionStatus;
  cardId?: string;
  isRecurring: boolean;
  installments?: number;
  installmentNumber?: number;
  isDeleted?: boolean;
  deletedAt?: any;
  createdAt: any;
  updatedAt?: any;
}

export interface Card {
  id: string;
  userId: string;
  name: string;
  bank: string;
  color: string;
  brand: string;
  limit: number;
  bestDay: number;
  dueDay: number;
  isDeleted?: boolean;
  deletedAt?: any;
  createdAt: any;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  dueDate: string;
  isDeleted?: boolean;
  deletedAt?: any;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: any;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  lastMessage: string;
  updatedAt: any;
}

export interface Memory {
  id: string;
  userId: string;
  fact: string;
  category: 'preference' | 'behavior' | 'insight' | 'goal_detail';
  relevance: number;
  updatedAt: any;
}
