/**
 * Import Excel Button Component
 * Handles file upload and sends to backend for batch creation
 */

import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ImportExcelButtonProps {
  endpoint: string; // e.g. '/import/clients'
  onSuccess: () => void;
  label?: string;
}

export function ImportExcelButton({ endpoint, onSuccess, label = 'Importar Excel' }: ImportExcelButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls',
    ];
    const isValid = validTypes.some(t => file.type === t) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isValid) {
      toast({ title: 'Formato inválido', description: 'Envie um arquivo .xlsx ou .xls', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao importar');
      }

      const result = await res.json();
      toast({ title: 'Importação concluída!', description: `${result.count || 0} registros importados.` });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Erro ao importar', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" size="sm" onClick={handleClick} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {isLoading ? 'Importando...' : label}
      </Button>
    </>
  );
}
