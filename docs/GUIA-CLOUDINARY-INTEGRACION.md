# 🖼️ Guía: Migrar Imágenes a Cloudinary (GRATIS)

## ¿Por Qué Cloudinary?

### Comparación con Supabase Storage:

| Feature | Supabase Free | Cloudinary Free |
|---------|---------------|-----------------|
| **Storage** | 1 GB | **25 GB** (25x más) ✅ |
| **Bandwidth** | 2 GB/mes | **25 GB/mes** (12.5x más) ✅ |
| **Transformaciones** | ❌ No | ✅ Sí (resize, crop, format) |
| **CDN** | ✅ Sí | ✅ Sí (más rápido) |
| **Optimización** | Manual | ✅ Automática |

**Resultado**: Con Cloudinary puedes manejar 1000+ productos sin problemas.

## 📋 Paso a Paso: Configuración

### 1. Crear Cuenta en Cloudinary

1. Ir a: https://cloudinary.com/users/register/free
2. Registrarse con email (gratis, no requiere tarjeta)
3. Confirmar email y hacer login

### 2. Obtener Credenciales

En Dashboard → Settings → API Keys:

```
Cloud Name: tu-cloud-name
API Key: 123456789012345
API Secret: abc123...
```

**⚠️ Guarda estos datos**, los necesitarás.

### 3. Configurar en tu Proyecto

Crear archivo de configuración:

```bash
touch src/environments/cloudinary.config.ts
```

```typescript
// src/environments/cloudinary.config.ts
export const cloudinaryConfig = {
  cloudName: 'tu-cloud-name', // Reemplaza con tu cloud name
  uploadPreset: 'productos_preset', // Lo crearemos en el paso 4
  folder: 'productos', // Carpeta donde se guardarán las imágenes
};

// URLs base
export function getCloudinaryUrl(publicId: string, transformation?: string): string {
  const base = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  
  // Transformaciones comunes
  const transformations = {
    thumbnail: 'w_200,h_200,c_fill,q_auto,f_auto',
    card: 'w_400,h_400,c_fill,q_auto,f_auto',
    detail: 'w_800,h_800,c_fit,q_auto,f_auto',
    original: '',
  };
  
  const transform = transformation ? transformations[transformation as keyof typeof transformations] || transformation : transformations.card;
  
  return transform 
    ? `${base}/${transform}/${publicId}` 
    : `${base}/${publicId}`;
}
```

### 4. Crear Upload Preset en Cloudinary

**Upload Preset** = Configuración para subir sin autenticación desde el frontend.

1. En Cloudinary Dashboard → Settings → Upload
2. Scroll a "Upload presets"
3. Click "Add upload preset"
4. Configurar:
   ```
   Upload preset name: productos_preset
   Signing Mode: Unsigned (para uploads desde frontend)
   Folder: productos
   Transformation: {
     width: 800,
     height: 800,
     crop: fit,
     quality: auto,
     format: auto
   }
   ```
5. Click "Save"

### 5. Instalar SDK (Opcional - Solo si subes desde Node.js)

```bash
npm install cloudinary
```

## 🚀 Implementación en tu Sistema

### Opción A: Subir Imágenes Desde Frontend (Más Simple)

Crear servicio de upload:

```typescript
// src/app/core/services/cloudinary.service.ts
import { Injectable } from '@angular/core';
import { cloudinaryConfig, getCloudinaryUrl } from '../../../environments/cloudinary.config';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

  /**
   * Subir imagen a Cloudinary
   * @param file Archivo de imagen
   * @param publicId ID único (opcional, ej: "producto-123")
   * @returns URL de la imagen subida
   */
  async uploadImage(file: File, publicId?: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', cloudinaryConfig.folder);
    
    if (publicId) {
      formData.append('public_id', publicId);
    }

    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      console.log('✅ Imagen subida a Cloudinary:', data.secure_url);
      return data.secure_url; // URL HTTPS de la imagen
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      throw error;
    }
  }

  /**
   * Obtener URL optimizada de imagen
   */
  getImageUrl(publicId: string, size: 'thumbnail' | 'card' | 'detail' | 'original' = 'card'): string {
    return getCloudinaryUrl(publicId, size);
  }

  /**
   * Eliminar imagen (requiere backend con API secret)
   */
  async deleteImage(publicId: string): Promise<void> {
    // Esto debe hacerse desde tu backend por seguridad
    console.warn('⚠️ Delete debe implementarse en backend');
  }
}
```

### Opción B: Subir Imágenes Desde Backend (Más Seguro)

Si tienes un backend Node.js/Python:

```javascript
// backend/cloudinary-upload.js (Node.js)
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'tu-cloud-name',
  api_key: 'tu-api-key',
  api_secret: 'tu-api-secret'
});

async function uploadProductImage(filePath, productId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'productos',
      public_id: `producto-${productId}`,
      overwrite: true,
      transformation: [
        { width: 800, height: 800, crop: 'fit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

## 📤 Migrar Imágenes Existentes

### Script de Migración (Desde Supabase a Cloudinary)

```typescript
// scripts/migrate-images-to-cloudinary.ts
import { createClient } from '@supabase/supabase-js';
import { CloudinaryService } from '../src/app/core/services/cloudinary.service';

const supabase = createClient('TU_SUPABASE_URL', 'TU_SUPABASE_KEY');
const cloudinary = new CloudinaryService();

async function migrateImages() {
  // 1. Obtener todos los productos con imágenes
  const { data: productos } = await supabase
    .from('productos')
    .select('id, name, image')
    .not('image', 'is', null);

  console.log(`📦 ${productos?.length || 0} productos con imágenes`);

  for (const producto of productos || []) {
    try {
      console.log(`Procesando: ${producto.name}...`);
      
      // 2. Descargar imagen de Supabase
      const response = await fetch(producto.image);
      const blob = await response.blob();
      const file = new File([blob], `${producto.id}.jpg`);

      // 3. Subir a Cloudinary
      const cloudinaryUrl = await cloudinary.uploadImage(file, `producto-${producto.id}`);

      // 4. Actualizar URL en Supabase
      await supabase
        .from('productos')
        .update({ image: cloudinaryUrl })
        .eq('id', producto.id);

      console.log(`✅ ${producto.name} migrado`);
    } catch (error) {
      console.error(`❌ Error con ${producto.name}:`, error);
    }
  }

  console.log('🎉 Migración completada!');
}

migrateImages();
```

### Ejecutar Script:

```bash
# Instalar ts-node si no lo tienes
npm install -D ts-node

# Ejecutar migración
npx ts-node scripts/migrate-images-to-cloudinary.ts
```

## 🎨 Usar en Templates

### Antes (Supabase):
```html
<img [src]="product.image" appImageFallback>
```

### Después (Cloudinary):
```html
<!-- La URL ya viene de Cloudinary, solo agregar transformación si quieres -->
<img [src]="product.image" appImageFallback>

<!-- O con transformación dinámica -->
<img [src]="getOptimizedUrl(product.image, 'thumbnail')" appImageFallback>
```

### Helper en Componente:
```typescript
getOptimizedUrl(url: string, size: 'thumbnail' | 'card' | 'detail' = 'card'): string {
  // Si ya es URL de Cloudinary, está lista
  if (url?.includes('cloudinary.com')) {
    return url;
  }
  // Si es otra URL, usar tal cual (con fallback)
  return url || '/images/placeholder-product.svg';
}
```

## 📊 Ventajas de esta Arquitectura

### Tu Sistema Final:
```
┌─────────────────┐
│   Angular App   │
│   (Frontend)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│Supabase │ │  Cloudinary  │
│(Datos)  │ │  (Imágenes)  │
└─────────┘ └──────────────┘
```

### Beneficios:
1. **Supabase**: Solo datos (productos, ventas, usuarios)
   - Usa: ~50-100 MB para 1000 productos
   - Queda espacio para más datos

2. **Cloudinary**: Solo imágenes
   - Usa: ~2-5 GB para 1000 productos (con optimización)
   - 25 GB disponibles (capacidad para 5000+ productos)

3. **Tu App**: Más rápida
   - Cloudinary tiene CDN global
   - Imágenes optimizadas automáticamente
   - Lazy loading nativo

## 🔒 Seguridad

### Upload Preset Unsigned:
- ✅ Bueno para: Uploads desde frontend controlado
- ⚠️ Riesgo: Cualquiera con la URL puede subir (bajo si no publicas el preset)

### Solución Segura (Opcional):
1. Crear endpoint en tu backend
2. Backend valida usuario autenticado
3. Backend sube a Cloudinary con API secret
4. Retorna URL al frontend

## 🎯 Resumen

### Lo que necesitas:
1. ✅ Cuenta Cloudinary (5 min)
2. ✅ Crear upload preset (2 min)
3. ✅ Agregar servicio CloudinaryService (ya lo tienes arriba)
4. ✅ Migrar imágenes existentes (script automático)

### Resultado:
- 📦 1000+ productos sin problemas
- 🚀 Carga ultrarrápida de imágenes
- 💰 100% GRATIS
- 🔄 Integración perfecta con Supabase

### Costo mensual:
- **$0** (plan gratuito de por vida)
- Después de 25 GB/mes: $0.0008/GB adicional (muy barato)

¿Quieres que te ayude con la implementación del servicio o la migración?
