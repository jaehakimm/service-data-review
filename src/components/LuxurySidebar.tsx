
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Shield,
  CreditCard,
  PieChart,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface LuxurySidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    id: 'satisfaction',
    label: 'Satisfaction',
    icon: BarChart3,
    badge: null,
  },
  {
    id: 'regional',
    label: 'Regional Analysis',
    icon: PieChart,
    badge: null,
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: Users,
    badge: '12',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    badge: null,
  },
  {
    id: 'trends',
    label: 'Trends',
    icon: TrendingUp,
    badge: 'New',
  },
];

const bottomItems = [
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
  },
];

const LuxurySidebar: React.FC<LuxurySidebarProps> = ({ isOpen, activeTab, onTabChange }) => {
  return (
    <aside className={cn(
      "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform bg-card border-r border-border luxury-transition",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "md:relative md:top-0 md:h-screen md:translate-x-0"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-4">
            <div className="pb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Analytics
              </h2>
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 luxury-transition luxury-hover",
                    activeTab === item.id && "bg-primary/10 text-primary border-primary/20"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badge === 'New' ? 'default' : 'secondary'} 
                      className="text-xs px-2 py-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </nav>
        </div>

        <div className="border-t border-border p-4">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              System
            </h2>
            {bottomItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start gap-3 luxury-transition luxury-hover"
                onClick={() => onTabChange(item.id)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LuxurySidebar;
