
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface Webhook {
  id: string;
  url: string;
  method: string;
}

export const useWebhooks = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

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

  const addWebhook = (url: string) => {
    const newWebhook: Webhook = {
      id: Date.now().toString(),
      url,
      method: 'POST',
    };

    const updatedWebhooks = [...webhooks, newWebhook];
    saveWebhooks(updatedWebhooks);
    
    toast({
      title: "สำเร็จ",
      description: "เพิ่ม webhook เรียบร้อยแล้ว",
    });
  };

  const updateWebhook = (id: string, url: string) => {
    const updatedWebhooks = webhooks.map(webhook =>
      webhook.id === id ? { ...webhook, url } : webhook
    );
    saveWebhooks(updatedWebhooks);
    
    toast({
      title: "สำเร็จ",
      description: "แก้ไข webhook เรียบร้อยแล้ว",
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

  return {
    webhooks,
    addWebhook,
    updateWebhook,
    deleteWebhook,
  };
};
