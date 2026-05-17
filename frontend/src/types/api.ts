export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { pagination?: Pagination };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
