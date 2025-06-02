
import React from 'react';
import { DataProvider, useData } from '@/contexts/DataContext';
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
      <MainContent />
    </DataProvider>
  );
};

export default Index;
