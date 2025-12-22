// ============================================
// MODELOS PRINCIPALES DE DENRAF
// ============================================

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  barcode?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  cost: number;
  stock: number; // Stock total (suma de todas las variantes)
  minStock: number;
  sizes: string[]; // Tallas disponibles
  colors?: string[]; // Colores disponibles
  variants?: ProductVariant[]; // Variantes (combinaciones talla+color)
  image: string | null;
  barcode?: string;
  status?: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  saleNumber: string; // Ej: "VENTA-001"
  date: Date;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'yape' | 'plin';
  status: 'completed' | 'pending' | 'cancelled';
  customer?: Customer;
  notes?: string;
  createdBy: string; // Usuario que hizo la venta
  vendedorId: string; // ID del vendedor que realizó la venta
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  size: string;
  color?: string;
  unitPrice: number;
  subtotal: number;
  variantId?: string; // ID de la variante vendida (si aplica)
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  tier: 'nuevo' | 'silver' | 'gold';
  preferences?: string[];
}

export interface DailySummary {
  date: Date;
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  averageTicket: number;
  topProducts: { productId: string; quantity: number; revenue: number }[];
}

export interface Expense {
  id: string;
  date: Date;
  category: 'rent' | 'utilities' | 'supplies' | 'salary' | 'other';
  amount: number;
  description: string;
  receipt?: string;
}

// ============================================
// GAMIFICATION & GOALS
// ============================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Material icon name
  category: 'sales' | 'revenue' | 'products' | 'streak' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number; // Valor objetivo (ej: 10 ventas, S/1000 en ventas)
  progress: number; // Progreso actual
  unlocked: boolean;
  unlockedAt?: Date;
  points: number; // Puntos que otorga al desbloquearse
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  metric: 'sales_count' | 'revenue' | 'new_customers' | 'avg_ticket';
  target: number; // Meta objetivo
  current: number; // Progreso actual
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  reward?: string; // Descripción de la recompensa
  assignedTo?: string; // ID del usuario (para multi-usuario)
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  totalSales: number;
  totalRevenue: number;
  achievementsCount: number;
  points: number;
  rank: number;
  badge?: 'top_seller' | 'rising_star' | 'consistent' | 'champion';
  streak: number; // Días consecutivos con ventas
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  level: number; // Nivel calculado basado en puntos
  achievementsUnlocked: string[]; // IDs de achievements
  currentStreak: number;
  longestStreak: number;
  totalSalesCompleted: number;
  totalRevenueGenerated: number;
  joinedAt: Date;
}

// ============================================
// AUTENTICACIÓN & USUARIOS
// ============================================

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'vendor';
  pin: string; // PIN de 4 dígitos
  avatar?: string;
  email?: string;
  createdAt: Date;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}
