---
tags: [supabase, base-datos, producción, migración]
created: 2024-12-20
---

# 🚀 Plan de Migración a Producción

> _"De juguete a tienda real"_

---

## 🎒 ¿Por qué migrar?

### Tu app ahora:

```
📱 Tu celular
    └── localStorage (5MB máximo)
        ├── productos
        ├── ventas
        └── usuarios

❌ Limpias el navegador → Pierdes TODO
❌ Abres otro celular → No hay nada
❌ Muchos productos → Se llena
```

### Tu app después:

```
📱 Tu celular                     ☁️ Nube (Supabase)
    └── IndexedDB (50GB+)    ←→   └── PostgreSQL
        ├── productos              ├── productos (respaldo)
        ├── ventas                 ├── ventas
        └── usuarios               └── usuarios

✅ Sin internet → Sigue funcionando
✅ Con internet → Se sincroniza
✅ Otro celular → Mismos datos
✅ 10,000 productos → Sin problema
```

---

## 🏗️ La Nueva Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      TU APP ANGULAR                          │
│                                                              │
│  ┌──────────────┐                  ┌───────────────────┐    │
│  │ Componentes  │                  │    Supabase       │    │
│  │  (UI/UX)     │                  │   (PostgreSQL)    │    │
│  └──────┬───────┘                  └─────────▲─────────┘    │
│         │                                    │              │
│         ▼                                    │              │
│  ┌──────────────┐     ┌──────────────┐      │              │
│  │  Servicios   │────▶│  SyncService │──────┘              │
│  │ (Product,    │     │  (nuevo)     │                      │
│  │  Sales...)   │     └──────┬───────┘                      │
│  └──────────────┘            │                              │
│                              ▼                              │
│                       ┌──────────────┐                      │
│                       │  IndexedDB   │                      │
│                       │  (offline)   │                      │
│                       └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Las 4 Fases

### Fase 1: Configurar Supabase

- Crear cuenta gratuita
- Crear proyecto
- Diseñar tablas

### Fase 2: Crear SyncService

- Instalar dependencias
- Crear servicio de sincronización
- Manejar offline/online

### Fase 3: Migrar Servicios

- ProductService → con sync
- SalesService → con sync
- AuthService → Supabase Auth

### Fase 4: Deploy

- Angular → Vercel
- Variables de entorno

---

## 🎁 Lo que Obtienes

| Antes            | Después                |
| ---------------- | ---------------------- |
| 5MB máximo       | 500MB+ en nube         |
| 1 dispositivo    | Todos los dispositivos |
| Datos se pierden | Datos seguros          |
| Solo demo        | Producción real        |
| PIN simple       | Auth profesional       |

---

## 💰 Costos

```
Supabase Free Tier:
├── 500MB de base de datos
├── 50,000 filas de datos
├── 2GB de transferencia
├── Auth ilimitado
└── $0/mes

Vercel Free Tier:
├── 100GB de bandwidth
├── Builds ilimitados
├── HTTPS gratis
└── $0/mes

TOTAL: $0/mes para tu tienda familiar
```

---

## 📎 Siguientes Pasos

1. [[Supabase - Qué es]]
2. [[Esquema de Base de Datos]]
3. [[IndexedDB - Offline Storage]]
4. [[SyncService - Sincronización]]
5. [[Migración de Servicios]]
6. [[Deploy en Vercel]]
