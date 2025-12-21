import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { ProductVariant } from '../../../core/models';
import { 
  UiInputComponent,
  UiButtonComponent,
  UiAnimatedDialogComponent,
  UiLabelComponent
} from '../../../shared/ui';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [
    CommonModule,
    UiInputComponent,
    UiButtonComponent,
    UiAnimatedDialogComponent,
    UiLabelComponent
  ],
  templateUrl: './productos-page.component.html',
  styleUrls: ['./productos-page.component.css']
})
export class ProductosPageComponent {
  private productService = inject(ProductService);

  // Productos desde el servicio central
  products = this.productService.products;

  // Señales para búsqueda y modal
  searchQuery = signal('');
  isDialogOpen = signal(false);
  editingProductId = signal<string | null>(null); // Producto que se está editando
  modalTitle = computed(() => this.editingProductId() ? 'Editar Producto' : 'Nuevo Producto');

  // Señales para el formulario de creación/edición
  productName = signal('');
  productCategory = signal('General');
  initialStock = signal(0);
  activeSizeTab = signal<string>('S'); // Talla activa en el modal
  costPrice = signal(0);
  salePrice = signal(0);
  selectedImage = signal<string | null>(null);
  variants = signal<ProductVariant[]>([]); // Variantes del producto
  expandedProductId = signal<string | null>(null); // Para expandir/contraer variantes en cards

  // Tallas y colores disponibles
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  availableColors = ['Negro', 'Blanco', 'Gris', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Rosa'];

  // Computed: Tallas únicas que tienen variantes
  activeSizes = computed(() => {
    const sizes = new Set(this.variants().map(v => v.size));
    return Array.from(sizes);
  });

  // Computed: Colores para la talla activa
  activeColors = computed(() => {
    const activeSize = this.activeSizeTab();
    return this.variants()
      .filter(v => v.size === activeSize)
      .map(v => v.color);
  });

  // Computed: Ganancia y margen en tiempo real
  profit = computed(() => this.salePrice() - this.costPrice());
  margin = computed(() => {
    if (this.salePrice() === 0) return 0;
    return ((this.profit() / this.salePrice()) * 100).toFixed(1);
  });

  // Computed: Validación del formulario
  isFormValid = computed(() => {
    return this.productName().trim().length > 0 &&
           this.costPrice() > 0 &&
           this.salePrice() > 0 &&
           this.salePrice() > this.costPrice() &&
           this.variants().length > 0 &&
           this.variants().every(v => v.stock >= 0);
  });

  // Computed: Stock total de todas las variantes
  totalStock = computed(() => {
    return this.variants().reduce((sum, v) => sum + v.stock, 0);
  });

  // Computed: Filtrar productos por búsqueda
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.products().filter(
      (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    );
  });

  // MÉTODOS

  /**
   * Abrir modal para crear un nuevo producto
   */
  openCreate() {
    this.editingProductId.set(null);
    this.resetForm();
    this.isDialogOpen.set(true);
  }

  /**
   * Abrir modal para editar un producto existente
   */
  openEdit(productId: string) {
    const product = this.products().find(p => p.id === productId);
    if (!product) return;

    this.editingProductId.set(productId);
    this.productName.set(product.name);
    this.productCategory.set(product.category);
    this.costPrice.set(product.cost);
    this.salePrice.set(product.price);
    this.selectedImage.set(product.image || null);
    
    // Cargar variantes existentes
    if (product.variants && product.variants.length > 0) {
      this.variants.set([...product.variants]);
      // Establecer la primera talla como activa
      const firstSize = product.variants[0].size;
      this.activeSizeTab.set(firstSize);
    } else {
      // Si no hay variantes, crear una por defecto
      this.variants.set([{
        id: `S-Negro-${Date.now()}`,
        size: 'S',
        color: 'Negro',
        stock: product.stock || 0,
        barcode: ''
      }]);
      this.activeSizeTab.set('S');
    }
    
    this.isDialogOpen.set(true);
  }

  /**
   * Resetear el formulario a valores iniciales
   */
  private resetForm() {
    this.productName.set('');
    this.productCategory.set('General');
    this.costPrice.set(0);
    this.salePrice.set(0);
    this.activeSizeTab.set('S');
    this.selectedImage.set(null);
    // Inicializar con una variante por defecto
    this.variants.set([{
      id: `S-Negro-${Date.now()}`,
      size: 'S',
      color: 'Negro',
      stock: 0,
      barcode: ''
    }]);
  }

  /**
   * Generar variantes por defecto basadas en tallas y colores seleccionados
   */
  /**
   * Agregar una nueva talla al producto
   */
  addSize(size: string) {
    const currentVariants = this.variants();
    // Verificar si ya existe alguna variante con esta talla
    const hasSizeAlready = currentVariants.some(v => v.size === size);
    
    if (!hasSizeAlready) {
      // Agregar una variante con el primer color por defecto
      const newVariant: ProductVariant = {
        id: `${size}-Negro-${Date.now()}`,
        size,
        color: 'Negro',
        stock: 0,
        barcode: ''
      };
      this.variants.set([...currentVariants, newVariant]);
    }
    
    // Cambiar a la talla que acabamos de agregar
    this.activeSizeTab.set(size);
  }

  /**
   * Eliminar todas las variantes de una talla
   */
  removeSize(size: string) {
    const currentVariants = this.variants();
    const filtered = currentVariants.filter(v => v.size !== size);
    
    if (filtered.length === 0) {
      // Si se eliminan todas, mantener al menos una variante
      this.variants.set([{
        id: `S-Negro-${Date.now()}`,
        size: 'S',
        color: 'Negro',
        stock: 0,
        barcode: ''
      }]);
      this.activeSizeTab.set('S');
    } else {
      this.variants.set(filtered);
      // Si eliminamos la talla activa, cambiar a la primera disponible
      if (this.activeSizeTab() === size) {
        this.activeSizeTab.set(filtered[0].size);
      }
    }
  }

  /**
   * Agregar un color a la talla activa
   */
  addColorToActiveSize(color: string) {
    const activeSize = this.activeSizeTab();
    const currentVariants = this.variants();
    
    // Verificar si ya existe esta combinación
    const exists = currentVariants.some(
      v => v.size === activeSize && v.color === color
    );
    
    if (!exists) {
      const newVariant: ProductVariant = {
        id: `${activeSize}-${color}-${Date.now()}`,
        size: activeSize,
        color,
        stock: 0,
        barcode: ''
      };
      this.variants.set([...currentVariants, newVariant]);
    }
  }

  /**
   * Eliminar un color de la talla activa
   */
  removeColorFromActiveSize(color: string) {
    const activeSize = this.activeSizeTab();
    const currentVariants = this.variants();
    
    // Filtrar la variante específica
    const filtered = currentVariants.filter(
      v => !(v.size === activeSize && v.color === color)
    );
    
    // Asegurar que cada talla tenga al menos un color
    const sizeVariants = filtered.filter(v => v.size === activeSize);
    if (sizeVariants.length === 0) {
      // Mantener al menos una variante para esta talla
      return;
    }
    
    this.variants.set(filtered);
  }

  /**
   * Toggle color para la talla activa
   */
  toggleColorForActiveSize(color: string) {
    const activeSize = this.activeSizeTab();
    const hasColor = this.activeColors().includes(color);
    
    if (hasColor) {
      this.removeColorFromActiveSize(color);
    } else {
      this.addColorToActiveSize(color);
    }
  }

  /**
   * Actualizar stock de una variante específica
   */
  updateVariantStock(variantId: string, stock: number) {
    const updated = this.variants().map(v => 
      v.id === variantId ? { ...v, stock: Math.max(0, stock) } : v
    );
    this.variants.set(updated);
  }

  /**
   * Toggle expandir/contraer variantes de un producto
   */
  toggleProductVariants(productId: string) {
    this.expandedProductId.set(
      this.expandedProductId() === productId ? null : productId
    );
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct() {
    if (!this.isFormValid()) {
      alert('Por favor completa todos los campos correctamente y asigna stock a las variantes');
      return;
    }

    const editingId = this.editingProductId();
    const totalStock = this.totalStock();
    const allVariants = this.variants();
    
    // Extraer tallas y colores únicos de las variantes
    const uniqueSizes = Array.from(new Set(allVariants.map(v => v.size)));
    const uniqueColors = Array.from(new Set(allVariants.map(v => v.color)));

    if (editingId) {
      // Actualizar producto existente
      const success = this.productService.updateProduct(editingId, {
        name: this.productName(),
        category: this.productCategory(),
        price: this.salePrice(),
        cost: this.costPrice(),
        stock: totalStock,
        sizes: uniqueSizes,
        colors: uniqueColors,
        variants: allVariants,
        image: this.selectedImage() || undefined,
      });

      if (success) {
        this.isDialogOpen.set(false);
        this.resetForm();
      }
    } else {
      // Crear nuevo producto
      const newProduct = {
        name: this.productName(),
        category: this.productCategory(),
        brand: 'DENFAR',
        price: this.salePrice(),
        cost: this.costPrice(),
        stock: totalStock,
        minStock: 5,
        sizes: uniqueSizes,
        colors: uniqueColors,
        variants: allVariants,
        barcode: `BAR-${Date.now()}`,
        image: this.selectedImage() || 'https://via.placeholder.com/100',
        status: 'active' as const,
      };

      this.productService.addProduct(newProduct);
      this.isDialogOpen.set(false);
      this.resetForm();
    }
  }

  handleAction(action: string, id: string) {
    if (action === 'delete') {
      if (confirm('¿Borrar producto del inventario?')) {
        this.productService.deleteProduct(id);
      }
    }
  }

  // Helpers para actualizar valores del formulario
  updateCost(val: string) {
    this.costPrice.set(parseFloat(val) || 0);
  }

  updateSale(val: string) {
    this.salePrice.set(parseFloat(val) || 0);
  }

  updateName(val: string) {
    this.productName.set(val);
  }

  updateCategory(val: string) {
    this.productCategory.set(val);
  }

  /**
   * Obtener variantes de una talla específica
   */
  getVariantsBySize(size: string): ProductVariant[] {
    return this.variants().filter(v => v.size === size);
  }

  /**
   * Contar variantes de una talla específica
   */
  countVariantsBySize(size: string): number {
    return this.variants().filter(v => v.size === size).length;
  }
}
