
import React from 'react';
import { DataProvider, useData } from '@/contexts/DataContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import FileUpload from '@/components/FileUpload';
import DataValidation from '@/components/DataValidation';
import Dashboard from '@/components/Dashboard';

const MainContent: React.FC = () => {
  const { currentStep } = useData();

  switch (currentStep) {
    case 'upload':
      return <FileUpload />;
    case 'validate':
      return <DataValidation />;
    case 'dashboard':
      return <Dashboard />;
    default:
      return <FileUpload />;
  }
};

const Index: React.FC = () => {
  return (
    <DataProvider>
      <div className="w-full">
        <div className="flex items-center gap-2 p-3 sm:p-4 border-b bg-background">
          <SidebarTrigger className="h-6 w-6 sm:h-8 sm:w-8" />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">ระบบวิเคราะห์ข้อมูล</h1>
        </div>
        <div className="w-full">
          <MainContent />
        </div>
      </div>
    </DataProvider>
  );
};

export default Index;
