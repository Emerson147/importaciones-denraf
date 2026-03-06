# ⚡ Guía Rápida: Configurar Cloudinary (5 minutos)

## ✅ Paso 1: Obtener tu Cloud Name (1 min)

1. Ve a: https://console.cloudinary.com/
2. Haz login
3. En el dashboard, verás tu **Cloud Name** arriba:
   ```
   Cloud name: tu-nombre-unico
   ```
4. **Cópialo** (ejemplo: `demoapp`, `miempresa-xyz`, etc.)

---

## ✅ Paso 2: Crear Upload Preset (2 min)

1. En Cloudinary Dashboard, click en **Settings** (⚙️ arriba derecha)
2. Click en pestaña **Upload**
3. Scroll hasta **Upload presets**
4. Click **Add upload preset**
5. Configurar:
   - **Upload preset name**: `productos_preset` (⚠️ exactamente así)
   - **Signing Mode**: **Unsigned** ✅ (MUY IMPORTANTE)
   - **Folder**: `productos`
   - **Use filename or externally defined Public ID**: ✅ Check
   - **Unique filename**: ❌ Uncheck (para poder sobrescribir)
6. Click **Save**

📸 **Captura**: 
```
Upload preset name: productos_preset
Signing Mode:      Unsigned ✅
Folder:            productos
```

---

## ✅ Paso 3: Configurar en tu Proyecto (1 min)

Abre el archivo:
```
src/environments/cloudinary.config.ts
```

Cambiar esta línea:
```typescript
cloudName: 'tu-cloud-name', // 👈 CAMBIAR ESTO
```

Por tu Cloud Name real:
```typescript
cloudName: 'miempresa-xyz', // 👈 TU CLOUD NAME AQUÍ
```

**Guardar archivo** (Ctrl+S / Cmd+S)

---

## ✅ Paso 4: Instalar Dependencias (opcional si falta)

```bash
cd /home/migatte/Documentos/Proyectos\ Frontend/sistema-master
npm install ts-node --save-dev
```

---

## ✅ Paso 5: Migrar Imágenes Existentes (Automático)

Si ya tienes productos con imágenes en Supabase:

```bash
npm run migrate-images
```

Esto:
- ✅ Descarga imágenes de Supabase
- ✅ Las sube a Cloudinary
- ✅ Actualiza las URLs en la base de datos
- ✅ Todo automático

### Si NO tienes imágenes aún:
⏭️ **Saltar este paso**, las nuevas imágenes se subirán automáticamente.

---

## 🎉 Listo!

### ¿Funciona?

**Probar creando un producto:**

1. Ve a **Inventario** → **Nuevo Producto**
2. Sube una imagen
3. Click **Guardar**

**En la consola del navegador verás:**
```
📤 Subiendo imagen a Cloudinary...
✅ Imagen subida: https://res.cloudinary.com/tu-cloud/...
```

**Verificar en Cloudinary:**
1. Ve a https://console.cloudinary.com/console/media_library
2. Entra a carpeta `productos`
3. Deberías ver tu imagen

---

## 🔍 Troubleshooting

### Error: "Upload preset not found"
- ✅ Verifica que creaste el preset con nombre exacto: `productos_preset`
- ✅ Verifica que es **Unsigned**

### Error: "Invalid cloud name"
- ✅ Verifica que copiaste bien tu Cloud Name
- ✅ Sin espacios, sin mayúsculas si no las tiene

### No sube la imagen pero no da error
- ✅ Abre DevTools → Network → filtra por "cloudinary"
- ✅ Mira el error HTTP
- ✅ Verifica que el upload preset es **Unsigned**

---

## 📊 Resultado Final

### Arquitectura:
```
┌────────────────┐
│  Angular App   │
└────┬───────┬───┘
     │       │
     ▼       ▼
┌─────────┐ ┌──────────┐
│Supabase │ │Cloudinary│
│(Datos)  │ │(Imágenes)│
└─────────┘ └──────────┘
```

### Nuevos Productos:
1. Usuario sube imagen en formulario
2. Angular la sube a Cloudinary automáticamente
3. URL de Cloudinary se guarda en Supabase
4. ✅ Listo

### Productos Existentes:
1. Script de migración las pasa a Cloudinary
2. URLs actualizadas en Supabase
3. ✅ Listo

---

## ✅ Checklist Final

- [ ] Cloud Name configurado en `cloudinary.config.ts`
- [ ] Upload preset `productos_preset` creado (Unsigned)
- [ ] (Opcional) Imágenes existentes migradas con `npm run migrate-images`
- [ ] Probado crear producto nuevo con imagen
- [ ] Imagen visible en app
- [ ] Imagen visible en Cloudinary dashboard

**Si todos ✅ → ¡LISTO! Tu sistema ya usa Cloudinary**

---

## 💰 Costo

**$0 /mes** (plan gratuito)

### Límites:
- 25 GB storage
- 25 GB bandwidth/mes
- Transformaciones incluidas

**Para 1000 productos**: Usarás ~2-5 GB = **GRATIS ✅**
