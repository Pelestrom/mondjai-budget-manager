import { NavLink, useLocation } from "react-router-dom";
import { Chrome as Home, Wallet, Plus, ChartBar as BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export const BottomTabBar = () => {
  const location = useLocation();

  const tabs = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/budgets", icon: Wallet, label: "Budgets" },
    { path: "/add-transaction", icon: Plus, label: "Ajouter", isSpecial: true },
    { path: "/stats", icon: BarChart3, label: "Stats" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="flex items-center justify-center px-6 pb-6">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="bg-card rounded-full shadow-2xl border border-border/20 flex items-center justify-around w-full max-w-sm h-16 px-2"
        >
          {tabs.map((tab, index) => {
            const active = isActive(tab.path);

            if (tab.isSpecial) {
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className="relative flex items-center justify-center -mx-2"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.05 }}
                    className="w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-xl hover:shadow-primary/40 transition-shadow"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </motion.div>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center flex-1 relative"
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                  className="flex flex-col items-center justify-center p-3 rounded-full transition-colors"
                >
                  {active && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 bg-primary/10 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={{
                      scale: active ? 1.2 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative z-10"
                  >
                    <tab.icon
                      className={`w-6 h-6 transition-all duration-300 ${
                        active ? "text-primary" : "text-muted-foreground hover:text-primary"
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                      fill={active ? "currentColor" : "none"}
                    />
                  </motion.div>
                </motion.div>
              </NavLink>
            );
          })}
        </motion.div>
      </div>
    </nav>
  );
};
