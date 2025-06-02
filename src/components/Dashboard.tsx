import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { RotateCcw, TrendingUp, Users, Star, Phone, Award, Target, Activity, BarChart3 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CustomerData } from '@/types';

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#84CC16'];

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

  // Calculate service type statistics with better formatting
  const serviceTypeStats = useMemo(() => {
    const stats = [
      { 
        name: 'ฝากถอนเงินฝาก/สลากออมสิน', 
        shortName: 'ฝากถอน',
        value: filteredData.reduce((sum, d) => sum + (d.ประเภท1 || 0), 0), 
        color: COLORS[0],
        percentage: 0
      },
      { 
        name: 'ชำระสินเชื่อ/ชำระค่าสินค้าและบริการ', 
        shortName: 'ชำระสินเชื่อ',
        value: filteredData.reduce((sum, d) => sum + (d.ประเภท2 || 0), 0), 
        color: COLORS[1],
        percentage: 0
      },
      { 
        name: 'สมัครใช้บริการ เงินฝาก/สินเชื่อ/MyMo/บัตร/อื่น ๆ', 
        shortName: 'สมัครบริการ',
        value: filteredData.reduce((sum, d) => sum + (d.ประเภท3 || 0), 0), 
        color: COLORS[2],
        percentage: 0
      },
      { 
        name: 'สอบถาม/ขอคำปรึกษา', 
        shortName: 'คำปรึกษา',
        value: filteredData.reduce((sum, d) => sum + (d.ประเภท4 || 0), 0), 
        color: COLORS[3],
        percentage: 0
      }
    ];
    
    const total = stats.reduce((sum, s) => sum + s.value, 0);
    return stats.map(stat => ({
      ...stat,
      percentage: total > 0 ? Math.round((stat.value / total) * 100) : 0
    })).filter(s => s.value > 0);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with enhanced styling */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 animate-fade-in">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              Dashboard วิเคราะห์ความพึงพอใจ
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">
              ธนาคารออมสิน - ระบบวิเคราะห์ข้อมูลการให้บริการ
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentStep('upload')}
            className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl px-6 py-3"
          >
            <RotateCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
            อัปโหลดข้อมูลใหม่
          </Button>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 shadow-xl bg-white/70 backdrop-blur-sm border-0 animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-6 w-6" />
              ตัวกรองข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">ภาค</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-purple-400 transition-colors duration-200">
                    <SelectValue placeholder="เลือกภาค" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200">
                    <SelectItem value="all">ทุกภาค</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">เขต</label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-purple-400 transition-colors duration-200">
                    <SelectValue placeholder="เลือกเขต" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200">
                    <SelectItem value="all">ทุกเขต</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">หน่วยให้บริการ</label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-purple-400 transition-colors duration-200">
                    <SelectValue placeholder="เลือกหน่วยให้บริการ" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200">
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
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  ล้างตัวกรอง
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{filteredData.length.toLocaleString()}</p>
                  <p className="text-blue-100 font-medium">รายการบริการ</p>
                </div>
                <Users className="h-12 w-12 text-blue-200 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-slide-in-right" style={{animationDelay: '0.1s'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{overallSatisfaction}</p>
                  <p className="text-amber-100 font-medium">คะแนนเฉลี่ย</p>
                </div>
                <Star className="h-12 w-12 text-amber-200 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-slide-in-right" style={{animationDelay: '0.2s'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{serviceTypeStats.reduce((sum, s) => sum + s.value, 0).toLocaleString()}</p>
                  <p className="text-emerald-100 font-medium">การใช้บริการรวม</p>
                </div>
                <TrendingUp className="h-12 w-12 text-emerald-200 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-slide-in-right" style={{animationDelay: '0.3s'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{callbackRequests.length.toLocaleString()}</p>
                  <p className="text-purple-100 font-medium">ขอติดต่อกลับ</p>
                </div>
                <Phone className="h-12 w-12 text-purple-200 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg border-2 border-purple-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">ภาพรวม</TabsTrigger>
            <TabsTrigger value="satisfaction" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">ความพึงพอใจ</TabsTrigger>
            <TabsTrigger value="regional" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">เปรียบเทียบภาค</TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">ความคิดเห็น</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Enhanced Service Type Chart - Horizontal Bar Chart instead of Pie */}
              <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-0 animate-fade-in">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-6 w-6" />
                    การใช้บริการแต่ละประเภท
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {serviceTypeStats.map((stat, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-700 text-sm">{stat.shortName}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg" style={{color: stat.color}}>
                              {stat.value.toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {stat.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg"
                            style={{
                              width: `${stat.percentage}%`,
                              backgroundColor: stat.color,
                              animationDelay: `${index * 200}ms`
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{stat.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Satisfaction Chart */}
              <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-0 animate-fade-in">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Award className="h-6 w-6" />
                    คะแนนความพึงพอใจรายด้าน
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={satisfactionStats} layout="horizontal" margin={{ top: 20, right: 30, left: 120, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis type="number" domain={[0, 5]} stroke="#6b7280" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Bar dataKey="score" fill="url(#satisfactionGradient)" radius={[0, 8, 8, 0]} />
                      <defs>
                        <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="satisfaction" className="space-y-6">
            <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-0 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-6 w-6" />
                  รายละเอียดคะแนนความพึงพอใจ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {satisfactionStats.map((stat, index) => (
                    <div key={index} className="group p-6 border-2 border-gray-100 rounded-xl bg-gradient-to-br from-white to-purple-50 hover:border-purple-300 hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-slide-in-right" style={{animationDelay: `${index * 100}ms`}}>
                      <h4 className="font-bold text-gray-800 mb-3 text-sm leading-tight">{stat.name}</h4>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {stat.score}
                        </span>
                        <span className="text-gray-500 text-lg font-medium">/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg"
                          style={{ 
                            width: `${(stat.score / 5) * 100}%`,
                            animationDelay: `${index * 200}ms`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            {/* ... keep existing code (regional comparison content) */}
            <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-0 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-6 w-6" />
                  เปรียบเทียบผลการให้บริการแต่ละภาค
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={regionalComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis yAxisId="left" orientation="left" stroke="#6b7280" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="satisfaction" fill="url(#satisfactionRegionGradient)" name="คะแนนเฉลี่ย" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="totalService" fill="url(#serviceRegionGradient)" name="การใช้บริการรวม" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="satisfactionRegionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                      <linearGradient id="serviceRegionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0891b2" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-0 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle>สรุปข้อมูลแต่ละภาค</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {regionalComparison.map((region, index) => (
                    <div key={index} className="group p-6 border-2 border-gray-100 rounded-xl bg-gradient-to-br from-white to-blue-50 hover:border-blue-300 hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-slide-in-right" style={{animationDelay: `${index * 100}ms`}}>
                      <h4 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-500" />
                        {region.name}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">คะแนนเฉลี่ย:</span>
                          <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                            {region.satisfaction}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">การใช้บริการ:</span>
                          <Badge variant="outline" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                            {region.totalService.toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">หน่วยให้บริการ:</span>
                          <Badge variant="outline" className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                            {region.units}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {/* ... keep existing code (feedback content) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-0 animate-fade-in">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    ความคิดเห็นจากลูกค้า
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {customerFeedback.length} รายการ
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {customerFeedback.map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-400 hover:shadow-lg transition-all duration-300 animate-slide-in-right" style={{animationDelay: `${index * 50}ms`}}>
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className="text-xs bg-white border-green-300">
                            {item.หน่วยให้บริการ} - {item.เขต}
                          </Badge>
                          <span className="text-xs text-gray-500 font-medium">{item.วันที่}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.หมายเหตุ}</p>
                      </div>
                    ))}
                    {customerFeedback.length === 0 && (
                      <div className="text-center text-gray-500 py-12">
                        <Award className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg">ไม่มีความคิดเห็นจากลูกค้า</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-0 animate-fade-in">
                <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    รายการขอติดต่อกลับ
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {callbackRequests.length} รายการ
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {callbackRequests.map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-l-4 border-red-400 hover:shadow-lg transition-all duration-300 animate-slide-in-right" style={{animationDelay: `${index * 50}ms`}}>
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className="text-xs bg-white border-red-300">
                            {item.หน่วยให้บริการ} - {item.เขต}
                          </Badge>
                          <span className="text-xs text-gray-500 font-medium">{item.วันที่}</span>
                        </div>
                        <p className="text-sm text-gray-700 font-semibold flex items-center gap-2 mb-2">
                          <Phone className="inline h-4 w-4 text-red-500" />
                          {item.ลูกค้าต้องการให้ติดต่อกลับ}
                        </p>
                        {item.หมายเหตุ && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            หมายเหตุ: {item.หมายเหตุ}
                          </p>
                        )}
                      </div>
                    ))}
                    {callbackRequests.length === 0 && (
                      <div className="text-center text-gray-500 py-12">
                        <Phone className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg">ไม่มีรายการขอติดต่อกลับ</p>
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
