
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, MessageSquare } from 'lucide-react';
import { CustomerData } from '@/types';

const SENTIMENT_COLORS = {
  Positive: '#10b981',
  Negative: '#ef4444',
  Neutral: '#6b7280'
};

const chartConfig = {
  Positive: {
    label: "Positive",
    color: "hsl(var(--chart-1))",
  },
  Negative: {
    label: "Negative", 
    color: "hsl(var(--chart-2))",
  },
  Neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-3))",
  },
};

interface SentimentAnalysisProps {
  data: CustomerData[];
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ data }) => {
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
      percentage: Math.round((count / data.length) * 100),
      fill: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS]
    }));
  }, [data]);

  // คำนวณข้อมูล sentiment แยกตามภาค
  const sentimentByRegion = useMemo(() => {
    const regionStats = data.reduce((acc, item) => {
      const region = item.ภาค;
      const sentiment = item.sentiment || 'Neutral';
      
      if (!acc[region]) {
        acc[region] = { Positive: 0, Negative: 0, Neutral: 0 };
      }
      acc[region][sentiment]++;
      
      return acc;
    }, {} as Record<string, Record<string, number>>);

    return Object.entries(regionStats).map(([region, sentiments]) => ({
      name: region,
      Positive: sentiments.Positive || 0,
      Negative: sentiments.Negative || 0,
      Neutral: sentiments.Neutral || 0,
      total: (sentiments.Positive || 0) + (sentiments.Negative || 0) + (sentiments.Neutral || 0)
    }));
  }, [data]);

  // คำนวณเทรนด์ sentiment (สำมารถใช้จากวันที่ถ้ามีข้อมูลเพียงพอ)
  const sentimentTrend = useMemo(() => {
    // สร้างข้อมูลจำลองสำหรับเทรนด์ (ในกรณีจริงจะใช้ข้อมูลจากวันที่)
    return [
      { period: 'สัปดาห์ 1', Positive: 65, Negative: 20, Neutral: 15 },
      { period: 'สัปดาห์ 2', Positive: 70, Negative: 18, Neutral: 12 },
      { period: 'สัปดาห์ 3', Positive: 68, Negative: 22, Neutral: 10 },
      { period: 'สัปดาห์ 4', Positive: 72, Negative: 16, Neutral: 12 },
    ];
  }, []);

  // วิเคราะห์ประเภทปัญหาของ Negative sentiment
  const negativeIssues = useMemo(() => {
    const negativeData = data.filter(item => item.sentiment === 'Negative');
    const issueTypes = [
      { key: 'บริการช้า', label: 'บริการช้า', icon: '⏱️' },
      { key: 'ระบบช้า', label: 'ระบบช้า', icon: '💻' },
      { key: 'service mind พนักงาน', label: 'Service Mind พนักงาน', icon: '😞' },
      { key: 'แซงคิว', label: 'แซงคิว', icon: '🚫' },
      { key: 'ปรับปรุงสถานที่', label: 'ปรับปรุงสถานที่', icon: '🏢' },
      { key: 'ไม่สามารถจัดหมวดหมู่ได้', label: 'ไม่สามารถจัดหมวดหมู่ได้', icon: '❓' }
    ];

    return issueTypes.map(issue => {
      const count = negativeData.reduce((sum, item) => {
        return sum + (item[issue.key as keyof CustomerData] as number || 0);
      }, 0);
      
      return {
        name: issue.label,
        value: count,
        percentage: negativeData.length > 0 ? Math.round((count / negativeData.length) * 100) : 0,
        icon: issue.icon,
        fill: '#ef4444'
      };
    }).filter(issue => issue.value > 0).sort((a, b) => b.value - a.value);
  }, [data]);

  // ความคิดเห็นลูกค้าที่เป็น Negative
  const negativeComments = useMemo(() => {
    return data
      .filter(item => item.sentiment === 'Negative' && item.หมายเหตุ && item.หมายเหตุ.trim() !== '')
      .slice(0, 5); // แสดงแค่ 5 รายการล่าสุด
  }, [data]);

  return (
    <div className="space-y-6">
      {/* สถิติภาพรวม */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sentimentStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
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
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${stat.percentage}%`,
                    backgroundColor: stat.fill
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sentiment Donut Chart และ Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>การกระจายของ Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <RadialBarChart
                data={sentimentStats}
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="70%"
              >
                <RadialBar dataKey="value" cornerRadius={5} />
                <ChartTooltip 
                  content={<ChartTooltipContent hideLabel />} 
                />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>เทรนด์ Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="Positive" 
                  stackId="1"
                  stroke={SENTIMENT_COLORS.Positive}
                  fill={SENTIMENT_COLORS.Positive}
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Neutral" 
                  stackId="1"
                  stroke={SENTIMENT_COLORS.Neutral}
                  fill={SENTIMENT_COLORS.Neutral}
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Negative" 
                  stackId="1"
                  stroke={SENTIMENT_COLORS.Negative}
                  fill={SENTIMENT_COLORS.Negative}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment แยกตามภาค - Stacked Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>เปรียบเทียบ Sentiment แยกตามภาค</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <BarChart data={sentimentByRegion} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="Positive" stackId="a" fill={SENTIMENT_COLORS.Positive} name="Positive" />
              <Bar dataKey="Neutral" stackId="a" fill={SENTIMENT_COLORS.Neutral} name="Neutral" />
              <Bar dataKey="Negative" stackId="a" fill={SENTIMENT_COLORS.Negative} name="Negative" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* วิเคราะห์ประเภทปัญหา Negative - Polar Chart */}
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
                  <Pie
                    data={negativeIssues}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${percentage}%`}
                  >
                    {negativeIssues.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                รายละเอียดประเภทปัญหา
              </h4>
              {negativeIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{issue.icon}</span>
                    <span className="text-sm font-medium">{issue.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="animate-pulse">{issue.value} ครั้ง</Badge>
                    <span className="text-xs text-gray-600 font-semibold">{issue.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ความคิดเห็นลูกค้าที่เป็น Negative - Cards Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-red-500" />
            ความคิดเห็นลูกค้า (Negative Sentiment)
            <Badge variant="destructive" className="ml-auto">{negativeComments.length} รายการ</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {negativeComments.map((item, index) => (
              <div key={index} className="relative p-4 bg-gradient-to-br from-red-50 via-red-25 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-md hover:shadow-lg transition-shadow">
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
                  
                  {/* แสดงประเภทปัญหาในรูปแบบ chips */}
                  <div className="flex flex-wrap gap-1">
                    {item.บริการช้า === 1 && <Badge variant="destructive" className="text-xs">⏱️ บริการช้า</Badge>}
                    {item.ระบบช้า === 1 && <Badge variant="destructive" className="text-xs">💻 ระบบช้า</Badge>}
                    {item['service mind พนักงาน'] === 1 && <Badge variant="destructive" className="text-xs">😞 Service Mind</Badge>}
                    {item.แซงคิว === 1 && <Badge variant="destructive" className="text-xs">🚫 แซงคิว</Badge>}
                    {item.ปรับปรุงสถานที่ === 1 && <Badge variant="destructive" className="text-xs">🏢 ปรับปรุงสถานที่</Badge>}
                    {item.ไม่สามารถจัดหมวดหมู่ได้ === 1 && <Badge variant="destructive" className="text-xs">❓ อื่นๆ</Badge>}
                  </div>
                </div>
              </div>
            ))}
            {negativeComments.length === 0 && (
              <div className="col-span-2 text-center text-gray-500 py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>ไม่มีความคิดเห็นลูกค้าที่เป็น Negative</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentAnalysis;
