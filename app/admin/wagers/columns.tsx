import { WagerWithDetails } from './page';

export interface Column<T> {
  header: string;
  accessor?: string;
  accessorKey?: string;
  cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
}

export const columns: Column<WagerWithDetails>[] = [
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
    cell: ({ row }) => {
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