import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-animated-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showModal()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        class="fixed inset-0 bg-stone-900/20 backdrop-blur-sm transition-all duration-400 ease-out"
        [class.opacity-0]="!animateIn()"
        [class.opacity-100]="animateIn()"
        (click)="close()"
      ></div>

      <div
        class="relative z-10 w-full max-w-md transform overflow-hidden rounded-4xl bg-[#FDFCFC] p-8 shadow-2xl transition-all duration-400 ease-spring"
        [style.transform-origin]="transformOrigin()"
        [class.scale-90]="!animateIn()"
        [class.opacity-0]="!animateIn()"
        [class.translate-y-8]="!animateIn()"
        [class.scale-100]="animateIn()"
        [class.opacity-100]="animateIn()"
        [class.translate-y-0]="animateIn()"
        (click)="$event.stopPropagation()"
      >
        <ng-content></ng-content>

        <button
          (click)="close()"
          class="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-800 transition-colors"
        >
          <span class="material-icons-outlined text-lg">close</span>
        </button>
      </div>
    </div>
    }
  `,
  styles: [
    `
      /* Aseguramos que el host no interfiera */
      :host {
        display: contents;
      }
    `,
  ],
})
export class UiAnimatedDialogComponent {
  @Input() trigger: HTMLElement | null = null;
  transformOrigin = signal('center center');

  @Input() set isOpen(value: boolean) {
    if (value) {
      // CALCULAR ORIGEN DE LA ANIMACIÓN
      if (this.trigger) {
        const rect = this.trigger.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculamos la posición relativa a la ventana (viewport)
        // Como el diálogo está fixed inset-0, las coordenadas del viewport funcionan directo
        this.transformOrigin.set(`${centerX}px ${centerY}px`);
      } else {
        this.transformOrigin.set('center center');
      }

      // AL ABRIR:
      // 1. Lo creamos en el DOM (showModal = true)
      this.showModal.set(true);
      // 2. Un tick después, iniciamos la animación de entrada (animateIn = true)
      setTimeout(() => this.animateIn.set(true), 10);
    } else {
      // AL CERRAR:
      // 1. Iniciamos animación de salida (animateIn = false)
      this.animateIn.set(false);
      // 2. Esperamos a que termine la animación (400ms) y lo sacamos del DOM
      setTimeout(() => this.showModal.set(false), 400);
    }
  }
  @Output() isOpenChange = new EventEmitter<boolean>();

  // Signals internas para orquestar la animación
  showModal = signal(false); // Controla el @if (existencia en DOM)
  animateIn = signal(false); // Controla las clases CSS (estado visual)

  close() {
    this.isOpenChange.emit(false);
  }
}
