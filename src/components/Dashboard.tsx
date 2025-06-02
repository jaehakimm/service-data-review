import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { RotateCcw, TrendingUp, Users, Star, Phone, Eye, Target, Award } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import LuxuryHeader from './LuxuryHeader';
import LuxurySidebar from './LuxurySidebar';
import LuxuryMetricCard from './LuxuryMetricCard';

const COLORS = ['#d4af37', '#f5c842', '#b8941f', '#e6c866', '#8dd1e1', '#d084d0', '#ffb347'];

const Dashboard: React.FC = () => {
  const { processedData, setCurrentStep } = useData();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-luxury-cream">
      <LuxuryHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <LuxurySidebar 
        isOpen={sidebarOpen} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} pt-4`}>
        <div className="px-6 pb-6 max-w-7xl mx-auto">
          {/* Enhanced Filters Section */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-luxury-platinum/30 shadow-luxury-soft animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-luxury-navy font-heading">ตัวกรองข้อมูล</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                  className="flex items-center gap-2 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-300"
                >
                  <RotateCcw className="h-4 w-4" />
                  อัปโหลดข้อมูลใหม่
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-luxury-navy">ภาค</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="border-luxury-platinum/40 focus:border-luxury-gold bg-white/50">
                      <SelectValue placeholder="เลือกภาค" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md border-luxury-platinum/20">
                      <SelectItem value="all">ทุกภาค</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-luxury-navy">เขต</label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="border-luxury-platinum/40 focus:border-luxury-gold bg-white/50">
                      <SelectValue placeholder="เลือกเขต" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md border-luxury-platinum/20">
                      <SelectItem value="all">ทุกเขต</SelectItem>
                      {zones.map(zone => (
                        <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-luxury-navy">หน่วยให้บริการ</label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="border-luxury-platinum/40 focus:border-luxury-gold bg-white/50">
                      <SelectValue placeholder="เลือกหน่วยให้บริการ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md border-luxury-platinum/20">
                      <SelectItem value="all">ทุกหน่วย</SelectItem>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={resetFilters} 
                    variant="outline" 
                    className="w-full border-luxury-platinum/40 hover:bg-luxury-gold/10 hover:border-luxury-gold transition-all duration-300"
                  >
                    ล้างตัวกรอง
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LuxuryMetricCard
              title="รายการบริการทั้งหมด"
              value={filteredData.length.toLocaleString()}
              subtitle="รายการ"
              icon={Eye}
              trend={{ value: 12.5, isPositive: true }}
              delay={0}
            />
            <LuxuryMetricCard
              title="คะแนนความพึงพอใจเฉลี่ย"
              value={overallSatisfaction}
              subtitle="/ 5.0"
              icon={Star}
              trend={{ value: 3.2, isPositive: true }}
              delay={100}
            />
            <LuxuryMetricCard
              title="การใช้บริการรวม"
              value={serviceTypeStats.reduce((sum, s) => sum + s.value, 0).toLocaleString()}
              subtitle="ครั้ง"
              icon={Target}
              trend={{ value: 8.7, isPositive: true }}
              delay={200}
            />
            <LuxuryMetricCard
              title="รายการขอติดต่อกลับ"
              value={callbackRequests.length}
              subtitle="รายการ"
              icon={Phone}
              trend={{ value: 5.3, isPositive: false }}
              delay={300}
            />
          </div>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border border-luxury-platinum/30 p-1 rounded-xl">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-luxury-gold data-[state=active]:text-white transition-all duration-300"
              >
                ภาพรวม
              </TabsTrigger>
              <TabsTrigger 
                value="satisfaction"
                className="data-[state=active]:bg-luxury-gold data-[state=active]:text-white transition-all duration-300"
              >
                ความพึงพอใจ
              </TabsTrigger>
              <TabsTrigger 
                value="regional"
                className="data-[state=active]:bg-luxury-gold data-[state=active]:text-white transition-all duration-300"
              >
                เปรียบเทียบภาค
              </TabsTrigger>
              <TabsTrigger 
                value="feedback"
                className="data-[state=active]:bg-luxury-gold data-[state=active]:text-white transition-all duration-300"
              >
                ความคิดเห็น
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-luxury-platinum/30 shadow-luxury-soft">
                  <CardHeader>
                    <CardTitle className="text-luxury-navy font-heading">การใช้บริการแต่ละประเภท</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={serviceTypeStats} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e2" />
                        <XAxis type="number" stroke="#3f424f" />
                        <YAxis dataKey="name" type="category" width={150} stroke="#3f424f" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e4e2',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                        <Bar dataKey="value" fill="#d4af37" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-luxury-platinum/30 shadow-luxury-soft">
                  <CardHeader>
                    <CardTitle className="text-luxury-navy font-heading">คะแนนความพึงพอใจรายด้าน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={satisfactionStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e2" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#3f424f" />
                        <YAxis domain={[0, 5]} stroke="#3f424f" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e4e2',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                        <Bar dataKey="score" fill="#d4af37" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="satisfaction" className="space-y-6 animate-fade-in">
              <Card className="bg-white/80 backdrop-blur-sm border-luxury-platinum/30 shadow-luxury-soft">
                <CardHeader>
                  <CardTitle className="text-luxury-navy font-heading">รายละเอียดคะแนนความพึงพอใจ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {satisfactionStats.map((stat, index) => (
                      <div key={index} className="p-4 border border-luxury-platinum/30 rounded-lg luxury-gradient">
                        <h4 className="font-medium text-luxury-navy mb-2">{stat.name}</h4>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-luxury-gold">{stat.score}</span>
                          <span className="text-luxury-slate ml-1">/5</span>
                        </div>
                        <div className="w-full bg-luxury-platinum/30 rounded-full h-2 mt-2">
                          <div 
                            className="bg-luxury-gold h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(stat.score / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="regional" className="space-y-6 animate-fade-in">
              <Card className="bg-white/80 backdrop-blur-sm border-luxury-platinum/30 shadow-luxury-soft">
                <CardHeader>
                  <CardTitle className="text-luxury-navy font-heading">เปรียบเทียบผลการให้บริการแต่ละภาค</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={regionalComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e2" />
                      <XAxis dataKey="name" stroke="#3f424f" />
                      <YAxis yAxisId="left" orientation="left" stroke="#3f424f" />
                      <YAxis yAxisId="right" orientation="right" stroke="#3f424f" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e4e2',
                          borderRadius: '8px',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="satisfaction" fill="#d4af37" name="คะแนนเฉลี่ย" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="totalService" fill="#f5c842" name="การใช้บริการรวม" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-luxury-platinum/30 shadow-luxury-soft">
                  <CardHeader>
                    <CardTitle className="text-luxury-navy font-heading">ความคิดเห็นจากลูกค้า</CardTitle>
                    <Badge variant="outline" className="border-luxury-gold text-luxury-gold">{customerFeedback.length} รายการ</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {customerFeedback.map((item, index) => (
                        <div key={index} className="p-3 bg-luxury-cream rounded-lg border border-luxury-platinum/30">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-xs border-luxury-gold/30">
                              {item.หน่วยให้บริการ} - {item.เขต}
                            </Badge>
                            <span className="text-xs text-luxury-slate">{item.วันที่}</span>
                          </div>
                          <p className="text-sm text-luxury-navy">{item.หมายเหตุ}</p>
                        </div>
                      ))}
                      {customerFeedback.length === 0 && (
                        <div className="text-center text-luxury-slate py-8">
                          ไม่มีความคิดเห็นจากลูกค้า
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-luxury-platinum/30 shadow-luxury-soft">
                  <CardHeader>
                    <CardTitle className="text-luxury-navy font-heading">รายการขอติดต่อกลับ</CardTitle>
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
                        <div className="text-center text-luxury-slate py-8">
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
      </main>
    </div>
  );
};

export default Dashboard;
