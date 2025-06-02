
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
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream to-luxury-pearl p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-luxury-navy mb-2 sm:mb-4">
            ระบบวิเคราะห์ความพึงพอใจลูกค้า
          </h1>
          <p className="text-lg sm:text-xl text-luxury-slate px-4">
            ธนาคารออมสิน - อัปโหลดไฟล์ Excel หรือ CSV เพื่อวิเคราะห์ข้อมูล
          </p>
        </div>

        <Card className="shadow-luxury border-luxury-platinum bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center p-4 sm:p-6 bg-luxury-gradient rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl text-luxury-navy font-heading">
              <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-luxury-gold" />
              อัปโหลดไฟล์ข้อมูล
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-luxury-slate">
              อัปโหลดไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv) ที่มีข้อมูลความพึงพอใจของลูกค้า
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div
              className="border-2 border-dashed border-luxury-platinum rounded-lg p-6 sm:p-12 text-center hover:border-luxury-gold transition-colors cursor-pointer bg-luxury-pearl/50"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleButtonClick}
            >
              <Upload className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-luxury-gold mb-4" />
              <p className="text-lg sm:text-xl text-luxury-navy mb-4 px-2 font-medium">
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
                className="bg-luxury-gold hover:bg-luxury-gold-dark text-white text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 font-medium shadow-luxury-soft"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
              >
                เลือกไฟล์ Excel หรือ CSV
              </Button>
            </div>
            
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-luxury-navy/10 to-luxury-navy/5 p-4 sm:p-6 rounded-lg border border-luxury-platinum">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-luxury-navy font-heading">ข้อมูลทั่วไป</h3>
                <ul className="text-xs sm:text-sm text-luxury-slate space-y-1">
                  <li>• ลำดับ, หน่วยให้บริการ, เขต, ภาค</li>
                  <li>• วันที่, เวลา</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-luxury-gold/10 to-luxury-gold/5 p-4 sm:p-6 rounded-lg border border-luxury-platinum">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-luxury-navy font-heading">ประเภทบริการ</h3>
                <ul className="text-xs sm:text-sm text-luxury-slate space-y-1">
                  <li>• ประเภท1: ฝากถอนเงินฝาก/สลากออมสิน</li>
                  <li>• ประเภท2: ชำระสินเชื่อ/ชำระค่าสินค้าและบริการ</li>
                  <li>• ประเภท3: สมัครใช้บริการ</li>
                  <li>• ประเภท4: สอบถาม/ขอคำปรึกษา</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-luxury-amber/10 to-luxury-amber/5 p-4 sm:p-6 rounded-lg border border-luxury-platinum">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-luxury-navy font-heading">คะแนนความพึงพอใจ</h3>
                <ul className="text-xs sm:text-sm text-luxury-slate space-y-1">
                  <li>• ข้อ1-7: ความพึงพอใจในด้านต่างๆ</li>
                  <li>• การดูแล, คำแนะนำ, ความรวดเร็ว</li>
                  <li>• ความพร้อมเครื่องมือ, ความประทับใจ</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-luxury-charcoal/10 to-luxury-charcoal/5 p-4 sm:p-6 rounded-lg border border-luxury-platinum">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-luxury-navy font-heading">ข้อมูลเพิ่มเติม</h3>
                <ul className="text-xs sm:text-sm text-luxury-slate space-y-1">
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
