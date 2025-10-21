import { memo } from 'react';
import { WifiIcon } from '@heroicons/react/24/outline';
import { formatSnapshotTime } from '@/lib/storage';

interface OfflineIndicatorProps {
  timestamp: string;
  className?: string;
}

const OfflineIndicator = memo(function OfflineIndicator({ 
  timestamp, 
  className = '' 
}: OfflineIndicatorProps) {
  return (
    <div className={`flex items-center space-x-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg backdrop-blur-sm ${className}`}>
      <WifiIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
      <div className="text-sm">
        <span className="text-amber-300 font-medium">Offline data</span>
        <span className="text-amber-400 ml-1">
          – last updated at {formatSnapshotTime(timestamp)}
        </span>
      </div>
    </div>
  );
});

export default OfflineIndicator;
