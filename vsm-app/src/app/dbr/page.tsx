'use client';

import React from 'react';
import ProductionDashboard from '@/components/ProductionDashboard';

/**
 * Dedicated dashboard page for DBR Factory.
 * Enforces the 'dbr' factory context.
 */
export default function DBRPage() {
  return <ProductionDashboard factory="dbr" />;
}
