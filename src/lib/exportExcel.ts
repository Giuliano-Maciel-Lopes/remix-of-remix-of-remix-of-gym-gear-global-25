/**
 * Excel Export Utility
 * Exports data to .xlsx files using the xlsx library
 */

import * as XLSX from 'xlsx';

interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number;
}

export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string
) {
  const headers = columns.map(c => c.header);
  const rows = data.map(item => columns.map(c => c.accessor(item)));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function formatDateBR(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
}

export function formatStatus(isActive: boolean): string {
  return isActive ? 'Ativo' : 'Inativo';
}

export function formatMoney(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
