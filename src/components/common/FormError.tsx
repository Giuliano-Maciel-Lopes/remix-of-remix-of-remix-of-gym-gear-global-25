/**
 * Form field error display component
 */

import React from 'react';

interface FormErrorProps {
  error?: string;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;
  return (
    <p className="text-xs text-destructive mt-1">{error}</p>
  );
}
