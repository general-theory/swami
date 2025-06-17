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
    accessorKey: 'league.name',
    header: 'League',
  },
  {
    accessorKey: 'game',
    header: 'Game',
    cell: ({ row }) => {
      const game = row.original.game;
      return `${game.homeTeam.name} vs ${game.awayTeam.name}`;
    },
  },
  {
    accessorKey: 'pick',
    header: 'Pick',
    cell: ({ row }) => {
      const pick = row.original.pick;
      const game = row.original.game;
      return pick === 'home' ? game.homeTeam.name : game.awayTeam.name;
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      return `$${row.original.amount}`;
    },
  },
  {
    accessorKey: 'won',
    header: 'Won',
    cell: ({ row }) => {
      const won = row.original.won;
      if (won === null) return 'Pending';
      return won ? 'Yes' : 'No';
    },
  },
  {
    accessorKey: 'balanceImpact',
    header: 'Balance Impact',
    cell: ({ row }) => {
      return `$${row.original.balanceImpact}`;
    },
  },
]; 