import type { GameWithRelations } from '../../admin/games/page';

interface DeleteGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  game: GameWithRelations;
}

export default function DeleteGameModal({ isOpen, onClose, onConfirm, game }: DeleteGameModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium text-white mb-4">Delete Game</h3>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete the game between {game.homeTeam?.name} and {game.awayTeam?.name}?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 