/**
 * Import Controller
 * Handles Excel file uploads and batch creation
 * Uses contactEmail as unique key for clients/suppliers to prevent duplicates
 */

import { Request, Response, NextFunction } from 'express';
import * as XLSX from 'xlsx';
import prisma from '../../shared/prisma.js';
import fs from 'fs';

export class ImportController {
  async importClients(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: true, message: 'Arquivo não enviado' });

      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      let countCreated = 0;
      let countSkipped = 0;

      for (const row of data) {
        const contactEmail = String(row['Email'] || row['email'] || row['Email Contato'] || row['contact_email'] || '').trim();
        if (!contactEmail) {
          countSkipped++;
          continue;
        }

        const existing = await prisma.client.findUnique({ where: { contactEmail } });
        if (existing) {
          countSkipped++;
          continue;
        }

        await prisma.client.create({
          data: {
            name: String(row['Nome'] || row['name'] || '').trim(),
            contactEmail,
            country: String(row['País'] || row['country'] || 'BR').trim(),
            defaultCurrency: (row['Moeda'] || row['default_currency'] || 'USD') as any,
            contactPhone: row['Telefone'] || row['contact_phone'] || null,
            notes: row['Observações'] || row['notes'] || null,
            isActive: true,
          },
        });
        countCreated++;
      }

      fs.unlinkSync(file.path);
      res.json({
        success: true,
        countCreated,
        countSkipped,
        message: `Import concluído: ${countCreated} criados, ${countSkipped} já existentes.`,
      });
    } catch (error) {
      next(error);
    }
  }

  async importSuppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: true, message: 'Arquivo não enviado' });

      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      let countCreated = 0;
      let countSkipped = 0;

      for (const row of data) {
        const contactEmail = String(row['Email'] || row['email'] || row['Email Contato'] || row['contact_email'] || '').trim();
        if (!contactEmail) {
          countSkipped++;
          continue;
        }

        const existing = await prisma.supplier.findUnique({ where: { contactEmail } });
        if (existing) {
          countSkipped++;
          continue;
        }

        await prisma.supplier.create({
          data: {
            name: String(row['Nome'] || row['name'] || '').trim(),
            contactEmail,
            country: String(row['País'] || row['country'] || 'CN').trim(),
            defaultCurrency: (row['Moeda'] || row['default_currency'] || 'USD') as any,
            incotermDefault: (row['Incoterm'] || row['incoterm_default'] || 'FOB') as any,
            leadTimeDays: Number(row['Lead Time'] || row['lead_time_days'] || 45),
            contactPhone: row['Telefone'] || row['contact_phone'] || null,
            notes: row['Observações'] || row['notes'] || null,
            isActive: true,
          },
        });
        countCreated++;
      }

      fs.unlinkSync(file.path);
      res.json({
        success: true,
        countCreated,
        countSkipped,
        message: `Import concluído: ${countCreated} criados, ${countSkipped} já existentes.`,
      });
    } catch (error) {
      next(error);
    }
  }

  async importCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: true, message: 'Arquivo não enviado' });

      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      let count = 0;
      for (const row of data) {
        await prisma.catalogItem.create({
          data: {
            sku: String(row['SKU'] || row['sku'] || `SKU-${Date.now()}-${count}`).trim(),
            name: String(row['Nome'] || row['name'] || '').trim(),
            category: (row['Categoria'] || row['category'] || 'Cardio') as any,
            description: row['Descrição'] || row['description'] || null,
            unitCbm: Number(row['CBM'] || row['unit_cbm'] || 0),
            unitWeightKg: Number(row['Peso (kg)'] || row['unit_weight_kg'] || 0),
            hsCode: row['HS Code'] || row['hs_code'] || null,
            ncmCode: row['NCM Code'] || row['ncm_code'] || null,
            isActive: true,
          },
        });
        count++;
      }

      fs.unlinkSync(file.path);
      res.json({ success: true, count });
    } catch (error) {
      next(error);
    }
  }

  async importSupplierPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: true, message: 'Arquivo não enviado' });

      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      let countCreated = 0;
      let countSkipped = 0;

      for (const row of data) {
        // Lookup supplier by contactEmail
        const supplierEmail = String(row['Email Fornecedor'] || row['supplier_email'] || row['Email'] || row['email'] || '').trim();
        const itemSku = String(row['SKU'] || row['sku'] || row['catalog_item_sku'] || '').trim();

        if (!supplierEmail || !itemSku) {
          countSkipped++;
          continue;
        }

        const supplier = await prisma.supplier.findUnique({ where: { contactEmail: supplierEmail } });
        const catalogItem = await prisma.catalogItem.findUnique({ where: { sku: itemSku } });

        if (!supplier || !catalogItem) {
          countSkipped++;
          continue;
        }

        await prisma.supplierPrice.create({
          data: {
            supplierId: supplier.id,
            catalogItemId: catalogItem.id,
            priceFobUsd: Number(row['Preço FOB (USD)'] || row['price_fob_usd'] || 0),
            currencyOriginal: (row['Moeda Original'] || row['currency_original'] || 'USD') as any,
            priceOriginal: Number(row['Preço Original'] || row['price_original'] || 0),
            moq: row['MOQ'] || row['moq'] ? Number(row['MOQ'] || row['moq']) : null,
          },
        });
        countCreated++;
      }

      fs.unlinkSync(file.path);
      res.json({
        success: true,
        countCreated,
        countSkipped,
        message: `Import concluído: ${countCreated} criados, ${countSkipped} ignorados.`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const importController = new ImportController();
