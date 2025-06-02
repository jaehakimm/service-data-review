
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LuxuryMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
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
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden bg-white/70 backdrop-blur-sm border-luxury-platinum/30 hover:border-luxury-gold/40 transition-all duration-300 hover:shadow-luxury-soft animate-scale-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 luxury-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl bg-luxury-gold/10 text-luxury-gold transition-all duration-300",
              "group-hover:bg-luxury-gold group-hover:text-white group-hover:scale-110"
            )}>
              <Icon className="h-6 w-6" />
            </div>
            
            {trend && (
              <div className={cn(
                "flex items-center text-sm font-medium px-2 py-1 rounded-full",
                trend.isPositive 
                  ? "text-green-600 bg-green-50" 
                  : "text-red-600 bg-red-50"
              )}>
                <span className="mr-1">{trend.isPositive ? '↗' : '↘'}</span>
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-luxury-slate group-hover:text-luxury-navy transition-colors">
              {title}
            </h3>
            
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-luxury-navy group-hover:text-gradient transition-all duration-300">
                {value}
              </span>
              {subtitle && (
                <span className="text-sm text-luxury-slate">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Subtle animation lines */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </CardContent>
    </Card>
  );
};

export default LuxuryMetricCard;
