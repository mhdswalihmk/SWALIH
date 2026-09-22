export type ServiceCategory = 'Wash & Fold' | 'Dry Cleaning' | 'Ironing' | 'Specialty' | 'Express';

export interface LaundryService {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g. "per kg", "per item", "per batch"
  turnaroundTime: string; // e.g. "24 Hours", "48 Hours"
  category: ServiceCategory;
  available: boolean;
  icon: string; // Icon name for lucide-react
}

export type OrderStatus = 'Pending' | 'Picked Up' | 'Processing' | 'Out for Delivery' | 'Completed' | 'Cancelled';

export interface OrderItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
}

export interface LaundryOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  totalPrice: number;
  pickupDate: string;
  pickupSlot: string;
  deliveryDate: string;
  deliverySlot: string;
  status: OrderStatus;
  notes?: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'customer' | 'admin';
}
