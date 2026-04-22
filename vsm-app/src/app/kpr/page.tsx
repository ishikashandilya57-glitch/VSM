'use client';

import React from 'react';
import ProductionDashboard from '@/components/ProductionDashboard';

/**
 * Dedicated dashboard page for KPR Factory.
 * Enforces the 'kpr' factory context.
 */
export default function KPRPage() {
  return <ProductionDashboard factory="kpr" />;
}
