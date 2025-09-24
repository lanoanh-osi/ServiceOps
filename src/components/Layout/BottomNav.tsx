import { Home, Package, Wrench, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Trang chủ", active: true },
  { icon: Package, label: "Giao hàng", active: false },
  { icon: Wrench, label: "Bảo hành", active: false },
  { icon: BarChart3, label: "Kinh doanh", active: false },
  { icon: User, label: "Cá nhân", active: false },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-elevated md:hidden">
      <div className="grid h-16 max-w-lg grid-cols-5 mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-accent transition-colors",
                item.active && "text-primary"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-1", item.active && "text-primary")} />
              <span className={cn(
                "text-xs",
                item.active ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;