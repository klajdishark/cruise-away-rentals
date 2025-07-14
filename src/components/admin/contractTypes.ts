export interface ContractVersion {
  id: string;
  name: string;
  created_at: string;
  is_current_version?: boolean;
}

export interface VersionsModalProps {
  isOpen: boolean;
  templateId: string | null;
  onClose: () => void;
}
