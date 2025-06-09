
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Webhook {
  id: string;
  url: string;
}

interface WebhookListProps {
  webhooks: Webhook[];
  onUpdate: (id: string, url: string) => void;
  onDelete: (id: string) => void;
}

const WebhookList: React.FC<WebhookListProps> = ({ webhooks, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');

  const handleEdit = (webhook: Webhook) => {
    setEditingId(webhook.id);
    setEditingUrl(webhook.url);
  };

  const handleSave = () => {
    if (!editingUrl.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ URL webhook",
        variant: "destructive",
      });
      return;
    }

    onUpdate(editingId!, editingUrl.trim());
    setEditingId(null);
    setEditingUrl('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingUrl('');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">รายการ Webhook</CardTitle>
          <Badge variant="outline" className="w-fit">
            {webhooks.length} รายการ
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {webhooks.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
            ยังไม่มี webhook
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg">
                {editingId === webhook.id ? (
                  <>
                    <Input
                      value={editingUrl}
                      onChange={(e) => setEditingUrl(e.target.value)}
                      className="flex-1 text-sm sm:text-base"
                      placeholder="https://example.com/webhook"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button size="sm" onClick={handleSave} className="flex-1 sm:flex-none text-xs sm:text-sm">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        บันทึก
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none text-xs sm:text-sm">
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        ยกเลิก
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium break-all">{webhook.url}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">POST Method</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(webhook)} className="flex-1 sm:flex-none text-xs sm:text-sm">
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        แก้ไข
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(webhook.id)} className="flex-1 sm:flex-none text-xs sm:text-sm">
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        ลบ
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookList;
