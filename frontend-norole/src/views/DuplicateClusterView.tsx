import { InventoryCockpitView } from './InventoryCockpitView';
import type { MaterialRecord, UserProfile } from '../types';

interface DuplicateClusterProps {
  records?: MaterialRecord[];
  currentUser?: UserProfile | null;
  onNavigateTab?: (tab: string) => void;
}

export function DuplicateClusterView({ records, currentUser, onNavigateTab }: DuplicateClusterProps) {
  return (
    <InventoryCockpitView
      records={records}
      currentUser={currentUser}
      onNavigateTab={onNavigateTab}
    />
  );
}

export default DuplicateClusterView;
