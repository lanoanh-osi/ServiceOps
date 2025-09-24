import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  type: 'delivery' | 'maintenance' | 'sales';
  title: string;
  customer: string;
  address: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'assigned' | 'in-progress' | 'completed';
}

const mockTickets: Ticket[] = [
  {
    id: "TK001",
    type: "delivery",
    title: "Lắp đặt máy phân tích",
    customer: "Công ty ABC",
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
    deadline: "25/09/2024",
    priority: "high",
    status: "assigned"
  },
  {
    id: "TK002", 
    type: "maintenance",
    title: "Bảo trì thiết bị định kỳ",
    customer: "Trường ĐH XYZ",
    address: "456 Lê Lợi, Q3, TP.HCM",
    deadline: "26/09/2024",
    priority: "medium",
    status: "assigned"
  },
  {
    id: "TK003",
    type: "sales",
    title: "Tư vấn giải pháp lab",
    customer: "Bệnh viện DEF",
    address: "789 Hai Bà Trưng, Q1, TP.HCM",
    deadline: "27/09/2024",
    priority: "low",
    status: "assigned"
  }
];

const getTypeColor = (type: Ticket['type']) => {
  switch (type) {
    case 'delivery': return 'bg-blue-100 text-blue-800';
    case 'maintenance': return 'bg-orange-100 text-orange-800';
    case 'sales': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: Ticket['type']) => {
  switch (type) {
    case 'delivery': return 'Giao hàng';
    case 'maintenance': return 'Bảo trì';
    case 'sales': return 'Kinh doanh';
    default: return 'Khác';
  }
};

const getPriorityColor = (priority: Ticket['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const TicketList = () => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ticket cần thực hiện</span>
          <Badge variant="secondary">{mockTickets.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 rounded-lg border hover:shadow-card transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Badge className={cn("text-xs", getTypeColor(ticket.type))}>
                  {getTypeLabel(ticket.type)}
                </Badge>
                <Badge className={cn("text-xs", getPriorityColor(ticket.priority))}>
                  {ticket.priority === 'high' ? 'Cao' : 
                   ticket.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                </Badge>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {ticket.id}
              </span>
            </div>
            
            <h4 className="font-semibold text-foreground mb-2">
              {ticket.title}
            </h4>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{ticket.customer}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{ticket.address}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-1 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600 font-medium">
                  Hạn: {ticket.deadline}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Đã phân công
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TicketList;