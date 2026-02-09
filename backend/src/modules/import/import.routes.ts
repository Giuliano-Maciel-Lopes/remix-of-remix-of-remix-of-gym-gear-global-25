/**
 * Import Routes
 * Handles Excel file uploads for batch creation
 */

import { Router } from 'express';
import multer from 'multer';
import { importController } from './import.controller.js';
import { authenticate} from '../../shared/middleware/auth.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(authenticate);

router.post('/clients', upload.single('file'), (req, res, next) => importController.importClients(req, res, next));
router.post('/suppliers', upload.single('file'), (req, res, next) => importController.importSuppliers(req, res, next));
router.post('/catalog', upload.single('file'), (req, res, next) => importController.importCatalog(req, res, next));
router.post('/supplier-prices', upload.single('file'), (req, res, next) => importController.importSupplierPrices(req, res, next));

export default router;
