import { Injectable, inject } from '@angular/core';
import { Category, CategoryType } from '@core/models/category.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private supabase = inject(SupabaseService);

  async getCategories(type?: CategoryType): Promise<Category[]> {
    let query = this.supabase.client
      .from('categories')
      .select('*')
      .order('name');

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    return data as Category[];
  }

  async createCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<Category> {
    const { data, error } = await this.supabase.client
      .from('categories')
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  }

  async updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'color' | 'icon'>>): Promise<Category> {
    const { data, error } = await this.supabase.client
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
