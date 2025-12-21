---
tags: [deploy, vercel, producción, hosting]
created: 2024-12-20
---

# 🚀 Deploy en Vercel

> _"Tu app en internet en 5 minutos"_

---

## 🎒 ¿Por qué Vercel?

- ✅ **Gratis** para proyectos personales
- ✅ **HTTPS automático**
- ✅ **Deploys automáticos** con GitHub
- ✅ **Perfecto para Angular** (sin backend)

---

## 📦 Paso 1: Preparar el Proyecto

### Crear archivo `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/sistema-master/browser",
  "framework": "angular",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

El `rewrites` es importante para que las rutas de Angular funcionen.

---

## 🔐 Paso 2: Variables de Entorno

### En Vercel Dashboard

```
Settings → Environment Variables

SUPABASE_URL = https://tu-proyecto.supabase.co
SUPABASE_KEY = tu-anon-key
```

### En tu código

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  supabaseUrl: 'https://tu-proyecto.supabase.co',
  supabaseKey: 'tu-anon-key',
};
```

---

## 🚀 Paso 3: Conectar con GitHub

1. Sube tu proyecto a GitHub
2. Ve a vercel.com
3. "New Project" → Importa tu repo
4. Vercel detecta Angular automáticamente
5. Click "Deploy"

---

## ✅ Resultado

```
Tu app estará en:
https://sistema-master.vercel.app

O con dominio personalizado:
https://denraf.com
```

---

## 💡 Tips

> [!important] Siempre prueba el build antes
> `npm run build` local para verificar errores

> [!tip] Cada push = nuevo deploy
> Vercel hace deploy automático en cada commit

---

## 📎 Relacionados

- [[Supabase - Qué es]]
- [[PWA Configuration]]
