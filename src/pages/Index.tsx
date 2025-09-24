import { CheckCircle, Clock, Star, TrendingUp, Package, Wrench, Users } from "lucide-react";
import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import StatsCard from "@/components/Dashboard/StatsCard";
import TicketList from "@/components/Dashboard/TicketList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content */}  
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-hero rounded-lg p-6 text-white mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Chào mừng, Kỹ thuật viên!
            </h1>
            <p className="text-blue-100">
              Hôm nay bạn có <span className="font-semibold">3 ticket</span> cần thực hiện
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Ticket hoàn thành"
            value={28}
            icon={CheckCircle}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Tỷ lệ đúng hạn"
            value="94%"
            icon={Clock}
            trend={{ value: 3, isPositive: true }}
          />
          <StatsCard
            title="Đánh giá TB"
            value="4.8"
            icon={Star}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Phản hồi nhanh"
            value="96%"
            icon={TrendingUp}
            trend={{ value: 2, isPositive: true }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 text-center shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Giao hàng</h3>
            <p className="text-xs text-muted-foreground">& Lắp đặt</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 text-center shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-3">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Bảo hành</h3>
            <p className="text-xs text-muted-foreground">& Sửa chữa</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 text-center shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Hỗ trợ</h3>
            <p className="text-xs text-muted-foreground">Kinh doanh</p>
          </div>
        </div>

        {/* Ticket List */}
        <TicketList />
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
