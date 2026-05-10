import { Category } from './category.model';

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  category_id: string | null;
  limit_amount: number;
  auto_renew: boolean;
  created_at: string;
  category?: Category;
  spent_amount?: number;
  usage_percentage?: number;
}

export interface CreateBudgetDto {
  month: string;
  category_id: string;
  limit_amount: number;
  auto_renew: boolean;
}
