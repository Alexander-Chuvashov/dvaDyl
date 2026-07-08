import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { offlineService } from '../../services/OfflineService';

const NetworkStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            offlineService.syncQueue();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="flex items-center gap-1 text-sm">
            {isOnline ? (
                <Wifi className="w-4 h-4 text-olive" />
            ) : (
                <WifiOff className="w-4 h-4 text-terracotta" />
            )}
            <span className={isOnline ? 'text-olive' : 'text-terracotta'}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
};

export default NetworkStatus;
