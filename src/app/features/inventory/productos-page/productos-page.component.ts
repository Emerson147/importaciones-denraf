import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { UiInputComponent } from '../../../shared/ui/ui-input/ui-input.component';
import { UiButtonComponent } from '../../../shared/ui/ui-button/ui-button.component';
import { UiAnimatedDialogComponent } from '../../../shared/ui/ui-animated-dialog/ui-animated-dialog.component';
import { UiLabelComponent } from '../../../shared/ui/ui-label/ui-label.component';

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

  // Señales para el formulario de creación
  productName = signal('');
  initialStock = signal(0);
  selectedSize = signal('M');
  costPrice = signal(0);
  salePrice = signal(0);
  selectedImage = signal<string | null>(null);

  // Computed: Ganancia y margen en tiempo real
  profit = computed(() => this.salePrice() - this.costPrice());
  margin = computed(() => {
    if (this.salePrice() === 0) return 0;
    return ((this.profit() / this.salePrice()) * 100).toFixed(1);
  });

  // Computed: Filtrar productos por búsqueda
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.products().filter(
      (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    );
  });

  // MÉTODOS

  openCreate() {
    // Resetear valores al abrir el modal
    this.productName.set('');
    this.initialStock.set(0);
    this.costPrice.set(0);
    this.salePrice.set(0);
    this.selectedSize.set('M');
    this.selectedImage.set(null);
    this.isDialogOpen.set(true);
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
    const newProduct = {
      name: this.productName(),
      category: 'General',
      brand: 'DENFAR',
      price: this.salePrice(),
      cost: this.costPrice(),
      stock: this.initialStock(),
      minStock: 5,
      sizes: [this.selectedSize()],
      colors: ['Negro'],
      barcode: `BAR-${Date.now()}`,
      image: this.selectedImage() || 'https://via.placeholder.com/100',
      status: 'active' as const,
    };

    this.productService.addProduct(newProduct);
    this.isDialogOpen.set(false);
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

  updateStock(val: string) {
    this.initialStock.set(parseInt(val) || 0);
  }
}
