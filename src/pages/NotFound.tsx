
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-muted-foreground mb-4">404</CardTitle>
          <h1 className="text-2xl font-bold">ไม่พบหน้าที่ร้องขอ</h1>
          <p className="text-muted-foreground">
            ขออภัย หน้าที่คุณกำลังค้นหาไม่มีอยู่
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              กลับสู่หน้าหลัก
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
