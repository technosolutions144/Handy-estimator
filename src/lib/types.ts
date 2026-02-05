export type TradeType =
  | 'masonry'
  | 'plumbing'
  | 'electrical'
  | 'remodeling'
  | 'landscaping'
  | 'roofing'
  | 'painting'
  | 'hvac'
  | 'carpentry'
  | 'general';

export type CustomerType = 'residential' | 'commercial';
export type QualityLevel = 'economy' | 'standard' | 'premium';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type LineItemCategory = 'labor' | 'materials' | 'other';

export interface RegionPreset {
  id: string;
  name: string;
  currency: string;
  taxRate: number;
  minimumVisitRate: number;
  emergencyMultiplier: number;
  minimumBillableHours: number;
  rates: Record<TradeType, number>;
}

export interface Profile {
  id: string;
  full_name: string;
  company_name: string;
  default_trade: TradeType;
  default_region: string;
  default_quality_level: QualityLevel;
  default_customer_type: CustomerType;
  default_is_emergency: boolean;
  default_profit_margin_pct: number;
  default_admin_overhead_pct: number;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  category: LineItemCategory;
  created_at: string;
}

export interface Quote {
  id: string;
  user_id: string;
  project_name: string;
  trade_type: TradeType;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  customer_type: CustomerType;
  quality_level: QualityLevel;
  region: string;
  is_emergency: boolean;
  labor_hours: number;
  labor_rate: number;
  materials_cost: number;
  transportation_cost: number;
  tax_rate: number;
  admin_overhead_pct: number;
  tool_wear_cost: number;
  profit_margin_pct: number;
  recommended_price: number;
  minimum_price: number;
  destructive_price: number;
  final_price: number;
  notes: string;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
  line_items?: QuoteLineItem[];
}

export interface QuoteFormData {
  project_name: string;
  trade_type: TradeType;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  customer_type: CustomerType;
  quality_level: QualityLevel;
  region: string;
  is_emergency: boolean;
  labor_hours: number;
  labor_rate: number;
  materials_cost: number;
  transportation_cost: number;
  tax_rate: number;
  admin_overhead_pct: number;
  tool_wear_cost: number;
  profit_margin_pct: number;
  notes: string;
  line_items: Omit<QuoteLineItem, 'id' | 'quote_id' | 'created_at'>[];
}

export interface PricingResult {
  baseLaborCost: number;
  materialsCost: number;
  transportationCost: number;
  toolWearCost: number;
  subtotal: number;
  adminOverhead: number;
  taxAmount: number;
  totalCost: number;
  recommendedPrice: number;
  minimumPrice: number;
  destructivePrice: number;
  recommendedMargin: number;
  minimumMargin: number;
  emergencyApplied: boolean;
  minimumVisitApplied: boolean;
  minimumHoursApplied: boolean;
  effectiveLaborHours: number;
  emergencySurcharge: number;
  minimumVisitRate: number;
}
