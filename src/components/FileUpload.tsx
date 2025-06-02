
import React, { useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { readExcelFile } from '@/utils/excelUtils';
import { useToast } from '@/hooks/use-toast';

const FileUpload: React.FC = () => {
  const { setRawData, setCurrentStep } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาอัปโหลดไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv)",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = await readExcelFile(file);
      setRawData(data);
      setCurrentStep('validate');
      toast({
        title: "อัปโหลดสำเร็จ",
        description: `อ่านข้อมูลได้ ${data.length} แถว`,
      });
    } catch (error) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอ่านไฟล์ได้",
        variant: "destructive"
      });
    }
  }, [setRawData, setCurrentStep, toast]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileUpload({ target: fileInputRef.current } as any);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            ระบบวิเคราะห์ความพึงพอใจลูกค้า
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            ธนาคารออมสิน - อัปโหลดไฟล์ Excel หรือ CSV เพื่อวิเคราะห์ข้อมูล
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
              <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              อัปโหลดไฟล์ข้อมูล
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              อัปโหลดไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv) ที่มีข้อมูลความพึงพอใจของลูกค้า
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleButtonClick}
            >
              <Upload className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
              <p className="text-lg sm:text-xl text-gray-600 mb-4 px-2">
                ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
              >
                เลือกไฟล์ Excel หรือ CSV
              </Button>
            </div>
            
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-blue-800">ข้อมูลทั่วไป</h3>
                <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                  <li>• ลำดับ, หน่วยให้บริการ, เขต, ภาค</li>
                  <li>• วันที่, เวลา</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-green-800">ประเภทบริการ</h3>
                <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                  <li>• ประเภท1: ฝากถอนเงินฝาก/สลากออมสิน</li>
                  <li>• ประเภท2: ชำระสินเชื่อ/ชำระค่าสินค้าและบริการ</li>
                  <li>• ประเภท3: สมัครใช้บริการ</li>
                  <li>• ประเภท4: สอบถาม/ขอคำปรึกษา</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-purple-800">คะแนนความพึงพอใจ</h3>
                <ul className="text-xs sm:text-sm text-purple-700 space-y-1">
                  <li>• ข้อ1-7: ความพึงพอใจในด้านต่างๆ</li>
                  <li>• การดูแล, คำแนะนำ, ความรวดเร็ว</li>
                  <li>• ความพร้อมเครื่องมือ, ความประทับใจ</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-orange-800">ข้อมูลเพิ่มเติม</h3>
                <ul className="text-xs sm:text-sm text-orange-700 space-y-1">
                  <li>• สรุป, หมายเหตุ (คอมเม้นลูกค้า)</li>
                  <li>• ลูกค้าต้องการให้ติดต่อกลับ</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FileUpload;
