import { Injectable, inject, signal } from '@angular/core';
import {
  Transaction,
  TransactionType,
  CreateTransactionDto,
} from '@core/models/transaction.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private supabase = inject(SupabaseService);

  readonly selectedMonth = signal<string>(
    new Date().toISOString().slice(0, 7)
  );
  readonly selectedCategoryId = signal<string | null>(null);
  readonly selectedType = signal<TransactionType | null>(null);

  async getTransactions(): Promise<Transaction[]> {
    const month = this.selectedMonth();
    const [year, m] = month.split('-');
    const daysInMonth = new Date(+year, +m, 0).getDate();
    const from = `${year}-${m}-01`;
    const to = `${year}-${m}-${String(daysInMonth).padStart(2, '0')}`;

    let query = this.supabase.client
      .from('transactions')
      .select('*, category:categories(*)')
      .gte('date', from)
      .lte('date', to)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    const catId = this.selectedCategoryId();
    if (catId) query = query.eq('category_id', catId);

    const type = this.selectedType();
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  }

  async getTransactionsByMonth(month: string): Promise<Transaction[]> {
    const [year, m] = month.split('-');
    const daysInMonth = new Date(+year, +m, 0).getDate();
    const from = `${year}-${m}-01`;
    const to = `${year}-${m}-${String(daysInMonth).padStart(2, '0')}`;

    const { data, error } = await this.supabase.client
      .from('transactions')
      .select('*, category:categories(*)')
      .gte('date', from)
      .lte('date', to)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
  }

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const { data, error } = await this.supabase.client
      .from('transactions')
      .insert({ ...dto, source: dto.source ?? 'manual' })
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as Transaction;
  }

  async updateTransaction(id: string, dto: Partial<CreateTransactionDto>): Promise<Transaction> {
    const { data, error } = await this.supabase.client
      .from('transactions')
      .update(dto)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as Transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async getLast6MonthsSummary(): Promise<{ month: string; income: number; expense: number }[]> {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const results = await Promise.all(months.map((m) => this.getTransactionsByMonth(m)));

    return months.map((month, i) => {
      const txs = results[i];
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month, income, expense };
    });
  }
}
