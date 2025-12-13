import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
  actionLabel?: string;
  actionRoute?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  
  // Computed signals
  allNotifications = computed(() => this.notifications());
  unreadNotifications = computed(() => this.notifications().filter(n => !n.read));
  unreadCount = computed(() => this.unreadNotifications().length);
  
  // Últimas 5 notificaciones para el dropdown
  recentNotifications = computed(() => 
    this.notifications().slice(0, 5)
  );

  constructor() {
    this.loadFromLocalStorage();
  }

  // Agregar nueva notificación
  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    this.notifications.update(current => [newNotification, ...current]);
    this.saveToLocalStorage();
    
    return newNotification.id;
  }

  // Notificación de éxito
  success(title: string, message: string, options?: { actionLabel?: string; actionRoute?: string }) {
    return this.add({
      type: 'success',
      title,
      message,
      icon: 'check_circle',
      ...options
    });
  }

  // Notificación de información
  info(title: string, message: string, options?: { actionLabel?: string; actionRoute?: string }) {
    return this.add({
      type: 'info',
      title,
      message,
      icon: 'info',
      ...options
    });
  }

  // Notificación de advertencia
  warning(title: string, message: string, options?: { actionLabel?: string; actionRoute?: string }) {
    return this.add({
      type: 'warning',
      title,
      message,
      icon: 'warning',
      ...options
    });
  }

  // Notificación de error
  error(title: string, message: string, options?: { actionLabel?: string; actionRoute?: string }) {
    return this.add({
      type: 'error',
      title,
      message,
      icon: 'error',
      ...options
    });
  }

  // Marcar como leída
  markAsRead(id: string) {
    this.notifications.update(current =>
      current.map(n => n.id === id ? { ...n, read: true } : n)
    );
    this.saveToLocalStorage();
  }

  // Marcar todas como leídas
  markAllAsRead() {
    this.notifications.update(current =>
      current.map(n => ({ ...n, read: true }))
    );
    this.saveToLocalStorage();
  }

  // Eliminar notificación
  remove(id: string) {
    this.notifications.update(current =>
      current.filter(n => n.id !== id)
    );
    this.saveToLocalStorage();
  }

  // Limpiar todas las notificaciones leídas
  clearRead() {
    this.notifications.update(current =>
      current.filter(n => !n.read)
    );
    this.saveToLocalStorage();
  }

  // Limpiar todas
  clearAll() {
    this.notifications.set([]);
    this.saveToLocalStorage();
  }

  // Persistencia
  private saveToLocalStorage() {
    try {
      const data = this.notifications().map(n => ({
        ...n,
        timestamp: n.timestamp.toISOString()
      }));
      localStorage.setItem('denraf-notifications', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('denraf-notifications');
      if (saved) {
        const data = JSON.parse(saved);
        const notifications = data.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notifications.set(notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
