export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  status: UserStatus;
  role_id?: string;
  created_at: string;
  updated_at: string;
}

export type ArticleStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

export interface Article {
  id: string;
  code: string;
  reference: string;
  designation: string;
  description?: string;
  category_id: string;
  unit: string;
  stock_min: number;
  stock_max?: number;
  reorder_point?: number;
  main_supplier_id?: string;
  barcode?: string;
  image_url?: string;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
}

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
}

export type SupplierStatus = 'ACTIVE' | 'INACTIVE';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  ice?: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  status: SupplierStatus;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id: string;
  article_id: string;
  location_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export type MovementType = 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT' | 'INVENTORY_ADJUSTMENT';

export interface StockMovement {
  id: string;
  movement_number: string;
  article_id: string;
  quantity: number;
  movement_type: MovementType;
  user_id: string;
  site_id?: string;
  warehouse_id?: string;
  location_id?: string;
  source_location_id?: string;
  destination_location_id?: string;
  reason?: string;
  reference?: string;
  comment?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface DashboardKPIs {
  total_articles: number;
  total_stock: number;
  critical_stock: number;
  low_stock: number;
  pending_requests: number;
  today_receipts: number;
  today_issues: number;
  today_transfers: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  movements_today: Record<string, number>;
  critical: Array<{
    article_id: string;
    quantity: number;
    minimum_stock: number;
  }>;
  recent_activity: Array<{
    id: string;
    movement_number: string;
    movement_type: string;
    article_id: string;
    quantity: number;
    user_id: string;
    created_at: string;
  }>;
}
