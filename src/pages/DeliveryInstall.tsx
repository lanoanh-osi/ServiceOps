import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import TicketList from "@/components/Dashboard/TicketList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DeliveryInstall = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Giao hàng & Lắp đặt" />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        

        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned">Tiếp nhận</TabsTrigger>
            <TabsTrigger value="in-progress">Đang thực hiện</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-4">
            <TicketList type="delivery" status="assigned" />
          </TabsContent>
          <TabsContent value="in-progress" className="mt-4">
            <TicketList type="delivery" status="in-progress" />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <TicketList type="delivery" status="completed" />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default DeliveryInstall;