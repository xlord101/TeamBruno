import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'blood' | 'success' | 'warning';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export const MetricsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  trend,
  isLoading = false,
}: MetricsCardProps) => {
  const getCardClass = () => {
    switch (variant) {
      case 'blood':
        return 'metric-card-blood';
      case 'success':
        return 'metric-card-success';
      case 'warning':
        return 'metric-card-warning';
      default:
        return 'metric-card-primary';
    }
  };

  return (
    <div className={`${getCardClass()} p-6 hover-lift group relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-6 right-6">
          <Icon className="h-16 w-16 opacity-30" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
          
          {trend && (
            <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              variant === 'primary' ? 'bg-white/20' : 'bg-black/10'
            }`}>
              <span className={trend.isPositive ? 'text-green-100' : 'text-red-100'}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium opacity-90">{title}</h3>
          
          <div className={`text-3xl font-bold ${isLoading ? 'pulse-data' : 'data-enter'}`}>
            {isLoading ? (
              <div className="h-8 bg-white/20 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </div>

          {subtitle && (
            <p className="text-sm opacity-75">{subtitle}</p>
          )}
        </div>

        {/* Live indicator */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs opacity-75">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};