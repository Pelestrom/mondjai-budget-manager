import { NavLink } from "@/components/NavLink";
import { Home, Bell, Grid3x3, TrendingUp, Settings } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";

export const BottomTabBar = () => {
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());

  const tabs = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/notifications", icon: Bell, label: "Alertes", badge: unreadCount },
    { path: "/categories", icon: Grid3x3, label: "Catégories" },
    { path: "/stats", icon: TrendingUp, label: "Stats" },
    { path: "/settings", icon: Settings, label: "Réglages" },
  ];

  return (
    <nav className="tab-bar-mobile">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end
            className="flex flex-col items-center justify-center flex-1 h-full relative group"
            activeClassName="text-primary"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <div className="relative">
                  <tab.icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  />
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 transition-all duration-200 ${
                    isActive ? "font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
