
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BranchManager {
  id: string;
  name: string;
  branch: string;
  email: string;
}

interface ManagerListProps {
  managers: BranchManager[];
  onUpdate: (id: string, manager: { name: string; branch: string; email: string }) => void;
  onDelete: (id: string) => void;
}

const ManagerList: React.FC<ManagerListProps> = ({ managers, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingManager, setEditingManager] = useState({
    name: '',
    branch: '',
    email: ''
  });

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

    onUpdate(id, {
      name: editingManager.name.trim(),
      branch: editingManager.branch.trim(),
      email: editingManager.email.trim()
    });

    setEditingId(null);
    setEditingManager({ name: '', branch: '', email: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingManager({ name: '', branch: '', email: '' });
  };

  return (
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
                          onClick={() => onDelete(manager.id)}
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

export default ManagerList;
