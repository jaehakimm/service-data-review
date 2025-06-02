
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomerData, ColumnMapping } from '@/types';

interface DataContextType {
  rawData: any[][];
  setRawData: (data: any[][]) => void;
  columnMappings: ColumnMapping[];
  setColumnMappings: (mappings: ColumnMapping[]) => void;
  processedData: CustomerData[];
  setProcessedData: (data: CustomerData[]) => void;
  currentStep: 'upload' | 'validate' | 'dashboard';
  setCurrentStep: (step: 'upload' | 'validate' | 'dashboard') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [rawData, setRawData] = useState<any[][]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [processedData, setProcessedData] = useState<CustomerData[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'validate' | 'dashboard'>('upload');

  return (
    <DataContext.Provider value={{
      rawData,
      setRawData,
      columnMappings,
      setColumnMappings,
      processedData,
      setProcessedData,
      currentStep,
      setCurrentStep
    }}>
      {children}
    </DataContext.Provider>
  );
};
