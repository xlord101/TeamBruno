import { useState, useEffect } from 'react';
import { Activity, RefreshCcw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export const DashboardHeader = ({ onRefresh, isLoading, lastUpdated }: DashboardHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="medical-card p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">LifeFlow Dashboard</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Live Medical Data Portal
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              Current Time: {formatTime(currentTime)}
            </div>
            <div className="text-xs text-muted-foreground">
              Last Updated: {formatLastUpdated(lastUpdated)}
            </div>
          </div>

          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="group hover-lift"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 transition-transform ${
              isLoading ? 'animate-spin' : 'group-hover:rotate-180'
            }`} />
            {isLoading ? 'Updating...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary-light animate-pulse rounded-full"></div>
          </div>
        </div>
      )}
    </header>
  );
};