
import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Building2, Database, TrendingUp } from 'lucide-react';
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
      className={`p-4 border border-navy-200 rounded-xl cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md hover:border-primary/50'
      } bg-gradient-to-br from-navy-50 to-navy-100`}
    >
      <div className="font-semibold text-navy-800">{column || `คอลัมน์ ${index + 1}`}</div>
      <div className="text-xs text-navy-600 mt-2 truncate bg-white/50 rounded px-2 py-1">
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
      className={`p-4 border-2 border-dashed rounded-xl transition-all duration-300 min-h-[120px] ${
        isOver
          ? 'border-primary bg-primary/10 scale-105'
          : mappedColumn
          ? 'border-primary/50 bg-gradient-to-br from-gold-50 to-gold-100'
          : isRequired
          ? 'border-destructive/50 bg-destructive/5'
          : 'border-border bg-muted/30'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-foreground">{systemColumn}</div>
        {isRequired && (
          <Badge variant="destructive" className="text-xs font-medium">จำเป็น</Badge>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground mb-3 bg-white/50 rounded p-2">{columnDef.description}</div>
      
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="text-xs border-primary/20 text-primary">
          {columnDef.type}
        </Badge>
        {mappedColumn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(systemColumn)}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {mappedColumn && (
        <div className="mt-3 p-3 bg-white rounded-lg border border-primary/20 shadow-sm">
          <div className="font-medium text-primary text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {mappedColumn}
          </div>
        </div>
      )}
      
      {!mappedColumn && (
        <div className="mt-3 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg py-4">
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
      <div className="min-h-screen bg-gradient-to-br from-navy-50 via-background to-accent p-6">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="h-12 w-px bg-border"></div>
              <div className="p-3 rounded-2xl bg-accent/50 border border-accent">
                <Database className="h-8 w-8 text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
              ตรวจสอบและจับคู่คอลัมน์ข้อมูล
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              ลากและวางคอลัมน์จากไฟล์ Excel ไปยังคอลัมน์ในระบบที่ต้องการ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Excel Columns */}
            <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="w-4 h-4 bg-navy-500 rounded-full"></div>
                  คอลัมน์จากไฟล์ Excel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {availableColumns.map((column, index) => (
                    <ExcelColumn
                      key={index}
                      column={column}
                      index={headers.indexOf(column)}
                      sampleData={sampleData[headers.indexOf(column)]}
                    />
                  ))}
                  {availableColumns.length === 0 && (
                    <div className="text-center text-muted-foreground py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
                      คอลัมน์ทั้งหมดถูกจับคู่แล้ว
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Columns */}
            <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  คอลัมน์ในระบบ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
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
          <Card className="mt-8 shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-3 text-foreground">
                <TrendingUp className="h-6 w-6 text-primary" />
                สรุปการจับคู่คอลัมน์
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {columnMappings.filter(m => m.isValid).length}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">คอลัมน์ที่จับคู่แล้ว</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl border border-destructive/20">
                  <div className="text-3xl font-bold text-destructive mb-2">
                    {columnMappings.filter(m => !m.isValid).length}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">คอลัมน์ที่ยังไม่จับคู่</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-accent to-accent/80 rounded-xl border border-accent-foreground/20">
                  <div className="text-3xl font-bold text-accent-foreground mb-2">
                    {rawData.length - 1}
                  </div>
                  <div className="text-sm text-accent-foreground/80 font-medium">แถวข้อมูล</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                  className="flex items-center gap-2 border-border hover:bg-muted/50"
                >
                  <RotateCcw className="h-4 w-4" />
                  กลับไปอัปโหลดใหม่
                </Button>
                <Button
                  onClick={validateAndProcess}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
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
