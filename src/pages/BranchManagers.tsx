
import React from 'react';
import ManagerForm from '@/components/manager/ManagerForm';
import ManagerList from '@/components/manager/ManagerList';
import { useBranchManagers } from '@/hooks/useBranchManagers';

const BranchManagers: React.FC = () => {
  const { managers, addManager, updateManager, deleteManager } = useBranchManagers();

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">จัดการผู้จัดการสาขา</h1>
        <p className="text-sm sm:text-base text-muted-foreground">จัดการข้อมูลผู้จัดการและสาขา</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <ManagerForm onAdd={addManager} />
        <ManagerList 
          managers={managers}
          onUpdate={updateManager}
          onDelete={deleteManager}
        />
      </div>
    </div>
  );
};

export default BranchManagers;
