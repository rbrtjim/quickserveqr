export interface Category {
  id: string; name: string; description: string | null;
  sortOrder: number; isActive: boolean; menuItems: MenuItem[];
}

export interface MenuItem {
  id: string; categoryId: string; categoryName: string; name: string;
  description: string | null; price: number; imageUrl: string | null;
  isAvailable: boolean; preparationTime: number; calories: number | null;
  tags: string[] | null;
}

export interface CartItem {
  menuItem: MenuItem; quantity: number; specialInstructions: string;
}

export interface Order {
  id: string; tableId: string; orderNumber: number; tableNumber: number; status: OrderStatus;
  subtotal: number; tax: number; total: number; notes: string | null;
  paymentStatus: string; paymentMethod: string | null; createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string; menuItemId: string; menuItemName: string;
  quantity: number; unitPrice: number; specialInstructions: string | null;
}

export type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Ready" | "Served" | "Completed" | "Cancelled";

export interface RestaurantTable {
  id: string; tableNumber: number; qrCode: string; seats: number; isOccupied: boolean;
}

export interface DashboardAnalytics {
  totalOrders: number; totalRevenue: number; activeOrders: number;
  tablesOccupied: number; totalTables: number; averageOrderValue: number;
  topSellingItems: { name: string; quantity: number; revenue: number }[];
  revenueByHour: { hour: number; revenue: number; orderCount: number }[];
}
