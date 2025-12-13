import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);

  // Usuarios disponibles (3 vendedores de la familia)
  private usersList = signal<User[]>([
    { 
      id: 'user-1', 
      name: 'Yo', 
      role: 'admin',
      pin: '1234',
      createdAt: new Date('2024-01-01')
    },
    { 
      id: 'user-2', 
      name: 'Mamá', 
      role: 'vendor',
      pin: '5678',
      createdAt: new Date('2024-01-01')
    },
    { 
      id: 'user-3', 
      name: 'Hermano', 
      role: 'vendor',
      pin: '9012',
      createdAt: new Date('2024-01-01')
    }
  ]);

  // Estado del usuario actual
  private currentUserSig = signal<User | null>(this.loadUserFromStorage());

  // Computadas
  isAuthenticated = computed(() => !!this.currentUserSig());
  currentUser = computed(() => this.currentUserSig());

  // Obtener todos los usuarios disponibles
  getAvailableUsers(): User[] {
    return this.usersList();
  }

  // Obtener usuarios (signal)
  getUsers() {
    return this.usersList();
  }

  // Crear nuevo usuario
  createUser(data: { name: string; role: 'admin' | 'vendor'; pin: string }): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      role: data.role,
      pin: data.pin,
      createdAt: new Date()
    };
    
    this.usersList.update(users => [...users, newUser]);
    this.saveUsersToStorage();
    return newUser;
  }

  // Actualizar usuario existente
  updateUser(userId: string, data: { name: string; role: 'admin' | 'vendor'; pin: string }): boolean {
    const userIndex = this.usersList().findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    this.usersList.update(users => {
      const updated = [...users];
      updated[userIndex] = {
        ...updated[userIndex],
        name: data.name,
        role: data.role,
        pin: data.pin
      };
      return updated;
    });

    this.saveUsersToStorage();
    return true;
  }

  // Eliminar usuario
  deleteUser(userId: string): boolean {
    if (this.currentUserSig()?.id === userId) {
      return false; // No se puede eliminar el usuario actual
    }

    this.usersList.update(users => users.filter(u => u.id !== userId));
    this.saveUsersToStorage();
    return true;
  }

  // Login - seleccionar usuario por ID y PIN
  login(userId: string, pin?: string): boolean {
    const user = this.usersList().find(u => u.id === userId);
    if (!user) return false;

    // Validar PIN si se proporciona
    if (pin !== undefined && user.pin !== pin) {
      return false; // PIN incorrecto
    }

    this.currentUserSig.set(user);
    this.saveUserToStorage(user);
    return true;
  }

  // Validar PIN de un usuario
  validatePin(userId: string, pin: string): boolean {
    const user = this.usersList().find(u => u.id === userId);
    return user ? user.pin === pin : false;
  }

  // Cambiar de usuario sin hacer logout completo
  switchUser(userId: string): boolean {
    return this.login(userId);
  }

  // Logout
  logout() {
    this.currentUserSig.set(null);
    localStorage.removeItem('denraf_current_user');
    this.router.navigate(['/login']);
  }

  // Persistencia
  private saveUserToStorage(user: User) {
    localStorage.setItem('denraf_current_user', JSON.stringify(user));
  }

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('denraf_current_user');
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt)
      };
    } catch {
      return null;
    }
  }

  private saveUsersToStorage() {
    localStorage.setItem('denraf_users', JSON.stringify(this.usersList()));
  }

  private loadUsersFromStorage(): User[] {
    const stored = localStorage.getItem('denraf_users');
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return parsed.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt)
      }));
    } catch {
      return [];
    }
  }
}
