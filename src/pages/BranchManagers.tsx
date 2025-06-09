
import React from 'react';
import ManagerForm from '@/components/manager/ManagerForm';
import ManagerList from '@/components/manager/ManagerList';
import { useBranchManagers } from '@/hooks/useBranchManagers';

const BranchManagers: React.FC = () => {
  const { managers, addManager, updateManager, deleteManager } = useBranchManagers();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการผู้จัดการสาขา</h1>
        <p className="text-muted-foreground">จัดการข้อมูลผู้จัดการและสาขา</p>
      </div>

      <ManagerForm onAdd={addManager} />
      <ManagerList 
        managers={managers}
        onUpdate={updateManager}
        onDelete={deleteManager}
      />
    </div>
  );
};

export default BranchManagers;
