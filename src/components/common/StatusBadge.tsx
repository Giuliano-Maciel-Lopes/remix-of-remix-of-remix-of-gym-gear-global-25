/**
 * StatusBadge Component
 * Visual indicator for various statuses (orders, suppliers, items)
 */

import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'ordered' 
  | 'cancelled'
  | 'active'
  | 'inactive'
  | 'warning'
  | 'error'
  | 'success';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  draft: {
    label: 'Rascunho',
    className: 'bg-muted text-muted-foreground',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-warning/10 text-warning border border-warning/20',
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-success/10 text-success border border-success/20',
  },
  ordered: {
    label: 'Pedido',
    className: 'bg-info/10 text-info border border-info/20',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-destructive/10 text-destructive border border-destructive/20',
  },
  active: {
    label: 'Ativo',
    className: 'bg-success/10 text-success border border-success/20',
  },
  inactive: {
    label: 'Inativo',
    className: 'bg-muted text-muted-foreground',
  },
  warning: {
    label: 'Atenção',
    className: 'bg-warning/10 text-warning border border-warning/20',
  },
  error: {
    label: 'Erro',
    className: 'bg-destructive/10 text-destructive border border-destructive/20',
  },
  success: {
    label: 'OK',
    className: 'bg-success/10 text-success border border-success/20',
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {label ?? config.label}
    </span>
  );
}

/**
 * ContainerBadge Component
 * Visual indicator for container types
 */
interface ContainerBadgeProps {
  type: '20FT' | '40FT' | '40HC';
  className?: string;
}

const containerConfig = {
  '20FT': { label: "20'", className: 'container-badge container-20' },
  '40FT': { label: "40'", className: 'container-badge container-40' },
  '40HC': { label: "40'HC", className: 'container-badge container-40hc' },
};

export function ContainerBadge({ type, className }: ContainerBadgeProps) {
  const config = containerConfig[type];
  
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}

/**
 * CountryBadge Component
 * Flag and name for destination countries
 */
interface CountryBadgeProps {
  country: 'US' | 'AR' | 'BR';
  showName?: boolean;
  className?: string;
}

const countryConfig = {
  US: { flag: '🇺🇸', name: 'Estados Unidos' },
  AR: { flag: '🇦🇷', name: 'Argentina' },
  BR: { flag: '🇧🇷', name: 'Brasil' },
};

export function CountryBadge({ country, showName = true, className }: CountryBadgeProps) {
  const config = countryConfig[country];
  
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="text-base">{config.flag}</span>
      {showName && <span className="text-sm">{config.name}</span>}
    </span>
  );
}

/**
 * CategoryBadge Component
 * Visual tag for equipment categories
 */
interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  Cardio: 'bg-info/10 text-info',
  Strength: 'bg-destructive/10 text-destructive',
  'Free Weights': 'bg-warning/10 text-warning',
  Benches: 'bg-success/10 text-success',
  Functional: 'bg-accent/20 text-accent',
  Accessories: 'bg-muted text-muted-foreground',
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] ?? 'bg-muted text-muted-foreground';
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        colorClass,
        className
      )}
    >
      {category}
    </span>
  );
}
