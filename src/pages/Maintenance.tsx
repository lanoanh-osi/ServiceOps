import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import { Clock, MapPin, User, Wrench, CheckCircle, Phone, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceTicket {
  id: string;
  customer: string;
  address: string;
  phone: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'assigned' | 'accepted' | 'in-progress' | 'completed';
  type: 'warranty' | 'repair' | 'maintenance';
  equipment: {
    serial: string;
    name: string;
    brand: string;
    issue: string;
  };
  description: string;
}

const mockTickets: MaintenanceTicket[] = [
  {
    id: "BH001",
    customer: "Công ty ABC Lab",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "0901234567",
    deadline: "25/09/2024",
    priority: "high",
    status: "assigned",
    type: "warranty",
    equipment: {
      serial: "ABC123456",
      name: "Máy phân tích ABC Model X",
      brand: "Brand A",
      issue: "Màn hình không hiển thị"
    },
    description: "Khách hàng báo máy bị lỗi màn hình sau 1 năm sử dụng, cần kiểm tra bảo hành"
  },
  {
    id: "BH002", 
    customer: "Trường ĐH XYZ",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    phone: "0987654321",
    deadline: "26/09/2024",
    priority: "medium",
    status: "accepted",
    type: "maintenance",
    equipment: {
      serial: "MIC789456",
      name: "Kính hiển vi EM-500",
      brand: "Brand C",
      issue: "Bảo trì định kỳ 6 tháng"
    },
    description: "Bảo trì định kỳ theo lịch, vệ sinh và hiệu chuẩn thiết bị"
  },
  {
    id: "BH003",
    customer: "Bệnh viện DEF",
    address: "789 Hai Bà Trưng, Quận 1, TP.HCM", 
    phone: "0912345678",
    deadline: "24/09/2024",
    priority: "high",
    status: "completed",
    type: "repair",
    equipment: {
      serial: "LAB456789",
      name: "Máy xét nghiệm AUTO-200",
      brand: "Brand D",
      issue: "Bơm mẫu bị kẹt"
    },
    description: "Sửa chữa hệ thống bơm mẫu, thay thế linh kiện hỏng"
  }
];

const Maintenance = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const { toast } = useToast();

  const handleAcceptTicket = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'accepted' as const }
        : ticket
    ));
    toast({
      title: "Đã tiếp nhận ticket",
      description: `Ticket ${ticketId} đã được tiếp nhận thành công`,
    });
  };

  const getStatusColor = (status: MaintenanceTicket['status']) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MaintenanceTicket['status']) => {
    switch (status) {
      case 'assigned': return 'Đã phân công';
      case 'accepted': return 'Đã tiếp nhận';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      default: return 'Khác';
    }
  };

  const getTypeColor = (type: MaintenanceTicket['type']) => {
    switch (type) {
      case 'warranty': return 'bg-blue-100 text-blue-800';
      case 'repair': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: MaintenanceTicket['type']) => {
    switch (type) {
      case 'warranty': return 'Bảo hành';
      case 'repair': return 'Sửa chữa';
      case 'maintenance': return 'Bảo trì';
      default: return 'Khác';
    }
  };

  const getPriorityColor = (priority: MaintenanceTicket['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = (status: MaintenanceTicket['status'][]) => 
    tickets.filter(ticket => status.includes(ticket.status));

  const TicketCard = ({ ticket }: { ticket: MaintenanceTicket }) => (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(ticket.status)}>
              {getStatusLabel(ticket.status)}
            </Badge>
            <Badge className={getTypeColor(ticket.type)}>
              {getTypeLabel(ticket.type)}
            </Badge>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority === 'high' ? 'Cao' : 
               ticket.priority === 'medium' ? 'Trung bình' : 'Thấp'}
            </Badge>
          </div>
          <span className="text-sm font-mono text-muted-foreground">
            {ticket.id}
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{ticket.customer}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{ticket.address}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{ticket.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">
              Hạn: {ticket.deadline}
            </span>
          </div>
        </div>

        {/* Equipment */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Wrench className="h-4 w-4 mr-1" />
            Thiết bị
          </h4>
          <div className="bg-muted/50 p-3 rounded">
            <div className="font-mono text-xs text-muted-foreground mb-1">
              S/N: {ticket.equipment.serial}
            </div>
            <div className="font-medium">{ticket.equipment.name}</div>
            <div className="text-xs text-muted-foreground mb-2">{ticket.equipment.brand}</div>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-orange-700 font-medium">
                {ticket.equipment.issue}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Mô tả</h4>
          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
            {ticket.description}
          </p>
        </div>

        {/* Actions */}
        {ticket.status === 'assigned' && (
          <Button 
            onClick={() => handleAcceptTicket(ticket.id)}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Tiếp nhận
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Bảo hành & Sửa chữa</h1>
          <p className="text-muted-foreground">
            Quản lý các ticket bảo hành, sửa chữa và bảo trì thiết bị
          </p>
        </div>

        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned">
              Tiếp nhận ({filteredTickets(['assigned']).length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              Đang thực hiện ({filteredTickets(['accepted', 'in-progress']).length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Đã hoàn thành ({filteredTickets(['completed']).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="assigned" className="space-y-4">
            {filteredTickets(['assigned']).map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            {filteredTickets(['accepted', 'in-progress']).map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {filteredTickets(['completed']).map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Maintenance;