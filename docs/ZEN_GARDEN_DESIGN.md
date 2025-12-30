# 🌿 Zen Garden Design System

## Filosofía de Color

Sistema inspirado en jardines zen japoneses: piedra, musgo, sol y agua.

**Nivel:** Professional/Premium (inspirado en Linear, Notion, Stripe)

---

## 🎨 Paleta Principal (4 Colores)

### 🪨 **Stone (Piedra) - 85%**
**Representa:** Calma, estabilidad, fundamento sólido

**Uso:**
- Fondos: `bg-stone-50` / `dark:bg-stone-950`
- Cards: `bg-white` / `dark:bg-stone-900`
- Bordes: `border-stone-100` / `dark:border-stone-800`
- Textos: `text-stone-900` / `dark:text-stone-100`
- Iconos estándar: `bg-stone-900` / `dark:bg-stone-100`
- Badges neutros: `bg-stone-100` / `dark:bg-stone-800`

**Aplicar a:**
- Toda la UI base
- Navegación
- Estructura
- Elementos neutros

---

### 🌿 **Verde (Pasto) - 8%**
**Representa:** Crecimiento, progreso, positivo, naturaleza

**Colores:** `emerald-500/600` (verde natural)

**Uso:**
- ✅ **Ingresos/Ganancias** - Flujo monetario positivo
- 📈 **Barras de progreso** - Avance hacia metas
- ✨ **Checks de éxito** - Logros completados
- 💚 **Acciones positivas** - Botones "Guardar", "Completar"
- 🎯 **Metas alcanzadas** - Progreso 100%

**NO usar para:**
- ❌ Decoración
- ❌ Iconos genéricos
- ❌ Badges informativos

**Ejemplos:**
```html
<!-- Ingreso/Ganancia -->
<div class="bg-emerald-500 dark:bg-emerald-600">
  <span class="material-icons">trending_up</span>
</div>
<p class="text-emerald-600 dark:text-emerald-500">
  S/ 1,500
</p>

<!-- Barra de progreso -->
<div class="h-2 bg-emerald-500 dark:bg-emerald-600"></div>

<!-- Check de éxito -->
<span class="material-icons text-emerald-500">check_circle</span>
```

---

### ☀️ **Dorado/Ámbar (Sol) - 4%**
**Representa:** Lo excepcional, valioso, premium, logros destacados

**Colores:** `amber-500` a `orange-500` (degradado solar)

**Uso:**
- 🏆 **Top performers** - Ranking #1, mejores vendedores
- ⭐ **Puntos/Recompensas** - Gamificación
- 💎 **KPIs excepcionales** - ROI alto, margen destacado
- 👑 **Elementos premium** - Features especiales
- 🌟 **Mejor día/semana** - Records

**NO usar para:**
- ❌ Datos comunes
- ❌ Información regular
- ❌ Elementos frecuentes

**Ejemplos:**
```html
<!-- Puntos de gamificación -->
<p class="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
  1,250 pts
</p>

<!-- Top performer -->
<div class="bg-gradient-to-br from-amber-400 to-orange-500">
  <span class="material-icons">emoji_events</span>
</div>

<!-- Badge premium -->
<span class="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
  Top
</span>
```

---

## 🌊 **Azul Cielo (Agua) - 3%**
**Representa:** Información del sistema, flujo, acciones técnicas

**Colores:** `sky-500/600` (azul cielo/agua)

**Uso:**
- 💧 **Movimientos automáticos** - Ajustes de inventario, sincronización
- 🔄 **Acciones de sistema** - Procesos técnicos, background tasks
- ℹ️ **Información neutral** - Datos sin carga emocional positiva/negativa
- 🛠️ **Configuración** - Ajustes, preferencias

**NO usar para:**
- ❌ Dinero o ingresos (usar verde)
- ❌ Premios o destacados (usar dorado)
- ❌ Acciones del usuario (usar verde o stone)

**Ejemplos:**
```html
<!-- Ajuste de inventario -->
<div class="bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/30">
  <span class="text-sky-600 dark:text-sky-500">Ajuste</span>
</div>

<!-- Icono de sistema -->
<div class="bg-sky-500 dark:bg-sky-600">
  <span class="material-icons">sync</span>
</div>
```

---

## ⚠️ **Rojo (Alerta) - <1%**
**Representa:** Alerta, bajo stock, urgente

**Colores:** `red-500/600` (solo para alertas críticas)

**Uso:**
- ⚠️ **Stock crítico** - < 5 unidades
- 🚨 **Alertas urgentes** - Acciones requeridas
- ❌ **Errores** - Validaciones fallidas

**Ejemplos:**
```html
<!-- Stock bajo -->
<div class="bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30">
  <span class="text-red-600 dark:text-red-500">Stock bajo</span>
</div>
```

---

## 📋 Guía de Aplicación por Componente

### **Dashboard**
- ✅ Iconos: Stone monocromáticos
- ✅ Ventas de hoy: Stone
- ✅ Ingresos semanales: Icono verde + Valor dorado (tesoro acumulado)
- ✅ Ganancia neta: Icono y valor verde (crecimiento)
- ✅ Mejor día: Icono y badge dorado (excepcional)
- ✅ KPIs: Stone, excepto ROI/Margen destacado en dorado

### **Metas**
- ✅ Iconos stats: Stone monocromáticos
- ✅ Puntos totales: Degradado dorado (tesoro)
- ✅ Barras de progreso: Verde sutil
- ✅ Checks completado: Verde
- ✅ Ranking #1: Badge dorado

### **Inventario**
- ✅ Cards productos: Stone
- ⚠️ Stock bajo: Rojo (alerta)
- ✅ Stock normal: Verde sutil
- ✅ Productos destacados: Sin color especial

### **POS**
- ✅ Interfaz: Stone
- ✅ Botón "Cobrar": Verde (acción positiva)
- ✅ Total > 500: Dorado sutil
- ✅ Productos: Stone

### **Reportes**
- ✅ Iconos: Stone
- ✅ Top vendedor: Dorado
- ✅ Gráficas: Verde para barras de ingresos
- ✅ Rankings: Dorado para #1, stone resto

### **Clientes**
- ✅ Todo stone monocromático
- ✅ Cliente destacado: Badge dorado

---

## ✨ Micro-interacciones (Linear/Notion Style)

### **Cards Interactivas**
```html
<!-- Base card con hover sutil -->
<div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 
            shadow-sm hover:shadow-md transition-all duration-300 ease-out
            hover:scale-[1.01] cursor-pointer">
  <!-- Contenido -->
</div>
```

### **Botones con Feedback**
```html
<!-- Botón primario (verde - acción positiva) -->
<button class="bg-emerald-500 hover:bg-emerald-600 active:scale-95 
               transition-all duration-150 ease-out
               shadow-sm hover:shadow-md">
  Guardar
</button>

<!-- Botón secundario (stone - neutro) -->
<button class="bg-stone-100 hover:bg-stone-200 active:scale-95
               transition-all duration-150 ease-out">
  Cancelar
</button>

<!-- Botón de acción sutil -->
<button class="hover:bg-stone-50 dark:hover:bg-stone-800 
               active:scale-95 transition-all duration-150">
  <span class="material-icons">more_vert</span>
</button>
```

### **KPI Cards con Animación**
```html
<div class="group bg-white dark:bg-stone-900 rounded-2xl 
            border border-stone-100 dark:border-stone-800
            shadow-sm hover:shadow-lg transition-all duration-300
            hover:-translate-y-0.5">
  
  <!-- El número principal con transición suave -->
  <p class="text-3xl font-bold transition-all duration-500 ease-out
            group-hover:scale-105 transform-gpu">
    {{ value }}
  </p>
</div>
```

### **Iconos con Bounce**
```html
<div class="h-10 w-10 rounded-xl bg-stone-900 dark:bg-stone-100
            flex items-center justify-center
            transition-all duration-200 ease-out
            hover:rotate-12 hover:scale-110">
  <span class="material-icons-outlined">star</span>
</div>
```

### **Loading States**
```html
<!-- Skeleton con pulse suave -->
<div class="animate-pulse bg-stone-100 dark:bg-stone-800 rounded-2xl h-32"></div>

<!-- Spinner premium -->
<div class="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-emerald-500"></div>
```

### **Transiciones de Números (Counter)**
```typescript
// Usar Angular animations o librería count-up
// Los números deben "contar" hacia arriba suavemente
@Component({
  animations: [
    trigger('countUp', [
      transition(':increment', [
        animate('500ms ease-out')
      ])
    ])
  ]
})
```

### **Durations & Easing**
```css
/* Ultra rápido - feedback inmediato */
duration-100 ease-out  → Clicks, active states

/* Rápido - interacciones normales */
duration-150 ease-out  → Hovers, focus states

/* Medio - transiciones suaves */
duration-300 ease-out  → Cards, shadows, scales

/* Lento - animaciones especiales */
duration-500 ease-out  → Números, transformaciones complejas
```

---

## 🚫 Colores Prohibidos

**Eliminar completamente:**
- ❌ Azul (sky, blue, cyan)
- ❌ Púrpura/Violeta (purple, violet, indigo)
- ❌ Rosa (pink, rose, fuchsia)
- ❌ Amarillo brillante (yellow - solo amber)
- ❌ Lima/Verde lima (lime)

**Excepción:** Gráficas pueden usar grises variados para distinguir series

---

## ✨ Principios de Diseño

1. **Menos es más** - Si dudas, usa stone
2. **Color con propósito** - Cada color debe significar algo
3. **Jerarquía clara** - Stone (base) → Verde (positivo) → Dorado (excepcional)
4. **Consistencia total** - Mismo color = mismo significado en toda la app
5. **Accesibilidad** - Contraste mínimo 4.5:1

---

## 🎯 Checklist de Implementación

### Dashboard
- [x] Ventas de Hoy → Stone
- [x] Ingresos Semanales → Verde + Dorado
- [x] Ganancia Neta → Verde
- [x] Mejor Día → Dorado
- [ ] KPI Cards → Revisar y aplicar

### Metas
- [x] Stats Cards → Stone + Dorado (puntos)
- [x] Progreso → Verde
- [x] Logros → Stone
- [x] Ranking → Dorado (#1)

### Inventario
- [ ] Cards → Stone
- [ ] Stock bajo → Rojo (alerta)
- [ ] Análisis → Revisar colores

### POS
- [ ] Interfaz → Stone
- [ ] Botón Cobrar → Verde
- [ ] Total → Revisar

### Reportes
- [ ] Iconos → Stone
- [ ] Rankings → Dorado (#1)
- [ ] Gráficas → Verde (ingresos)

### Clientes
- [ ] Todo → Stone
- [ ] Destacados → Dorado

---

## 🧘 Resultado Final

**Zen Garden completo:**
```
Stone (Piedra)  → 90% - Calma y estabilidad
Verde (Musgo)   → 7%  - Crecimiento natural
Dorado (Sol)    → 3%  - Lo excepcional
Rojo (Alerta)   → <1% - Solo urgencias
```

**Sensación:** Profesional, minimalista, sofisticado, enfocado en datos.

---

*Última actualización: 30 de diciembre de 2025*
