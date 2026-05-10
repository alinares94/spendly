import { Injectable, inject } from '@angular/core';
import { Budget, CreateBudgetDto } from '@core/models/budget.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private supabase = inject(SupabaseService);

  async getBudgets(month?: string): Promise<Budget[]> {
    let query = this.supabase.client
      .from('budgets')
      .select('*, category:categories(*)')
      .order('created_at');

    if (month) query = query.eq('month', `${month}-01`);

    const { data, error } = await query;
    if (error) throw error;
    return data as Budget[];
  }

  async getBudgetUsage(month: string): Promise<Budget[]> {
    const [year, m] = month.split('-');
    const daysInMonth = new Date(+year, +m, 0).getDate();
    const from = `${year}-${m}-01`;
    const to = `${year}-${m}-${String(daysInMonth).padStart(2, '0')}`;

    const [{ data: budgets, error: bErr }, { data: transactions, error: tErr }] = await Promise.all([
      this.supabase.client
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('month', from),
      this.supabase.client
        .from('transactions')
        .select('category_id, amount')
        .eq('type', 'expense')
        .gte('date', from)
        .lte('date', to)
        .is('deleted_at', null),
    ]);

    if (bErr) throw bErr;
    if (tErr) throw tErr;

    const spendingMap = new Map<string, number>();
    for (const tx of transactions ?? []) {
      const prev = spendingMap.get(tx.category_id) ?? 0;
      spendingMap.set(tx.category_id, prev + tx.amount);
    }

    return (budgets ?? []).map((b) => {
      const spent = spendingMap.get(b.category_id) ?? 0;
      return {
        ...b,
        spent_amount: spent,
        usage_percentage: Math.min(100, Math.round((spent / b.limit_amount) * 100)),
      };
    }) as Budget[];
  }

  async createBudget(dto: CreateBudgetDto): Promise<Budget> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const month = `${dto.month}-01`;
    const { data, error } = await this.supabase.client
      .from('budgets')
      .insert({ ...dto, month, user_id: user.id })
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as Budget;
  }

  async updateBudget(id: string, updates: { limit_amount?: number; auto_renew?: boolean }): Promise<Budget> {
    const { data, error } = await this.supabase.client
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as Budget;
  }

  async deleteBudget(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('budgets')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async processBudgets(): Promise<void> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) return;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Categorías que ya tienen presupuesto este mes
    const { data: existing } = await this.supabase.client
      .from('budgets')
      .select('category_id')
      .eq('user_id', user.id)
      .eq('month', currentMonth);

    const existingCategories = new Set((existing ?? []).map((b: { category_id: string }) => b.category_id));

    // Presupuestos auto_renew de meses anteriores, ordenados por mes desc
    const { data: templates } = await this.supabase.client
      .from('budgets')
      .select('category_id, limit_amount')
      .eq('user_id', user.id)
      .eq('auto_renew', true)
      .lt('month', currentMonth)
      .order('month', { ascending: false });

    if (!templates?.length) return;

    // El más reciente por categoría
    const latestByCategory = new Map<string, number>();
    for (const t of templates as { category_id: string; limit_amount: number }[]) {
      if (!latestByCategory.has(t.category_id)) {
        latestByCategory.set(t.category_id, t.limit_amount);
      }
    }

    const toInsert = [];
    for (const [category_id, limit_amount] of latestByCategory) {
      if (!existingCategories.has(category_id)) {
        toInsert.push({ user_id: user.id, category_id, limit_amount, month: currentMonth, auto_renew: true });
      }
    }

    if (toInsert.length) {
      await this.supabase.client.from('budgets').insert(toInsert);
    }
  }
}
