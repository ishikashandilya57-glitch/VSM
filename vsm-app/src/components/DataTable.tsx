'use client';

import React from 'react';

interface DataTableProps {
  columns: {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export default function DataTable({ columns, data, onRowClick }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-primary-100 shadow-sm">
      <table className="w-full">
        <thead className="bg-primary-50">
          <tr className="border-b border-primary-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-4 text-xs font-bold text-primary-800 uppercase tracking-wider ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-100 bg-white">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-primary-50 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-5 py-4 text-sm font-medium text-primary-950 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
