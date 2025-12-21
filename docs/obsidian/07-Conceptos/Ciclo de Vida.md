---
tags: [angular, ciclo-vida, hooks, lifecycle]
created: 2024-12-20
---

# 🔄 Ciclo de Vida - Del Nacimiento a la Muerte

> _"Todo componente nace, vive y muere"_

---

## 🎒 ¿Qué es el Ciclo de Vida?

Cada componente tiene **etapas de vida**:

1. 👶 Nace (se crea)
2. 🧒 Crece (recibe datos, se actualiza)
3. 💀 Muere (se destruye)

Angular te avisa en cada etapa con **hooks** (métodos especiales).

---

## 📊 Los Hooks en Orden

```
constructor()          1️⃣ Se construye (inyección)
      ↓
ngOnChanges()          2️⃣ Inputs cambian (primera vez y después)
      ↓
ngOnInit()             3️⃣ Se inicializa (una vez)
      ↓
ngDoCheck()            4️⃣ Detección de cambios
      ↓
ngAfterContentInit()   5️⃣ Contenido proyectado listo
      ↓
ngAfterContentChecked()6️⃣ Contenido revisado
      ↓
ngAfterViewInit()      7️⃣ Vista lista (una vez)
      ↓
ngAfterViewChecked()   8️⃣ Vista revisada
      ↓
[ciclo de actualizaciones...]
      ↓
ngOnDestroy()          9️⃣ Se destruye (limpieza)
```

---

## 🎯 Los 3 Más Importantes

### 1️⃣ ngOnInit - Cuando Nace

```typescript
export class MiComponent implements OnInit {
  private service = inject(MiService);
  datos = signal<Producto[]>([]);

  ngOnInit() {
    // ✅ Cargar datos iniciales
    this.datos.set(this.service.getProductos());

    // ✅ Configurar subscripciones
    // ✅ Llamar APIs
  }
}
```

**Usa para:**

- Cargar datos de servicios
- Inicializar estado
- Suscribirse a observables

### 2️⃣ ngOnChanges - Cuando Inputs Cambian

```typescript
export class HijoComponent implements OnChanges {
  @Input() producto: Producto | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['producto']) {
      const valorAnterior = changes['producto'].previousValue;
      const valorNuevo = changes['producto'].currentValue;

      console.log('Producto cambió:', valorAnterior, '→', valorNuevo);
    }
  }
}
```

**Usa para:**

- Reaccionar a cambios de @Input
- Comparar valor anterior vs nuevo

### 3️⃣ ngOnDestroy - Cuando Muere

```typescript
export class MiComponent implements OnDestroy {
  private subscription!: Subscription;

  ngOnInit() {
    this.subscription = this.service.datos$.subscribe(...);
  }

  ngOnDestroy() {
    // ✅ Limpiar suscripciones
    this.subscription.unsubscribe();

    // ✅ Limpiar timers
    // ✅ Remover event listeners
  }
}
```

**Usa para:**

- Desuscribirse de observables
- Limpiar intervalos/timeouts
- Liberar recursos

---

## ⚡ Con Signals (Moderno)

Con signals, necesitas MENOS hooks:

### ❌ Antes (con ngOnChanges)

```typescript
export class Componente implements OnChanges {
  @Input() precio = 0;
  @Input() cantidad = 0;

  total = 0;

  ngOnChanges() {
    this.total = this.precio * this.cantidad;
  }
}
```

### ✅ Ahora (con computed)

```typescript
export class Componente {
  precio = input(0);
  cantidad = input(0);

  // Se actualiza AUTOMÁTICAMENTE
  total = computed(() => this.precio() * this.cantidad());
}
```

---

## 📝 Ejemplo Completo: Componente de Producto

```typescript
@Component({
  selector: 'app-producto',
  template: `...`,
})
export class ProductoComponent implements OnInit, OnDestroy {
  // Inyecciones
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  // Estado
  producto = signal<Producto | null>(null);
  loading = signal(true);

  // Subscripciones (para limpiar después)
  private routeSub!: Subscription;

  ngOnInit() {
    // Escuchar cambios en la ruta
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.cargarProducto(id);
      }
    });
  }

  private cargarProducto(id: string) {
    this.loading.set(true);
    const prod = this.productService.getById(id);
    this.producto.set(prod);
    this.loading.set(false);
  }

  ngOnDestroy() {
    // ⚠️ IMPORTANTE: Siempre limpiar
    this.routeSub.unsubscribe();
  }
}
```

---

## 🆚 Constructor vs ngOnInit

| Constructor                 | ngOnInit                 |
| --------------------------- | ------------------------ |
| JavaScript puro             | Angular hook             |
| Antes que Angular configure | Después de configurar    |
| Solo inyección              | Lógica de inicialización |

```typescript
export class MiComponent implements OnInit {
  // Constructor: solo inyección
  private service = inject(MiService);

  // ngOnInit: lógica
  ngOnInit() {
    this.service.cargarDatos();
  }
}
```

---

## 🧹 Patrón de Limpieza con takeUntilDestroyed

### El Problema

```typescript
// ❌ Olvidar desuscribirse = memory leak
ngOnInit() {
  this.service.datos$.subscribe(data => {
    this.datos = data;
  });
  // Sin ngOnDestroy, esto queda "vivo" para siempre
}
```

### La Solución Moderna

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class MiComponent {
  private service = inject(MiService);

  constructor() {
    // ✅ Se desuscribe automáticamente cuando el componente muere
    this.service.datos$.pipe(takeUntilDestroyed()).subscribe((data) => {
      // ...
    });
  }
}
```

---

## 💡 Reglas Zen del Ciclo de Vida

> [!important] Regla 1: Siempre limpia en ngOnDestroy
> Subscripciones, timers, event listeners

> [!tip] Regla 2: Usa signals en lugar de ngOnChanges
> computed() es más limpio

> [!note] Regla 3: takeUntilDestroyed() es tu amigo
> Evita memory leaks automáticamente

---

## 📎 Relacionados

- [[Signal Básico]]
- [[Computed]]
- [[Effect]]
- [[Componente App]]
