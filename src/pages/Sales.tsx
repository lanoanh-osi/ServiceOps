import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import TicketList from "@/components/Dashboard/TicketList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import CreateActivityTicketForm from "@/components/CreateActivityTicketForm";

const Sales = () => {
  const [openCreateForm, setOpenCreateForm] = React.useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Hoạt động & Hỗ trợ" />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="mb-3">
          <Button
            variant="outline"
            onClick={() => setOpenCreateForm(true)}
            className="w-full justify-center bg-white border-primary text-primary hover:bg-primary/5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo mới
          </Button>
        </div>

        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned">Cần thực hiện</TabsTrigger>
            <TabsTrigger value="in-progress">Đang thực hiện</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assigned" className="mt-4">
            <TicketList type="sales" status="assigned" />
          </TabsContent>
          <TabsContent value="in-progress" className="mt-4">
            <TicketList type="sales" status="in-progress" />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <TicketList type="sales" status="completed" />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      {/* Create Activity Ticket Form */}
      <CreateActivityTicketForm 
        open={openCreateForm} 
        onOpenChange={setOpenCreateForm} 
      />
    </div>
  );
};

export default Sales;