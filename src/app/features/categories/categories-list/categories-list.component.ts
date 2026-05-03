import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { LucideAngularModule, LucideIconData, Tag, Plus, Pencil, Trash2, X } from 'lucide-angular';
import { CategoryService } from '@core/services/category.service';
import { Category } from '@core/models/category.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    CategoryFormComponent,
    LucideAngularModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories-list.component.html',
})
export class CategoriesListComponent implements OnInit {
  readonly Tag = Tag;
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly X = X;

  private categoryService = inject(CategoryService);

  isLoading = signal(true);
  categories = signal<Category[]>([]);
  showForm = signal(false);
  editing = signal<Category | null>(null);
  showDeleteDialog = signal(false);
  deletingId = signal<string | null>(null);

  expenses = computed(() => this.categories().filter((c) => c.type === 'expense'));
  incomes = computed(() => this.categories().filter((c) => c.type === 'income'));

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.isLoading.set(true);
    try {
      this.categories.set(await this.categoryService.getCategories());
    } finally {
      this.isLoading.set(false);
    }
  }

  openCreate() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(cat: Category) {
    this.editing.set(cat);
    this.showForm.set(true);
  }

  openDelete(cat: Category) {
    this.deletingId.set(cat.id);
    this.showDeleteDialog.set(true);
  }

  async confirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    try {
      await this.categoryService.deleteCategory(id);
      await this.load();
    } finally {
      this.showDeleteDialog.set(false);
      this.deletingId.set(null);
    }
  }
}
