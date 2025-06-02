
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, User, Search, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface LuxuryHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const LuxuryHeader: React.FC<LuxuryHeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="luxury-transition hover:bg-accent/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">GSB</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold luxury-heading">
                Government Savings Bank
              </h1>
              <p className="text-xs text-muted-foreground">
                Customer Satisfaction Analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 luxury-transition"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="luxury-transition hover:bg-accent/10"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <div className="relative">
            <Button variant="ghost" size="sm" className="luxury-transition hover:bg-accent/10">
              <Bell className="h-5 w-5" />
            </Button>
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              3
            </Badge>
          </div>

          <Button variant="ghost" size="sm" className="luxury-transition hover:bg-accent/10">
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">administrator</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LuxuryHeader;
