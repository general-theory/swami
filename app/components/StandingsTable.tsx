'use client';
import { useState } from 'react';

interface Column {
  header: string;
  accessor: string;
}

interface Standing {
  id: number;
  league: {
    id: number;
    name: string;
    active: boolean;
  };
  user: {
    displayName: string;
  };
  balance: number;
  minBet: number;
  maxBet: number;
}

interface StandingsTableProps {
  columns: Column[];
  data: Standing[];
}

export default function StandingsTable({ columns, data }: StandingsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const getNestedValue = (obj: Standing, path: string): unknown => {
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  };

  const formatValue = (value: unknown, accessor: string): string => {
    if (typeof value === 'number') {
      const formattedNumber = value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      
      // Add spade symbol to monetary values
      if (['balance', 'minBet', 'maxBet'].includes(accessor)) {
        return `♠${formattedNumber}`;
      }
      
      return formattedNumber;
    }
    return String(value ?? '');
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle numeric values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle string values
    const comparison = String(aValue) < String(bValue) ? -1 : 1;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort(column.accessor)}
              >
                {column.header}
                {sortConfig?.key === column.accessor && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((standing) => (
            <tr key={standing.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.accessor} className="px-6 py-4 whitespace-nowrap">
                  {formatValue(
                    getNestedValue(standing, column.accessor),
                    column.accessor
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 