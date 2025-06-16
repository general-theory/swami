'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../components/ui/use-toast';
import type { WagerWithDetails } from './page';

interface Game {
  id: number;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  season: {
    id: number;
    name: string;
  };
  week: {
    id: number;
    week: number;
  };
}

interface Season {
  id: number;
  name: string;
  active: boolean;
}

interface Week {
  id: number;
  week: number;
  seasonId: number;
  active: boolean;
}

interface League {
  id: number;
  name: string;
}

interface CreateWagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (wager: WagerWithDetails) => void;
  users: { id: number; firstName: string; lastName: string; }[];
  games: Game[];
  leagues: League[];
  wager?: WagerWithDetails;
}

export default function CreateWagerModal({
  open,
  onOpenChange,
  onSuccess,
  users,
  games,
  leagues,
  wager
}: CreateWagerModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [formData, setFormData] = useState({
    userId: '',
    gameId: '',
    leagueId: '',
    pick: '',
    amount: '',
    won: false,
  });

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/admin/seasons');
        if (!response.ok) throw new Error('Failed to fetch seasons');
        const data = await response.json();
        setSeasons(data);
        // Set default season to active season
        const activeSeason = data.find((s: Season) => s.active);
        if (activeSeason) {
          setSelectedSeason(activeSeason.id.toString());
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };

    if (open) {
      fetchSeasons();
    }
  }, [open]);

  useEffect(() => {
    const fetchWeeks = async () => {
      if (!selectedSeason) return;
      try {
        const response = await fetch(`/api/admin/seasons/${selectedSeason}/weeks`);
        if (!response.ok) throw new Error('Failed to fetch weeks');
        const data = await response.json();
        setWeeks(data);
        // Set default week to active week
        const activeWeek = data.find((w: Week) => w.active);
        if (activeWeek) {
          setSelectedWeek(activeWeek.id.toString());
        }
      } catch (error) {
        console.error('Error fetching weeks:', error);
      }
    };

    fetchWeeks();
  }, [selectedSeason]);

  useEffect(() => {
    if (wager) {
      setFormData({
        userId: wager.userId.toString(),
        gameId: wager.gameId.toString(),
        leagueId: wager.leagueId.toString(),
        pick: wager.pick,
        amount: wager.amount.toString(),
        won: wager.won || false,
      });
      // Set season and week based on the wager's game
      const game = games.find(g => g.id === wager.gameId);
      if (game) {
        setSelectedSeason(game.season.id.toString());
        setSelectedWeek(game.week.id.toString());
      }
    }
  }, [wager, games]);

  const filteredGames = games.filter(game => {
    if (!selectedSeason || !selectedWeek) return false;
    return game.season.id.toString() === selectedSeason && 
           game.week.id.toString() === selectedWeek;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(wager ? `/api/admin/wagers/${wager.id}` : '/api/admin/wagers', {
        method: wager ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: wager?.id,
          won: formData.won.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save wager');
      }

      const data = await response.json();
      onSuccess(data);
      onOpenChange(false);
      toast({
        title: wager ? 'Wager updated' : 'Wager created',
        description: wager ? 'The wager has been updated successfully.' : 'The wager has been created successfully.',
      });
    } catch (error) {
      console.error('Error saving wager:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save wager. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatGameLabel = (game: Game) => {
    return `${game.homeTeam.name} vs ${game.awayTeam.name}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {wager ? 'Edit Wager' : 'Create New Wager'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-gray-300">User</Label>
            <Select
              value={formData.userId}
              onValueChange={(value: string) => setFormData({ ...formData, userId: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 max-h-[200px] overflow-y-auto">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()} className="text-white hover:bg-gray-600">
                    {`${user.firstName} ${user.lastName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leagueId" className="text-gray-300">League</Label>
            <Select
              value={formData.leagueId}
              onValueChange={(value: string) => setFormData({ ...formData, leagueId: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 max-h-[200px] overflow-y-auto">
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id.toString()} className="text-white hover:bg-gray-600">
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="season" className="text-gray-300">Season</Label>
            <Select
              value={selectedSeason}
              onValueChange={setSelectedSeason}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 max-h-[200px] overflow-y-auto">
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.id.toString()} className="text-white hover:bg-gray-600">
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="week" className="text-gray-300">Week</Label>
            <Select
              value={selectedWeek}
              onValueChange={setSelectedWeek}
              disabled={!selectedSeason}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 max-h-[200px] overflow-y-auto">
                {weeks.map((week) => (
                  <SelectItem key={week.id} value={week.id.toString()} className="text-white hover:bg-gray-600">
                    Week {week.week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameId" className="text-gray-300">Game</Label>
            <Select
              value={formData.gameId}
              onValueChange={(value: string) => setFormData({ ...formData, gameId: value })}
              disabled={!selectedSeason || !selectedWeek}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 max-h-[200px] overflow-y-auto">
                {filteredGames.map((game) => (
                  <SelectItem key={game.id} value={game.id.toString()} className="text-white hover:bg-gray-600">
                    {formatGameLabel(game)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pick" className="text-gray-300">Pick</Label>
            <Select
              value={formData.pick}
              onValueChange={(value: string) => setFormData({ ...formData, pick: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select pick" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="home" className="text-white hover:bg-gray-600">Home</SelectItem>
                <SelectItem value="away" className="text-white hover:bg-gray-600">Away</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {wager && (
            <div className="space-y-2">
              <Label htmlFor="won" className="text-gray-300">Won</Label>
              <Select
                value={formData.won.toString()}
                onValueChange={(value: string) => setFormData({ ...formData, won: value === 'true' })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="true" className="text-white hover:bg-gray-600">Yes</SelectItem>
                  <SelectItem value="false" className="text-white hover:bg-gray-600">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-gray-300 bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (wager ? 'Updating...' : 'Creating...') : (wager ? 'Update Wager' : 'Create Wager')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 