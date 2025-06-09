
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Manager {
  id: string;
  name: string;
  branch: string;
  email: string;
}

interface ManagerListProps {
  managers: Manager[];
  onUpdate: (id: string, manager: { name: string; branch: string; email: string }) => void;
  onDelete: (id: string) => void;
}

const ManagerList: React.FC<ManagerListProps> = ({ managers, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({ name: '', branch: '', email: '' });

  const handleEdit = (manager: Manager) => {
    setEditingId(manager.id);
    setEditingData({
      name: manager.name,
      branch: manager.branch,
      email: manager.email
    });
  };

  const handleSave = () => {
    if (!editingData.name.trim() || !editingData.branch.trim() || !editingData.email.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    onUpdate(editingId!, {
      name: editingData.name.trim(),
      branch: editingData.branch.trim(),
      email: editingData.email.trim()
    });
    
    setEditingId(null);
    setEditingData({ name: '', branch: '', email: '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({ name: '', branch: '', email: '' });
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">รายการผู้จัดการสาขา</CardTitle>
          <Badge variant="outline" className="w-fit">
            {managers.length} คน
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {managers.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
            ยังไม่มีข้อมูลผู้จัดการ
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              {managers.map((manager) => (
                <div key={manager.id} className="border rounded-lg p-4">
                  {editingId === manager.id ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="ชื่อ-นามสกุล"
                        value={editingData.name}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        placeholder="ชื่อสาขา"
                        value={editingData.branch}
                        onChange={(e) => setEditingData({ ...editingData, branch: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        type="email"
                        placeholder="อีเมล"
                        value={editingData.email}
                        onChange={(e) => setEditingData({ ...editingData, email: e.target.value })}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} className="flex-1 text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          บันทึก
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1 text-xs">
                          <X className="h-3 w-3 mr-1" />
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-sm">{manager.name}</p>
                        <p className="text-xs text-muted-foreground">{manager.branch}</p>
                        <p className="text-xs text-muted-foreground break-all">{manager.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(manager)} className="flex-1 text-xs">
                          <Pencil className="h-3 w-3 mr-1" />
                          แก้ไข
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(manager.id)} className="flex-1 text-xs">
                          <Trash2 className="h-3 w-3 mr-1" />
                          ลบ
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm font-medium">ชื่อผู้จัดการ</TableHead>
                    <TableHead className="text-sm font-medium">สาขา</TableHead>
                    <TableHead className="text-sm font-medium">อีเมล</TableHead>
                    <TableHead className="text-sm font-medium text-center">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map((manager) => (
                    <TableRow key={manager.id}>
                      {editingId === manager.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editingData.name}
                              onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                              className="text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editingData.branch}
                              onChange={(e) => setEditingData({ ...editingData, branch: e.target.value })}
                              className="text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="email"
                              value={editingData.email}
                              onChange={(e) => setEditingData({ ...editingData, email: e.target.value })}
                              className="text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              <Button size="sm" onClick={handleSave} className="text-xs px-2">
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel} className="text-xs px-2">
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium text-sm">{manager.name}</TableCell>
                          <TableCell className="text-sm">{manager.branch}</TableCell>
                          <TableCell className="text-sm break-all">{manager.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(manager)} className="text-xs px-2">
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(manager.id)} className="text-xs px-2">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagerList;
