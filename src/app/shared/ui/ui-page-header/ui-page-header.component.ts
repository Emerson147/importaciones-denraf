import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-page-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        @if (icon()) {
          <div class="text-3xl sm:text-4xl shrink-0">{{ icon() }}</div>
        }
        <div>
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-stone-800">
            {{ title() }}
          </h1>
          @if (subtitle()) {
            <p class="text-stone-500 text-sm font-light mt-0.5">{{ subtitle() }}</p>
          }
        </div>
      </div>
      <div class="flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UiPageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  icon = input<string>();
}
