
import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { COLUMN_DEFINITIONS, ColumnMapping, CustomerData } from '@/types';
import { validateDataType, convertValue } from '@/utils/excelUtils';
import { useToast } from '@/hooks/use-toast';

const ItemType = 'COLUMN';

interface DragItem {
  type: string;
  column: string;
  systemColumn?: keyof CustomerData;
}

interface ExcelColumnProps {
  column: string;
  index: number;
  sampleData: string;
}

const ExcelColumn: React.FC<ExcelColumnProps> = ({ column, index, sampleData }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { type: ItemType, column, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'
      } bg-blue-50 border-blue-200`}
    >
      <div className="font-medium text-blue-800">{column || `คอลัมน์ ${index + 1}`}</div>
      <div className="text-xs text-blue-600 mt-1 truncate">
        ตัวอย่าง: {sampleData || 'ไม่มีข้อมูล'}
      </div>
    </div>
  );
};

interface SystemColumnProps {
  systemColumn: keyof CustomerData;
  mappedColumn?: string;
  onDrop: (column: string, systemColumn: keyof CustomerData) => void;
  onRemove: (systemColumn: keyof CustomerData) => void;
}

const SystemColumn: React.FC<SystemColumnProps> = ({ systemColumn, mappedColumn, onDrop, onRemove }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item: DragItem) => onDrop(item.column, systemColumn),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const columnDef = COLUMN_DEFINITIONS[systemColumn];
  const isRequired = ['ลำดับ', 'หน่วยให้บริการ', 'เขต', 'ภาค'].includes(systemColumn);

  return (
    <div
      ref={drop}
      className={`p-4 border-2 border-dashed rounded-lg transition-all min-h-[100px] ${
        isOver
          ? 'border-green-400 bg-green-50'
          : mappedColumn
          ? 'border-green-300 bg-green-50'
          : isRequired
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-gray-800">{systemColumn}</div>
        {isRequired && (
          <Badge variant="destructive" className="text-xs">จำเป็น</Badge>
        )}
      </div>
      
      <div className="text-xs text-gray-600 mb-2">{columnDef.description}</div>
      
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {columnDef.type}
        </Badge>
        {mappedColumn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(systemColumn)}
            className="text-red-600 hover:text-red-800"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {mappedColumn && (
        <div className="mt-2 p-2 bg-white rounded border">
          <div className="font-medium text-green-700">{mappedColumn}</div>
        </div>
      )}
      
      {!mappedColumn && (
        <div className="mt-2 text-center text-gray-500 text-sm">
          ลากคอลัมน์มาวางที่นี่
        </div>
      )}
    </div>
  );
};

const DataValidation: React.FC = () => {
  const { rawData, columnMappings, setColumnMappings, setProcessedData, setCurrentStep } = useData();
  const { toast } = useToast();
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[]>([]);

  useEffect(() => {
    if (rawData && rawData.length > 0) {
      const headerRow = rawData[0] || [];
      const sampleRow = rawData[1] || [];
      setHeaders(headerRow);
      setSampleData(sampleRow);
      
      // Auto-map columns based on similar names
      const autoMappings: ColumnMapping[] = Object.keys(COLUMN_DEFINITIONS).map(systemColumn => {
        const excelColumnIndex = headerRow.findIndex((header: string) => 
          header && header.toString().includes(systemColumn)
        );
        
        return {
          excelColumn: excelColumnIndex >= 0 ? headerRow[excelColumnIndex] : '',
          systemColumn: systemColumn as keyof CustomerData,
          type: COLUMN_DEFINITIONS[systemColumn as keyof typeof COLUMN_DEFINITIONS].type as 'number' | 'text' | 'date',
          isValid: excelColumnIndex >= 0
        };
      });
      
      setColumnMappings(autoMappings);
    }
  }, [rawData, setColumnMappings]);

  const handleDrop = (excelColumn: string, systemColumn: keyof CustomerData) => {
    const updatedMappings = columnMappings.map(mapping => {
      if (mapping.systemColumn === systemColumn) {
        return {
          ...mapping,
          excelColumn,
          isValid: true
        };
      }
      // Remove the column from other mappings
      if (mapping.excelColumn === excelColumn) {
        return {
          ...mapping,
          excelColumn: '',
          isValid: false
        };
      }
      return mapping;
    });
    
    setColumnMappings(updatedMappings);
  };

  const handleRemove = (systemColumn: keyof CustomerData) => {
    const updatedMappings = columnMappings.map(mapping => {
      if (mapping.systemColumn === systemColumn) {
        return {
          ...mapping,
          excelColumn: '',
          isValid: false
        };
      }
      return mapping;
    });
    
    setColumnMappings(updatedMappings);
  };

  const validateAndProcess = () => {
    const requiredColumns = ['ลำดับ', 'หน่วยให้บริการ', 'เขต', 'ภาค'];
    const missingRequired = requiredColumns.filter(col => 
      !columnMappings.find(m => m.systemColumn === col && m.isValid)
    );

    if (missingRequired.length > 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: `กรุณาระบุคอลัมน์ที่จำเป็น: ${missingRequired.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Process data
    const processedData: CustomerData[] = rawData.slice(1).map((row, index) => {
      const dataRow: any = {
        id: `row-${index + 1}`
      };

      columnMappings.forEach(mapping => {
        if (mapping.isValid && mapping.excelColumn) {
          const excelColumnIndex = headers.indexOf(mapping.excelColumn);
          if (excelColumnIndex >= 0) {
            const rawValue = row[excelColumnIndex];
            dataRow[mapping.systemColumn] = convertValue(rawValue, mapping.type);
          }
        }
      });

      return dataRow as CustomerData;
    }).filter(row => row.ลำดับ); // Filter out empty rows

    setProcessedData(processedData);
    setCurrentStep('dashboard');
    
    toast({
      title: "ประมวลผลสำเร็จ",
      description: `ประมวลผลข้อมูลได้ ${processedData.length} รายการ`,
    });
  };

  const usedColumns = columnMappings
    .filter(m => m.isValid && m.excelColumn)
    .map(m => m.excelColumn);

  const availableColumns = headers.filter(header => !usedColumns.includes(header));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ตรวจสอบและจับคู่คอลัมน์ข้อมูล
            </h1>
            <p className="text-xl text-gray-600">
              ลากและวางคอลัมน์จากไฟล์ Excel ไปยังคอลัมน์ในระบบที่ต้องการ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Excel Columns */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  คอลัมน์จากไฟล์ Excel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {availableColumns.map((column, index) => (
                    <ExcelColumn
                      key={index}
                      column={column}
                      index={headers.indexOf(column)}
                      sampleData={sampleData[headers.indexOf(column)]}
                    />
                  ))}
                  {availableColumns.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      คอลัมน์ทั้งหมดถูกจับคู่แล้ว
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Columns */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  คอลัมน์ในระบบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {columnMappings.map((mapping) => (
                    <SystemColumn
                      key={mapping.systemColumn}
                      systemColumn={mapping.systemColumn}
                      mappedColumn={mapping.isValid ? mapping.excelColumn : undefined}
                      onDrop={handleDrop}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Summary */}
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle>สรุปการจับคู่คอลัมน์</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {columnMappings.filter(m => m.isValid).length}
                  </div>
                  <div className="text-sm text-gray-600">คอลัมน์ที่จับคู่แล้ว</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {columnMappings.filter(m => !m.isValid).length}
                  </div>
                  <div className="text-sm text-gray-600">คอลัมน์ที่ยังไม่จับคู่</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {rawData.length - 1}
                  </div>
                  <div className="text-sm text-gray-600">แถวข้อมูล</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  กลับไปอัปโหลดใหม่
                </Button>
                <Button
                  onClick={validateAndProcess}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  disabled={columnMappings.filter(m => m.isValid).length === 0}
                >
                  <ArrowRight className="h-4 w-4" />
                  ดำเนินการต่อไป Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
};

export default DataValidation;
