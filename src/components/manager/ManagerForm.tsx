
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
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !branch.trim() || !email.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      name: name.trim(),
      branch: branch.trim(),
      email: email.trim()
    });
    
    setName('');
    setBranch('');
    setEmail('');
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">เพิ่มผู้จัดการสาขาใหม่</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          เพิ่มข้อมูลผู้จัดการและสาขา
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">ชื่อผู้จัดการ</label>
            <Input
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ชื่อสาขา</label>
            <Input
              placeholder="ชื่อสาขา"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium">อีเมล</label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>
        </div>
        <Button 
          onClick={handleSubmit}
          className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มผู้จัดการ
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManagerForm;
