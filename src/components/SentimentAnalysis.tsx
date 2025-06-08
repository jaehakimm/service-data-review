import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, MessageSquare, Filter, X } from 'lucide-react';
import { CustomerData } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// สีสำหรับ sentiment
const SENTIMENT_COLORS = {
  Positive: '#22c55e',
  Negative: '#ef4444',
  Neutral: '#6b7280'
};

// สีสำหรับประเภทปัญหาต่างๆ
const ISSUE_COLORS = ['#ef4444',
// แดง - บริการช้า
'#f97316',
// ส้ม - ระบบช้า
'#8b5cf6',
// ม่วง - Service Mind พนักงาน
'#3b82f6',
// น้ำเงิน - แซงคิว
'#f59e0b',
// เหลือง - ปรับปรุงสถานที่
'#6b7280' // เทา - ไม่สามารถจัดหมวดหมู่ได้
];
const chartConfig = {
  Positive: {
    label: "Positive",
    color: "hsl(var(--chart-1))"
  },
  Negative: {
    label: "Negative",
    color: "hsl(var(--chart-2))"
  },
  Neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-3))"
  }
};
interface SentimentAnalysisProps {
  data: CustomerData[];
}
interface FilterState {
  หน่วยให้บริการ: string;
  ภาค: string;
  วันที่From: Date | undefined;
  วันที่To: Date | undefined;
  บริการช้า: boolean;
  ระบบช้า: boolean;
  serviceMind: boolean;
  แซงคิว: boolean;
  ปรับปรุงสถานที่: boolean;
  ไม่สามารถจัดหมวดหมู่ได้: boolean;
}
const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  data
}) => {
  const [filters, setFilters] = useState<FilterState>({
    หน่วยให้บริการ: 'all',
    ภาค: 'all',
    วันที่From: undefined,
    วันที่To: undefined,
    บริการช้า: false,
    // default เป็น "ไม่มี"
    ระบบช้า: false,
    serviceMind: false,
    แซงคิว: false,
    ปรับปรุงสถานที่: false,
    ไม่สามารถจัดหมวดหมู่ได้: false
  });

  // คำนวณข้อมูล sentiment รวม
  const sentimentStats = useMemo(() => {
    const stats = data.reduce((acc, item) => {
      const sentiment = item.sentiment || 'Neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(stats).map(([sentiment, count]) => ({
      name: sentiment,
      value: count,
      percentage: Math.round(count / data.length * 100),
      fill: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS]
    }));
  }, [data]);

  // คำนวณข้อมูล sentiment แยกตามภาค
  const sentimentByRegion = useMemo(() => {
    const regionStats = data.reduce((acc, item) => {
      const region = item.ภาค;
      const sentiment = item.sentiment || 'Neutral';
      if (!acc[region]) {
        acc[region] = {
          Positive: 0,
          Negative: 0,
          Neutral: 0
        };
      }
      acc[region][sentiment]++;
      return acc;
    }, {} as Record<string, Record<string, number>>);
    return Object.entries(regionStats).map(([region, sentiments]) => {
      const total = (sentiments.Positive || 0) + (sentiments.Negative || 0) + (sentiments.Neutral || 0);
      return {
        name: region,
        Positive: sentiments.Positive || 0,
        Negative: sentiments.Negative || 0,
        Neutral: sentiments.Neutral || 0,
        total,
        PositivePercent: total > 0 ? Math.round(sentiments.Positive / total * 100) : 0,
        NegativePercent: total > 0 ? Math.round(sentiments.Negative / total * 100) : 0,
        NeutralPercent: total > 0 ? Math.round(sentiments.Neutral / total * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [data]);

  // วิเคราะห์ประเภทปัญหาของ Negative sentiment - แก้ไขให้มีสีที่แตกต่างกัน
  const negativeIssues = useMemo(() => {
    const negativeData = data.filter(item => item.sentiment === 'Negative');
    const issueTypes = [{
      key: 'บริการช้า',
      label: 'บริการช้า',
      icon: '⏱️'
    }, {
      key: 'ระบบช้า',
      label: 'ระบบช้า',
      icon: '💻'
    }, {
      key: 'serviceMind',
      label: 'Service Mind',
      icon: '😞'
    }, {
      key: 'แซงคิว',
      label: 'แซงคิว',
      icon: '🚫'
    }, {
      key: 'ปรับปรุงสถานที่',
      label: 'ปรับปรุงสถานที่',
      icon: '🏢'
    }, {
      key: 'ไม่สามารถจัดหมวดหมู่ได้',
      label: 'อื่นๆ',
      icon: '❓'
    }];
    return issueTypes.map((issue, index) => {
      const count = negativeData.reduce((sum, item) => {
        return sum + (item[issue.key as keyof CustomerData] as number || 0);
      }, 0);
      return {
        name: issue.label,
        value: count,
        percentage: negativeData.length > 0 ? Math.round(count / negativeData.length * 100) : 0,
        icon: issue.icon,
        fill: ISSUE_COLORS[index] // กำหนดสีที่แตกต่างกันสำหรับแต่ละประเภท
      };
    }).filter(issue => issue.value > 0).sort((a, b) => b.value - a.value);
  }, [data]);

  // ข้อมูลสำหรับ dropdown filters
  const uniqueUnits = useMemo(() => {
    return Array.from(new Set(data.map(item => item.หน่วยให้บริการ))).sort();
  }, [data]);
  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(data.map(item => item.ภาค))).sort();
  }, [data]);

  // ความคิดเห็นลูกค้าที่เป็น Negative พร้อม filters
  const filteredNegativeComments = useMemo(() => {
    let filtered = data.filter(item => item.sentiment === 'Negative' && item.หมายเหตุ && item.หมายเหตุ.trim() !== '');

    // Filter by หน่วยให้บริการ
    if (filters.หน่วยให้บริการ && filters.หน่วยให้บริการ !== 'all') {
      filtered = filtered.filter(item => item.หน่วยให้บริการ === filters.หน่วยให้บริการ);
    }

    // Filter by ภาค
    if (filters.ภาค && filters.ภาค !== 'all') {
      filtered = filtered.filter(item => item.ภาค === filters.ภาค);
    }

    // Filter by วันที่
    if (filters.วันที่From) {
      const fromDate = format(filters.วันที่From, 'yyyy-MM-dd');
      filtered = filtered.filter(item => item.วันที่ >= fromDate);
    }
    if (filters.วันที่To) {
      const toDate = format(filters.วันที่To, 'yyyy-MM-dd');
      filtered = filtered.filter(item => item.วันที่ <= toDate);
    }

    // Filter by ประเภทปัญหา - true = มี, false = ไม่มี
    filtered = filtered.filter(item => filters.บริการช้า ? item.บริการช้า === 1 : item.บริการช้า !== 1);
    filtered = filtered.filter(item => filters.ระบบช้า ? item.ระบบช้า === 1 : item.ระบบช้า !== 1);
    filtered = filtered.filter(item => filters.serviceMind ? item['service mind พนักงาน'] === 1 : item['service mind พนักงาน'] !== 1);
    filtered = filtered.filter(item => filters.แซงคิว ? item.แซงคิว === 1 : item.แซงคิว !== 1);
    filtered = filtered.filter(item => filters.ปรับปรุงสถานที่ ? item.ปรับปรุงสถานที่ === 1 : item.ปรับปรุงสถานที่ !== 1);
    filtered = filtered.filter(item => filters.ไม่สามารถจัดหมวดหมู่ได้ ? item.ไม่สามารถจัดหมวดหมู่ได้ === 1 : item.ไม่สามารถจัดหมวดหมู่ได้ !== 1);
    return filtered;
  }, [data, filters]);
  const clearFilters = () => {
    setFilters({
      หน่วยให้บริการ: 'all',
      ภาค: 'all',
      วันที่From: undefined,
      วันที่To: undefined,
      บริการช้า: false,
      ระบบช้า: false,
      serviceMind: false,
      แซงคิว: false,
      ปรับปรุงสถานที่: false,
      ไม่สามารถจัดหมวดหมู่ได้: false
    });
  };
  const hasActiveFilters = Object.values(filters).some(value => typeof value === 'string' && value !== 'all' || typeof value === 'boolean' && value === true || value instanceof Date);
  return <div className="space-y-6">
      {/* สถิติภาพรวม */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sentimentStats.map((stat, index) => <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              {stat.name === 'Positive' && <TrendingUp className="h-4 w-4 text-green-600" />}
              {stat.name === 'Negative' && <TrendingDown className="h-4 w-4 text-red-600" />}
              {stat.name === 'Neutral' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.percentage}% ของทั้งหมด
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="h-2 rounded-full transition-all duration-500" style={{
              width: `${stat.percentage}%`,
              backgroundColor: stat.fill
            }}></div>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Bar Chart สำหรับเปรียบเทียบ Sentiment แยกตามภาค - ขนาดใหญ่และสวยงาม */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">เปรียบเทียบ Sentiment แยกตามภาค</CardTitle>
          <p className="text-sm text-muted-foreground">
            การกระจายของ Sentiment ในแต่ละภาค (เรียงตามจำนวนรวม)
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[500px] w-full">
            <BarChart data={sentimentByRegion} margin={{
            top: 20,
            right: 30,
            left: 40,
            bottom: 100
          }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" opacity={0.5} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} interval={0} fontSize={13} fontWeight={500} stroke="#64748b" tick={{
              dy: 10
            }} />
              <YAxis fontSize={12} fontWeight={500} stroke="#64748b" axisLine={false} tickLine={false} />
              <ChartTooltip content={({
              active,
              payload,
              label
            }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
                        <div className="font-semibold text-gray-800 mb-2">{label}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-green-600">✓ Positive:</span>
                            <span className="font-medium">{data.Positive} ({data.PositivePercent}%)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-600">✗ Negative:</span>
                            <span className="font-medium">{data.Negative} ({data.NegativePercent}%)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">○ Neutral:</span>
                            <span className="font-medium">{data.Neutral} ({data.NeutralPercent}%)</span>
                          </div>
                          <div className="border-t pt-1 mt-2 flex justify-between items-center font-semibold">
                            <span>รวม:</span>
                            <span>{data.total}</span>
                          </div>
                        </div>
                      </div>;
              }
              return null;
            }} />
              <Legend wrapperStyle={{
              paddingTop: '20px'
            }} iconType="rect" formatter={value => <span className="font-medium text-gray-700">{value}</span>} />
              <Bar dataKey="Positive" fill={SENTIMENT_COLORS.Positive} name="Positive" radius={[4, 4, 0, 0]} stroke="#059669" strokeWidth={1} />
              <Bar dataKey="Neutral" fill={SENTIMENT_COLORS.Neutral} name="Neutral" radius={[4, 4, 0, 0]} stroke="#475569" strokeWidth={1} />
              <Bar dataKey="Negative" fill={SENTIMENT_COLORS.Negative} name="Negative" radius={[4, 4, 0, 0]} stroke="#dc2626" strokeWidth={1} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cards แยกออกมา: สรุปตัวเลขแต่ละภาค และ อันดับภาคด้วย Negative สูงสุด */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สรุปตัวเลขแต่ละภาค</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ภาค</TableHead>
                  <TableHead className="text-center">รวม</TableHead>
                  <TableHead className="text-center">Positive</TableHead>
                  <TableHead className="text-center">Negative</TableHead>
                  <TableHead className="text-center">Neutral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentimentByRegion.map((region, index) => <TableRow key={index}>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{region.total}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        {region.Positive} ({region.PositivePercent}%)</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        {region.Negative} ({region.NegativePercent}%)</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        {region.Neutral} ({region.NeutralPercent}%)</Badge>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">อันดับภาคด้วย Negative สูงสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentimentByRegion.sort((a, b) => b.NegativePercent - a.NegativePercent).slice(0, 5).map((region, index) => <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{region.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {region.Negative} ครั้ง
                      </Badge>
                      <span className="text-sm font-semibold text-red-600">
                        {region.NegativePercent}%
                      </span>
                    </div>
                  </div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* วิเคราะห์ประเภทปัญหา Negative - Pie Chart ที่มีสีแตกต่างกัน */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            วิเคราะห์ประเภทปัญหา (Negative Sentiment)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie data={negativeIssues} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({
                  name,
                  percentage
                }) => `${percentage}%`}>
                    {negativeIssues.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <ChartTooltip content={({
                  active,
                  payload
                }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[150px]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{data.icon}</span>
                              <span className="font-medium text-gray-800">{data.name}</span>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>จำนวน:</span>
                                <span className="font-semibold">{data.value} ครั้ง</span>
                              </div>
                              <div className="flex justify-between">
                                <span>เปอร์เซ็นต์:</span>
                                <span className="font-semibold">{data.percentage}%</span>
                              </div>
                            </div>
                          </div>;
                  }
                  return null;
                }} />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                รายละเอียดประเภทปัญหา
              </h4>
              {negativeIssues.map((issue, index) => <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-sm" style={{
              borderLeftColor: issue.fill,
              borderLeftWidth: '4px',
              background: `linear-gradient(to right, ${issue.fill}10, ${issue.fill}05)`
            }}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{
                  backgroundColor: issue.fill
                }}></div>
                    <span className="text-lg">{issue.icon}</span>
                    <span className="text-sm font-medium">{issue.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge style={{
                  backgroundColor: issue.fill,
                  color: 'white',
                  border: 'none'
                }} className="animate-pulse">
                      {issue.value} ครั้ง
                    </Badge>
                    <span className="text-xs text-gray-600 font-semibold">
                      {issue.percentage}%
                    </span>
                  </div>
                </div>)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ความคิดเห็นลูกค้าที่เป็น Negative พร้อม Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-red-500" />
            ความคิดเห็นลูกค้า (Negative Sentiment)
            <Badge variant="destructive" className="ml-auto">
              {filteredNegativeComments.length} รายการ
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                ตัวกรองข้อมูล
              </h4>
              {hasActiveFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4 mr-1" />
                  ล้างตัวกรอง
                </Button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* หน่วยให้บริการ Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">หน่วยให้บริการ</label>
                <Select value={filters.หน่วยให้บริการ} onValueChange={value => setFilters(prev => ({
                ...prev,
                หน่วยให้บริการ: value
              }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {uniqueUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* ภาค Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">ภาค</label>
                <Select value={filters.ภาค} onValueChange={value => setFilters(prev => ({
                ...prev,
                ภาค: value
              }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {uniqueRegions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* วันที่เริ่มต้น */}
              <div>
                <label className="text-sm font-medium mb-1 block">วันที่เริ่มต้น</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.วันที่From && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.วันที่From ? format(filters.วันที่From, "dd/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={filters.วันที่From} onSelect={date => setFilters(prev => ({
                    ...prev,
                    วันที่From: date
                  }))} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              {/* วันที่สิ้นสุด */}
              <div>
                <label className="text-sm font-medium mb-1 block">วันที่สิ้นสุด</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.วันที่To && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.วันที่To ? format(filters.วันที่To, "dd/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={filters.วันที่To} onSelect={date => setFilters(prev => ({
                    ...prev,
                    วันที่To: date
                  }))} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* ประเภทปัญหา Filters - เหลือแค่ มี/ไม่มี */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-3 block">ประเภทปัญหา (เลือกปัญหาได้มากกว่า 1 หัวข้อ)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[{
                key: 'บริการช้า',
                label: 'บริการช้า',
                icon: '⏱️'
              }, {
                key: 'ระบบช้า',
                label: 'ระบบช้า',
                icon: '💻'
              }, {
                key: 'serviceMind',
                label: 'Service Mind',
                icon: '😞'
              }, {
                key: 'แซงคิว',
                label: 'แซงคิว',
                icon: '🚫'
              }, {
                key: 'ปรับปรุงสถานที่',
                label: 'ปรับปรุงสถานที่',
                icon: '🏢'
              }, {
                key: 'ไม่สามารถจัดหมวดหมู่ได้',
                label: 'อื่นๆ',
                icon: '❓'
              }].map(issue => {
                const filterValue = filters[issue.key as keyof FilterState] as boolean;
                return <div key={issue.key} className="flex flex-col gap-2">
                      <span className="text-xs text-gray-600 text-center">{issue.icon}</span>
                      <Button variant={filterValue ? "default" : "secondary"} size="sm" onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      [issue.key]: !filterValue
                    }));
                  }} className={cn("h-12 text-xs font-medium transition-all duration-200 flex flex-col gap-1", filterValue ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "bg-red-100 hover:bg-red-200 text-red-800 border-red-300")}>
                        <div className="text-center leading-tight">
                          {issue.label}
                        </div>
                        <div className="text-xs opacity-80">
                          {filterValue ? "มี" : "ไม่มี"}
                        </div>
                      </Button>
                    </div>;
              })}
              </div>
            </div>
          </div>

          {/* Comments Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto">
            {filteredNegativeComments.map((item, index) => <div key={index} className="relative p-4 bg-gradient-to-br from-red-50 via-red-25 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-xs bg-white">
                    #{index + 1}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      📍 {item.หน่วยให้บริการ}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      🌏 {item.เขต} - {item.ภาค}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      📅 {item.วันที่}
                    </Badge>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md border">
                    <p className="text-sm text-gray-700 leading-relaxed">{item.หมายเหตุ}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {item.บริการช้า === 1 && <Badge variant="destructive" className="text-xs">⏱️ บริการช้า</Badge>}
                    {item.ระบบช้า === 1 && <Badge variant="destructive" className="text-xs">💻 ระบบช้า</Badge>}
                    {item['service mind พนักงาน'] === 1 && <Badge variant="destructive" className="text-xs">😞 Service Mind</Badge>}
                    {item.แซงคิว === 1 && <Badge variant="destructive" className="text-xs">🚫 แซงคิว</Badge>}
                    {item.ปรับปรุงสถานที่ === 1 && <Badge variant="destructive" className="text-xs">🏢 ปรับปรุงสถานที่</Badge>}
                    {item.ไม่สามารถจัดหมวดหมู่ได้ === 1 && <Badge variant="destructive" className="text-xs">❓ อื่นๆ</Badge>}
                  </div>
                </div>
              </div>)}
            {filteredNegativeComments.length === 0 && <div className="col-span-2 text-center text-gray-500 py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>ไม่มีความคิดเห็นลูกค้าที่ตรงกับเงื่อนไขการกรอง</p>
              </div>}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default SentimentAnalysis;