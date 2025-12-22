# 🚀 Guía de Optimización de Performance

## 📊 Problema Actual
- **Performance Score**: 33/100
- **FCP**: 17.4s
- **LCP**: 42.6s
- **Bundle Size**: 41 MB

## ✅ Optimizaciones Implementadas

### 1. **Fonts Optimizadas**
- ✅ Preconnect a Google Fonts
- ✅ `display=swap` para evitar FOIT
- ✅ Lazy load de Material Icons
- ✅ Eliminada font Space Mono (no usada)

### 2. **Angular Build Optimizado**
- ✅ Build optimizer habilitado
- ✅ Vendor chunk separado
- ✅ Source maps deshabilitados en prod
- ✅ Extract licenses habilitado
- ✅ CSS minificado e inline crítico

### 3. **Tailwind CSS Optimizado**
- ✅ Purge CSS habilitado
- ✅ Eliminación de clases no usadas
- ✅ Safelist para clases dinámicas

### 4. **Code Splitting Mejorado**
- ✅ PreloadAllModules
- ✅ Lazy loading de rutas
- ✅ Componentes standalone

### 5. **Carga Inicial Optimizada**
- ✅ Loader visual mientras carga
- ✅ Cache strategy (Stale-While-Revalidate)
- ✅ Change Detection OnPush

## 🛠️ Comandos de Build

### Build Producción Optimizado
```bash
npm run build:prod
```

### Analizar Bundle
```bash
npm run build:analyze
```

### Build Normal
```bash
npm run build
```

## 📈 Mejoras Esperadas

| Métrica | Antes | Después (Estimado) |
|---------|-------|-------------------|
| Performance | 33 | 80-90 |
| FCP | 17.4s | 1.5s |
| LCP | 42.6s | 2.5s |
| TBT | 1,030ms | 200ms |
| Bundle | 41 MB | 3-5 MB |

## 🔍 Próximos Pasos

### Para mejorar aún más:

1. **Lazy load de ApexCharts** (solo cargar cuando se necesite)
2. **Usar CDN para librerías grandes** (ApexCharts, jsPDF)
3. **Implementar Virtual Scrolling** para listas largas
4. **Comprimir imágenes** (WebP, AVIF)
5. **Service Worker caching** (ya configurado)

### Comandos útiles:

```bash
# Verificar tamaño del bundle
npm run build -- --stats-json
npx source-map-explorer dist/sistema-master/**/*.js

# Lighthouse CI
npx lighthouse https://tu-dominio.com --view

# Bundle analyzer
npx webpack-bundle-analyzer dist/sistema-master/stats.json
```

## ⚠️ Importante

Después de deployar, verifica:
1. ✅ Lighthouse score > 80
2. ✅ FCP < 2s
3. ✅ LCP < 2.5s
4. ✅ Bundle < 5MB

## 🎯 Configuración de Vercel (si aplica)

Agrega en `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```
