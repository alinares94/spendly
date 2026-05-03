import { Category } from './category.model';

export type TransactionType = 'income' | 'expense';
export type TransactionSource = 'manual' | 'recurring';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  date: string;
  description: string | null;
  source: TransactionSource;
  recurring_id: string | null;
  created_at: string;
  deleted_at: string | null;
  category?: Category;
}

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  category_id: string | null;
  date: string;
  description: string | null;
  source?: TransactionSource;
  recurring_id?: string | null;
}
