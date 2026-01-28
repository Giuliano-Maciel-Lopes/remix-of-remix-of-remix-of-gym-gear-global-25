/**
 * Mock Data for Gym Equipment Trading System
 * Comprehensive dataset for simulating real trading scenarios
 * Includes suppliers, catalog items, pricing, and quotes
 */

import type { 
  Supplier, 
  CatalogItem, 
  SKUMapping, 
  SupplierPrice, 
  Quote, 
  QuoteLine,
  EquipmentCategory 
} from '@/types';

// =============================================================================
// SUPPLIERS
// Major gym equipment manufacturers from China
// =============================================================================

export const suppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Shandong Fitness Equipment Co.',
    country: 'CN',
    default_currency: 'USD',
    incoterm_default: 'FOB',
    lead_time_days: 45,
    is_active: true,
    contact_email: 'export@shandongfitness.cn',
    notes: 'Premium commercial equipment. Good quality control.'
  },
  {
    id: 'sup-002',
    name: 'Ningbo Iron Sports Ltd.',
    country: 'CN',
    default_currency: 'USD',
    incoterm_default: 'FOB',
    lead_time_days: 35,
    is_active: true,
    contact_email: 'sales@ningboiron.com',
    notes: 'Specializes in free weights. Competitive pricing.'
  },
  {
    id: 'sup-003',
    name: 'Guangzhou Elite Gym',
    country: 'CN',
    default_currency: 'CNY',
    incoterm_default: 'FOB',
    lead_time_days: 50,
    is_active: true,
    contact_email: 'trade@gzelite.cn',
    notes: 'Full range. Higher MOQ but best prices.'
  },
  {
    id: 'sup-004',
    name: 'Zhejiang Pro Fitness',
    country: 'CN',
    default_currency: 'USD',
    incoterm_default: 'FOB',
    lead_time_days: 40,
    is_active: true,
    contact_email: 'export@zjprofitness.com',
    notes: 'Good for cardio equipment. Fast response.'
  },
  {
    id: 'sup-005',
    name: 'Hebei Strong Gym',
    country: 'CN',
    default_currency: 'USD',
    incoterm_default: 'EXW',
    lead_time_days: 55,
    is_active: false,
    contact_email: 'info@hebeistrong.cn',
    notes: 'Currently on hold - quality issues pending resolution.'
  },
];

// =============================================================================
// CATALOG ITEMS
// Commercial gym equipment catalog
// =============================================================================

export const catalogItems: CatalogItem[] = [
  // CARDIO EQUIPMENT
  {
    id: 'cat-001',
    sku: 'TRD-COM-001',
    category: 'Cardio',
    name: 'Commercial Treadmill Pro',
    description: 'Heavy-duty commercial treadmill with 4.0HP motor, 22" belt, touchscreen display',
    unit_cbm: 1.85,
    unit_weight_kg: 180,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-002',
    sku: 'TRD-LT-001',
    category: 'Cardio',
    name: 'Light Commercial Treadmill',
    description: 'Semi-commercial treadmill with 3.0HP motor, 20" belt, LCD display',
    unit_cbm: 1.45,
    unit_weight_kg: 140,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-003',
    sku: 'BIK-UPR-001',
    category: 'Cardio',
    name: 'Upright Exercise Bike',
    description: 'Commercial upright bike with magnetic resistance, heart rate monitor',
    unit_cbm: 0.55,
    unit_weight_kg: 65,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-004',
    sku: 'BIK-REC-001',
    category: 'Cardio',
    name: 'Recumbent Exercise Bike',
    description: 'Commercial recumbent bike with adjustable seat, 32 resistance levels',
    unit_cbm: 0.75,
    unit_weight_kg: 85,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-005',
    sku: 'ELP-COM-001',
    category: 'Cardio',
    name: 'Commercial Elliptical Cross Trainer',
    description: 'Heavy-duty elliptical with 20" stride, 25 resistance levels, self-generating',
    unit_cbm: 1.20,
    unit_weight_kg: 130,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-006',
    sku: 'ROW-COM-001',
    category: 'Cardio',
    name: 'Commercial Rowing Machine',
    description: 'Air resistance rower with performance monitor, steel frame',
    unit_cbm: 0.85,
    unit_weight_kg: 55,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },

  // STRENGTH EQUIPMENT
  {
    id: 'cat-007',
    sku: 'SMT-PWR-001',
    category: 'Strength',
    name: 'Power Rack Commercial',
    description: 'Heavy-duty power rack with pull-up bar, safety arms, plate storage',
    unit_cbm: 1.50,
    unit_weight_kg: 200,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-008',
    sku: 'SMT-SMI-001',
    category: 'Strength',
    name: 'Smith Machine Pro',
    description: 'Commercial smith machine with linear bearings, safety stops',
    unit_cbm: 1.80,
    unit_weight_kg: 280,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-009',
    sku: 'SMT-CBL-001',
    category: 'Strength',
    name: 'Dual Cable Crossover',
    description: 'Dual adjustable pulley system, 200lb weight stacks each side',
    unit_cbm: 2.10,
    unit_weight_kg: 350,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-010',
    sku: 'SMT-LAT-001',
    category: 'Strength',
    name: 'Lat Pulldown Machine',
    description: 'Selectorized lat pulldown with 300lb stack, dual grips',
    unit_cbm: 0.95,
    unit_weight_kg: 180,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-011',
    sku: 'SMT-LEG-001',
    category: 'Strength',
    name: 'Leg Press 45°',
    description: 'Plate-loaded 45-degree leg press, 1000lb capacity',
    unit_cbm: 1.65,
    unit_weight_kg: 250,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },

  // FREE WEIGHTS
  {
    id: 'cat-012',
    sku: 'FRW-DUM-001',
    category: 'Free Weights',
    name: 'Rubber Hex Dumbbell Set (5-50lb)',
    description: 'Commercial rubber hex dumbbells, set of 10 pairs with rack',
    unit_cbm: 0.45,
    unit_weight_kg: 280,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-013',
    sku: 'FRW-DUM-002',
    category: 'Free Weights',
    name: 'Rubber Hex Dumbbell Set (55-100lb)',
    description: 'Commercial rubber hex dumbbells, set of 10 pairs with rack',
    unit_cbm: 0.65,
    unit_weight_kg: 450,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-014',
    sku: 'FRW-PLA-001',
    category: 'Free Weights',
    name: 'Olympic Bumper Plate Set (150kg)',
    description: 'Competition bumper plates, color-coded, 150kg total',
    unit_cbm: 0.25,
    unit_weight_kg: 150,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-015',
    sku: 'FRW-BAR-001',
    category: 'Free Weights',
    name: 'Olympic Barbell 20kg',
    description: 'IWF specification barbell, 220,000 PSI tensile strength',
    unit_cbm: 0.08,
    unit_weight_kg: 20,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-016',
    sku: 'FRW-KTL-001',
    category: 'Free Weights',
    name: 'Kettlebell Set (8-32kg)',
    description: 'Competition kettlebells, steel construction, set of 7',
    unit_cbm: 0.18,
    unit_weight_kg: 140,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },

  // BENCHES
  {
    id: 'cat-017',
    sku: 'BNC-ADJ-001',
    category: 'Benches',
    name: 'Adjustable Bench Commercial',
    description: 'FID bench with 7 positions, 500lb capacity, wheels',
    unit_cbm: 0.35,
    unit_weight_kg: 45,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-018',
    sku: 'BNC-FLT-001',
    category: 'Benches',
    name: 'Flat Bench Commercial',
    description: 'Heavy-duty flat bench, 1000lb capacity, tripod base',
    unit_cbm: 0.28,
    unit_weight_kg: 35,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-019',
    sku: 'BNC-OLY-001',
    category: 'Benches',
    name: 'Olympic Bench Press',
    description: 'Competition bench with integrated rack, spotter platform',
    unit_cbm: 0.75,
    unit_weight_kg: 95,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-020',
    sku: 'BNC-ABD-001',
    category: 'Benches',
    name: 'Decline Abdominal Bench',
    description: 'Adjustable decline bench with foot rollers, 0-45 degrees',
    unit_cbm: 0.42,
    unit_weight_kg: 40,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },

  // FUNCTIONAL TRAINING
  {
    id: 'cat-021',
    sku: 'FUN-RIG-001',
    category: 'Functional',
    name: 'Functional Training Rig 6-Station',
    description: 'Modular CrossFit rig with pull-up bars, storage, battle rope anchors',
    unit_cbm: 3.50,
    unit_weight_kg: 450,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-022',
    sku: 'FUN-BOX-001',
    category: 'Functional',
    name: 'Plyo Box Set (3 pieces)',
    description: 'Soft foam plyo boxes, 20/24/30 inch heights',
    unit_cbm: 0.55,
    unit_weight_kg: 35,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },
  {
    id: 'cat-023',
    sku: 'FUN-SLD-001',
    category: 'Functional',
    name: 'Prowler Push Sled',
    description: 'Heavy-duty prowler sled with high/low handles, plate posts',
    unit_cbm: 0.25,
    unit_weight_kg: 45,
    hs_code: '9506.91',
    ncm_code: '9506.91.00',
    is_active: true,
  },

  // ACCESSORIES
  {
    id: 'cat-024',
    sku: 'ACC-MAT-001',
    category: 'Accessories',
    name: 'Rubber Floor Mat (4\'x6\'x3/4")',
    description: 'Commercial rubber flooring, interlocking, per piece',
    unit_cbm: 0.08,
    unit_weight_kg: 25,
    hs_code: '4016.91',
    ncm_code: '4016.91.00',
    is_active: true,
  },
  {
    id: 'cat-025',
    sku: 'ACC-MIR-001',
    category: 'Accessories',
    name: 'Gym Wall Mirror (4\'x8\')',
    description: 'Safety-backed gym mirror, commercial grade',
    unit_cbm: 0.15,
    unit_weight_kg: 35,
    hs_code: '7009.91',
    ncm_code: '7009.91.00',
    is_active: true,
  },
];

// =============================================================================
// SKU MAPPINGS
// Links supplier codes to our catalog items
// Some items intentionally left unmapped to show pending state
// =============================================================================

export const skuMappings: SKUMapping[] = [
  // Shandong Fitness mappings
  { id: 'map-001', supplier_id: 'sup-001', supplier_model_code: 'SD-TM-PRO-2024', catalog_item_id: 'cat-001', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 'map-002', supplier_id: 'sup-001', supplier_model_code: 'SD-TM-LT-2024', catalog_item_id: 'cat-002', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 'map-003', supplier_id: 'sup-001', supplier_model_code: 'SD-ELP-X5', catalog_item_id: 'cat-005', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 'map-004', supplier_id: 'sup-001', supplier_model_code: 'SD-PWR-RACK', catalog_item_id: 'cat-007', created_at: '2024-01-20', updated_at: '2024-01-20' },
  { id: 'map-005', supplier_id: 'sup-001', supplier_model_code: 'SD-SMITH-PRO', catalog_item_id: 'cat-008', created_at: '2024-01-20', updated_at: '2024-01-20' },
  
  // Ningbo Iron Sports mappings (specializes in weights)
  { id: 'map-006', supplier_id: 'sup-002', supplier_model_code: 'NB-HEX-5-50', catalog_item_id: 'cat-012', created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id: 'map-007', supplier_id: 'sup-002', supplier_model_code: 'NB-HEX-55-100', catalog_item_id: 'cat-013', created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id: 'map-008', supplier_id: 'sup-002', supplier_model_code: 'NB-BUMPER-150', catalog_item_id: 'cat-014', created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id: 'map-009', supplier_id: 'sup-002', supplier_model_code: 'NB-BAR-OLY-20', catalog_item_id: 'cat-015', created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id: 'map-010', supplier_id: 'sup-002', supplier_model_code: 'NB-KB-SET', catalog_item_id: 'cat-016', created_at: '2024-02-05', updated_at: '2024-02-05' },
  
  // Guangzhou Elite mappings
  { id: 'map-011', supplier_id: 'sup-003', supplier_model_code: 'GZ-CARDIO-TRD-01', catalog_item_id: 'cat-001', created_at: '2024-02-10', updated_at: '2024-02-10' },
  { id: 'map-012', supplier_id: 'sup-003', supplier_model_code: 'GZ-BIKE-UPR-01', catalog_item_id: 'cat-003', created_at: '2024-02-10', updated_at: '2024-02-10' },
  { id: 'map-013', supplier_id: 'sup-003', supplier_model_code: 'GZ-BIKE-REC-01', catalog_item_id: 'cat-004', created_at: '2024-02-10', updated_at: '2024-02-10' },
  { id: 'map-014', supplier_id: 'sup-003', supplier_model_code: 'GZ-CBL-CROSS', catalog_item_id: 'cat-009', created_at: '2024-02-15', updated_at: '2024-02-15' },
  { id: 'map-015', supplier_id: 'sup-003', supplier_model_code: 'GZ-LAT-300', catalog_item_id: 'cat-010', created_at: '2024-02-15', updated_at: '2024-02-15' },
  
  // Zhejiang Pro Fitness mappings
  { id: 'map-016', supplier_id: 'sup-004', supplier_model_code: 'ZJ-TRD-2024A', catalog_item_id: 'cat-001', created_at: '2024-03-01', updated_at: '2024-03-01' },
  { id: 'map-017', supplier_id: 'sup-004', supplier_model_code: 'ZJ-TRD-LITE', catalog_item_id: 'cat-002', created_at: '2024-03-01', updated_at: '2024-03-01' },
  { id: 'map-018', supplier_id: 'sup-004', supplier_model_code: 'ZJ-ROW-AIR', catalog_item_id: 'cat-006', created_at: '2024-03-01', updated_at: '2024-03-01' },
  { id: 'map-019', supplier_id: 'sup-004', supplier_model_code: 'ZJ-ELP-ULTRA', catalog_item_id: 'cat-005', created_at: '2024-03-05', updated_at: '2024-03-05' },
  
  // PENDING MAPPINGS (catalog_item_id = null)
  { id: 'map-020', supplier_id: 'sup-001', supplier_model_code: 'SD-NEW-2024-X', catalog_item_id: null, notes: 'New product - needs catalog entry', created_at: '2024-03-10', updated_at: '2024-03-10' },
  { id: 'map-021', supplier_id: 'sup-002', supplier_model_code: 'NB-PROTO-WEIGHT', catalog_item_id: null, notes: 'Prototype dumbbells', created_at: '2024-03-12', updated_at: '2024-03-12' },
  { id: 'map-022', supplier_id: 'sup-003', supplier_model_code: 'GZ-UNKNOWN-SKU', catalog_item_id: null, notes: 'Unidentified product from last shipment', created_at: '2024-03-15', updated_at: '2024-03-15' },
];

// =============================================================================
// SUPPLIER PRICES
// FOB prices for catalog items from different suppliers
// =============================================================================

export const supplierPrices: SupplierPrice[] = [
  // Shandong Fitness prices
  { id: 'prc-001', supplier_id: 'sup-001', catalog_item_id: 'cat-001', price_fob_usd: 2850, currency_original: 'USD', price_original: 2850, valid_from: '2024-01-01', moq: 10 },
  { id: 'prc-002', supplier_id: 'sup-001', catalog_item_id: 'cat-002', price_fob_usd: 1650, currency_original: 'USD', price_original: 1650, valid_from: '2024-01-01', moq: 15 },
  { id: 'prc-003', supplier_id: 'sup-001', catalog_item_id: 'cat-005', price_fob_usd: 1980, currency_original: 'USD', price_original: 1980, valid_from: '2024-01-01', moq: 10 },
  { id: 'prc-004', supplier_id: 'sup-001', catalog_item_id: 'cat-007', price_fob_usd: 1450, currency_original: 'USD', price_original: 1450, valid_from: '2024-01-01', moq: 5 },
  { id: 'prc-005', supplier_id: 'sup-001', catalog_item_id: 'cat-008', price_fob_usd: 2200, currency_original: 'USD', price_original: 2200, valid_from: '2024-01-01', moq: 5 },
  
  // Ningbo Iron Sports prices (competitive on weights)
  { id: 'prc-006', supplier_id: 'sup-002', catalog_item_id: 'cat-012', price_fob_usd: 1250, currency_original: 'USD', price_original: 1250, valid_from: '2024-01-15', moq: 20 },
  { id: 'prc-007', supplier_id: 'sup-002', catalog_item_id: 'cat-013', price_fob_usd: 2100, currency_original: 'USD', price_original: 2100, valid_from: '2024-01-15', moq: 15 },
  { id: 'prc-008', supplier_id: 'sup-002', catalog_item_id: 'cat-014', price_fob_usd: 420, currency_original: 'USD', price_original: 420, valid_from: '2024-01-15', moq: 50 },
  { id: 'prc-009', supplier_id: 'sup-002', catalog_item_id: 'cat-015', price_fob_usd: 185, currency_original: 'USD', price_original: 185, valid_from: '2024-01-15', moq: 100 },
  { id: 'prc-010', supplier_id: 'sup-002', catalog_item_id: 'cat-016', price_fob_usd: 380, currency_original: 'USD', price_original: 380, valid_from: '2024-01-15', moq: 30 },
  
  // Guangzhou Elite prices (best on high volume)
  { id: 'prc-011', supplier_id: 'sup-003', catalog_item_id: 'cat-001', price_fob_usd: 2650, currency_original: 'CNY', price_original: 19080, valid_from: '2024-02-01', moq: 20 },
  { id: 'prc-012', supplier_id: 'sup-003', catalog_item_id: 'cat-003', price_fob_usd: 520, currency_original: 'CNY', price_original: 3744, valid_from: '2024-02-01', moq: 30 },
  { id: 'prc-013', supplier_id: 'sup-003', catalog_item_id: 'cat-004', price_fob_usd: 680, currency_original: 'CNY', price_original: 4896, valid_from: '2024-02-01', moq: 25 },
  { id: 'prc-014', supplier_id: 'sup-003', catalog_item_id: 'cat-009', price_fob_usd: 2850, currency_original: 'CNY', price_original: 20520, valid_from: '2024-02-01', moq: 5 },
  { id: 'prc-015', supplier_id: 'sup-003', catalog_item_id: 'cat-010', price_fob_usd: 1380, currency_original: 'CNY', price_original: 9936, valid_from: '2024-02-01', moq: 10 },
  
  // Zhejiang Pro Fitness prices (competitive on cardio)
  { id: 'prc-016', supplier_id: 'sup-004', catalog_item_id: 'cat-001', price_fob_usd: 2780, currency_original: 'USD', price_original: 2780, valid_from: '2024-03-01', moq: 10 },
  { id: 'prc-017', supplier_id: 'sup-004', catalog_item_id: 'cat-002', price_fob_usd: 1580, currency_original: 'USD', price_original: 1580, valid_from: '2024-03-01', moq: 15 },
  { id: 'prc-018', supplier_id: 'sup-004', catalog_item_id: 'cat-005', price_fob_usd: 1850, currency_original: 'USD', price_original: 1850, valid_from: '2024-03-01', moq: 10 },
  { id: 'prc-019', supplier_id: 'sup-004', catalog_item_id: 'cat-006', price_fob_usd: 890, currency_original: 'USD', price_original: 890, valid_from: '2024-03-01', moq: 20 },
  
  // Additional cross-supplier competition
  { id: 'prc-020', supplier_id: 'sup-001', catalog_item_id: 'cat-017', price_fob_usd: 320, currency_original: 'USD', price_original: 320, valid_from: '2024-01-01', moq: 30 },
  { id: 'prc-021', supplier_id: 'sup-003', catalog_item_id: 'cat-017', price_fob_usd: 285, currency_original: 'CNY', price_original: 2052, valid_from: '2024-02-01', moq: 50 },
  { id: 'prc-022', supplier_id: 'sup-001', catalog_item_id: 'cat-011', price_fob_usd: 1850, currency_original: 'USD', price_original: 1850, valid_from: '2024-01-01', moq: 5 },
  { id: 'prc-023', supplier_id: 'sup-003', catalog_item_id: 'cat-011', price_fob_usd: 1720, currency_original: 'CNY', price_original: 12384, valid_from: '2024-02-01', moq: 8 },
];

// =============================================================================
// QUOTES
// Sample purchase orders with line items
// =============================================================================

const quoteLines1: QuoteLine[] = [
  { id: 'ql-001', quote_id: 'quo-001', catalog_item_id: 'cat-001', qty: 15, chosen_supplier_id: 'sup-003' },
  { id: 'ql-002', quote_id: 'quo-001', catalog_item_id: 'cat-003', qty: 20, chosen_supplier_id: 'sup-003' },
  { id: 'ql-003', quote_id: 'quo-001', catalog_item_id: 'cat-005', qty: 10, chosen_supplier_id: 'sup-004' },
  { id: 'ql-004', quote_id: 'quo-001', catalog_item_id: 'cat-017', qty: 25, chosen_supplier_id: 'sup-003' },
];

const quoteLines2: QuoteLine[] = [
  { id: 'ql-005', quote_id: 'quo-002', catalog_item_id: 'cat-012', qty: 30, chosen_supplier_id: 'sup-002' },
  { id: 'ql-006', quote_id: 'quo-002', catalog_item_id: 'cat-013', qty: 20, chosen_supplier_id: 'sup-002' },
  { id: 'ql-007', quote_id: 'quo-002', catalog_item_id: 'cat-014', qty: 100, chosen_supplier_id: 'sup-002' },
  { id: 'ql-008', quote_id: 'quo-002', catalog_item_id: 'cat-015', qty: 150, chosen_supplier_id: 'sup-002' },
  { id: 'ql-009', quote_id: 'quo-002', catalog_item_id: 'cat-016', qty: 40, chosen_supplier_id: 'sup-002' },
];

const quoteLines3: QuoteLine[] = [
  { id: 'ql-010', quote_id: 'quo-003', catalog_item_id: 'cat-007', qty: 8, chosen_supplier_id: 'sup-001' },
  { id: 'ql-011', quote_id: 'quo-003', catalog_item_id: 'cat-008', qty: 5, chosen_supplier_id: 'sup-001' },
  { id: 'ql-012', quote_id: 'quo-003', catalog_item_id: 'cat-009', qty: 4, chosen_supplier_id: 'sup-003' },
  { id: 'ql-013', quote_id: 'quo-003', catalog_item_id: 'cat-010', qty: 6, chosen_supplier_id: 'sup-003' },
  { id: 'ql-014', quote_id: 'quo-003', catalog_item_id: 'cat-011', qty: 4, chosen_supplier_id: 'sup-003' },
];

const quoteLines4: QuoteLine[] = [
  { id: 'ql-015', quote_id: 'quo-004', catalog_item_id: 'cat-001', qty: 20, chosen_supplier_id: 'sup-001' },
  { id: 'ql-016', quote_id: 'quo-004', catalog_item_id: 'cat-002', qty: 30, chosen_supplier_id: 'sup-004' },
  { id: 'ql-017', quote_id: 'quo-004', catalog_item_id: 'cat-006', qty: 25, chosen_supplier_id: 'sup-004' },
];

export const quotes: Quote[] = [
  {
    id: 'quo-001',
    name: 'GymBR São Paulo - Cardio Q1 2024',
    status: 'approved',
    destination_country: 'BR',
    container_type: '40HC',
    freight_per_container_usd: 4200,
    insurance_rate: 0.005,
    fixed_costs_usd: 2500,
    lines: quoteLines1,
    created_at: '2024-01-20',
    updated_at: '2024-02-15',
  },
  {
    id: 'quo-002',
    name: 'FitnessPro Miami - Free Weights',
    status: 'ordered',
    destination_country: 'US',
    container_type: '40FT',
    freight_per_container_usd: 3800,
    insurance_rate: 0.004,
    fixed_costs_usd: 1800,
    lines: quoteLines2,
    created_at: '2024-02-01',
    updated_at: '2024-02-28',
  },
  {
    id: 'quo-003',
    name: 'Club Atlético BA - Strength Equipment',
    status: 'pending',
    destination_country: 'AR',
    container_type: '40HC',
    freight_per_container_usd: 5500,
    insurance_rate: 0.006,
    fixed_costs_usd: 3200,
    lines: quoteLines3,
    created_at: '2024-03-01',
    updated_at: '2024-03-10',
  },
  {
    id: 'quo-004',
    name: 'SmartGym Rio - Mixed Cardio',
    status: 'draft',
    destination_country: 'BR',
    container_type: '40FT',
    freight_per_container_usd: 4500,
    insurance_rate: 0.005,
    fixed_costs_usd: 2800,
    lines: quoteLines4,
    created_at: '2024-03-15',
    updated_at: '2024-03-15',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// Quick lookup utilities for mock data
// =============================================================================

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find(s => s.id === id);
}

export function getCatalogItemById(id: string): CatalogItem | undefined {
  return catalogItems.find(c => c.id === id);
}

export function getSupplierPrice(supplierId: string, catalogItemId: string): SupplierPrice | undefined {
  return supplierPrices.find(p => p.supplier_id === supplierId && p.catalog_item_id === catalogItemId);
}

export function getPricesForCatalogItem(catalogItemId: string): SupplierPrice[] {
  return supplierPrices.filter(p => p.catalog_item_id === catalogItemId);
}

export function getMappingsForSupplier(supplierId: string): SKUMapping[] {
  return skuMappings.filter(m => m.supplier_id === supplierId);
}

export function getPendingMappings(): SKUMapping[] {
  return skuMappings.filter(m => m.catalog_item_id === null);
}

export function getActiveSuppliers(): Supplier[] {
  return suppliers.filter(s => s.is_active);
}

export function getCatalogItemsByCategory(category: EquipmentCategory): CatalogItem[] {
  return catalogItems.filter(c => c.category === category);
}
