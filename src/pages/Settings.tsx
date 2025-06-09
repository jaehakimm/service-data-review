
import React from 'react';
import WebhookForm from '@/components/webhook/WebhookForm';
import WebhookList from '@/components/webhook/WebhookList';
import { useWebhooks } from '@/hooks/useWebhooks';

const Settings: React.FC = () => {
  const { webhooks, addWebhook, updateWebhook, deleteWebhook } = useWebhooks();

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">ตั้งค่า</h1>
        <p className="text-sm sm:text-base text-muted-foreground">จัดการ webhook สำหรับการแจ้งเตือน</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <WebhookForm onAdd={addWebhook} />
        <WebhookList 
          webhooks={webhooks}
          onUpdate={updateWebhook}
          onDelete={deleteWebhook}
        />
      </div>
    </div>
  );
};

export default Settings;
