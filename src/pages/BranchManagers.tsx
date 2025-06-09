
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BranchManager {
  id: string;
  name: string;
  branch: string;
  email: string;
}

const BranchManagers: React.FC = () => {
  const [managers, setManagers] = useState<BranchManager[]>([]);
  const [newManager, setNewManager] = useState({
    name: '',
    branch: '',
    email: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingManager, setEditingManager] = useState({
    name: '',
    branch: '',
    email: ''
  });

  useEffect(() => {
    const savedManagers = localStorage.getItem('branchManagers');
    if (savedManagers) {
      setManagers(JSON.parse(savedManagers));
    }
  }, []);

  const saveManagers = (updatedManagers: BranchManager[]) => {
    setManagers(updatedManagers);
    localStorage.setItem('branchManagers', JSON.stringify(updatedManagers));
  };

  const addManager = () => {
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

    const manager: BranchManager = {
      id: Date.now().toString(),
      name: newManager.name.trim(),
      branch: newManager.branch.trim(),
      email: newManager.email.trim(),
    };

    const updatedManagers = [...managers, manager];
    saveManagers(updatedManagers);
    setNewManager({ name: '', branch: '', email: '' });
    
    toast({
      title: "สำเร็จ",
      description: "เพิ่มผู้จัดการสาขาเรียบร้อยแล้ว",
    });
  };

  const deleteManager = (id: string) => {
    const updatedManagers = managers.filter(manager => manager.id !== id);
    saveManagers(updatedManagers);
    
    toast({
      title: "สำเร็จ",
      description: "ลบผู้จัดการสาขาเรียบร้อยแล้ว",
    });
  };

  const startEdit = (manager: BranchManager) => {
    setEditingId(manager.id);
    setEditingManager({
      name: manager.name,
      branch: manager.branch,
      email: manager.email
    });
  };

  const saveEdit = (id: string) => {
    if (!editingManager.name.trim() || !editingManager.branch.trim() || !editingManager.email.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    if (!editingManager.email.includes('@')) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกอีเมลให้ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    const updatedManagers = managers.map(manager =>
      manager.id === id ? {
        ...manager,
        name: editingManager.name.trim(),
        branch: editingManager.branch.trim(),
        email: editingManager.email.trim()
      } : manager
    );
    saveManagers(updatedManagers);
    setEditingId(null);
    setEditingManager({ name: '', branch: '', email: '' });
    
    toast({
      title: "สำเร็จ",
      description: "แก้ไขข้อมูลเรียบร้อยแล้ว",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingManager({ name: '', branch: '', email: '' });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการผู้จัดการสาขา</h1>
        <p className="text-muted-foreground">จัดการข้อมูลผู้จัดการและสาขา</p>
      </div>

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
            <Button onClick={addManager}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มผู้จัดการสาขา
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการผู้จัดการสาขา</CardTitle>
          <CardDescription>จัดการข้อมูลผู้จัดการสาขาที่มีอยู่</CardDescription>
        </CardHeader>
        <CardContent>
          {managers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่มีข้อมูลผู้จัดการสาขา
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อผู้จัดการ</TableHead>
                  <TableHead>สาขา</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead className="w-[120px]">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      {editingId === manager.id ? (
                        <Input
                          value={editingManager.name}
                          onChange={(e) => setEditingManager({ ...editingManager, name: e.target.value })}
                        />
                      ) : (
                        manager.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === manager.id ? (
                        <Input
                          value={editingManager.branch}
                          onChange={(e) => setEditingManager({ ...editingManager, branch: e.target.value })}
                        />
                      ) : (
                        manager.branch
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === manager.id ? (
                        <Input
                          type="email"
                          value={editingManager.email}
                          onChange={(e) => setEditingManager({ ...editingManager, email: e.target.value })}
                        />
                      ) : (
                        manager.email
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === manager.id ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => saveEdit(manager.id)}>
                            บันทึก
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            ยกเลิก
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(manager)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteManager(manager.id)}
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

export default BranchManagers;
