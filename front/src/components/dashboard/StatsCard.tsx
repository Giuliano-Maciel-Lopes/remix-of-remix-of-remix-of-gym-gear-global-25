/**
 * StatsCard Component
 * Displays key metrics with optional trend indicators
 * Used in dashboard for summary statistics
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'alert' | 'success' | 'info';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  variant = 'default',
  className 
}: StatsCardProps) {
  // Variant-based styling for the accent bar and icon
  const variantStyles = {
    default: {
      bar: 'from-primary to-accent',
      icon: 'bg-primary/10 text-primary',
    },
    alert: {
      bar: 'from-destructive to-destructive/70',
      icon: 'bg-destructive/10 text-destructive',
    },
    success: {
      bar: 'from-success to-success/70',
      icon: 'bg-success/10 text-success',
    },
    info: {
      bar: 'from-info to-info/70',
      icon: 'bg-info/10 text-info',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "relative bg-card rounded-lg border shadow-sm overflow-hidden animate-fade-in",
      className
    )}>
      {/* Top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", styles.bar)} />
      
      <div className="p-5">
        <div className="flex items-start justify-between">
          {/* Content */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            
            {/* Subtitle or trend */}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(trend.value)}% vs mês anterior</span>
              </div>
            )}
          </div>
          
          {/* Icon */}
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", styles.icon)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AlertCard Component
 * For displaying warning/error states that need attention
 */
interface AlertCardProps {
  title: string;
  message: string;
  count?: number;
  onClick?: () => void;
}

export function AlertCard({ title, message, count, onClick }: AlertCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-destructive/5 border border-destructive/20 rounded-lg p-4 hover:bg-destructive/10 transition-colors animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-destructive">{title}</p>
            {count !== undefined && (
              <span className="px-2 py-0.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
        </div>
      </div>
    </button>
  );
}
