
import React, { useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Upload, FileSpreadsheet, Shield, BarChart3, CreditCard } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-background to-accent p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Premium Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div className="p-3 rounded-2xl bg-accent/50 border border-accent">
              <BarChart3 className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4 tracking-tight">
            ระบบวิเคราะห์ความพึงพอใจลูกค้า
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground px-4 font-medium">
            ธนาคารออมสิน - อัปโหลดไฟล์ Excel หรือ CSV เพื่อวิเคราะห์ข้อมูล
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">ความปลอดภัยระดับธนาคาร</span>
          </div>
        </div>

        <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center p-4 sm:p-6 border-b border-border/50">
            <CardTitle className="flex items-center justify-center gap-3 text-xl sm:text-2xl text-foreground">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              อัปโหลดไฟล์ข้อมูล
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground mt-2">
              อัปโหลดไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv) ที่มีข้อมูลความพึงพอใจของลูกค้า
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 sm:p-12 text-center transition-all duration-300 cursor-pointer bg-gradient-to-br from-card to-muted/30 hover:from-primary/5 hover:to-accent/10"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleButtonClick}
            >
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 w-fit mx-auto mb-6">
                <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
              </div>
              <p className="text-lg sm:text-xl text-foreground mb-4 px-2 font-medium">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                เลือกไฟล์ Excel หรือ CSV
              </Button>
            </div>
            
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-navy-50 to-navy-100 border border-navy-200 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-navy-800">ข้อมูลทั่วไป</h3>
                <ul className="text-xs sm:text-sm text-navy-700 space-y-1">
                  <li>• ลำดับ, หน่วยให้บริการ, เขต, ภาค</li>
                  <li>• วันที่, เวลา</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gold-50 to-gold-100 border border-gold-200 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gold-800">ประเภทบริการ</h3>
                <ul className="text-xs sm:text-sm text-gold-700 space-y-1">
                  <li>• ประเภท1: ฝากถอนเงินฝาก/สลากออมสิน</li>
                  <li>• ประเภท2: ชำระสินเชื่อ/ชำระค่าสินค้าและบริการ</li>
                  <li>• ประเภท3: สมัครใช้บริการ</li>
                  <li>• ประเภท4: สอบถาม/ขอคำปรึกษา</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-accent to-accent/80 border border-accent-foreground/20 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-accent-foreground">คะแนนความพึงพอใจ</h3>
                <ul className="text-xs sm:text-sm text-accent-foreground/80 space-y-1">
                  <li>• ข้อ1-7: ความพึงพอใจในด้านต่างๆ</li>
                  <li>• การดูแล, คำแนะนำ, ความรวดเร็ว</li>
                  <li>• ความพร้อมเครื่องมือ, ความประทับใจ</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-muted to-muted/60 border border-border p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-foreground">ข้อมูลเพิ่มเติม</h3>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
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
