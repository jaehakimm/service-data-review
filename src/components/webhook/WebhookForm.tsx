
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WebhookFormProps {
  onAdd: (url: string) => void;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ onAdd }) => {
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const handleSubmit = () => {
    if (!newWebhookUrl.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ URL webhook",
        variant: "destructive",
      });
      return;
    }

    onAdd(newWebhookUrl.trim());
    setNewWebhookUrl('');
  };

  return (
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
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่ม
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookForm;
