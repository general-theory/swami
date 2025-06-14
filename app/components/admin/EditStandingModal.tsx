interface EditStandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (standing: Standing) => void;
  standing: Standing;
} 