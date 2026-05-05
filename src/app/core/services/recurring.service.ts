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
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const nextRun = dto.start_date;
    const { data, error } = await this.supabase.client
      .from('recurring_transactions')
      .insert({ ...dto, next_run: nextRun, user_id: user.id })
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

  async processRecurring(): Promise<void> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);

    const { data: pending } = await this.supabase.client
      .from('recurring_transactions')
      .select('*')
      .eq('active', true)
      .lte('next_run', today);

    if (!pending?.length) return;

    for (const rec of pending) {
      let nextRun: string = rec.next_run;
      let lastGenerated: string | null = null;
      const toInsert: object[] = [];

      while (nextRun <= today) {
        if (rec.end_date && nextRun > rec.end_date) break;

        toInsert.push({
          user_id: user.id,
          amount: rec.amount,
          type: rec.type,
          category_id: rec.category_id,
          description: rec.description,
          date: nextRun,
          source: 'recurring',
          recurring_id: rec.id,
        });

        lastGenerated = nextRun;
        nextRun = this.advanceDate(nextRun, rec.frequency);
      }

      if (!toInsert.length) continue;

      await this.supabase.client.from('transactions').insert(toInsert);
      await this.supabase.client
        .from('recurring_transactions')
        .update({ next_run: nextRun, last_generated: lastGenerated })
        .eq('id', rec.id);
    }
  }

  private advanceDate(date: string, frequency: string): string {
    const d = new Date(date + 'T00:00:00');
    if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  }
}
