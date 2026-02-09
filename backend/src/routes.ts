/**
 * Central Routes Configuration
 * Aggregates all module routes
 */

import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import clientRoutes from './modules/clients/client.routes.js';
import supplierRoutes from './modules/suppliers/supplier.routes.js';
import catalogRoutes from './modules/catalog_items/catalog.routes.js';
import skuMappingRoutes from './modules/sku_mapping/skuMapping.routes.js';
import supplierPriceRoutes from './modules/supplier_prices/supplierPrice.routes.js';
import quoteRoutes from './modules/quotes/quote.routes.js';
import importRoutes from './modules/import/import.routes.js';

const router = Router();

// Auth routes (public)
router.use('/auth', authRoutes);

// Protected routes
router.use('/clients', clientRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/catalog', catalogRoutes);
router.use('/sku-mapping', skuMappingRoutes);
router.use('/supplier-prices', supplierPriceRoutes);
router.use('/quotes', quoteRoutes);
router.use('/import', importRoutes);

export default router;
