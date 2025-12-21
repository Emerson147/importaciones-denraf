import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models';
import { StorageService } from '../services/storage.service';
import { SyncService } from '../services/sync.service';
import { supabase } from '../services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private storage = inject(StorageService);
  private syncService = inject(SyncService);

  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'current_user';

  // 🔄 Estado de carga de usuarios
  isLoadingUsers = signal(true);

  // Usuarios disponibles - ahora prioriza Supabase sobre localStorage
  private usersList = signal<User[]>([]);

  // Estado del usuario actual
  private currentUserSig = signal<User | null>(this.loadUserFromStorage());

  constructor() {
    this.initFromCloud();
  }

  /**
   * 🌐 Cargar usuarios desde Supabase al iniciar
   * Prioridad: Supabase > localStorage > usuarios de prueba
   */
  private async initFromCloud(): Promise<void> {
    try {
      const { data, error } = await supabase.from('usuarios').select('*');

      if (error) {
        console.error('Error cargando usuarios:', error);
        // Fallback a localStorage
        this.loadFromLocalStorageOrDefaults();
        return;
      }

      if (data && data.length > 0) {
        const users = data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          pin: u.pin,
          avatar: u.avatar,
          createdAt: u.created_at ? new Date(u.created_at) : new Date(),
        }));
        console.log(`☁️ Cargados ${users.length} usuarios desde Supabase`);
        this.usersList.set(users);
        // Actualizar localStorage con datos de Supabase
        this.saveUsersToStorage();
      } else {
        // Supabase vacío, usar localStorage o defaults
        this.loadFromLocalStorageOrDefaults();
      }
    } catch (error) {
      console.log('📴 Sin conexión, usando usuarios locales');
      this.loadFromLocalStorageOrDefaults();
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  /**
   * Cargar usuarios desde localStorage o usar defaults
   */
  private loadFromLocalStorageOrDefaults(): void {
    const stored = this.loadUsersFromStorage();
    if (stored && stored.length > 0) {
      this.usersList.set(stored);
    } else {
      // Usuarios por defecto solo si no hay datos
      this.usersList.set([
        {
          id: 'user-1',
          name: 'Admin',
          role: 'admin',
          pin: '1234',
          createdAt: new Date('2024-01-01'),
        },
      ]);
    }
  }

  // Computadas
  isAuthenticated = computed(() => !!this.currentUserSig());
  currentUser = computed(() => this.currentUserSig());

  // 🔄 Signal reactivo para usuarios disponibles
  availableUsers = computed(() => this.usersList());

  // Obtener todos los usuarios disponibles (legacy - usar availableUsers signal)
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
      id: crypto.randomUUID(),
      name: data.name,
      role: data.role,
      pin: data.pin,
      createdAt: new Date(),
    };

    this.usersList.update((users) => [...users, newUser]);
    this.saveUsersToStorage();

    // 🔄 Sincronizar con Supabase
    this.syncService.queueForSync('user', 'create', newUser);

    return newUser;
  }

  // Actualizar usuario existente
  updateUser(
    userId: string,
    data: { name: string; role: 'admin' | 'vendor'; pin: string }
  ): boolean {
    const userIndex = this.usersList().findIndex((u) => u.id === userId);
    if (userIndex === -1) return false;

    this.usersList.update((users) => {
      const updated = [...users];
      updated[userIndex] = {
        ...updated[userIndex],
        name: data.name,
        role: data.role,
        pin: data.pin,
      };
      return updated;
    });

    this.saveUsersToStorage();

    // 🔄 Sincronizar con Supabase
    const updatedUser = this.usersList()[userIndex];
    this.syncService.queueForSync('user', 'update', updatedUser);

    return true;
  }

  // Eliminar usuario
  deleteUser(userId: string): boolean {
    if (this.currentUserSig()?.id === userId) {
      return false; // No se puede eliminar el usuario actual
    }

    this.usersList.update((users) => users.filter((u) => u.id !== userId));
    this.saveUsersToStorage();

    // 🔄 Sincronizar eliminación con Supabase
    this.syncService.queueForSync('user', 'delete', { id: userId });

    return true;
  }

  // Login - seleccionar usuario por ID y PIN
  login(userId: string, pin?: string): boolean {
    const user = this.usersList().find((u) => u.id === userId);
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
    const user = this.usersList().find((u) => u.id === userId);
    return user ? user.pin === pin : false;
  }

  // Cambiar de usuario sin hacer logout completo
  switchUser(userId: string): boolean {
    return this.login(userId);
  }

  // Logout
  logout() {
    this.currentUserSig.set(null);
    this.storage.remove(this.CURRENT_USER_KEY);
    this.router.navigate(['/login']);
  }

  // Persistencia
  private saveUserToStorage(user: User) {
    this.storage.set(this.CURRENT_USER_KEY, user);
  }

  private loadUserFromStorage(): User | null {
    return this.storage.get<User>(this.CURRENT_USER_KEY);
  }

  private saveUsersToStorage() {
    this.storage.set(this.USERS_KEY, this.usersList());
  }

  private loadUsersFromStorage(): User[] | null {
    return this.storage.get<User[]>(this.USERS_KEY);
  }
}
