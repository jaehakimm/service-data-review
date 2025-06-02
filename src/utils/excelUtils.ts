
import * as XLSX from 'xlsx';
import { CustomerData, ColumnMapping } from '@/types';

export const readExcelFile = async (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let jsonData: any[][];
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Handle CSV files
          const csvText = data as string;
          const lines = csvText.split('\n');
          jsonData = lines.map(line => {
            // Simple CSV parsing - handles basic cases
            const cells = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                cells.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            cells.push(current.trim());
            return cells;
          }).filter(row => row.some(cell => cell !== ''));
        } else {
          // Handle Excel files
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }
        
        resolve(jsonData as any[][]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
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
