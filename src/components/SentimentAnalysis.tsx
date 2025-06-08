
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CustomerData } from '@/types';

const SENTIMENT_COLORS = {
  Positive: '#10b981',
  Negative: '#ef4444',
  Neutral: '#6b7280'
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
      percentage: Math.round((count / data.length) * 100)
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

  // วิเคราะห์ประเภทปัญหาของ Negative sentiment
  const negativeIssues = useMemo(() => {
    const negativeData = data.filter(item => item.sentiment === 'Negative');
    const issueTypes = [
      { key: 'บริการช้า', label: 'บริการช้า' },
      { key: 'ระบบช้า', label: 'ระบบช้า' },
      { key: 'service mind พนักงาน', label: 'Service Mind พนักงาน' },
      { key: 'แซงคิว', label: 'แซงคิว' },
      { key: 'ปรับปรุงสถานที่', label: 'ปรับปรุงสถานที่' },
      { key: 'ไม่สามารถจัดหมวดหมู่ได้', label: 'ไม่สามารถจัดหมวดหมู่ได้' }
    ];

    return issueTypes.map(issue => {
      const count = negativeData.reduce((sum, item) => {
        return sum + (item[issue.key as keyof CustomerData] as number || 0);
      }, 0);
      
      return {
        name: issue.label,
        value: count,
        percentage: negativeData.length > 0 ? Math.round((count / negativeData.length) * 100) : 0
      };
    }).filter(issue => issue.value > 0).sort((a, b) => b.value - a.value);
  }, [data]);

  // ความคิดเห็นลูกค้าที่เป็น Negative
  const negativeComments = useMemo(() => {
    return data
      .filter(item => item.sentiment === 'Negative' && item.หมายเหตุ && item.หมายเหตุ.trim() !== '')
      .slice(0, 10); // แสดงแค่ 10 รายการล่าสุด
  }, [data]);

  return (
    <div className="space-y-6">
      {/* ภาพรวม Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ภาพรวม Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถิติ Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentimentStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: SENTIMENT_COLORS[stat.name as keyof typeof SENTIMENT_COLORS] }}
                    ></div>
                    <span className="font-medium">{stat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{stat.value} รายการ</Badge>
                    <Badge variant="secondary">{stat.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment แยกตามภาค */}
      <Card>
        <CardHeader>
          <CardTitle>เปรียบเทียบ Sentiment แยกตามภาค</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sentimentByRegion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Positive" fill={SENTIMENT_COLORS.Positive} name="Positive" />
              <Bar dataKey="Negative" fill={SENTIMENT_COLORS.Negative} name="Negative" />
              <Bar dataKey="Neutral" fill={SENTIMENT_COLORS.Neutral} name="Neutral" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* วิเคราะห์ประเภทปัญหา Negative */}
      <Card>
        <CardHeader>
          <CardTitle>วิเคราะห์ประเภทปัญหา (Negative Sentiment)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={negativeIssues} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">รายละเอียดประเภทปัญหา</h4>
              {negativeIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm font-medium">{issue.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{issue.value} ครั้ง</Badge>
                    <span className="text-xs text-gray-600">{issue.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ความคิดเห็นลูกค้าที่เป็น Negative */}
      <Card>
        <CardHeader>
          <CardTitle>ความคิดเห็นลูกค้า (Negative Sentiment)</CardTitle>
          <Badge variant="destructive">{negativeComments.length} รายการ</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {negativeComments.map((item, index) => (
              <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.หน่วยให้บริการ}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.เขต} - {item.ภาค}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">{item.วันที่}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.หมายเหตุ}</p>
                
                {/* แสดงประเภทปัญหา */}
                <div className="flex flex-wrap gap-1">
                  {item.บริการช้า === 1 && <Badge variant="destructive" className="text-xs">บริการช้า</Badge>}
                  {item.ระบบช้า === 1 && <Badge variant="destructive" className="text-xs">ระบบช้า</Badge>}
                  {item['service mind พนักงาน'] === 1 && <Badge variant="destructive" className="text-xs">Service Mind</Badge>}
                  {item.แซงคิว === 1 && <Badge variant="destructive" className="text-xs">แซงคิว</Badge>}
                  {item.ปรับปรุงสถานที่ === 1 && <Badge variant="destructive" className="text-xs">ปรับปรุงสถานที่</Badge>}
                  {item.ไม่สามารถจัดหมวดหมู่ได้ === 1 && <Badge variant="destructive" className="text-xs">อื่นๆ</Badge>}
                </div>
              </div>
            ))}
            {negativeComments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                ไม่มีความคิดเห็นลูกค้าที่เป็น Negative
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentAnalysis;
