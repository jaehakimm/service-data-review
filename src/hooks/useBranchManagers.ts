
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface BranchManager {
  id: string;
  name: string;
  branch: string;
  email: string;
}

export const useBranchManagers = () => {
  const [managers, setManagers] = useState<BranchManager[]>([]);

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

  const addManager = (managerData: { name: string; branch: string; email: string }) => {
    const manager: BranchManager = {
      id: Date.now().toString(),
      ...managerData,
    };

    const updatedManagers = [...managers, manager];
    saveManagers(updatedManagers);
    
    toast({
      title: "สำเร็จ",
      description: "เพิ่มผู้จัดการสาขาเรียบร้อยแล้ว",
    });
  };

  const updateManager = (id: string, managerData: { name: string; branch: string; email: string }) => {
    const updatedManagers = managers.map(manager =>
      manager.id === id ? { ...manager, ...managerData } : manager
    );
    saveManagers(updatedManagers);
    
    toast({
      title: "สำเร็จ",
      description: "แก้ไขข้อมูลเรียบร้อยแล้ว",
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

  return {
    managers,
    addManager,
    updateManager,
    deleteManager,
  };
};
