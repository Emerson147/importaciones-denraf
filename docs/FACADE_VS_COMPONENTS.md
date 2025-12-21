# 🎭 Facades vs Componentes: La Guía Definitiva

**Explicación Senior para Principiantes**  
Última actualización: 16 de diciembre de 2025

---

## 📚 Tabla de Contenido

1. Analogía del Mundo Real
2. Qué es un Componente UI/Atómico
3. Qué es un Facade
4. Diferencias Clave
5. Cuándo Usar Cada Uno
6. Ejemplos Reales del Proyecto
7. Checklist de Decisión
8. Anti-Patrones Comunes

---

## 🎨 Analogía del Mundo Real

Imagina que estás construyendo una casa:

### 🧱 **Componentes UI = Ladrillos, Ventanas, Puertas**

- Son las **piezas visuales** reutilizables
- No saben para qué casa se están usando
- Solo se preocupan por **verse bien** y ser **fáciles de usar**
- Ejemplo: Un botón no sabe si es para guardar, eliminar o enviar

### 🏗️ **Facade = El Arquitecto/Capataz**

- Es el **cerebro** que coordina todo
- Sabe **QUÉ hacer** y **CUÁNDO hacerlo**
- Maneja la **lógica de negocio** compleja
- Ejemplo: El sistema que calcula el precio total de una venta, maneja descuentos, valida stock, etc.

---

## 🎨 Qué es un Componente UI/Atómico

### Definición Simple

**Un componente UI es una pieza visual reutilizable que se ve bonita y funciona igual en cualquier parte de tu aplicación.**

---

### Características Principales

#### 1️⃣ **Responsabilidad: SOLO PRESENTACIÓN**

```typescript
// ✅ CORRECTO: Un botón solo sabe verse bonito y emitir eventos
@Component({
  selector: 'app-ui-button',
  template: `
    <button [class]="classes" (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `
})
export class UiButtonComponent {
  @Input() variant: 'default' | 'destructive' | 'outline' = 'default';
  @Input() disabled = false;
  @Output() onClick = new EventEmitter<Event>();
  
  // Solo calcula clases CSS, NO lógica de negocio
  get classes() { /* ... */ }
}
```

#### 2️⃣ **NO conoce el negocio**

```typescript
// ❌ INCORRECTO: El botón NO debe saber sobre ventas
export class UiButtonComponent {
  calculateSaleTotal() { } // ¡¡MAL!!
  validateStock() { }      // ¡¡MAL!!
}

// ✅ CORRECTO: Solo emite eventos
export class UiButtonComponent {
  @Output() onClick = new EventEmitter(); // ¡Bien!
}
```

#### 3️⃣ **Reutilizable en TODO el proyecto**

```html
<!-- Mismo componente, usos diferentes -->
<app-ui-button variant="default" (onClick)="guardar()">Guardar</app-ui-button>
<app-ui-button variant="destructive" (onClick)="eliminar()">Eliminar</app-ui-button>
<app-ui-button variant="outline" (onClick)="cancelar()">Cancelar</app-ui-button>
```

### Tipos de Componentes UI (Atomic Design)

```
🔹 Átomos (atoms)
   └─ Elementos más pequeños e indivisibles
   └─ Ejemplos: ui-button, ui-input, ui-badge, ui-label
   
🔹 Moléculas (molecules)  
   └─ Combinación de átomos
   └─ Ejemplos: ui-card (usa badge + texto), ui-dropdown (usa button + lista)
   
🔹 Organismos (organisms)
   └─ Secciones completas de UI
   └─ Ejemplos: ui-page-header, ui-notification-center
```

### Ubicación en el Proyecto

```
src/app/shared/ui/
├── ui-button/           # Átomo
├── ui-input/            # Átomo
├── ui-badge/            # Átomo
├── ui-card/             # Molécula
├── ui-dropdown/         # Molécula
└── ui-page-header/      # Organismo
```

---

## 🏗️ Qué es un Facade

### Definición Simple

**Un Facade es un servicio inteligente que maneja TODA la lógica de negocio de una funcionalidad específica, dejando a los componentes solo "presentar" información.**

---

### Características Principales

#### 1️⃣ **Responsabilidad: LÓGICA DE NEGOCIO**

```typescript
@Injectable()
export class PosCartFacade {
  // 🧠 ESTADO: Maneja datos complejos
  private cartItems = signal<CartItem[]>([]);
  
  // 📊 COMPUTADOS: Cálculos automáticos
  readonly total = computed(() => 
    this.cartItems().reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    )
  );
  
  readonly tax = computed(() => this.subtotal() * 0.18);
  
  // ⚙️ MÉTODOS: Lógica de negocio compleja
  addItem(product: Product): { success: boolean; message?: string } {
    // Valida stock
    if (product.stock === 0) {
      return { success: false, message: 'Sin stock' };
    }
    
    // Verifica duplicados
    const existing = this.cartItems().find(item => item.product.id === product.id);
    
    // Actualiza estado
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.update(items => [...items, { product, quantity: 1 }]);
    }
    
    return { success: true };
  }
}
```

#### 2️⃣ **Centraliza la Complejidad**

```typescript
// ❌ Sin Facade: Lógica dispersa en componentes 😵
export class PosPageComponent {
  cart: CartItem[] = [];
  
  addProduct(product: Product) {
    // Validar stock
    if (product.stock === 0) { /* ... */ }
    
    // Buscar duplicados
    const existing = this.cart.find(/* ... */);
    
    // Calcular totales
    const subtotal = this.cart.reduce(/* ... */);
    const tax = subtotal * 0.18;
    
    // Validar descuentos
    // Aplicar promociones
    // Validar métodos de pago
    // ... 100 líneas más
  }
}

// ✅ Con Facade: Simple y limpio 😊
export class PosPageComponent {
  private cartFacade = inject(PosCartFacade);
  
  addProduct(product: Product) {
    const result = this.cartFacade.addItem(product);
    
    if (!result.success) {
      this.showError(result.message);
    }
  }
}
```

#### 3️⃣ **Reutilizable ENTRE Features**

```typescript
// Mismo Facade, usado en diferentes páginas
export class PosPageComponent {
  private cartFacade = inject(PosCartFacade); // 🛒
}

export class QuickSaleComponent {
  private cartFacade = inject(PosCartFacade); // 🛒 Mismo
}

export class MobilePosComponent {
  private cartFacade = inject(PosCartFacade); // 🛒 Mismo
}
```

### Ubicación en el Proyecto

```
src/app/features/pos/facades/
├── pos-cart.facade.ts       # Lógica del carrito
├── pos-payment.facade.ts    # Lógica de pagos
└── pos-product.facade.ts    # Lógica de productos
```

---

## ⚖️ Diferencias Clave

---

| Aspecto | 🎨 Componente UI | 🏗️ Facade |
|---------|------------------|------------|
| **Qué es** | Pieza visual | Servicio de lógica |
| **Responsabilidad** | Presentación | Lógica de negocio |
| **Conoce el negocio** | ❌ No | ✅ Sí |
| **Maneja estado** | ❌ Solo local simple | ✅ Estado complejo |
| **Decorator** | @Component | @Injectable |
| **Tiene template** | ✅ Sí (HTML) | ❌ No |
| **Tiene estilos** | ✅ Sí (CSS) | ❌ No |
| **Reutilizable en** | Toda la app | Features relacionados |
| **Testeo** | Visual/Interacción | Lógica/Unidades |
| **Ejemplo** | `<app-ui-button>` | PosCartFacade |

---

### 📊 Comparación Visual

```
┌─────────────────────────────────────────────────────────┐
│                    APLICACIÓN                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         POS PAGE COMPONENT                      │   │
│  │                                                 │   │
│  │  ┌──────────────┐         ┌─────────────────┐  │   │
│  │  │ UI BUTTON    │         │ PosCartFacade   │  │   │
│  │  │ (Vista)      │◄────────│ (Cerebro)       │  │   │
│  │  │              │ Datos   │                 │  │   │
│  │  │ - Colores    │         │ - Validaciones  │  │   │
│  │  │ - Tamaños    │         │ - Cálculos      │  │   │
│  │  │ - Clicks     │         │ - Estado        │  │   │
│  │  └──────────────┘         │ - API Calls     │  │   │
│  │                           └─────────────────┘  │   │
│  │  ┌──────────────┐                              │   │
│  │  │ UI CARD      │                              │   │
│  │  │ (Vista)      │                              │   │
│  │  └──────────────┘                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 Cuándo Usar Cada Uno

### Usa un **Componente UI** cuando:

**✅ Necesites una pieza visual reutilizable**

```typescript
// Quiero un botón bonito que use en toda la app
<app-ui-button variant="primary">Click me</app-ui-button>
```

**✅ Solo manejes presentación y eventos simples**

```typescript
@Component({...})
export class UiInputComponent {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  
  onInput(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
```

**✅ NO necesites conocer el contexto de negocio**

```typescript
// El botón NO sabe si es para ventas, inventario o usuarios
// Solo se ve bonito y emite eventos
```

---

### Usa un **Facade** cuando:

**✅ Necesites lógica de negocio compleja**

```typescript
// Gestionar un carrito: validar stock, calcular totales, aplicar descuentos
export class PosCartFacade { /* ... */ }
```

**✅ Manejes estado compartido entre componentes**

```typescript
// Varios componentes necesitan acceder al mismo carrito
export class PosPageComponent {
  private cartFacade = inject(PosCartFacade);
}
export class QuickSaleComponent {
  private cartFacade = inject(PosCartFacade); // Mismo estado
}
```

**✅ Necesites coordinar múltiples servicios**

```typescript
export class PosPaymentFacade {
  private salesService = inject(SalesService);
  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);
  
  async processSale(sale: Sale) {
    // Coordina múltiples servicios
    await this.salesService.save(sale);
    await this.inventoryService.updateStock(sale.items);
    this.notificationService.success('Venta exitosa');
  }
}
```

---

## 💼 Ejemplos Reales del Proyecto

### Ejemplo 1: Sistema de Carrito de Compras

#### 🎨 COMPONENTE UI: ui-button

**Ubicación:** `src/app/shared/ui/ui-button/`

```typescript
@Component({
  selector: 'app-ui-button',
  template: `
    <button [class]="classes" (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `
})
export class UiButtonComponent {
  @Input() variant: 'default' | 'destructive' = 'default';
  @Output() onClick = new EventEmitter<Event>();
  
  // Solo maneja apariencia
  get classes() {
    return cn(
      'rounded-md font-medium',
      this.variant === 'default' && 'bg-blue-500 text-white',
      this.variant === 'destructive' && 'bg-red-500 text-white'
    );
  }
}
```

---

#### 🏗️ FACADE: PosCartFacade

**Ubicación:** `src/app/features/pos/facades/`

```typescript
@Injectable()
export class PosCartFacade {
  private cartItems = signal<CartItem[]>([]);
  
  // Cálculos automáticos
  readonly total = computed(() => 
    this.cartItems().reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    )
  );
  
  readonly tax = computed(() => this.total() * 0.18);
  
  // Lógica de negocio
  addItem(product: Product): { success: boolean; message?: string } {
    // Validar stock
    if (product.stock === 0) {
      return { success: false, message: 'Sin stock disponible' };
    }
    
    // Buscar duplicados
    const existing = this.cartItems().find(i => i.product.id === product.id);
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        return { success: false, message: 'Stock máximo alcanzado' };
      }
      existing.quantity++;
    } else {
      this.cartItems.update(items => [...items, { product, quantity: 1 }]);
    }
    
    return { success: true };
  }
  
  removeItem(productId: string): void {
    this.cartItems.update(items => items.filter(i => i.product.id !== productId));
  }
  
  clear(): void {
    this.cartItems.set([]);
  }
}
```

---

#### 🎭 COMPONENTE DE PÁGINA: pos-page

**Ubicación:** `src/app/features/pos/pos-page/`

```typescript
@Component({
  selector: 'app-pos-page',
  template: `
    <div>
      <h1>Punto de Venta</h1>
      
      <!-- Usa el FACADE para lógica -->
      <p>Total: {{ cartFacade.total() }}</p>
      <p>Items: {{ cartFacade.itemCount() }}</p>
      
      <!-- Usa COMPONENTES UI para presentación -->
      <app-ui-button 
        variant="default"
        (onClick)="onAddProduct(selectedProduct)">
        Agregar al Carrito
      </app-ui-button>
      
      <app-ui-button 
        variant="destructive"
        (onClick)="onClearCart()">
        Vaciar Carrito
      </app-ui-button>
    </div>
  `
})
export class PosPageComponent {
  // Inyecta el FACADE (cerebro)
  protected cartFacade = inject(PosCartFacade);
  
  selectedProduct: Product = {/* ... */};
  
  // Métodos simples que delegan al Facade
  onAddProduct(product: Product) {
    const result = this.cartFacade.addItem(product);
    
    if (!result.success) {
      alert(result.message);
    }
  }
  
  onClearCart() {
    this.cartFacade.clear();
  }
}
```

---

### Flujo Completo

```
Usuario hace click en "Agregar al Carrito"
            ↓
    🎨 UI-BUTTON emite evento (onClick)
            ↓
    🎭 POS-PAGE recibe el evento
            ↓
    🏗️ FACADE procesa la lógica:
       - Valida stock
       - Busca duplicados
       - Actualiza estado
       - Calcula totales
            ↓
    🎭 POS-PAGE muestra resultado
            ↓
    🎨 UI-BUTTON se actualiza visualmente
```

---

## ✅ Checklist de Decisión

### ¿Debería crear un Componente UI?

**Marca las casillas que apliquen:**

- [ ] Es una pieza visual reutilizable (botón, input, card)
- [ ] Se usará en múltiples páginas con diferentes contextos
- [ ] Solo maneja presentación y eventos simples
- [ ] NO necesita conocer lógica de negocio específica

**Si respondiste SÍ a todas → Crear Componente UI** ✅

---

### ¿Debería crear un Facade?

**Marca las casillas que apliquen:**

- [ ] Hay lógica de negocio compleja (validaciones, cálculos)
- [ ] Múltiples componentes necesitan el mismo estado
- [ ] Necesito coordinar varios servicios
- [ ] La lógica es específica a una funcionalidad/feature

**Si respondiste SÍ a 2 o más → Crear Facade** ✅

---

## ❌ Anti-Patrones Comunes

### 1. Lógica de Negocio en Componentes UI

#### ❌ INCORRECTO

```typescript
@Component({ selector: 'app-ui-product-card' })
export class UiProductCardComponent {
  @Input() product!: Product;
  
  // ¡MAL! Un componente UI NO debe calcular impuestos
  calculateTax(): number {
    return this.product.price * 0.18;
  }
  
  // ¡MAL! Un componente UI NO debe validar stock
  validateStock(): boolean {
    return this.product.stock > 0;
  }
}
```

#### ✅ CORRECTO: Mover al Facade

```typescript
@Injectable()
export class ProductFacade {
  calculateTax(price: number): number {
    return price * 0.18;
  }
  
  validateStock(product: Product): boolean {
    return product.stock > 0;
  }
}

@Component({ selector: 'app-ui-product-card' })
export class UiProductCardComponent {
  @Input() product!: Product;
  @Input() tax!: number;        // Recibe datos calculados
  @Input() hasStock!: boolean;  // Recibe datos validados
}
```

---

### 2. Facades con Responsabilidades Mezcladas

#### ❌ INCORRECTO: Un Facade haciendo TODO

```typescript
@Injectable()
export class GodFacade {
  // Maneja carrito
  addToCart() { }
  
  // Maneja pagos
  processPayment() { }
  
  // Maneja inventario
  updateStock() { }
  
  // Maneja usuarios
  loginUser() { }
}
```

#### ✅ CORRECTO: Separar por responsabilidad

```typescript
@Injectable()
export class PosCartFacade {
  addToCart() { }
  removeFromCart() { }
}

@Injectable()
export class PosPaymentFacade {
  processPayment() { }
  refundPayment() { }
}

@Injectable()
export class InventoryFacade {
  updateStock() { }
  checkStock() { }
}
```

---

### 3. Componentes UI Acoplados a Datos Específicos

#### ❌ INCORRECTO: Acoplado a Product

```typescript
@Component({ selector: 'app-ui-card' })
export class UiCardComponent {
  @Input() product!: Product; // ¡Solo sirve para productos!
}
```

#### ✅ CORRECTO: Genérico y flexible

```typescript
@Component({ selector: 'app-ui-card' })
export class UiCardComponent {
  @Input() title!: string;
  @Input() description?: string;
  // Acepta cualquier contenido con ng-content
}

// Uso:
<app-ui-card [title]="product.name" [description]="product.description">
  <!-- Contenido personalizado -->
</app-ui-card>
```

---

## 📖 Resumen Final

### Piensa así:

**🎨 Componentes UI = LEGOS**
- Piezas simples que puedes combinar
- Se ven bonitas
- No saben para qué se usan

**🏗️ Facades = INSTRUCCIONES DEL LEGO**
- Te dicen cómo y cuándo usar las piezas
- Contienen la lógica y reglas
- Coordinan todo el proceso

**🎭 Componentes de Página = EL CONSTRUCTOR**
- Usa las piezas (UI)
- Sigue las instrucciones (Facade)
- Construye el resultado final

---

### Regla de Oro

**🎯 REGLA DE ORO:**

- **Si tiene template HTML** → Componente UI  
- **Si tiene lógica de negocio** → Facade  
- **Si coordina ambos** → Componente de Página/Feature

---

## 🔗 Referencias

- **Atomic Design Methodology:** https://atomicdesign.bradfrost.com/
- **Facade Pattern:** https://refactoring.guru/design-patterns/facade
- **Angular Component Communication:** https://angular.io/guide/component-interaction
- **Angular Signals:** https://angular.io/guide/signals

---

## 📝 Notas para Futuros Proyectos

### Estructura Recomendada

```
src/app/
├── shared/
│   └── ui/                    # 🎨 Componentes UI reutilizables
│       ├── ui-button/
│       ├── ui-input/
│       └── ui-card/
│
└── features/
    └── pos/                   # Feature específico
        ├── facades/           # 🏗️ Facades (lógica de negocio)
        │   ├── pos-cart.facade.ts
        │   └── pos-payment.facade.ts
        │
        └── pos-page/          # 🎭 Componente de página
            └── pos-page.component.ts
```

### Convenciones de Nombres

- **Componentes UI:** `ui-{nombre}.component.ts` → `ui-button.component.ts`
- **Facades:** `{feature}-{funcionalidad}.facade.ts` → `pos-cart.facade.ts`
- **Páginas:** `{feature}-page.component.ts` → `pos-page.component.ts`

---

## 💡 Recordatorios Finales

**💄 Componentes UI = Como te ves**  
Solo presentación visual

**🧠 Facades = Como piensas**  
Lógica de negocio

**🎬 Componentes de Página = Como actúas**  
Coordinación entre UI y lógica

---

**¡Éxito en tus proyectos!** 🚀
`