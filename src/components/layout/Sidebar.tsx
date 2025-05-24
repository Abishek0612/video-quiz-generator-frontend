import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Upload,
  Shield,
  FileVideo,
  HelpCircle,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Upload Video",
      href: "/upload",
      icon: Upload,
    },
  ];

  if (user?.role === "admin") {
    navigation.push({
      name: "Admin",
      href: "/admin",
      icon: Shield,
    });
  }

  return (
    <aside className="w-64 border-r bg-background min-h-screen">
      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center space-x-2 mb-2">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Need Help?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Check out our documentation for tips on getting the best results.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            View Docs
          </Button>
        </div>
      </div>
    </aside>
  );
}
