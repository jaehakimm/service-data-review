
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

    return Object.entries(regionStats).map(([region, sentiments]) => {
      const total = (sentiments.Positive || 0) + (sentiments.Negative || 0) + (sentiments.Neutral || 0);
      return {
        name: region,
        Positive: sentiments.Positive || 0,
        Negative: sentiments.Negative || 0,
        Neutral: sentiments.Neutral || 0,
        total,
        PositivePercent: total > 0 ? Math.round((sentiments.Positive / total) * 100) : 0,
        NegativePercent: total > 0 ? Math.round((sentiments.Negative / total) * 100) : 0,
        NeutralPercent: total > 0 ? Math.round((sentiments.Neutral / total) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [data]);

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
      .slice(0, 5);
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
            <BarChart 
              data={sentimentByRegion} 
              margin={{ top: 20, right: 30, left: 40, bottom: 100 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={120} 
                interval={0} 
                fontSize={13}
                fontWeight={500}
                stroke="#64748b"
                tick={{ dy: 10 }}
              />
              <YAxis 
                fontSize={12}
                fontWeight={500}
                stroke="#64748b"
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
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
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
                formatter={(value) => <span className="font-medium text-gray-700">{value}</span>}
              />
              <Bar 
                dataKey="Positive" 
                fill={SENTIMENT_COLORS.Positive} 
                name="Positive"
                radius={[4, 4, 0, 0]}
                stroke="#059669"
                strokeWidth={1}
              />
              <Bar 
                dataKey="Neutral" 
                fill={SENTIMENT_COLORS.Neutral} 
                name="Neutral"
                radius={[4, 4, 0, 0]}
                stroke="#475569"
                strokeWidth={1}
              />
              <Bar 
                dataKey="Negative" 
                fill={SENTIMENT_COLORS.Negative} 
                name="Negative"
                radius={[4, 4, 0, 0]}
                stroke="#dc2626"
                strokeWidth={1}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cards แยกออกมา: สรุปตัวเลขแต่ละภาค และ อันดับภาคด้วย Negative สูงสุด */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* สรุปตัวเลขแต่ละภาค */}
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
                {sentimentByRegion.map((region, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{region.total}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        {region.Positive} ({region.PositivePercent}%)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        {region.Negative} ({region.NegativePercent}%)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        {region.Neutral} ({region.NeutralPercent}%)
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* อันดับภาคด้วย Negative สูงสุด */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">อันดับภาคด้วย Negative สูงสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentimentByRegion
                .sort((a, b) => b.NegativePercent - a.NegativePercent)
                .slice(0, 5)
                .map((region, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
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
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{issue.icon}</span>
                    <span className="text-sm font-medium">{issue.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="animate-pulse">
                      {issue.value} ครั้ง
                    </Badge>
                    <span className="text-xs text-gray-600 font-semibold">
                      {issue.percentage}%
                    </span>
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
            <Badge variant="destructive" className="ml-auto">
              {negativeComments.length} รายการ
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {negativeComments.map((item, index) => (
              <div 
                key={index} 
                className="relative p-4 bg-gradient-to-br from-red-50 via-red-25 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
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
                    {item.บริการช้า === 1 && (
                      <Badge variant="destructive" className="text-xs">⏱️ บริการช้า</Badge>
                    )}
                    {item.ระบบช้า === 1 && (
                      <Badge variant="destructive" className="text-xs">💻 ระบบช้า</Badge>
                    )}
                    {item['service mind พนักงาน'] === 1 && (
                      <Badge variant="destructive" className="text-xs">😞 Service Mind</Badge>
                    )}
                    {item.แซงคิว === 1 && (
                      <Badge variant="destructive" className="text-xs">🚫 แซงคิว</Badge>
                    )}
                    {item.ปรับปรุงสถานที่ === 1 && (
                      <Badge variant="destructive" className="text-xs">🏢 ปรับปรุงสถานที่</Badge>
                    )}
                    {item.ไม่สามารถจัดหมวดหมู่ได้ === 1 && (
                      <Badge variant="destructive" className="text-xs">❓ อื่นๆ</Badge>
                    )}
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
