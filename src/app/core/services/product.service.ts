import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Product } from '../models';
import { ErrorHandlerService } from './error-handler.service';
import { SyncService } from './sync.service';
import { LocalDbService } from './local-db.service';

/**
 * 🚀 ProductService - Supabase First Architecture
 * 
 * Estrategia:
 * 1. Supabase es la única fuente de verdad
 * 2. IndexedDB como cache inteligente
 * 3. Carga paralela: muestra cache mientras actualiza desde Supabase
 * 4. Sin localStorage (eliminado)
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private errorHandler = inject(ErrorHandlerService);
  private syncService = inject(SyncService);
  private localDb = inject(LocalDbService);

  // ✅ FUENTE ÚNICA DE VERDAD - Todos los productos del sistema
  private productsSignal = signal<Product[]>([]);

  // 🔄 Estado de carga y sincronización
  isLoading = signal(true);
  isSyncing = signal(false);
  lastSyncTime = signal<Date | null>(null);

  constructor() {
    // 🚀 Nueva estrategia: Supabase First + Cache Inteligente
    this.initSupabaseFirst();
  }

  /**
   * 🚀 Estrategia Supabase-First con Cache Inteligente
   * 
   * 1. Muestra cache de IndexedDB INMEDIATAMENTE (0ms)
   * 2. Carga desde Supabase EN PARALELO (fuente de verdad)
   * 3. Actualiza UI con datos frescos de Supabase
   * 4. Guarda en IndexedDB para próxima vez
   */
  private async initSupabaseFirst(): Promise<void> {
    console.log('🚀 Iniciando carga Supabase-First...');

    // PASO 1: Mostrar cache INMEDIATAMENTE (sin bloquear)
    this.showCacheIfAvailable();

    // PASO 2: Cargar desde Supabase (fuente de verdad)
    await this.loadFromSupabase();
  }

  /**
   * Mostrar cache de IndexedDB inmediatamente (no bloquea)
   * OPTIMIZADO: Promise no bloqueante para carga ultra rápida
   */
  private showCacheIfAvailable(): void {
    // Ejecutar de forma asíncrona sin bloquear el flujo
    this.localDb.getProducts().then(cachedProducts => {
      if (cachedProducts && cachedProducts.length > 0) {
        console.log(`⚡ Cache: ${cachedProducts.length} productos desde IndexedDB`);
        this.productsSignal.set(cachedProducts);
        this.isLoading.set(false); // UI lista INMEDIATAMENTE
      } else {
        console.log('📄 No hay cache, esperando Supabase...');
      }
    }).catch(error => {
      console.warn('⚠️ Error leyendo cache:', error);
    });
  }

  /**
   * Cargar productos desde Supabase (fuente de verdad)
   */
  private async loadFromSupabase(): Promise<void> {
    if (!navigator.onLine) {
      console.log('📴 Sin conexión, usando solo cache');
      this.isLoading.set(false);
      return;
    }

    try {
      this.isSyncing.set(true);
      console.log('☁️ Cargando desde Supabase...');

      const { products } = await this.syncService.pullFromCloud();

      if (products && products.length > 0) {
        console.log(`✅ Supabase: ${products.length} productos cargados`);
        
        // Actualizar signal
        this.productsSignal.set(products);
        
        // Actualizar cache para próxima vez
        await this.localDb.saveProducts(products);
        
        this.lastSyncTime.set(new Date());
      } else if (this.productsSignal().length === 0) {
        // Si no hay datos en Supabase ni en cache, usar datos iniciales
        console.log('🌱 Cargando productos iniciales...');
        const initialProducts = this.getInitialProducts();
        this.productsSignal.set(initialProducts);
        await this.localDb.saveProducts(initialProducts);
      }
    } catch (error) {
      console.error('❌ Error cargando desde Supabase:', error);
      this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.isLoading.set(false);
      this.isSyncing.set(false);
    }
  }

  /**
   * Productos iniciales del sistema
   */
  private getInitialProducts(): Product[] {
    return [
      {
        id: 'PROD-001',
        name: 'Casaca Impermeable Negra',
        category: 'Casacas',
        brand: 'North Face',
        image:
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80',
        stock: 15,
        minStock: 5,
        price: 150,
        cost: 80,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Negro'],
        barcode: '7501234567890',
        status: 'active',
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date(),
      },
      {
        id: 'PROD-002',
        name: 'Jean Slim Fit Azul',
        category: 'Jeans',
        brand: "Levi's",
        image:
          'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=300&q=80',
        stock: 28,
        minStock: 10,
        price: 90,
        cost: 40,
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['Azul Oscuro'],
        barcode: '7501234567891',
        status: 'active',
        createdAt: new Date('2024-11-05'),
        updatedAt: new Date(),
      },
      {
        id: 'PROD-003',
        name: 'Polo Oversize Blanco',
        category: 'Polos',
        brand: 'H&M',
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80',
        stock: 42,
        minStock: 20,
        price: 45,
        cost: 15,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blanco', 'Negro', 'Gris'],
        barcode: '7501234567892',
        status: 'active',
        createdAt: new Date('2024-11-10'),
        updatedAt: new Date(),
      },
      {
        id: 'PROD-004',
        name: 'Gorra Urbana Beige',
        category: 'Accesorios',
        brand: 'Nike',
        image:
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=300&q=80',
        stock: 8,
        minStock: 5,
        price: 35,
        cost: 10,
        sizes: ['Única'],
        colors: ['Beige', 'Negro', 'Blanco'],
        barcode: '7501234567893',
        status: 'active',
        createdAt: new Date('2024-11-12'),
        updatedAt: new Date(),
      },
      {
        id: 'PROD-005',
        name: 'Zapatillas Running Negras',
        category: 'Calzado',
        brand: 'Adidas',
        image:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
        stock: 18,
        minStock: 10,
        price: 180,
        cost: 100,
        sizes: ['38', '39', '40', '41', '42', '43'],
        colors: ['Negro', 'Blanco'],
        barcode: '7501234567894',
        status: 'active',
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date(),
      },
      {
        id: 'PROD-006',
        name: 'Chompa Tejida Gris',
        category: 'Chompas',
        brand: 'Zara',
        image:
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=300&q=80',
        stock: 0,
        minStock: 5,
        price: 120,
        cost: 65,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Gris', 'Negro', 'Azul'],
        barcode: '7501234567895',
        status: 'active',
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date(),
      },
      {
        id: 'PROD-007',
        name: 'Pantalón Cargo Verde',
        category: 'Pantalones',
        brand: 'Pull&Bear',
        image:
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=300&q=80',
        stock: 22,
        minStock: 8,
        price: 85,
        cost: 45,
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['Verde Militar', 'Negro', 'Beige'],
        barcode: '7501234567896',
        status: 'active',
        createdAt: new Date('2024-11-22'),
        updatedAt: new Date(),
      },
      {
        id: 'PROD-008',
        name: 'Polera Deportiva Roja',
        category: 'Polos',
        brand: 'Puma',
        image:
          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=300&q=80',
        stock: 35,
        minStock: 15,
        price: 55,
        cost: 25,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Rojo', 'Azul', 'Negro'],
        barcode: '7501234567897',
        status: 'active',
        createdAt: new Date('2024-11-25'),
        updatedAt: new Date(),
      },
    ];
  }

  // ✅ API pública para acceder a productos
  products = this.productsSignal.asReadonly();

  // Computed útiles
  activeProducts = computed(() => this.productsSignal().filter((p) => p.stock > 0));

  lowStockProducts = computed(() =>
    this.productsSignal().filter((p) => p.stock > 0 && p.stock <= 10)
  );

  outOfStockProducts = computed(() => this.productsSignal().filter((p) => p.stock === 0));

  totalInventoryValue = computed(() =>
    this.productsSignal().reduce((sum, p) => sum + p.cost * p.stock, 0)
  );

  // ✅ MÉTODOS PARA SINCRONIZACIÓN

  /**
   * Obtener un producto por ID
   */
  getProductById(id: string): Product | undefined {
    return this.productsSignal().find((p) => p.id === id);
  }

  /**
   * Obtener producto por código de barras
   */
  getProductByBarcode(barcode: string): Product | undefined {
    return this.productsSignal().find((p) => p.barcode === barcode);
  }

  /**
   * Actualizar stock de un producto
   * ⚠️ CRÍTICO: Este método se llama desde SalesService al registrar ventas
   */
  updateStock(productId: string, quantityChange: number): boolean {
    return (
      this.errorHandler.handleSyncOperation(
        () => {
          const products = this.productsSignal();
          const index = products.findIndex((p) => p.id === productId);

          if (index === -1) {
            throw new Error(`Producto no encontrado: ${productId}`);
          }

          const product = products[index];
          const newStock = product.stock + quantityChange;

          // No permitir stock negativo
          if (newStock < 0) {
            throw new Error(
              `Stock insuficiente para ${product.name}. Stock actual: ${
                product.stock
              }, requerido: ${Math.abs(quantityChange)}`
            );
          }

          // Actualizar el array inmutablemente
          const updatedProducts = [...products];
          updatedProducts[index] = {
            ...product,
            stock: newStock,
            updatedAt: new Date(),
          };

          this.productsSignal.set(updatedProducts);

          // 🔄 Sincronizar cambio de stock con Supabase
          this.syncService.queueForSync('product', 'update', updatedProducts[index]);
          this.localDb.saveProduct(updatedProducts[index]);

          return true;
        },
        'Actualización de stock',
        'No se pudo actualizar el stock del producto'
      ) || false
    );
  }

  /**
   * Reducir stock al registrar una venta
   * Llamado desde SalesService
   */
  reduceStock(productId: string, quantity: number): boolean {
    return this.updateStock(productId, -quantity);
  }

  /**
   * Aumentar stock al recibir inventario
   */
  addStock(productId: string, quantity: number): boolean {
    return this.updateStock(productId, quantity);
  }

  /**
   * Agregar un nuevo producto
   */
  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product | null {
    return this.errorHandler.handleSyncOperation(
      () => {
        // Validación de campos requeridos
        if (!product.name || !product.category || product.price <= 0) {
          throw new Error('Datos del producto inválidos');
        }

        const newProduct: Product = {
          ...product,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.productsSignal.update((products) => [...products, newProduct]);

        // 🔄 Sincronizar con Supabase
        this.syncService.queueForSync('product', 'create', newProduct);
        this.localDb.saveProduct(newProduct);

        return newProduct;
      },
      'Creación de producto',
      'No se pudo crear el producto'
    );
  }

  /**
   * Actualizar un producto existente
   */
  updateProduct(id: string, updates: Partial<Product>): boolean {
    return (
      this.errorHandler.handleSyncOperation(
        () => {
          const products = this.productsSignal();
          const index = products.findIndex((p) => p.id === id);

          if (index === -1) {
            throw new Error(`Producto ${id} no encontrado`);
          }

          const updatedProducts = [...products];
          updatedProducts[index] = {
            ...updatedProducts[index],
            ...updates,
            id, // Asegurar que el ID no cambie
            updatedAt: new Date(),
          };

          this.productsSignal.set(updatedProducts);

          // 🔄 Sincronizar con Supabase
          this.syncService.queueForSync('product', 'update', updatedProducts[index]);
          this.localDb.saveProduct(updatedProducts[index]);
          return true;
        },
        'Actualización de producto',
        'No se pudo actualizar el producto'
      ) || false
    );
  }

  /**
   * Eliminar un producto
   */
  deleteProduct(id: string): boolean {
    return (
      this.errorHandler.handleSyncOperation(
        () => {
          const products = this.productsSignal();
          const filtered = products.filter((p) => p.id !== id);

          if (filtered.length === products.length) {
            throw new Error(`Producto ${id} no encontrado`);
          }

          this.productsSignal.set(filtered);

          // 🔄 Sincronizar eliminación con Supabase
          this.syncService.queueForSync('product', 'delete', { id });
          this.localDb.deleteProduct(id);
          return true;
        },
        'Eliminación de producto',
        'No se pudo eliminar el producto'
      ) || false
    );
  }

  /**
   * Buscar productos por nombre o categoría
   */
  searchProducts(query: string): Product[] {
    const q = query.toLowerCase();
    return this.productsSignal().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
    );
  }

  /**
   * Obtener productos por categoría
   */
  getProductsByCategory(category: string): Product[] {
    return this.productsSignal().filter((p) => p.category === category);
  }

  /**
   * Obtener todas las categorías únicas
   */
  getCategories(): string[] {
    const categories = this.productsSignal().map((p) => p.category);
    return Array.from(new Set(categories)).sort();
  }
}
