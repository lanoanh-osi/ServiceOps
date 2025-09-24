import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import { Clock, MapPin, User, Package, CheckCircle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeliveryTicket {
  id: string;
  customer: string;
  address: string;
  phone: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'assigned' | 'accepted' | 'in-progress' | 'completed';
  items: Array<{
    code: string;
    name: string;
    quantity: number;
  }>;
  equipment: Array<{
    serial: string;
    name: string;
    brand: string;
  }>;
}

const mockTickets: DeliveryTicket[] = [
  {
    id: "DL001",
    customer: "Công ty ABC Lab",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "0901234567",
    deadline: "25/09/2024",
    priority: "high",
    status: "assigned",
    items: [
      { code: "SP001", name: "Máy phân tích ABC", quantity: 1 },
      { code: "SP002", name: "Cảm biến nhiệt độ", quantity: 2 }
    ],
    equipment: [
      { serial: "ABC123456", name: "Máy phân tích ABC Model X", brand: "Brand A" },
      { serial: "DEF789012", name: "Cảm biến T-200", brand: "Brand B" }
    ]
  },
  {
    id: "DL002", 
    customer: "Trường ĐH XYZ",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    phone: "0987654321",
    deadline: "26/09/2024",
    priority: "medium",
    status: "accepted",
    items: [
      { code: "SP003", name: "Kính hiển vi điện tử", quantity: 1 }
    ],
    equipment: [
      { serial: "MIC789456", name: "Kính hiển vi EM-500", brand: "Brand C" }
    ]
  },
  {
    id: "DL003",
    customer: "Bệnh viện DEF",
    address: "789 Hai Bà Trưng, Quận 1, TP.HCM", 
    phone: "0912345678",
    deadline: "24/09/2024",
    priority: "low",
    status: "completed",
    items: [
      { code: "SP004", name: "Máy xét nghiệm tự động", quantity: 1 }
    ],
    equipment: [
      { serial: "LAB456789", name: "Máy xét nghiệm AUTO-200", brand: "Brand D" }
    ]
  }
];

const DeliveryInstall = () => {
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

  const getStatusColor = (status: DeliveryTicket['status']) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: DeliveryTicket['status']) => {
    switch (status) {
      case 'assigned': return 'Đã phân công';
      case 'accepted': return 'Đã tiếp nhận';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      default: return 'Khác';
    }
  };

  const getPriorityColor = (priority: DeliveryTicket['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = (status: DeliveryTicket['status'][]) => 
    tickets.filter(ticket => status.includes(ticket.status));

  const TicketCard = ({ ticket }: { ticket: DeliveryTicket }) => (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(ticket.status)}>
              {getStatusLabel(ticket.status)}
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

        {/* Items */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Package className="h-4 w-4 mr-1" />
            Hàng hóa ({ticket.items.length})
          </h4>
          <div className="space-y-1">
            {ticket.items.map((item, index) => (
              <div key={index} className="text-sm bg-muted/50 p-2 rounded">
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  {item.code}
                </span>
                <span>{item.name}</span>
                <span className="float-right">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">
            Thiết bị ({ticket.equipment.length})
          </h4>
          <div className="space-y-1">
            {ticket.equipment.map((eq, index) => (
              <div key={index} className="text-sm bg-muted/50 p-2 rounded">
                <div className="font-mono text-xs text-muted-foreground">
                  S/N: {eq.serial}
                </div>
                <div>{eq.name}</div>
                <div className="text-xs text-muted-foreground">{eq.brand}</div>
              </div>
            ))}
          </div>
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
          <h1 className="text-2xl font-bold mb-2">Giao hàng & Lắp đặt</h1>
          <p className="text-muted-foreground">
            Quản lý các ticket giao hàng và lắp đặt thiết bị
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

export default DeliveryInstall;