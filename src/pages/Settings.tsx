
import React from 'react';
import WebhookForm from '@/components/webhook/WebhookForm';
import WebhookList from '@/components/webhook/WebhookList';
import { useWebhooks } from '@/hooks/useWebhooks';

const Settings: React.FC = () => {
  const { webhooks, addWebhook, updateWebhook, deleteWebhook } = useWebhooks();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ตั้งค่า</h1>
        <p className="text-muted-foreground">จัดการ webhook สำหรับการแจ้งเตือน</p>
      </div>

      <WebhookForm onAdd={addWebhook} />
      <WebhookList 
        webhooks={webhooks}
        onUpdate={updateWebhook}
        onDelete={deleteWebhook}
      />
    </div>
  );
};

export default Settings;
