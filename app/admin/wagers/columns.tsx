import { ColumnDef, Row } from '@tanstack/react-table';
import { WagerWithDetails } from './page';

export const columns: ColumnDef<WagerWithDetails>[] = [
  {
    accessorKey: 'game.season.name',
    header: 'Season',
  },
  {
    accessorKey: 'game.week.week',
    header: 'Week',
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }: { row: Row<WagerWithDetails> }) => {
      const user = row.original.user;
      return `${user.firstName} ${user.lastName}`;
    },
  },
  {
    accessorKey: 'game.homeTeam.name',
    header: 'Game',
  },
  {
    accessorKey: 'pick',
    header: 'Pick',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
  {
    accessorKey: 'won',
    header: 'Won',
  },
  {
    accessorKey: 'balanceImpact',
    header: 'Balance Impact',
  },
]; 