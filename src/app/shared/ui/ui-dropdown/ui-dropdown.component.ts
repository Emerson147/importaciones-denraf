import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.component';

@Component({
  selector: 'app-ui-dropdown',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  template: `
    <div class="relative inline-block text-left" (clickOutside)="isOpen = false">
      
      <button 
        type="button" 
        class="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
        (click)="toggle($event)"
      >
        <span class="material-icons-outlined text-lg">more_vert</span> </button>

      @if (isOpen) {
        <div 
          class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-stone-100 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200"
        >
          <div class="py-1">
            <button 
              (click)="onAction('edit')"
              class="group flex w-full items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              <span class="material-icons-outlined mr-3 text-stone-400 group-hover:text-stone-600">edit</span>
              Editar
            </button>

            <button 
              (click)="onAction('delete')"
              class="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <span class="material-icons-outlined mr-3 text-red-400 group-hover:text-red-600">delete</span>
              Eliminar
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class UiDropdownComponent {
  isOpen = false;
  @Output() action = new EventEmitter<'edit' | 'delete'>();

  toggle(event: Event) {
    event.stopPropagation(); // Evita que el clic se propague y cierre inmediatamente
    this.isOpen = !this.isOpen;
  }

  onAction(type: 'edit' | 'delete') {
    this.action.emit(type);
    this.isOpen = false;
  }
}