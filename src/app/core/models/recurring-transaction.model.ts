import { Category } from './category.model';

export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';
export type RecurringType = 'income' | 'expense';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: RecurringType;
  category_id: string | null;
  description: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  last_generated: string | null;
  next_run: string | null;
  active: boolean;
  created_at: string;
  category?: Category;
}

export interface CreateRecurringDto {
  amount: number;
  type: RecurringType;
  category_id: string | null;
  description: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
}
