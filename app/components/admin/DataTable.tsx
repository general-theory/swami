'use client';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';

interface Column<T> {
  header: string;
  accessor?: string;
  accessorKey?: string;
  cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  // isDeleteModalOpen?: boolean;
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
}

export default function DataTable<T>({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  // isDeleteModalOpen,
  onDeleteConfirm,
  onDeleteCancel
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [deleteItem, setDeleteItem] = useState<T | null>(null);

  useEffect(() => {
    console.log('DataTable received data:', data);
    console.log('DataTable received columns:', columns);
  }, [data, columns]);

  const getNestedValue = (obj: Record<string, unknown> | undefined, path: string): unknown => {
    if (!path) return undefined;
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (typeof current !== 'object' || current === null) return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  };

  const formatValue = (value: unknown): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = getNestedValue(a as Record<string, unknown>, sortConfig.key);
    const bValue = getNestedValue(b as Record<string, unknown>, sortConfig.key);

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const aString = String(aValue);
    const bString = String(bValue);

    if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = (item: T) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = () => {
    if (deleteItem && onDelete) {
      onDelete(deleteItem);
    }
    if (onDeleteConfirm) {
      onDeleteConfirm();
    }
    setDeleteItem(null);
  };

  const handleDeleteCancel = () => {
    if (onDeleteCancel) {
      onDeleteCancel();
    }
    setDeleteItem(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                onClick={() => requestSort(column.accessorKey || '')}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {sortConfig?.key === column.accessorKey && sortConfig?.direction && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, rowIndex) => {
            console.log('Rendering row:', rowIndex, item);
            return (
              <tr
                key={rowIndex}
                className={cn(
                  'border-b border-gray-700 transition-colors hover:bg-gray-700 data-[state=selected]:bg-gray-700',
                  rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'
                )}
              >
                {columns.map((column, colIndex) => {
                  let value: React.ReactNode;
                  if (column.cell) {
                    value = column.cell({ row: { original: item } });
                  } else if (column.accessorKey) {
                    const rawValue = getNestedValue(item as Record<string, unknown>, column.accessorKey);
                    console.log('Column:', column.header, 'Value:', rawValue, 'Path:', column.accessorKey);
                    value = formatValue(rawValue);
                  }
                  return (
                    <td key={`${rowIndex}-${colIndex}`} className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {value}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Dialog open={!!deleteItem} onOpenChange={() => {
        if (onDeleteCancel) {
          onDeleteCancel();
        }
        setDeleteItem(null);
      }}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Confirm Delete</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              className="text-gray-300 bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 