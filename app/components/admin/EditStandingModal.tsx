interface Standing {
  id: number;
  teamId: number;
  leagueId: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

interface EditStandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (standing: Standing) => void;
  standing: Standing;
}

export default function EditStandingModal({ isOpen, onClose, onSave, standing }: EditStandingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Standing</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(standing);
        }}>
          <div className="space-y-4">
            {/* Add your form fields here */}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 