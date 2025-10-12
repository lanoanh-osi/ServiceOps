import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import TicketList from "@/components/Dashboard/TicketList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import React from "react";
import { Plus } from "lucide-react";
import CreateEmergencyMaintenanceForm from "@/components/CreateEmergencyMaintenanceForm";

const Maintenance = () => {
  const [openEmergencyForm, setOpenEmergencyForm] = React.useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Bảo hành & Sửa chữa" />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="mb-3">
          <Button
            variant="outline"
            onClick={() => setOpenEmergencyForm(true)}
            className="w-full justify-center bg-white border-primary text-primary hover:bg-primary/5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo xử lý khẩn cấp
          </Button>
        </div>

        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned">Tiếp nhận</TabsTrigger>
            <TabsTrigger value="in-progress">Đang thực hiện</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-4">
            <TicketList type="maintenance" status="assigned" />
          </TabsContent>
          <TabsContent value="in-progress" className="mt-4">
            <TicketList type="maintenance" status="in-progress" />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <TicketList type="maintenance" status="completed" />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      {/* Emergency Maintenance Form */}
      <CreateEmergencyMaintenanceForm 
        open={openEmergencyForm} 
        onOpenChange={setOpenEmergencyForm} 
      />
    </div>
  );
};

export default Maintenance;