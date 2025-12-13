import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Estado reactivo (Lee de localStorage o detecta preferencia del sistema)
  darkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    // Aplicar el tema inicial inmediatamente
    this.applyTheme(this.darkMode());

    // EFECTO: Cada vez que cambie la signal, actualizamos el HTML
    effect(() => {
      this.applyTheme(this.darkMode());
    });
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('denraf_theme');
    if (stored) {
      return stored === 'dark';
    }
    // Si no hay preferencia guardada, usar la del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean) {
    const root = document.documentElement;
    
    // Usar View Transition API si está disponible para transiciones instantáneas
    const applyClasses = () => {
      if (isDark) {
        root.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('denraf_theme', 'dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('denraf_theme', 'light');
      }
    };

    // Si el navegador soporta View Transitions, úsalo para un cambio más fluido
    if ('startViewTransition' in document && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => applyClasses());
    } else {
      applyClasses();
    }
  }

  toggle() {
    this.darkMode.update(val => !val);
  }
}