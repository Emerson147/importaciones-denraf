---
tags: [angular, typescript, configuración]
created: 2024-12-20
---

# 📝 tsconfig.json - Las Reglas de TypeScript

> _"Cómo TypeScript debe revisar tu código"_

---

## 🎒 ¿Qué es tsconfig.json?

Es un libro de **reglas** que le dice a TypeScript:

- ✅ Qué errores mostrar
- ⚙️ Cómo compilar
- 🎯 Qué tan estricto ser

---

## 📋 Tu Configuración Actual

```json
{
  "compilerOptions": {
    // 🔒 MODO ESTRICTO - MÁS SEGURO
    "strict": true, // Activa todas las verificaciones
    "noImplicitReturns": true, // Obliga a retornar siempre
    "noFallthroughCasesInSwitch": true, // Obliga break en switch

    // 🎯 TARGET
    "target": "ES2022", // JavaScript moderno
    "module": "preserve" // Sistema de módulos
  },

  "angularCompilerOptions": {
    // 🅰️ ANGULAR ESPECÍFICO
    "strictTemplates": true, // Revisa HTML estrictamente
    "strictInjectionParameters": true // Revisa inject()
  }
}
```

---

## 🔒 Modo Strict - Tu Mejor Amigo

### ¿Qué hace `"strict": true`?

Activa TODAS estas verificaciones:

```typescript
// ❌ Sin strict (peligroso)
function suma(a, b) {
  // ¿a y b son números? ¿strings?
  return a + b;
}

// ✅ Con strict (seguro)
function suma(a: number, b: number): number {
  return a + b; // TypeScript SABE que son números
}
```

### Errores que Strict Previene

```typescript
// 1. Variables posiblemente undefined
let nombre: string;
console.log(nombre); // ❌ Error: puede ser undefined

// 2. Parámetros sin tipo
function greet(name) {} // ❌ Error: name necesita tipo

// 3. Return implícito
function getValue() {
  if (condition) return 5;
  // ❌ Error: ¿qué retorna si condition es false?
}
```

---

## 🎯 Opciones Importantes

### `noImplicitReturns`

```typescript
// ❌ Sin la opción
function getValor(x: number) {
  if (x > 0) {
    return x;
  }
  // No retorna nada aquí... ¿está bien? 🤷
}

// ✅ Con la opción
function getValor(x: number): number {
  if (x > 0) {
    return x;
  }
  return 0; // Obligado a retornar siempre
}
```

### `noFallthroughCasesInSwitch`

```typescript
// ❌ Sin la opción (bug común)
switch (color) {
  case 'rojo':
    console.log('Parar');
  // Sin break, ¡sigue al siguiente case!
  case 'verde':
    console.log('Avanzar');
}

// ✅ Con la opción
switch (color) {
  case 'rojo':
    console.log('Parar');
    break; // Obligatorio
  case 'verde':
    console.log('Avanzar');
    break;
}
```

---

## 🅰️ Angular Compiler Options

### `strictTemplates`

Revisa que tu HTML tenga sentido:

```html
<!-- ❌ Error: 'nmae' no existe en el componente -->
<p>{{ nmae }}</p>

<!-- ❌ Error: 'onClick' no es un evento -->
<button (onClick)="save()">
  <!-- ✅ Correcto -->
  <p>{{ name }}</p>
  <button (click)="save()"></button>
</button>
```

### `strictInjectionParameters`

```typescript
// ❌ Error: ProductService necesita @Injectable
class ProductService {} // Falta decorador

// ✅ Correcto
@Injectable({ providedIn: 'root' })
class ProductService {}
```

---

## 📁 Los Tres Archivos tsconfig

```
tsconfig.json           ← Base (configuración común)
├── tsconfig.app.json   ← Para la app
└── tsconfig.spec.json  ← Para tests
```

### tsconfig.app.json

```json
{
  "extends": "./tsconfig.json", // Hereda del base
  "compilerOptions": {
    "outDir": "./out-tsc/app"
  },
  "files": ["src/main.ts"], // Punto de entrada
  "include": ["src/**/*.d.ts"]
}
```

---

## 🎯 Target y Module

### Target (¿A qué JavaScript compilar?)

```json
"target": "ES2022"
```

```
ES5     → JavaScript viejo (IE11)
ES2015  → let, const, arrow functions
ES2022  → Top-level await, private fields ✅
ESNext  → Lo más nuevo posible
```

### Module (¿Cómo manejar imports?)

```json
"module": "preserve"
```

Mantiene los `import/export` como están (Angular los maneja).

---

## 👶 Analogía para 5 Años

```
tsconfig.json = Las reglas de tu salón de clases

"strict": true = "Debes escribir bonito y ordenado"

Sin strict:
  📝 Puedes escribir como quieras
  😰 Pero luego no entiendes tu letra

Con strict:
  📝 Debes escribir ordenado
  😊 Todo está claro y sin errores
```

---

## 💡 Reglas Zen de tsconfig

> [!important] Regla 1: Strict siempre activado
> Más errores al escribir = menos errores al ejecutar

> [!tip] Regla 2: No bajes la guardia
> No desactives opciones solo porque dan error

> [!note] Regla 3: Hereda con extends
> Los tsconfigs hijos heredan del padre

---

## 📎 Relacionados

- [[package.json]]
- [[angular.json]]
- [[TypeScript Básico]]
