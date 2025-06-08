

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { RotateCcw, TrendingUp, Users, Star, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CustomerData } from '@/types';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

const Dashboard: React.FC = () => {
  const { processedData, setCurrentStep } = useData();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Get unique values for filters
  const regions = useMemo(() => {
    const unique = [...new Set(processedData.map(d => d.ภาค).filter(Boolean))];
    return unique.sort();
  }, [processedData]);

  const zones = useMemo(() => {
    let filtered = processedData;
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(d => d.ภาค === selectedRegion);
    }
    const unique = [...new Set(filtered.map(d => d.เขต).filter(Boolean))];
    return unique.sort();
  }, [processedData, selectedRegion]);

  const units = useMemo(() => {
    let filtered = processedData;
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(d => d.ภาค === selectedRegion);
    }
    if (selectedZone !== 'all') {
      filtered = filtered.filter(d => d.เขต === selectedZone);
    }
    const unique = [...new Set(filtered.map(d => d.หน่วยให้บริการ).filter(Boolean))];
    return unique.sort();
  }, [processedData, selectedRegion, selectedZone]);

  // Helper function to parse date strings
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      // Try different date formats
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (dateString.includes('-')) {
        return parseISO(dateString);
      }
      return new Date(dateString);
    } catch {
      return null;
    }
  };

  // Filtered data based on selections including date filter
  const filteredData = useMemo(() => {
    let filtered = processedData;
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(d => d.ภาค === selectedRegion);
    }
    if (selectedZone !== 'all') {
      filtered = filtered.filter(d => d.เขต === selectedZone);
    }
    if (selectedUnit !== 'all') {
      filtered = filtered.filter(d => d.หน่วยให้บริการ === selectedUnit);
    }
    
    // Date filtering
    if (startDate || endDate) {
      filtered = filtered.filter(d => {
        const recordDate = parseDate(d.วันที่);
        if (!recordDate) return false;
        
        let isInRange = true;
        
        if (startDate) {
          isInRange = isInRange && (isAfter(recordDate, startDate) || isEqual(recordDate, startDate));
        }
        
        if (endDate) {
          isInRange = isInRange && (isBefore(recordDate, endDate) || isEqual(recordDate, endDate));
        }
        
        return isInRange;
      });
    }
    
    return filtered;
  }, [processedData, selectedRegion, selectedZone, selectedUnit, startDate, endDate]);

  // Calculate service type statistics
  const serviceTypeStats = useMemo(() => {
    const stats = [
      { name: 'ฝากถอนเงินฝาก/สลากออมสิน', value: filteredData.reduce((sum, d) => sum + (d.ประเภท1 || 0), 0), color: COLORS[0] },
      { name: 'ชำระสินเชื่อ/ชำระค่าสินค้าและบริการ', value: filteredData.reduce((sum, d) => sum + (d.ประเภท2 || 0), 0), color: COLORS[1] },
      { name: 'สมัครใช้บริการ เงินฝาก/สินเชื่อ/MyMo/บัตร/อื่น ๆ', value: filteredData.reduce((sum, d) => sum + (d.ประเภท3 || 0), 0), color: COLORS[2] },
      { name: 'สอบถาม/ขอคำปรึกษา', value: filteredData.reduce((sum, d) => sum + (d.ประเภท4 || 0), 0), color: COLORS[3] }
    ];
    return stats.filter(s => s.value > 0);
  }, [filteredData]);

  // Calculate satisfaction scores
  const satisfactionStats = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    return [
      { name: 'การดูแล เอาใจใส่', score: filteredData.reduce((sum, d) => sum + (d.ข้อ1 || 0), 0) / filteredData.length },
      { name: 'การตอบคำถาม ให้คำแนะนำ', score: filteredData.reduce((sum, d) => sum + (d.ข้อ2 || 0), 0) / filteredData.length },
      { name: 'ความรวดเร็วในการให้บริการ', score: filteredData.reduce((sum, d) => sum + (d.ข้อ3 || 0), 0) / filteredData.length },
      { name: 'ความน่าเชื่อถือ ความเป็นมืออาชีพ', score: filteredData.reduce((sum, d) => sum + (d.ข้อ4 || 0), 0) / filteredData.length },
      { name: 'ความพร้อมของเครื่องมือ', score: filteredData.reduce((sum, d) => sum + (d.ข้อ5 || 0), 0) / filteredData.length },
      { name: 'ความประทับใจในการให้บริการ (1)', score: filteredData.reduce((sum, d) => sum + (d.ข้อ6 || 0), 0) / filteredData.length },
      { name: 'ความประทับใจในการให้บริการ (2)', score: filteredData.reduce((sum, d) => sum + (d.ข้อ7 || 0), 0) / filteredData.length }
    ].map(item => ({ ...item, score: Math.round(item.score * 100) / 100 }));
  }, [filteredData]);

  // Regional comparison
  const regionalComparison = useMemo(() => {
    return regions.map(region => {
      const regionData = processedData.filter(d => d.ภาค === region);
      const avgSatisfaction = regionData.length > 0 
        ? regionData.reduce((sum, d) => sum + (d.ข้อ1 + d.ข้อ2 + d.ข้อ3 + d.ข้อ4 + d.ข้อ5 + d.ข้อ6 + d.ข้อ7) / 7, 0) / regionData.length
        : 0;
      
      return {
        name: region,
        satisfaction: Math.round(avgSatisfaction * 100) / 100,
        totalService: regionData.reduce((sum, d) => sum + (d.ประเภท1 + d.ประเภท2 + d.ประเภท3 + d.ประเภท4), 0),
        units: [...new Set(regionData.map(d => d.หน่วยให้บริการ))].length
      };
    });
  }, [processedData, regions]);

  // Customer feedback and callback requests
  const customerFeedback = useMemo(() => {
    return filteredData.filter(d => d.หมายเหตุ && d.หมายเหตุ.trim() !== '');
  }, [filteredData]);

  const callbackRequests = useMemo(() => {
    return filteredData.filter(d => d.ลูกค้าต้องการให้ติดต่อกลับ && d.ลูกค้าต้องการให้ติดต่อกลับ.trim() !== '');
  }, [filteredData]);

  const resetFilters = () => {
    setSelectedRegion('all');
    setSelectedZone('all');
    setSelectedUnit('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const overallSatisfaction = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((sum, d) => {
      return sum + ((d.ข้อ1 + d.ข้อ2 + d.ข้อ3 + d.ข้อ4 + d.ข้อ5 + d.ข้อ6 + d.ข้อ7) / 7);
    }, 0);
    return Math.round((total / filteredData.length) * 100) / 100;
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard วิเคราะห์ความพึงพอใจลูกค้า
            </h1>
            <p className="text-xl text-gray-600">
              ธนาคารออมสิน - วิเคราะห์ข้อมูลการให้บริการและความพึงพอใจ
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentStep('upload')}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            อัปโหลดข้อมูลใหม่
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>ตัวกรองข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ภาค</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกภาค" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกภาค</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">เขต</label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกเขต" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกเขต</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">หน่วยให้บริการ</label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหน่วยให้บริการ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกหน่วย</SelectItem>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">วันที่เริ่มต้น</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">วันที่สิ้นสุด</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-end">
                <Button onClick={resetFilters} variant="outline" className="w-full">
                  ล้างตัวกรอง
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-12 w-12 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                  <p className="text-gray-600">รายการบริการ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-12 w-12 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{overallSatisfaction}</p>
                  <p className="text-gray-600">คะแนนเฉลี่ย</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-12 w-12 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{serviceTypeStats.reduce((sum, s) => sum + s.value, 0)}</p>
                  <p className="text-gray-600">การใช้บริการรวม</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Phone className="h-12 w-12 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{callbackRequests.length}</p>
                  <p className="text-gray-600">ขอติดต่อกลับ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="satisfaction">ความพึงพอใจ</TabsTrigger>
            <TabsTrigger value="regional">เปรียบเทียบภาค</TabsTrigger>
            <TabsTrigger value="feedback">ความคิดเห็น</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>การใช้บริการแต่ละประเภท</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>คะแนนความพึงพอใจรายด้าน</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60%]">รายการประเมิน</TableHead>
                        <TableHead className="text-center">คะแนน</TableHead>
                        <TableHead className="text-center">เปอร์เซ็นต์</TableHead>
                        <TableHead className="w-[25%]">แถบคะแนน</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {satisfactionStats.map((stat, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-sm">
                            {stat.name}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-bold">
                              {stat.score}/5
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-medium">
                              {Math.round((stat.score / 5) * 100)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${(stat.score / 5) * 100}%` }}
                              ></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="satisfaction" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>รายละเอียดคะแนนความพึงพอใจ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {satisfactionStats.map((stat, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <h4 className="font-medium text-gray-800 mb-2">{stat.name}</h4>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-blue-600">{stat.score}</span>
                        <span className="text-gray-500 ml-1">/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stat.score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>เปรียบเทียบผลการให้บริการแต่ละภาค</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={regionalComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="satisfaction" fill="#8884d8" name="คะแนนเฉลี่ย" />
                    <Bar yAxisId="right" dataKey="totalService" fill="#82ca9d" name="การใช้บริการรวม" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>สรุปข้อมูลแต่ละภาค</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regionalComparison.map((region, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                      <h4 className="font-semibold text-lg text-gray-800 mb-3">{region.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">คะแนนเฉลี่ย:</span>
                          <Badge variant="outline">{region.satisfaction}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">การใช้บริการ:</span>
                          <Badge variant="outline">{region.totalService}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">หน่วยให้บริการ:</span>
                          <Badge variant="outline">{region.units}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>ความคิดเห็นจากลูกค้า</CardTitle>
                  <Badge variant="outline">{customerFeedback.length} รายการ</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {customerFeedback.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.หน่วยให้บริการ} - {item.เขต}
                          </Badge>
                          <span className="text-xs text-gray-500">{item.วันที่}</span>
                        </div>
                        <p className="text-sm text-gray-700">{item.หมายเหตุ}</p>
                      </div>
                    ))}
                    {customerFeedback.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        ไม่มีความคิดเห็นจากลูกค้า
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>รายการขอติดต่อกลับ</CardTitle>
                  <Badge variant="destructive">{callbackRequests.length} รายการ</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {callbackRequests.map((item, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.หน่วยให้บริการ} - {item.เขต}
                          </Badge>
                          <span className="text-xs text-gray-500">{item.วันที่}</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          <Phone className="inline h-4 w-4 mr-1" />
                          {item.ลูกค้าต้องการให้ติดต่อกลับ}
                        </p>
                        {item.หมายเหตุ && (
                          <p className="text-sm text-gray-600 mt-2">
                            หมายเหตุ: {item.หมายเหตุ}
                          </p>
                        )}
                      </div>
                    ))}
                    {callbackRequests.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        ไม่มีรายการขอติดต่อกลับ
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

