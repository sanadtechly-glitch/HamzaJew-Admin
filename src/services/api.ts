const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'PRODUCTS_MANAGER' | 'ORDERS_MANAGER' | 'BRANCH_MANAGER' | 'CUSTOMER';
  isActive: boolean;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  karat: number;
  weight: number;
  makingCost: number;
  estimatedPrice: number;
  stoneType?: string;
  availabilityStatus: 'AVAILABLE' | 'OUT_OF_STOCK' | 'BY_ORDER';
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOffer: boolean;
  isActive: boolean;
  images: ProductImage[];
}

export interface GoldPrice {
  id: string;
  karat18: number;
  karat21: number;
  karat24: number;
  updatedBy: string;
  admin?: User;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  workingHours: string;
  mapUrl?: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  branchId: string;
  branch?: Branch;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status: 'NEW' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  adminNotes?: string;
  createdAt: string;
}

export interface CustomOrder {
  id: string;
  customerName: string;
  phone: string;
  branchId: string;
  branch?: Branch;
  itemType: string;
  description: string;
  budget?: number;
  imageUrl?: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';
  adminNotes?: string;
  createdAt: string;
}

export interface DashboardStats {
  counts: {
    products: number;
    categories: number;
    branches: number;
    appointments: number;
    customOrders: number;
  };
  latestAppointments: Appointment[];
  latestCustomOrders: CustomOrder[];
  monthlyCustomOrders: {
    month: string;
    total: number;
    count: number;
  }[];
}

// Token helper
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('jewelry_hamza_admin_token');
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper
const request = async <T>(
  endpoint: string,
  method = 'GET',
  body?: any,
  isMultipart = false
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: getHeaders(isMultipart),
  };

  if (body) {
    if (isMultipart) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    let message = 'حدث خطأ في النظام';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.error || parsed.message || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

export const api = {
  // Base URL for image paths
  imageUrl: (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '');
    return `${API_BASE_URL}/${cleanPath}`;
  },

  // Auth
  login: async (phone: string, password: string) => {
    const res = await request<{ token: string; user: User }>('/api/auth/login', 'POST', { phone, password });
    localStorage.setItem('jewelry_hamza_admin_token', res.token);
    return res.user;
  },
  me: async () => {
    return request<User>('/api/auth/me', 'GET');
  },
  logout: () => {
    localStorage.removeItem('jewelry_hamza_admin_token');
  },

  // Categories
  getCategories: async () => {
    return request<Category[]>('/api/categories');
  },
  createCategory: async (formData: FormData) => {
    return request<Category>('/api/categories', 'POST', formData, true);
  },
  updateCategory: async (id: string, nameAr: string, nameEn: string, sortOrder: number, isActive: boolean) => {
    return request<Category>(`/api/categories/${id}`, 'PUT', { nameAr, nameEn, sortOrder, isActive });
  },
  deleteCategory: async (id: string) => {
    return request<{ message: string }>(`/api/categories/${id}`, 'DELETE');
  },

  // Products
  getProducts: async (params?: { categoryId?: string; search?: string; karat?: number }) => {
    let query = '';
    if (params) {
      const parts = [];
      if (params.categoryId) parts.push(`categoryId=${params.categoryId}`);
      if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.karat) parts.push(`karat=${params.karat}`);
      if (parts.length) query = `?${parts.join('&')}`;
    }
    return request<Product[]>(`/api/products${query}`);
  },
  getProduct: async (id: string) => {
    return request<Product>(`/api/products/${id}`);
  },
  createProduct: async (productData: Partial<Product>) => {
    return request<Product>('/api/products', 'POST', productData);
  },
  updateProduct: async (id: string, productData: Partial<Product>) => {
    return request<Product>(`/api/products/${id}`, 'PUT', productData);
  },
  deleteProduct: async (id: string) => {
    return request<{ message: string }>(`/api/products/${id}`, 'DELETE');
  },
  uploadProductImages: async (productId: string, formData: FormData) => {
    return request<ProductImage[]>(`/api/products/${productId}/images`, 'POST', formData, true);
  },
  deleteProductImage: async (imageId: string) => {
    return request<{ message: string }>(`/api/products/images/${imageId}`, 'DELETE');
  },

  // Gold Prices
  getGoldPrice: async () => {
    return request<GoldPrice>('/api/gold-prices/current');
  },
  getGoldPriceHistory: async () => {
    return request<GoldPrice[]>('/api/gold-prices/history');
  },
  updateGoldPrice: async (karat18: number, karat21: number, karat24: number) => {
    return request<GoldPrice>('/api/gold-prices', 'POST', { karat18, karat21, karat24 });
  },

  // Branches
  getBranches: async () => {
    return request<Branch[]>('/api/branches');
  },
  createBranch: async (branchData: Partial<Branch>) => {
    return request<Branch>('/api/branches', 'POST', branchData);
  },
  updateBranch: async (id: string, branchData: Partial<Branch>) => {
    return request<Branch>(`/api/branches/${id}`, 'PUT', branchData);
  },
  deleteBranch: async (id: string) => {
    return request<{ message: string }>(`/api/branches/${id}`, 'DELETE');
  },

  // Appointments
  getAppointments: async () => {
    return request<Appointment[]>('/api/appointments');
  },
  updateAppointmentStatus: async (id: string, status: string, adminNotes?: string) => {
    return request<Appointment>(`/api/appointments/${id}/status`, 'PUT', { status, adminNotes });
  },

  // Custom Orders
  getCustomOrders: async () => {
    return request<CustomOrder[]>('/api/custom-orders/admin');
  },
  updateCustomOrderStatus: async (id: string, status: string, adminNotes?: string) => {
    return request<CustomOrder>(`/api/custom-orders/admin/${id}/status`, 'PUT', { status, adminNotes });
  },

  // Dashboard stats
  getDashboardStats: async () => {
    return request<DashboardStats>('/api/admin/dashboard/stats');
  },

  // Reviews (read-only + delete for admin)
  getProductReviews: async (productId: string) => {
    return request<any[]>(`/api/reviews/${productId}`);
  },
};

