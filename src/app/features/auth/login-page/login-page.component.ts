import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';
import { User } from '../../../core/models';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // 🔄 Ahora es reactivo - se actualiza cuando Supabase carga los usuarios
  users = computed(() => this.authService.availableUsers());
  isLoadingUsers = computed(() => this.authService.isLoadingUsers());

  // Estado del flujo de login
  selectedUser = signal<User | null>(null);
  pin = signal<string>('');
  error = signal<string>('');
  isValidating = signal(false);

  selectUser(userId: string) {
    const user = this.users().find((u) => u.id === userId);
    if (user) {
      this.selectedUser.set(user);
      this.pin.set('');
      this.error.set('');
      // Autoenfoque en el primer input de PIN
      const timeoutId = setTimeout(() => {
        const firstInput = document.querySelector('.pin-input') as HTMLInputElement;
        firstInput?.focus();
      }, 100);
      this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
    }
  }

  backToUsers() {
    this.selectedUser.set(null);
    this.pin.set('');
    this.error.set('');
  }

  onPinDigit(digit: string, index: number) {
    const currentPin = this.pin();

    if (digit.length === 0) {
      // Borrar dígito
      this.pin.set(currentPin.slice(0, -1));
      // Foco al input anterior
      if (index > 0) {
        const prevInput = document.querySelectorAll('.pin-input')[index - 1] as HTMLInputElement;
        prevInput?.focus();
      }
    } else if (/^\d$/.test(digit)) {
      // Solo números
      const newPin = currentPin + digit;
      this.pin.set(newPin);

      // Foco al siguiente input
      if (index < 3) {
        const nextInput = document.querySelectorAll('.pin-input')[index + 1] as HTMLInputElement;
        nextInput?.focus();
      }

      // Validar cuando se completan los 4 dígitos
      if (newPin.length === 4) {
        this.validatePin(newPin);
      }
    }
  }

  onPinKeydown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      event.preventDefault();
      const currentPin = this.pin();

      if (input.value) {
        // Borrar el dígito actual
        input.value = '';
        this.pin.set(currentPin.slice(0, -1));
      } else if (index > 0) {
        // Si está vacío, ir al anterior y borrar
        const prevInput = document.querySelectorAll('.pin-input')[index - 1] as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.value = '';
          this.pin.set(currentPin.slice(0, -1));
        }
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.querySelectorAll('.pin-input')[index - 1] as HTMLInputElement;
      prevInput?.focus();
    } else if (event.key === 'ArrowRight' && index < 3) {
      const nextInput = document.querySelectorAll('.pin-input')[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  }

  onPinPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);

    if (digits.length === 4) {
      this.pin.set(digits);

      // Llenar los inputs
      const inputs = document.querySelectorAll('.pin-input') as NodeListOf<HTMLInputElement>;
      digits.split('').forEach((digit, i) => {
        if (inputs[i]) inputs[i].value = digit;
      });

      // Foco al último
      inputs[3]?.focus();

      // Validar
      this.validatePin(digits);
    }
  }

  validatePin(pin: string) {
    const user = this.selectedUser();
    if (!user) return;

    this.isValidating.set(true);
    this.error.set('');

    // Simular delay de validación
    const timeoutId = setTimeout(() => {
      if (this.authService.login(user.id, pin)) {
        this.router.navigate(['/']);
      } else {
        this.error.set('PIN incorrecto');
        this.pin.set('');
        this.isValidating.set(false);

        // Limpiar inputs y refocus
        const inputs = document.querySelectorAll('.pin-input') as NodeListOf<HTMLInputElement>;
        inputs.forEach((input) => (input.value = ''));
        inputs[0]?.focus();
      }
    }, 300);
    this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
  }
}
