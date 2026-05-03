export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  created_at: string;
}
