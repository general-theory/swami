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

const MONEY_ACCESSORS = ['balance', 'minBet', 'maxBet'];

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

  const formatMoney = (value: number) =>
    `♠${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

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

  const sortIndicator = (key: string) =>
    sortConfig?.key === key ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <div className="sticky top-0 z-50 bg-gray-100 grid grid-cols-[2fr_2fr_1fr_1fr_1fr]">
          {columns.map((column) => {
            const alignment = MONEY_ACCESSORS.includes(column.accessor) ? 'right' : 'left';
            return (
              <div
                key={column.accessor}
                className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                style={{ textAlign: alignment }}
                onClick={() => requestSort(column.accessor)}
              >
                {column.header}
                {sortIndicator(column.accessor)}
              </div>
            );
          })}
        </div>

        <div className="h-96 overflow-y-auto">
          {sortedData.map((standing) => (
            <div
              key={standing.id}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] hover:bg-gray-50 border-b border-gray-200"
            >
              {columns.map((column) => {
                const alignment = MONEY_ACCESSORS.includes(column.accessor) ? 'right' : 'left';
                const value = getNestedValue(standing, column.accessor);
                return (
                  <div
                    key={column.accessor}
                    className="px-4 py-4 truncate"
                    style={{ textAlign: alignment }}
                  >
                    {column.accessor === 'user.displayName' ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate">{standing.user.displayName}</span>
                        {standing.user.favoriteTeam?.logo && (
                          <Image
                            src={standing.user.favoriteTeam.logo}
                            alt={`${standing.user.favoriteTeam.name} logo`}
                            width={20}
                            height={20}
                            className="rounded-full shrink-0"
                          />
                        )}
                      </div>
                    ) : typeof value === 'number' ? (
                      formatMoney(value)
                    ) : (
                      String(value ?? '')
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden">
        <div className="flex gap-1 overflow-x-auto px-3 py-2 bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
          {columns.map((column) => (
            <button
              key={column.accessor}
              onClick={() => requestSort(column.accessor)}
              className={`whitespace-nowrap px-2 py-1 rounded ${
                sortConfig?.key === column.accessor
                  ? 'bg-gray-300 text-gray-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              {column.header}
              {sortIndicator(column.accessor)}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-200">
          {sortedData.map((standing) => (
            <div key={standing.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                {standing.user.favoriteTeam?.logo && (
                  <Image
                    src={standing.user.favoriteTeam.logo}
                    alt={`${standing.user.favoriteTeam.name} logo`}
                    width={24}
                    height={24}
                    className="rounded-full shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {standing.user.displayName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{standing.league.name}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-gray-900">{formatMoney(standing.balance)}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  Min {formatMoney(standing.minBet)} / Max {formatMoney(standing.maxBet)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
