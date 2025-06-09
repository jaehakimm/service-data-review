
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Webhook {
  id: string;
  url: string;
  method: string;
}

interface WebhookListProps {
  webhooks: Webhook[];
  onUpdate: (id: string, url: string) => void;
  onDelete: (id: string) => void;
}

const WebhookList: React.FC<WebhookListProps> = ({ webhooks, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');

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

    onUpdate(id, editingUrl.trim());
    setEditingId(null);
    setEditingUrl('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingUrl('');
  };

  return (
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
                          onClick={() => onDelete(webhook.id)}
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
  );
};

export default WebhookList;
