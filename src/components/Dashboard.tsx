import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { RotateCcw, TrendingUp, Users, Star, Phone, Award, Target, Activity, BarChart3, Building, MapPin, Crown } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CustomerData } from '@/types';
import LuxuryHeader from './LuxuryHeader';
import LuxurySidebar from './LuxurySidebar';
import LuxuryMetricCard from './LuxuryMetricCard';

const LUXURY_COLORS = {
  primary: '#E7B738',
  secondary: '#2C3E50',
  accent: '#34495E',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  muted: '#95A5A6'
};

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

  // Calculate service type statistics with better formatting
  const serviceTypeStats = useMemo(() => {
    const stats = [
      { 
        name: 'ฝากถอนเงินฝาก/สลากออมสิน', 
        shortName: 'ฝากถอน',
        value: filteredData.reduce((sum, d) => sum + (d.ประเภท1 || 0), 0), 
        color: LUXURY_COLORS.primary,
        percentage: 0
      },
      { 
        name: 'ชำระสินเชื่อ/ชำระค่าสินค้าและบริการ', 
        shortName: 'ชำระสินเชื่อ',
        value: filteredData.reduce((sum, d) => sum + (d.ประเภท2 || 0), 0), 
        color: LUXURY_COLORS.info,
        percentage: 0
      },
      { 
        name: 'สมัครใช้บริการ เงินฝาก/สินเชื่อ/MyMo/บัตร/อื่น ๆ', 
        shortName: 'สมัครบริการ',
        value: filteredData.reduce((sum, d) => sum + (d.ประเภท3 || 0), 0), 
        color: LUXURY_COLORS.success,
        percentage: 0
      },
      { 
        name: 'สอบถาม/ขอคำปรึกษา', 
        shortName: 'คำปรึกษา',
        value: filteredData.reduce((sum, d) => sum + (d.ประเภท4 || 0), 0), 
        color: LUXURY_COLORS.warning,
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
    <div className="min-h-screen bg-background">
      <LuxuryHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      
      <div className="flex">
        <LuxurySidebar 
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 luxury-fade-in">
            <div>
              <h1 className="text-4xl font-bold luxury-heading mb-2">
                Customer Satisfaction Analytics
              </h1>
              <p className="text-lg luxury-subheading">
                Comprehensive insights into service quality and customer experience
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentStep('upload')}
              className="luxury-transition luxury-hover border-primary/20 hover:border-primary/40"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Upload New Data
            </Button>
          </div>

          {/* Filters Card */}
          <Card className="glass border-border/50 luxury-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-primary" />
                Data Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="luxury-transition">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Zone</label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="luxury-transition">
                      <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Zones</SelectItem>
                      {zones.map(zone => (
                        <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Service Unit</label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="luxury-transition">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
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
                    className="w-full luxury-transition luxury-hover border-primary/20 hover:border-primary/40"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LuxuryMetricCard
              title="Total Services"
              value={filteredData.length}
              subtitle="Service interactions"
              icon={Users}
              trend={{ value: 12.5, type: 'positive' }}
              delay={200}
            />
            <LuxuryMetricCard
              title="Satisfaction Score"
              value={overallSatisfaction}
              subtitle="Average rating"
              icon={Star}
              trend={{ value: 2.1, type: 'positive' }}
              delay={300}
            />
            <LuxuryMetricCard
              title="Service Volume"
              value={serviceTypeStats.reduce((sum, s) => sum + s.value, 0)}
              subtitle="Total transactions"
              icon={TrendingUp}
              trend={{ value: 8.3, type: 'positive' }}
              delay={400}
            />
            <LuxuryMetricCard
              title="Callback Requests"
              value={callbackRequests.length}
              subtitle="Pending responses"
              icon={Phone}
              trend={{ value: -5.2, type: 'negative' }}
              delay={500}
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-card border-border">
              <TabsTrigger value="overview" className="luxury-transition data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Overview
              </TabsTrigger>
              <TabsTrigger value="satisfaction" className="luxury-transition data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Satisfaction
              </TabsTrigger>
              <TabsTrigger value="regional" className="luxury-transition data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Regional
              </TabsTrigger>
              <TabsTrigger value="feedback" className="luxury-transition data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Service Types Chart */}
                <Card className="glass border-border/50 luxury-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Service Types Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {serviceTypeStats.map((stat, index) => (
                        <div key={index} className="luxury-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{stat.shortName}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg" style={{ color: stat.color }}>
                                {stat.value.toLocaleString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {stat.percentage}%
                              </Badge>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full rounded-full luxury-transition"
                              style={{
                                width: `${stat.percentage}%`,
                                backgroundColor: stat.color,
                                animationDelay: `${index * 200}ms`
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{stat.name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Satisfaction Chart */}
                <Card className="glass border-border/50 luxury-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Satisfaction Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={satisfactionStats} layout="horizontal" margin={{ top: 20, right: 30, left: 120, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--foreground))" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Bar dataKey="score" fill={LUXURY_COLORS.primary} radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="satisfaction" className="space-y-6">
              <Card className="glass border-border/50 luxury-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Detailed Satisfaction Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {satisfactionStats.map((stat, index) => (
                      <div key={index} className="p-6 border border-border rounded-lg bg-card/50 luxury-hover luxury-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <h4 className="font-semibold text-sm leading-tight mb-3">{stat.name}</h4>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl font-bold luxury-heading">
                            {stat.score}
                          </span>
                          <span className="text-muted-foreground text-lg font-medium">/5</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-3 rounded-full luxury-transition"
                            style={{ 
                              width: `${(stat.score / 5) * 100}%`,
                              backgroundColor: LUXURY_COLORS.primary,
                              animationDelay: `${index * 200}ms`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="regional" className="space-y-6">
              <Card className="glass border-border/50 luxury-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Regional Performance Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={regionalComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                      <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--foreground))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px',
                        }} 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="satisfaction" fill={LUXURY_COLORS.primary} name="Average Score" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="totalService" fill={LUXURY_COLORS.info} name="Total Services" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 luxury-fade-in">
                <CardHeader>
                  <CardTitle>Regional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {regionalComparison.map((region, index) => (
                      <div key={index} className="p-6 border border-border rounded-lg bg-card/50 luxury-hover luxury-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" />
                          {region.name}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Score:</span>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {region.satisfaction}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Services:</span>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              {region.totalService.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Units:</span>
                            <Badge variant="outline" className="bg-info/10 text-info border-info/20">
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
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="glass border-border/50 luxury-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Customer Feedback
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        {customerFeedback.length} items
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {customerFeedback.map((item, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg bg-card/50 luxury-hover luxury-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline" className="text-xs">
                              {item.หน่วยให้บริการ} - {item.เขต}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.วันที่}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{item.หมายเหตุ}</p>
                        </div>
                      ))}
                      {customerFeedback.length === 0 && (
                        <div className="text-center text-muted-foreground py-12">
                          <Crown className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p className="text-lg">No customer feedback available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border/50 luxury-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      Callback Requests
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        {callbackRequests.length} pending
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {callbackRequests.map((item, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg bg-card/50 luxury-hover luxury-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline" className="text-xs">
                              {item.หน่วยให้บริการ} - {item.เขต}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.วันที่}</span>
                          </div>
                          <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                            <Phone className="inline h-4 w-4 text-primary" />
                            {item.ลูกค้าต้องการให้ติดต่อกลับ}
                          </p>
                          {item.หมายเหตุ && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Note: {item.หมายเหตุ}
                            </p>
                          )}
                        </div>
                      ))}
                      {callbackRequests.length === 0 && (
                        <div className="text-center text-muted-foreground py-12">
                          <Phone className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p className="text-lg">No callback requests</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
