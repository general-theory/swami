import type { GameWithRelations } from './page';

export interface Column<T> {
  header: string;
  accessor?: string;
  accessorKey?: string;
  cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
}

export const columns: Column<GameWithRelations>[] = [
  {
    accessorKey: 'season',
    header: 'Season',
    cell: ({ row }) => row.original.season?.name || '',
  },
  {
    accessorKey: 'week',
    header: 'Week',
    cell: ({ row }) => row.original.week?.week || '',
  },
  {
    accessorKey: 'homeTeam',
    header: 'Home Team',
    cell: ({ row }) => row.original.homeTeam?.name || '',
  },
  {
    accessorKey: 'awayTeam',
    header: 'Away Team',
    cell: ({ row }) => row.original.awayTeam?.name || '',
  },
  {
    accessorKey: 'spread',
    header: 'Spread',
    cell: ({ row }) => {
      const spread = row.original.spread;
      if (spread === null) return '';
      return spread > 0 ? `+${spread}` : spread.toString();
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
  },
  {
    accessorKey: 'venue',
    header: 'Venue',
  },
  {
    accessorKey: 'neutralSite',
    header: 'Neutral Site',
    cell: ({ row }) => row.original.neutralSite ? 'Yes' : 'No',
  },
  {
    accessorKey: 'active',
    header: 'Active',
    cell: ({ row }) => row.original.active ? 'Yes' : 'No',
  },
  {
    accessorKey: 'completed',
    header: 'Status',
    cell: ({ row }) => row.original.completed ? 'Completed' : 'Pending',
  },
  {
    accessorKey: 'homePoints',
    header: 'Home Points',
  },
  {
    accessorKey: 'awayPoints',
    header: 'Away Points',
  },
]; 