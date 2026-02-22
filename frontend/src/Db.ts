import Dexie, { type Table } from 'dexie';

export interface Transaction {
  _id?: string;
  amount: number;
  category: string;
  notes?: string;
  day: number;
  month: number;
  year: number;
}

export interface Budget {
  _id?: string;
  category: string;
  amount: number;
  notes?: string;
  month: number;
  year: number;
}

class FinanceDB extends Dexie {
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;

  constructor() {
    super('FinanceDB');
    this.version(1).stores({
      transactions: '_id, month, year, category',
      budgets: '_id, month, year, category',
    });
  }
}

export const db = new FinanceDB();

// Auto-generate string IDs (mirrors MongoDB ObjectId style)
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}