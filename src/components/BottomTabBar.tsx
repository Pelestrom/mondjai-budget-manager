import { NavLink, useLocation } from "react-router-dom";
import { Chrome as Home, TrendingUp, Wallet, Plus, Menu } from "lucide-react";
import { motion } from "framer-motion";

export const BottomTabBar = () => {
  const location = useLocation();

  const tabs = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/budgets", icon: Wallet, label: "Budgets" },
    { path: "/add-transaction", icon: Plus, label: "Ajouter", isSpecial: true },
    { path: "/stats", icon: TrendingUp, label: "Stats" },
    { path: "/settings", icon: Menu, label: "Menu" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="flex items-center justify-center px-6 pb-6">
        <div className="bg-foreground rounded-full shadow-2xl flex items-center justify-around w-full max-w-xs h-16 px-2">
          {tabs.map((tab) => {
            const active = isActive(tab.path);

            if (tab.isSpecial) {
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className="relative flex items-center justify-center"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center"
                  >
                    <Plus className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center flex-1"
              >
                <motion.div
                  animate={{
                    scale: active ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex flex-col items-center justify-center p-3"
                >
                  <tab.icon
                    className={`w-5 h-5 ${
                      active ? "text-primary" : "text-background/60"
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                    fill={active ? "currentColor" : "none"}
                  />
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
