-- DropForeignKey
ALTER TABLE "sku_mapping" DROP CONSTRAINT "sku_mapping_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "supplier_prices" DROP CONSTRAINT "supplier_prices_catalog_item_id_fkey";

-- DropForeignKey
ALTER TABLE "supplier_prices" DROP CONSTRAINT "supplier_prices_supplier_id_fkey";

-- AddForeignKey
ALTER TABLE "sku_mapping" ADD CONSTRAINT "sku_mapping_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_prices" ADD CONSTRAINT "supplier_prices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_prices" ADD CONSTRAINT "supplier_prices_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
