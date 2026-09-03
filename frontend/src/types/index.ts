export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  status: string;
  role_id?: string;
  created_at: string;
  updated_at: string;
}

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
  image_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  ice?: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  status: string;
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

export interface StockMovement {
  id: string;
  movement_number: string;
  article_id: string;
  quantity: number;
  movement_type: string;
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
