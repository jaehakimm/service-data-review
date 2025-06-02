
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LuxuryMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
  };
  className?: string;
  delay?: number;
}

const LuxuryMetricCard: React.FC<LuxuryMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  delay = 0
}) => {
  const getTrendColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card 
      className={cn(
        "luxury-hover luxury-fade-in glass border-border/50",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold luxury-heading">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
              {trend && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs px-2 py-1",
                    getTrendColor(trend.type)
                  )}
                >
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LuxuryMetricCard;
