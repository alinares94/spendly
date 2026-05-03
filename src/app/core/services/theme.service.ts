import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly html = document.documentElement;
  readonly isDark = signal<boolean>(false);

  constructor() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    this.applyTheme(mq.matches);
    mq.addEventListener('change', (e) => this.applyTheme(e.matches));
  }

  toggle(): void {
    this.applyTheme(!this.isDark());
  }

  private applyTheme(dark: boolean): void {
    this.isDark.set(dark);
    this.html.classList.toggle('dark', dark);
  }
}
