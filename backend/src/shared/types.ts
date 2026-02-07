/**
 * Shared Types and Enums
 */

// Re-export Prisma enums for convenience
export { 
  AppRole,
  ContainerType,
  CurrencyType,
  DestinationCountry,
  EquipmentCategory,
  IncotermType,
  QuoteStatus
} from '@prisma/client';

// Container capacities in CBM
export const CONTAINER_CBM = {
  '20FT': 33,
  '40FT': 67,
  '40HC': 76,
} as const;

// Tax/duty rates by destination
export const DUTY_RATES = {
  US: { standard: 0.301 },
  AR: { standard: 0.8081, simplified: 0.51 },
  BR: { standard: 0.668 },
} as const;

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
