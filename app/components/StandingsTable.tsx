'use client';
import { useState } from 'react';

interface Standing {
  userId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  totalPoints: number;
  wins: number;
  losses: number;
  pushes: number;
  winPercentage: number;
}

interface StandingsTableProps {
  standings: Standing[];
  onEdit: (standing: Standing) => void;
  onDelete: (standing: Standing) => void;
}

export default function StandingsTable({ standings, onEdit, onDelete }: StandingsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const formatValue = (value: any, accessor: string) => {
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
    return value;
  };

  const sortedData = [...standings].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue < bValue ? -1 : 1;
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
            {standings.map((standing) => (
              <th
                key={standing.userId}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort(standing.userId)}
              >
                {standing.firstName} {standing.lastName}
                {sortConfig?.key === standing.userId && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((standing, index) => (
            <tr key={standing.userId} className="hover:bg-gray-50">
              {standings.map((column) => (
                <td key={column.userId} className="px-6 py-4 whitespace-nowrap">
                  {formatValue(
                    column.userId.includes('.')
                      ? getNestedValue(standing, column.userId)
                      : standing[column.userId],
                    column.userId
                  )}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onEdit(standing)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(standing)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 