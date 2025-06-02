import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { RotateCcw, TrendingUp, Users, Star, Phone, Building2, BarChart3, PieChart as PieChartIcon, MessageSquare } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CustomerData } from '@/types';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent-foreground))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))', 'hsl(var(--secondary-foreground))'];

const Dashboard: React.FC = () => {
  const { processedData, setCurrentStep } = useData();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

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

  // Filtered data based on selections
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
    return filtered;
  }, [processedData, selectedRegion, selectedZone, selectedUnit]);

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
  };

  const overallSatisfaction = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((sum, d) => {
      return sum + ((d.ข้อ1 + d.ข้อ2 + d.ข้อ3 + d.ข้อ4 + d.ข้อ5 + d.ข้อ6 + d.ข้อ7) / 7);
    }, 0);
    return Math.round((total / filteredData.length) * 100) / 100;
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-background to-accent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="h-12 w-px bg-border"></div>
              <div className="p-3 rounded-2xl bg-accent/50 border border-accent">
                <BarChart3 className="h-8 w-8 text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
              Dashboard วิเคราะห์ความพึงพอใจลูกค้า
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              ธนาคารออมสิน - วิเคราะห์ข้อมูลการให้บริการและความพึงพอใจ
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentStep('upload')}
            className="flex items-center gap-2 border-border hover:bg-muted/50 shadow-lg"
          >
            <RotateCcw className="h-4 w-4" />
            อัปโหลดข้อมูลใหม่
          </Button>
        </div>

        {/* Premium Filters */}
        <Card className="mb-8 shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              ตัวกรองข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-foreground">ภาค</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="border-border bg-background/50 hover:bg-background/80 transition-colors">
                    <SelectValue placeholder="เลือกภาค" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="all">ทุกภาค</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-3 text-foreground">เขต</label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="border-border bg-background/50 hover:bg-background/80 transition-colors">
                    <SelectValue placeholder="เลือกเขต" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="all">ทุกเขต</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-3 text-foreground">หน่วยให้บริการ</label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="border-border bg-background/50 hover:bg-background/80 transition-colors">
                    <SelectValue placeholder="เลือกหน่วยให้บริการ" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="all">ทุกหน่วย</SelectItem>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={resetFilters} variant="outline" className="w-full border-border hover:bg-muted/50">
                  ล้างตัวกรอง
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-gradient-to-br from-navy-50 to-navy-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl bg-navy-500/10 border border-navy-500/20">
                  <Users className="h-8 w-8 text-navy-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-navy-800">{filteredData.length}</p>
                  <p className="text-navy-600 font-medium">รายการบริการ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-gradient-to-br from-gold-50 to-gold-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/20">
                  <Star className="h-8 w-8 text-gold-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gold-800">{overallSatisfaction}</p>
                  <p className="text-gold-600 font-medium">คะแนนเฉลี่ย</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-primary">{serviceTypeStats.reduce((sum, s) => sum + s.value, 0)}</p>
                  <p className="text-primary/80 font-medium">การใช้บริการรวม</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-gradient-to-br from-destructive/10 to-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
                  <Phone className="h-8 w-8 text-destructive" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-destructive">{callbackRequests.length}</p>
                  <p className="text-destructive/80 font-medium">ขอติดต่อกลับ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl border border-border/50">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger value="satisfaction" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="h-4 w-4" />
              ความพึงพอใจ
            </TabsTrigger>
            <TabsTrigger value="regional" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PieChartIcon className="h-4 w-4" />
              เปรียบเทียบภาค
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
              ความคิดเห็น
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    การใช้บริการแต่ละประเภท
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${value}`}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {serviceTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    คะแนนความพึงพอใจรายด้าน
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={satisfactionStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="satisfaction" className="space-y-6">
            <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-gradient-to-br from-primary/10 to-primary/5">
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
            <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-gradient-to-br from-navy-50 to-navy-100">
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

            <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-gradient-to-br from-navy-50 to-navy-100">
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
              <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
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

              <Card className="shadow-luxury border-border/50 backdrop-blur-sm bg-card/95">
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
