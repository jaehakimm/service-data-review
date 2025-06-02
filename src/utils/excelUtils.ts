
import * as XLSX from 'xlsx';
import { CustomerData, ColumnMapping } from '@/types';

export const readExcelFile = async (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(jsonData as any[][]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const validateDataType = (value: any, expectedType: 'number' | 'text' | 'date'): boolean => {
  if (value === null || value === undefined || value === '') return true;
  
  switch (expectedType) {
    case 'number':
      return !isNaN(Number(value));
    case 'date':
      return !isNaN(Date.parse(value));
    case 'text':
      return typeof value === 'string' || typeof value === 'number';
    default:
      return false;
  }
};

export const convertValue = (value: any, expectedType: 'number' | 'text' | 'date'): any => {
  if (value === null || value === undefined || value === '') return '';
  
  switch (expectedType) {
    case 'number':
      return Number(value);
    case 'date':
      return new Date(value).toISOString().split('T')[0];
    case 'text':
      return String(value);
    default:
      return value;
  }
};
