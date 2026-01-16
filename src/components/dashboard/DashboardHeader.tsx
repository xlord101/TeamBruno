import { useState, useEffect } from 'react';
import { Activity, RefreshCcw, Clock } from 'lucide-react';
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
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="fade-in mb-6 sm:mb-8">
      {/* Main header container */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl shrink-0">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                LifeFlow Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Blood Bank Management System
              </p>
            </div>
          </div>

          {/* Right side - Time and refresh */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
            {/* Time display */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <div className="text-right">
                <div className="font-semibold text-foreground tabular-nums">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden sm:block h-10 w-px bg-border" />

            {/* Refresh button */}
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant="outline"
              size="default"
              className="gap-2 touch-target btn-hover shrink-0"
            >
              <RefreshCcw className={`h-4 w-4 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''
                }`} />
              <span className="hidden sm:inline">
                {isLoading ? 'Syncing...' : 'Sync'}
              </span>
            </Button>
          </div>
        </div>

        {/* Last updated info - subtle */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-warning animate-pulse' : 'bg-success'}`} />
            <span>{isLoading ? 'Syncing data...' : 'Connected'}</span>
          </div>
          <span>Last sync: {formatLastUpdated(lastUpdated)}</span>
        </div>
      </div>

      {/* Loading progress bar */}
      {isLoading && (
        <div className="mt-2 h-0.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-primary rounded-full animate-[shimmer_1s_ease-in-out_infinite]"
            style={{
              animation: 'shimmer 1s ease-in-out infinite',
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-light)), hsl(var(--primary)))',
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      )}
    </header>
  );
};