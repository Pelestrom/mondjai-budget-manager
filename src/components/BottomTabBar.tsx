import { NavLink, useLocation } from "react-router-dom";
import { Home, TrendingUp, Wallet, Plus } from "lucide-react";
import { motion } from "framer-motion";

export const BottomTabBar = () => {
  const location = useLocation();
  
  const tabs = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/budgets", icon: Wallet, label: "Budgets" },
    { path: "/add-transaction", icon: Plus, label: "Ajouter", isSpecial: true },
    { path: "/stats", icon: TrendingUp, label: "Stats" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/30 safe-area-bottom">
      <div className="flex items-center justify-around h-20 px-4 max-w-md mx-auto relative">
        {tabs.map((tab) => {
          const active = isActive(tab.path);

          if (tab.isSpecial) {
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="relative flex flex-col items-center justify-center -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/40 flex items-center justify-center"
                >
                  <Plus className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                  {tab.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center py-2 px-4"
            >
              <motion.div
                animate={{
                  scale: active ? 1 : 1,
                  y: active ? -4 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative flex flex-col items-center"
              >
                {active && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute -inset-3 bg-primary/10 rounded-2xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  className={`relative z-10 p-2 rounded-xl ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                </motion.div>
                <motion.span
                  className={`text-[10px] mt-0.5 font-medium relative z-10 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </motion.span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
