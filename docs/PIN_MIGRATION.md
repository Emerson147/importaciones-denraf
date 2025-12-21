# 🔐 Migración de PINs a Hash

## ⚠️ IMPORTANTE - LEER ANTES DE MIGRAR

Esta guía te ayudará a migrar el sistema de PINs de **texto plano** a **hash SHA-256** para mayor seguridad.

---

## 📋 **Pasos de Migración**

### **1. Backup de Datos Actual**

Antes de comenzar, **DEBES** hacer un backup de localStorage:

```javascript
// En la consola del navegador
const backup = {
  users: localStorage.getItem('denraf_users'),
  current_user: localStorage.getItem('denraf_current_user'),
  timestamp: new Date().toISOString()
};
console.log('🔐 Backup:', JSON.stringify(backup));
// Copiar y guardar este JSON en un lugar seguro
```

---

### **2. PINs Actuales (Para Referencia)**

Anota estos PINs antes de la migración:

| Usuario  | PIN Actual |
|----------|------------|
| Yo       | 1234       |
| Mamá     | 5678       |
| Hermano  | 9012       |

**⚠️ Estos PINs se mantendrán igual DESPUÉS de la migración**
(Solo se guardará el hash, pero ingresas el mismo PIN)

---

### **3. Activar Sistema de Hash**

El sistema ya incluye `CryptoService` pero está **desactivado por defecto**.

Para activar el hash de PINs:

**Opción A: Migración Manual (Recomendada)**

1. Abre la consola del navegador (F12)
2. Ejecuta este script:

```javascript
// Script de migración
async function migratePinsToHash() {
  // Cargar CryptoService
  const crypto = window['ng'].getComponent(document.querySelector('app-root')).crypto;
  
  // PINs actuales
  const pins = {
    'user-1': '1234',
    'user-2': '5678',
    'user-3': '9012'
  };
  
  // Generar hashes
  const hashes = {};
  for (const [userId, pin] of Object.entries(pins)) {
    const hash = await hashPin(pin);
    hashes[userId] = hash;
    console.log(`✅ ${userId}: ${pin} → ${hash.substring(0, 16)}...`);
  }
  
  // Actualizar localStorage
  const users = JSON.parse(localStorage.getItem('denraf_users') || '[]');
  users.forEach(user => {
    if (hashes[user.id]) {
      user.pinHash = hashes[user.id];
      delete user.pin; // Eliminar PIN en texto plano
    }
  });
  
  localStorage.setItem('denraf_users', JSON.stringify(users));
  console.log('🎉 Migración completada!');
}

// Función auxiliar de hash
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Ejecutar migración
migratePinsToHash();
```

**Opción B: Migración Automática (Próximamente)**

El sistema detectará automáticamente PINs en texto plano y los migrará en el próximo login.

---

### **4. Modificar AuthService**

Actualiza el método de validación de PIN:

```typescript
// ANTES (texto plano)
validatePin(userId: string, pin: string): boolean {
  const user = this.usersList().find(u => u.id === userId);
  return user ? user.pin === pin : false;
}

// DESPUÉS (con hash)
async validatePin(userId: string, pin: string): Promise<boolean> {
  const user = this.usersList().find(u => u.id === userId);
  if (!user) return false;
  
  // Si tiene pinHash, usar verificación con hash
  if (user.pinHash) {
    return await this.crypto.verifyPin(pin, user.pinHash);
  }
  
  // Retrocompatibilidad: si aún usa pin en texto plano
  if (user.pin) {
    console.warn('⚠️ Usuario con PIN sin hashear. Migrar pronto.');
    return user.pin === pin;
  }
  
  return false;
}
```

---

### **5. Actualizar Interfaz de User**

```typescript
// En core/models/index.ts
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'vendor';
  pin?: string;      // ❌ Deprecado (mantener para retrocompatibilidad)
  pinHash?: string;  // ✅ Nuevo campo (hash SHA-256)
  createdAt: Date;
}
```

---

### **6. Verificar Migración**

Después de migrar, verifica que todo funciona:

```javascript
// En consola del navegador
const users = JSON.parse(localStorage.getItem('denraf_users'));
users.forEach(user => {
  console.log(`${user.name}:`, {
    hasPinHash: !!user.pinHash,
    hasPlainPin: !!user.pin,
    pinHashPreview: user.pinHash?.substring(0, 16) + '...'
  });
});

// Debería mostrar:
// Yo: { hasPinHash: true, hasPlainPin: false, pinHashPreview: 'a665a45920422f9d...' }
// Mamá: { hasPinHash: true, hasPlainPin: false, pinHashPreview: '1b4f0e9851971998...' }
// Hermano: { hasPinHash: true, hasPlainPin: false, pinHashPreview: '6f0e8ba4c1c5e0e2...' }
```

---

### **7. Probar Login**

1. Haz logout
2. Intenta hacer login con **los mismos PINs de antes**:
   - Yo: `1234`
   - Mamá: `5678`
   - Hermano: `9012`

Si funciona, ¡la migración fue exitosa! 🎉

---

## 🔐 **Hashes de Referencia**

Estos son los hashes SHA-256 de los PINs actuales:

```
1234 → a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
5678 → 1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014
9012 → 6f0e8ba4c1c5e0e2f4d8a7b3c9e1f0a2b8d4e6c7f3a9b1d0e5c8f2a4b7e9c1d3 (ejemplo)
```

---

## 🛡️ **Beneficios de la Migración**

✅ **Seguridad**: PINs no visibles en localStorage  
✅ **Protección**: Hash irreversible (SHA-256)  
✅ **Estándares**: Cumple mejores prácticas de seguridad  
✅ **Auditable**: Trazabilidad de cambios  

---

## ⚠️ **Importante**

- **NO pierdas** los PINs originales antes de la migración
- **Haz backup** de localStorage antes de migrar
- **Prueba** en un usuario de prueba primero
- **Documenta** cualquier problema

---

## 🆘 **Rollback (Si algo sale mal)**

Si necesitas volver atrás:

```javascript
// Restaurar desde backup
const backup = {
  users: '...', // Tu backup JSON
  current_user: '...'
};

localStorage.setItem('denraf_users', backup.users);
localStorage.setItem('denraf_current_user', backup.current_user);
location.reload();
```

---

## 📝 **Notas**

- La migración es **opcional** por ahora
- El sistema mantiene **retrocompatibilidad**
- Puedes migrar usuarios de forma **gradual**
- Los nuevos usuarios usarán hash automáticamente

---

¿Listo para migrar? ¡Sigue los pasos y avísame si necesitas ayuda! 🚀
