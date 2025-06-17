import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Game } from '../../types/game';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface EditGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game?: Game;
  onSuccess: (game: Game) => void;
}

const EditGameModal: React.FC<EditGameModalProps> = ({ open, onOpenChange, game, onSuccess }) => {
  const [formData, setFormData] = useState({
    seasonId: '',
    weekId: '',
    homeId: '',
    awayId: '',
    startDate: '',
    venue: '',
    neutralSite: false,
    active: true,
    completed: false,
    homePoints: '',
    awayPoints: '',
    spread: '',
  });

  useEffect(() => {
    if (game) {
      console.log('Game data:', game);
      const formData = {
        seasonId: game.seasonId.toString(),
        weekId: game.weekId.toString(),
        homeId: game.homeId,
        awayId: game.awayId,
        startDate: new Date(game.startDate).toISOString().split('T')[0],
        venue: game.venue,
        neutralSite: game.neutralSite,
        active: game.active,
        completed: game.completed,
        homePoints: game.homePoints?.toString() || '',
        awayPoints: game.awayPoints?.toString() || '',
        spread: game.spread?.toString() || '',
      };
      console.log('Setting form data:', formData);
      setFormData(formData);
    } else {
      // For new games, set active to false by default
      setFormData({
        seasonId: '',
        weekId: '',
        homeId: '',
        awayId: '',
        startDate: '',
        venue: '',
        neutralSite: false,
        active: false,
        completed: false,
        homePoints: '',
        awayPoints: '',
        spread: '',
      });
    }
  }, [game]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Submitting form data:', formData);
    try {
      const response = await fetch(game ? `/api/admin/games/${game.id}` : '/api/admin/games', {
        method: game ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          seasonId: parseInt(formData.seasonId),
          weekId: parseInt(formData.weekId),
          homePoints: formData.homePoints ? parseInt(formData.homePoints) : null,
          awayPoints: formData.awayPoints ? parseInt(formData.awayPoints) : null,
          spread: formData.spread ? parseFloat(formData.spread) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save game');
      }

      const data = await response.json();
      onSuccess(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {game ? 'Edit Game' : 'Create New Game'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="active" className="text-gray-300">Active</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="active" className="text-gray-300">
                Active
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completed" className="text-gray-300">Completed</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="completed" className="text-gray-300">
                Completed
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neutralSite" className="text-gray-300">Neutral Site</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="neutralSite"
                checked={formData.neutralSite}
                onChange={(e) => setFormData({ ...formData, neutralSite: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="neutralSite" className="text-gray-300">
                Neutral Site
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue" className="text-gray-300">Venue</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homePoints" className="text-gray-300">Home Points</Label>
            <Input
              id="homePoints"
              type="number"
              value={formData.homePoints}
              onChange={(e) => setFormData({ ...formData, homePoints: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="awayPoints" className="text-gray-300">Away Points</Label>
            <Input
              id="awayPoints"
              type="number"
              value={formData.awayPoints}
              onChange={(e) => setFormData({ ...formData, awayPoints: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spread" className="text-gray-300">Spread</Label>
            <Input
              id="spread"
              type="number"
              step="0.5"
              value={formData.spread}
              onChange={(e) => setFormData({ ...formData, spread: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-300 bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {game ? 'Update Game' : 'Create Game'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGameModal; 