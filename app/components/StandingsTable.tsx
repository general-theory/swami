'use client';
import { useState } from 'react';
import Image from 'next/image';

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
    favTeamId?: string;
    favoriteTeam?: {
      id: string;
      name: string;
      logo: string;
    };
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
  console.log('StandingsTable rendered with:', { columns, dataLength: data.length });
  
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

  const formatValue = (value: unknown, accessor: string, standing?: Standing): React.ReactNode => {
    if (accessor === 'user.displayName') {
      const displayName = String(value ?? '');
      const favoriteTeam = standing?.user.favoriteTeam;
      
      return (
        <div className="flex items-center gap-2">
          <span>{displayName}</span>
          {favoriteTeam && favoriteTeam.logo && (
            <Image
              src={favoriteTeam.logo}
              alt={`${favoriteTeam.name} logo`}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
        </div>
      );
    }
    
    
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

  const getColumnAlignment = (accessor: string): 'left' | 'right' => {
    // Numeric columns should be right-aligned
    if (['balance', 'minBet', 'maxBet'].includes(accessor)) {
      return 'right';
    }
    // Text columns should be left-aligned
    return 'left';
  };

  const getColumnWidth = (accessor: string): string => {
    switch (accessor) {
      case 'league.name':
        return 'w-48'; // Fixed width for league names
      case 'user.displayName':
        return 'w-40'; // Fixed width for user names
      case 'balance':
        return 'w-24'; // Fixed width for balance
      case 'minBet':
        return 'w-24'; // Fixed width for min bet
      case 'maxBet':
        return 'w-24'; // Fixed width for max bet
      default:
        return 'w-auto';
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Fixed Table Header */}
      <div className="sticky top-0 z-50 bg-gray-100">
        <div className="grid grid-cols-5 gap-0">
          {columns.map((column) => {
            const alignment = getColumnAlignment(column.accessor);
            const width = getColumnWidth(column.accessor);
            console.log(`Column ${column.header} (${column.accessor}): ${alignment}`);
            return (
              <div
                key={column.accessor}
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 bg-gray-100 ${width}`}
                style={{ textAlign: alignment }}
                onClick={() => requestSort(column.accessor)}
              >
                {column.header}
                {sortConfig?.key === column.accessor && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Table Body */}
      <div className="overflow-x-auto h-96 overflow-y-auto">
        {sortedData.map((standing) => (
          <div key={standing.id} className="grid grid-cols-5 gap-0 hover:bg-gray-50 border-b border-gray-200">
            {columns.map((column) => {
              const alignment = getColumnAlignment(column.accessor);
              const width = getColumnWidth(column.accessor);
              return (
                <div key={column.accessor} className={`px-6 py-4 whitespace-nowrap ${width}`} style={{ textAlign: alignment }}>
                  {formatValue(
                    getNestedValue(standing, column.accessor),
                    column.accessor,
                    standing
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
} 