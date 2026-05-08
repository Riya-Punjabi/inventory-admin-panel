export interface ApiListResponse<T> {
  isSuccess?: boolean;
  issuccess?: boolean;
  message?: string;
  data?: T[];
  totalRecords?: number;
  totalPages?: number;
  totalPageNo?: number;
  pageIndex?: number;
}

export interface ApiDataResponse<T> {
  issuccess?: boolean;
  message?: string;
  data?: T;
}

export interface ApiMessageResponse {
  issuccess?: boolean;
  isSuccess?: boolean;
  message?: string;
}

export interface OpeningStockRecord {
  disID?: number;
  srno?: number;
  status: number;
  location?: string;
  sub_location?: string;
  supplier?: string;
  purchase_date?: string | Date;
  purchase_ref_no?: string;
  product_name?: string;
  part_name?: string;
  barcode?: string;
  model_no?: string;
  product_category?: string;
  product_type?: string;
  is_product_spare: number;
  qty: number;
  mfg_date?: string | Date;
  pcondition?: string;
  company?: string;
  serial_no1?: string;
  serial_no2?: string;
  mrp?: number;
  purchase_rate?: number;
  product_img?: string;
  product_imgBase64?: string;
  purchase_img?: string;
  purchase_imgBase64?: string;
  note?: string;
  stock?: number;
  bm_srno?: number;
  created_user_id?: number;
  created_dt?: string;
  updated_user_id?: number;
  updated_dt?: string;
  [key: string]: unknown;
}

export interface OpeningStockListFilters {
  dateRange?: {
    from?: Date | string | null;
    to?: Date | string | null;
  };
  subloc?: string | null;
  modelNo?: string | null;
  productCategory?: string | null;
  productType?: string | null;
  spare?: number | string | null;
  billNo?: string | null;
  productName?: string | null;
  supplier?: string | null;
  location?: string | null;
  pageNo?: number;
  pageSize?: number;
}

export interface RefreshOption {
  srno?: number;
  status_name?: string;
  location?: string;
  sub_location?: string;
  product_name?: string;
  part_name?: string;
  product_category?: string;
  product_type?: string;
  company?: string;
  model_no?: string;
  supplier?: string;
  [key: string]: unknown;
}

export interface OpeningStockRefreshData {
  data1?: RefreshOption[];
  data2?: RefreshOption[];
  data3?: RefreshOption[];
  data4?: RefreshOption[];
  data5?: RefreshOption[];
  data6?: RefreshOption[];
  data7?: RefreshOption[];
  data8?: RefreshOption[];
  data9?: RefreshOption[];
  data10?: RefreshOption[];
}
