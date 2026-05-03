import { Injectable, inject } from '@angular/core';
import {
  RecurringTransaction,
  CreateRecurringDto,
} from '@core/models/recurring-transaction.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class RecurringService {
  private supabase = inject(SupabaseService);

  async getRecurring(): Promise<RecurringTransaction[]> {
    const { data, error } = await this.supabase.client
      .from('recurring_transactions')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as RecurringTransaction[];
  }

  async createRecurring(dto: CreateRecurringDto): Promise<RecurringTransaction> {
    const nextRun = dto.start_date;
    const { data, error } = await this.supabase.client
      .from('recurring_transactions')
      .insert({ ...dto, next_run: nextRun })
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as RecurringTransaction;
  }

  async updateRecurring(id: string, dto: Partial<CreateRecurringDto>): Promise<RecurringTransaction> {
    const { data, error } = await this.supabase.client
      .from('recurring_transactions')
      .update(dto)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as RecurringTransaction;
  }

  async toggleActive(id: string, active: boolean): Promise<void> {
    const { error } = await this.supabase.client
      .from('recurring_transactions')
      .update({ active })
      .eq('id', id);
    if (error) throw error;
  }

  async deleteRecurring(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('recurring_transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
