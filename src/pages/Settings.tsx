
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Webhook {
  id: string;
  url: string;
  method: string;
}

const Settings: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');

  useEffect(() => {
    const savedWebhooks = localStorage.getItem('webhooks');
    if (savedWebhooks) {
      setWebhooks(JSON.parse(savedWebhooks));
    }
  }, []);

  const saveWebhooks = (updatedWebhooks: Webhook[]) => {
    setWebhooks(updatedWebhooks);
    localStorage.setItem('webhooks', JSON.stringify(updatedWebhooks));
  };

  const addWebhook = () => {
    if (!newWebhookUrl.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ URL webhook",
        variant: "destructive",
      });
      return;
    }

    const newWebhook: Webhook = {
      id: Date.now().toString(),
      url: newWebhookUrl.trim(),
      method: 'POST',
    };

    const updatedWebhooks = [...webhooks, newWebhook];
    saveWebhooks(updatedWebhooks);
    setNewWebhookUrl('');
    
    toast({
      title: "สำเร็จ",
      description: "เพิ่ม webhook เรียบร้อยแล้ว",
    });
  };

  const deleteWebhook = (id: string) => {
    const updatedWebhooks = webhooks.filter(webhook => webhook.id !== id);
    saveWebhooks(updatedWebhooks);
    
    toast({
      title: "สำเร็จ",
      description: "ลบ webhook เรียบร้อยแล้ว",
    });
  };

  const startEdit = (webhook: Webhook) => {
    setEditingId(webhook.id);
    setEditingUrl(webhook.url);
  };

  const saveEdit = (id: string) => {
    if (!editingUrl.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ URL webhook",
        variant: "destructive",
      });
      return;
    }

    const updatedWebhooks = webhooks.map(webhook =>
      webhook.id === id ? { ...webhook, url: editingUrl.trim() } : webhook
    );
    saveWebhooks(updatedWebhooks);
    setEditingId(null);
    setEditingUrl('');
    
    toast({
      title: "สำเร็จ",
      description: "แก้ไข webhook เรียบร้อยแล้ว",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingUrl('');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ตั้งค่า</h1>
        <p className="text-muted-foreground">จัดการ webhook สำหรับการแจ้งเตือน</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>เพิ่ม Webhook ใหม่</CardTitle>
          <CardDescription>เพิ่ม webhook URL สำหรับส่งข้อมูลผ่าน POST method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/webhook"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addWebhook}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่ม
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการ Webhook</CardTitle>
          <CardDescription>จัดการ webhook ที่มีอยู่</CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่มี webhook ที่ตั้งค่าไว้
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="w-[100px]">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      {editingId === webhook.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingUrl}
                            onChange={(e) => setEditingUrl(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={() => saveEdit(webhook.id)}>
                            บันทึก
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            ยกเลิก
                          </Button>
                        </div>
                      ) : (
                        <span className="font-mono text-sm">{webhook.url}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {webhook.method}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingId !== webhook.id && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(webhook)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
