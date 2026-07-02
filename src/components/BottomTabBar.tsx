import { NavLink, useLocation } from "react-router-dom";
import { House, Wallet, Plus, ChartBar as BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export const BottomTabBar = () => {
  const location = useLocation();

  const tabs: Array<{ path: string; icon: typeof House; label: string; isSpecial?: boolean }> = [
    { path: "/", icon: House, label: "Accueil" },
    { path: "/budgets", icon: Wallet, label: "Budgets" },
    { path: "/add-transaction", icon: Plus, label: "Ajouter", isSpecial: true },
    { path: "/stats", icon: BarChart3, label: "Stats" },
  ];

  const isActive = (path: string) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom pointer-events-none">
      <div className="flex items-end justify-center px-6 pb-5">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className="pointer-events-auto relative flex items-center justify-between w-full max-w-sm h-16 px-3 rounded-full"
          style={{
            background: "hsl(var(--card) / 0.9)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid hsl(var(--border) / 0.8)",
            boxShadow: "0 12px 40px -8px rgba(15,92,65,0.18), 0 2px 8px rgba(15,92,65,0.08)",
          }}
        >
          {tabs.map((tab) => {
            const active = isActive(tab.path);

            if (tab.isSpecial) {
              return (
                <NavLink key={tab.path} to={tab.path} className="flex-1 flex items-center justify-center -mt-8 pointer-events-auto">
                  <motion.div
                    whileHover={{ scale: 1.06, rotate: 90 }}
                    whileTap={{ scale: 0.92, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--gradient-cta)",
                      boxShadow: "var(--shadow-cta), 0 0 0 4px hsl(var(--background))",
                    }}
                  >
                    <Plus className="w-6 h-6 text-white" strokeWidth={2.8} />
                  </motion.div>
                </NavLink>
              );
            }

            return (
              <NavLink key={tab.path} to={tab.path} className="flex-1 flex flex-col items-center justify-center pointer-events-auto">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="relative w-11 h-11 flex items-center justify-center"
                >
                  {active && (
                    <motion.div
                      layoutId="activeBg"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "hsl(var(--primary) / 0.12)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={{ y: active ? -1 : 0, scale: active ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="relative z-10"
                  >
                    <tab.icon
                      className={`w-[22px] h-[22px] transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.div>
                </motion.div>
                {active && (
                  <motion.span
                    layoutId="activeDot"
                    className="w-1 h-1 rounded-full bg-primary mt-0.5"
                  />
                )}
              </NavLink>
            );
          })}
        </motion.div>
      </div>
    </nav>
  );
};
