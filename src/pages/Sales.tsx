import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import { Clock, MapPin, User, Users, CheckCircle, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SalesTicket {
  id: string;
  customer: string;
  contact: string;
  address: string;
  phone: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'assigned' | 'accepted' | 'in-progress' | 'completed';
  type: 'consultation' | 'demo' | 'training' | 'support';
  requirement: string;
  description: string;
  estimatedDuration: string;
}

const mockTickets: SalesTicket[] = [
  {
    id: "KD001",
    customer: "Công ty ABC Lab",
    contact: "Nguyễn Văn A - Giám đốc",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "0901234567",
    deadline: "25/09/2024",
    priority: "high",
    status: "assigned",
    type: "consultation",
    requirement: "Tư vấn thiết lập phòng lab mới",
    description: "Khách hàng muốn thiết lập phòng lab phân tích thực phẩm, cần tư vấn về thiết bị và layout",
    estimatedDuration: "2 giờ"
  },
  {
    id: "KD002", 
    customer: "Trường ĐH XYZ",
    contact: "TS. Lê Thị B - Trưởng khoa",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    phone: "0987654321",
    deadline: "26/09/2024",
    priority: "medium",
    status: "accepted",
    type: "demo",
    requirement: "Demo máy phân tích mới",
    description: "Trình diễn tính năng và hiệu suất của máy phân tích phổ mới cho ban lãnh đạo khoa",
    estimatedDuration: "3 giờ"
  },
  {
    id: "KD003",
    customer: "Bệnh viện DEF",
    contact: "BS. Trần Văn C - Trưởng phòng",
    address: "789 Hai Bà Trưng, Quận 1, TP.HCM", 
    phone: "0912345678",
    deadline: "24/09/2024",
    priority: "medium",
    status: "completed",
    type: "training",
    requirement: "Đào tạo vận hành thiết bị",
    description: "Đào tạo kỹ thuật viên sử dụng máy xét nghiệm tự động mới",
    estimatedDuration: "4 giờ"
  }
];

const Sales = () => {
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

  const getStatusColor = (status: SalesTicket['status']) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: SalesTicket['status']) => {
    switch (status) {
      case 'assigned': return 'Đã phân công';
      case 'accepted': return 'Đã tiếp nhận';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      default: return 'Khác';
    }
  };

  const getTypeColor = (type: SalesTicket['type']) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'demo': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: SalesTicket['type']) => {
    switch (type) {
      case 'consultation': return 'Tư vấn';
      case 'demo': return 'Demo';
      case 'training': return 'Đào tạo';
      case 'support': return 'Hỗ trợ';
      default: return 'Khác';
    }
  };

  const getPriorityColor = (priority: SalesTicket['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = (status: SalesTicket['status'][]) => 
    tickets.filter(ticket => status.includes(ticket.status));

  const TicketCard = ({ ticket }: { ticket: SalesTicket }) => (
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
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{ticket.contact}</span>
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

        {/* Requirement */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            Yêu cầu
          </h4>
          <div className="bg-primary/5 p-3 rounded border-l-4 border-primary">
            <p className="font-medium text-primary-dark">{ticket.requirement}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Thời gian dự kiến: {ticket.estimatedDuration}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Chi tiết</h4>
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
          <h1 className="text-2xl font-bold mb-2">Hỗ trợ Kinh doanh</h1>
          <p className="text-muted-foreground">
            Quản lý các hoạt động tư vấn, demo, đào tạo và hỗ trợ khách hàng
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

export default Sales;