
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
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">ระบบวิเคราะห์ข้อมูล</h1>
        </div>
        <MainContent />
      </div>
    </DataProvider>
  );
};

export default Index;
