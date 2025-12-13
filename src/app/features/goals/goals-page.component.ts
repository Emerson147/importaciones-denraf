import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamificationService } from '../../core/services/gamification.service';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-goals-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen p-6 transition-colors duration-150"
         [class.bg-stone-50]="!isDark()"
         [class.bg-stone-950]="isDark()">
      
      <!-- Header -->
      <div class="max-w-7xl mx-auto mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold transition-colors"
                [class.text-stone-900]="!isDark()"
                [class.text-stone-100]="isDark()">
              Metas y Logros
              @if (currentUser()) {
                <span class="text-xl transition-colors ml-3"
                      [class.text-stone-500]="!isDark()"
                      [class.text-stone-400]="isDark()">
                  · {{ currentUser()!.name }}
                </span>
              }
            </h1>
            <p class="transition-colors mt-1"
               [class.text-stone-600]="!isDark()"
               [class.text-stone-400]="isDark()">
              Sigue tu progreso y desbloquea recompensas
            </p>
          </div>
          
          <!-- Stats Card -->
          <div class="flex gap-4">
            <div class="px-6 py-4 rounded-xl backdrop-blur-sm transition-all duration-150"
                 [class.bg-white/80]="!isDark()"
                 [class.bg-stone-900/80]="isDark()"
                 [class.shadow-sm]="!isDark()">
              <div class="text-sm transition-colors"
                   [class.text-stone-600]="!isDark()"
                   [class.text-stone-400]="isDark()">
                Nivel
              </div>
              <div class="text-3xl font-bold transition-colors"
                   [class.text-stone-900]="!isDark()"
                   [class.text-stone-100]="isDark()">
                {{ gamification.currentLevel() }}
              </div>
            </div>
            
            <div class="px-6 py-4 rounded-xl backdrop-blur-sm transition-all duration-150"
                 [class.bg-white/80]="!isDark()"
                 [class.bg-stone-900/80]="isDark()"
                 [class.shadow-sm]="!isDark()">
              <div class="text-sm transition-colors"
                   [class.text-stone-600]="!isDark()"
                   [class.text-stone-400]="isDark()">
                Puntos
              </div>
              <div class="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {{ gamification.stats().totalPoints }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Progress to Next Level -->
        <div class="px-4 py-3 rounded-xl backdrop-blur-sm transition-all duration-150"
             [class.bg-white/60]="!isDark()"
             [class.bg-stone-900/60]="isDark()">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium transition-colors"
                  [class.text-stone-700]="!isDark()"
                  [class.text-stone-300]="isDark()">
              Progreso al Nivel {{ gamification.currentLevel() + 1 }}
            </span>
            <span class="text-sm transition-colors"
                  [class.text-stone-600]="!isDark()"
                  [class.text-stone-400]="isDark()">
              {{ gamification.pointsToNextLevel() }} puntos restantes
            </span>
          </div>
          <div class="h-2 rounded-full overflow-hidden transition-colors"
               [class.bg-stone-200]="!isDark()"
               [class.bg-stone-800]="isDark()">
            <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                 [style.width.%]="levelProgress()"></div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Goals Section (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <div>
            <h2 class="text-xl font-bold mb-4 transition-colors"
                [class.text-stone-900]="!isDark()"
                [class.text-stone-100]="isDark()">
              🎯 Metas Activas
            </h2>
            
            <div class="space-y-3">
              @for (goal of gamification.activeGoals(); track goal.id) {
                <div class="p-5 rounded-xl backdrop-blur-sm transition-all duration-150 hover:scale-[1.01]"
                     [class.bg-white/80]="!isDark()"
                     [class.bg-stone-900/80]="isDark()"
                     [class.shadow-sm]="!isDark()"
                     [class.hover:shadow-md]="!isDark()">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <h3 class="font-semibold transition-colors"
                          [class.text-stone-900]="!isDark()"
                          [class.text-stone-100]="isDark()">
                        {{ goal.title }}
                      </h3>
                      <p class="text-sm transition-colors"
                         [class.text-stone-600]="!isDark()"
                         [class.text-stone-400]="isDark()">
                        {{ goal.description }}
                      </p>
                    </div>
                    
                    <span class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                          [class.bg-blue-100]="!isDark() && goal.type === 'daily'"
                          [class.text-blue-700]="!isDark() && goal.type === 'daily'"
                          [class.bg-blue-900/40]="isDark() && goal.type === 'daily'"
                          [class.text-blue-300]="isDark() && goal.type === 'daily'"
                          [class.bg-purple-100]="!isDark() && goal.type === 'weekly'"
                          [class.text-purple-700]="!isDark() && goal.type === 'weekly'"
                          [class.bg-purple-900/40]="isDark() && goal.type === 'weekly'"
                          [class.text-purple-300]="isDark() && goal.type === 'weekly'"
                          [class.bg-emerald-100]="!isDark() && goal.type === 'monthly'"
                          [class.text-emerald-700]="!isDark() && goal.type === 'monthly'"
                          [class.bg-emerald-900/40]="isDark() && goal.type === 'monthly'"
                          [class.text-emerald-300]="isDark() && goal.type === 'monthly'">
                      {{ goalTypeLabel(goal.type) }}
                    </span>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="font-medium transition-colors"
                            [class.text-stone-700]="!isDark()"
                            [class.text-stone-300]="isDark()">
                        {{ goal.current }} / {{ goal.target }} {{ metricLabel(goal.metric) }}
                      </span>
                      <span class="transition-colors"
                            [class.text-stone-600]="!isDark()"
                            [class.text-stone-400]="isDark()">
                        {{ goalProgress(goal.current, goal.target) }}%
                      </span>
                    </div>
                    
                    <div class="h-2 rounded-full overflow-hidden transition-colors"
                         [class.bg-stone-200]="!isDark()"
                         [class.bg-stone-800]="isDark()">
                      <div class="h-full transition-all duration-300"
                           [class.bg-gradient-to-r]="true"
                           [class.from-emerald-500]="true"
                           [class.to-teal-500]="true"
                           [style.width.%]="goalProgress(goal.current, goal.target)"></div>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center rounded-xl backdrop-blur-sm transition-colors"
                     [class.bg-white/60]="!isDark()"
                     [class.bg-stone-900/60]="isDark()">
                  <span class="text-4xl mb-2 block">🎯</span>
                  <p class="transition-colors"
                     [class.text-stone-600]="!isDark()"
                     [class.text-stone-400]="isDark()">
                    No hay metas activas
                  </p>
                </div>
              }
            </div>
          </div>

          <!-- Achievements Section -->
          <div>
            <h2 class="text-xl font-bold mb-4 transition-colors"
                [class.text-stone-900]="!isDark()"
                [class.text-stone-100]="isDark()">
              🏆 Logros
            </h2>
            
            <div class="grid grid-cols-2 gap-3">
              @for (achievement of gamification.allAchievements(); track achievement.id) {
                <div class="p-4 rounded-xl backdrop-blur-sm transition-all duration-150"
                     [class.bg-white/80]="!isDark() && achievement.unlocked"
                     [class.bg-stone-900/80]="isDark() && achievement.unlocked"
                     [class.bg-white/40]="!isDark() && !achievement.unlocked"
                     [class.bg-stone-900/40]="isDark() && !achievement.unlocked"
                     [class.shadow-sm]="!isDark() && achievement.unlocked"
                     [class.opacity-60]="!achievement.unlocked"
                     [class.hover:scale-105]="achievement.unlocked">
                  
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                         [class.bg-amber-100]="!isDark() && achievement.tier === 'bronze'"
                         [class.text-amber-700]="!isDark() && achievement.tier === 'bronze'"
                         [class.bg-amber-900/40]="isDark() && achievement.tier === 'bronze'"
                         [class.text-amber-300]="isDark() && achievement.tier === 'bronze'"
                         [class.bg-slate-100]="!isDark() && achievement.tier === 'silver'"
                         [class.text-slate-700]="!isDark() && achievement.tier === 'silver'"
                         [class.bg-slate-900/40]="isDark() && achievement.tier === 'silver'"
                         [class.text-slate-300]="isDark() && achievement.tier === 'silver'"
                         [class.bg-yellow-100]="!isDark() && achievement.tier === 'gold'"
                         [class.text-yellow-700]="!isDark() && achievement.tier === 'gold'"
                         [class.bg-yellow-900/40]="isDark() && achievement.tier === 'gold'"
                         [class.text-yellow-300]="isDark() && achievement.tier === 'gold'"
                         [class.bg-purple-100]="!isDark() && achievement.tier === 'platinum'"
                         [class.text-purple-700]="!isDark() && achievement.tier === 'platinum'"
                         [class.bg-purple-900/40]="isDark() && achievement.tier === 'platinum'"
                         [class.text-purple-300]="isDark() && achievement.tier === 'platinum'">
                      <span class="material-icons">{{ achievement.icon }}</span>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-sm transition-colors"
                          [class.text-stone-900]="!isDark()"
                          [class.text-stone-100]="isDark()">
                        {{ achievement.title }}
                      </h3>
                      <p class="text-xs transition-colors"
                         [class.text-stone-600]="!isDark()"
                         [class.text-stone-400]="isDark()">
                        {{ achievement.description }}
                      </p>
                      
                      @if (!achievement.unlocked) {
                        <div class="mt-2">
                          <div class="h-1 rounded-full overflow-hidden transition-colors"
                               [class.bg-stone-200]="!isDark()"
                               [class.bg-stone-800]="isDark()">
                            <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                                 [style.width.%]="achievementProgress(achievement.progress, achievement.requirement)"></div>
                          </div>
                          <p class="text-xs mt-1 transition-colors"
                             [class.text-stone-500]="!isDark()"
                             [class.text-stone-500]="isDark()">
                            {{ achievement.progress }} / {{ achievement.requirement }}
                          </p>
                        </div>
                      } @else {
                        <div class="flex items-center gap-1 mt-1">
                          <span class="material-icons text-sm text-emerald-500">check_circle</span>
                          <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            +{{ achievement.points }} pts
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Leaderboard Section (1 col) -->
        <div class="lg:col-span-1">
          <h2 class="text-xl font-bold mb-4 transition-colors"
              [class.text-stone-900]="!isDark()"
              [class.text-stone-100]="isDark()">
            👑 Ranking
          </h2>
          
          <div class="space-y-3">
            @for (entry of gamification.allLeaderboard(); track entry.userId) {
              <div class="p-4 rounded-xl backdrop-blur-sm transition-all duration-150"
                   [class.bg-white/80]="!isDark()"
                   [class.bg-stone-900/80]="isDark()"
                   [class.shadow-sm]="!isDark()"
                   [class.hover:shadow-md]="!isDark()"
                   [class.ring-2]="entry.rank === 1"
                   [class.ring-amber-400]="entry.rank === 1">
                
                <div class="flex items-center gap-3">
                  <!-- Rank Badge -->
                  <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors"
                       [class.bg-gradient-to-br]="entry.rank <= 3"
                       [class.from-yellow-400]="entry.rank === 1"
                       [class.to-yellow-600]="entry.rank === 1"
                       [class.text-white]="entry.rank === 1"
                       [class.from-slate-300]="entry.rank === 2"
                       [class.to-slate-500]="entry.rank === 2"
                       [class.text-white]="entry.rank === 2"
                       [class.from-amber-600]="entry.rank === 3"
                       [class.to-amber-800]="entry.rank === 3"
                       [class.text-white]="entry.rank === 3"
                       [class.bg-stone-200]="entry.rank > 3 && !isDark()"
                       [class.bg-stone-800]="entry.rank > 3 && isDark()"
                       [class.text-stone-700]="entry.rank > 3 && !isDark()"
                       [class.text-stone-300]="entry.rank > 3 && isDark()">
                    {{ entry.rank }}
                  </div>
                  
                  <!-- User Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold text-sm transition-colors"
                          [class.text-stone-900]="!isDark()"
                          [class.text-stone-100]="isDark()">
                        {{ entry.userName }}
                      </h3>
                      @if (entry.streak > 0) {
                        <span class="text-xs" title="Racha">🔥{{ entry.streak }}</span>
                      }
                    </div>
                    
                    <div class="flex items-center gap-3 mt-1 text-xs transition-colors"
                         [class.text-stone-600]="!isDark()"
                         [class.text-stone-400]="isDark()">
                      <span>{{ entry.totalSales }} ventas</span>
                      <span>•</span>
                      <span>{{ entry.achievementsCount }} logros</span>
                    </div>
                  </div>
                  
                  <!-- Points -->
                  <div class="text-right">
                    <div class="font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      {{ entry.points }}
                    </div>
                    <div class="text-xs transition-colors"
                         [class.text-stone-500]="!isDark()"
                         [class.text-stone-500]="isDark()">
                      puntos
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center rounded-xl backdrop-blur-sm transition-colors"
                   [class.bg-white/60]="!isDark()"
                   [class.bg-stone-900/60]="isDark()">
                <span class="text-4xl mb-2 block">👑</span>
                <p class="transition-colors"
                   [class.text-stone-600]="!isDark()"
                   [class.text-stone-400]="isDark()">
                  El ranking se actualizará pronto
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class GoalsPageComponent {
  gamification = inject(GamificationService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  
  isDark = this.themeService.darkMode;
  currentUser = this.authService.currentUser;

  levelProgress = computed(() => {
    const currentLevel = this.gamification.currentLevel();
    const currentPoints = this.gamification.stats().totalPoints;
    const levelStart = (currentLevel - 1) * 500;
    const levelEnd = currentLevel * 500;
    const progress = ((currentPoints - levelStart) / (levelEnd - levelStart)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  });

  constructor() {
    // Update leaderboard on init
    this.gamification.updateLeaderboard();
  }

  goalTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      daily: 'Diaria',
      weekly: 'Semanal',
      monthly: 'Mensual',
      custom: 'Personalizada'
    };
    return labels[type] || type;
  }

  metricLabel(metric: string): string {
    const labels: Record<string, string> = {
      sales_count: 'ventas',
      revenue: 'en ingresos',
      new_customers: 'clientes nuevos',
      avg_ticket: 'de ticket promedio'
    };
    return labels[metric] || metric;
  }

  goalProgress(current: number, target: number): number {
    return Math.min(Math.round((current / target) * 100), 100);
  }

  achievementProgress(current: number, required: number): number {
    return Math.min(Math.round((current / required) * 100), 100);
  }
}
