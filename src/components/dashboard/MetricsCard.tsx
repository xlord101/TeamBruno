import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;

  // Animated count-up effect
  useEffect(() => {
    if (isLoading) return;

    const duration = 800;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = numericValue / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [numericValue, isLoading]);

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
    <div className={`${getCardClass()} p-4 sm:p-5 group relative overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]`}>
      {/* Subtle background icon */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Icon className="h-24 w-24" />
      </div>

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Icon className="h-5 w-5" />
          </div>

          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/20`}>
              <span className={trend.isPositive ? '' : 'rotate-180 inline-block'}>
                ↑
              </span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value section */}
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-medium opacity-80 uppercase tracking-wide">
            {title}
          </h3>

          <div className="metric-value">
            {isLoading ? (
              <div className="h-10 w-20 bg-white/20 rounded animate-pulse" />
            ) : (
              <span className="tabular-nums">{displayValue}</span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm opacity-70 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};