
import React from 'react';
import { BarChart3, Users, TrendingUp, FileText, Settings, Home, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  badge?: number;
}

interface LuxurySidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'ภาพรวม', icon: Home },
  { id: 'satisfaction', label: 'ความพึงพอใจ', icon: Star },
  { id: 'regional', label: 'เปรียบเทียบภาค', icon: BarChart3 },
  { id: 'feedback', label: 'ความคิดเห็น', icon: FileText, badge: 5 },
  { id: 'analytics', label: 'การวิเคราะห์', icon: TrendingUp },
  { id: 'customers', label: 'ลูกค้า', icon: Users },
  { id: 'callbacks', label: 'ติดต่อกลับ', icon: Phone, badge: 3 },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings },
];

const LuxurySidebar: React.FC<LuxurySidebarProps> = ({ isOpen, activeTab, onTabChange }) => {
  return (
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-luxury-navy border-r border-luxury-charcoal transition-all duration-300 z-40",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {sidebarItems.map((item, index) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full justify-start text-left transition-all duration-200 animate-slide-in group relative overflow-hidden",
                "hover:bg-luxury-gold/10 hover:text-luxury-gold",
                activeTab === item.id 
                  ? "bg-luxury-gold/20 text-luxury-gold border-r-2 border-luxury-gold shadow-lg" 
                  : "text-luxury-cream hover:text-luxury-gold",
                !isOpen && "justify-center px-2"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background shimmer effect on hover */}
              <div className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
              
              <item.icon className={cn("h-5 w-5 relative z-10", !isOpen && "mx-auto")} />
              
              {isOpen && (
                <>
                  <span className="ml-3 relative z-10">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-luxury-amber text-luxury-navy text-xs px-2 py-1 rounded-full font-medium relative z-10">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-luxury-charcoal">
          {isOpen ? (
            <div className="text-center text-luxury-cream/70 text-xs animate-fade-in">
              <p className="font-medium">ระบบวิเคราะห์ลูกค้า</p>
              <p>เวอร์ชัน 2.1.0</p>
            </div>
          ) : (
            <div className="w-8 h-8 bg-luxury-gold/20 rounded-lg mx-auto flex items-center justify-center">
              <div className="w-3 h-3 bg-luxury-gold rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LuxurySidebar;
