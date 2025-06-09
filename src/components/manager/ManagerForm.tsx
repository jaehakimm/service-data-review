
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ManagerFormProps {
  onAdd: (manager: { name: string; branch: string; email: string }) => void;
}

const ManagerForm: React.FC<ManagerFormProps> = ({ onAdd }) => {
  const [newManager, setNewManager] = useState({
    name: '',
    branch: '',
    email: ''
  });

  const handleSubmit = () => {
    if (!newManager.name.trim() || !newManager.branch.trim() || !newManager.email.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    if (!newManager.email.includes('@')) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกอีเมลให้ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      name: newManager.name.trim(),
      branch: newManager.branch.trim(),
      email: newManager.email.trim(),
    });
    
    setNewManager({ name: '', branch: '', email: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>เพิ่มผู้จัดการสาขาใหม่</CardTitle>
        <CardDescription>กรอกข้อมูลผู้จัดการสาขาใหม่</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="ชื่อผู้จัดการ"
            value={newManager.name}
            onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
          />
          <Input
            placeholder="ชื่อสาขา"
            value={newManager.branch}
            onChange={(e) => setNewManager({ ...newManager, branch: e.target.value })}
          />
          <Input
            type="email"
            placeholder="อีเมล"
            value={newManager.email}
            onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มผู้จัดการสาขา
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerForm;
