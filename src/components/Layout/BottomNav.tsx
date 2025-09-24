import { Home, Package, Wrench, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Trang chủ", path: "/" },
  { icon: Package, label: "Giao hàng", path: "/delivery-install" },
  { icon: Wrench, label: "Bảo hành", path: "/maintenance" },
  { icon: BarChart3, label: "Kinh doanh", path: "/sales" },
  { icon: User, label: "Cá nhân", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-elevated md:hidden">
      <div className="grid h-16 max-w-lg grid-cols-5 mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-accent transition-colors",
                isActive && "text-primary"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-1", isActive && "text-primary")} />
              <span className={cn(
                "text-xs",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;