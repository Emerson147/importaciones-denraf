import { Injectable, signal, inject } from '@angular/core';
import { NotificationService } from './notification.service';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  persistent?: boolean; // Si es true, se guarda en el centro de notificaciones
  actionLabel?: string;
  actionRoute?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private notificationService = inject(NotificationService);
  private toasts = signal<Toast[]>([]);
  
  // Exponemos los toasts como readonly
  readonly toasts$ = this.toasts.asReadonly();

  show(
    message: string, 
    type: Toast['type'] = 'info', 
    duration = 3000,
    options?: { persistent?: boolean; actionLabel?: string; actionRoute?: string; title?: string }
  ) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { 
      id, 
      type, 
      message, 
      duration,
      persistent: options?.persistent,
      actionLabel: options?.actionLabel,
      actionRoute: options?.actionRoute
    };
    
    this.toasts.update(current => [...current, toast]);

    // Si es persistente, guardarlo en notificaciones
    if (options?.persistent) {
      const title = options?.title || this.getDefaultTitle(type);
      this.notificationService.add({
        type,
        title,
        message,
        icon: this.getIcon(type),
        actionLabel: options?.actionLabel,
        actionRoute: options?.actionRoute
      });
    }

    // Auto-remover después de la duración
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  success(message: string, duration = 3000, options?: { persistent?: boolean; actionLabel?: string; actionRoute?: string; title?: string }) {
    return this.show(message, 'success', duration, options);
  }

  error(message: string, duration = 4000, options?: { persistent?: boolean; actionLabel?: string; actionRoute?: string; title?: string }) {
    return this.show(message, 'error', duration, options);
  }

  warning(message: string, duration = 3500, options?: { persistent?: boolean; actionLabel?: string; actionRoute?: string; title?: string }) {
    return this.show(message, 'warning', duration, options);
  }

  info(message: string, duration = 3000, options?: { persistent?: boolean; actionLabel?: string; actionRoute?: string; title?: string }) {
    return this.show(message, 'info', duration, options);
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  private getDefaultTitle(type: Toast['type']): string {
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };
    return titles[type];
  }

  private getIcon(type: Toast['type']): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type];
  }

  clear() {
    this.toasts.set([]);
  }
}
