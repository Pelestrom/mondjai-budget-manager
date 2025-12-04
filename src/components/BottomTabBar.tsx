import { NavLink, useLocation } from "react-router-dom";
import { Home, TrendingUp, Wallet, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const BottomTabBar = () => {
  const location = useLocation();
  
  const tabs = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/budgets", icon: Wallet, label: "Budgets" },
    { path: "/add-transaction", icon: Plus, label: "Ajouter", isSpecial: true },
    { path: "/stats", icon: TrendingUp, label: "Stats" },
  ];

  const activeIndex = tabs.findIndex(tab => 
    tab.path === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.path)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="mx-4 mb-4">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="relative bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Active background indicator */}
          <AnimatePresence>
            {activeIndex !== -1 && !tabs[activeIndex]?.isSpecial && (
              <motion.div
                layoutId="activeTab"
                className="absolute top-1 bottom-1 bg-primary/10 rounded-xl"
                style={{
                  width: `calc(${100 / tabs.length}% - 8px)`,
                  left: `calc(${(activeIndex * 100) / tabs.length}% + 4px)`,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </AnimatePresence>

          <div className="flex items-center justify-around h-16 px-2 relative">
            {tabs.map((tab, index) => {
              const isActive = tab.path === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(tab.path);

              if (tab.isSpecial) {
                return (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    className="relative flex items-center justify-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute -top-8 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center"
                    >
                      <Plus className="w-7 h-7 text-white" />
                    </motion.div>
                    <span className="text-[10px] text-muted-foreground mt-6">
                      {tab.label}
                    </span>
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className="flex-1 flex flex-col items-center justify-center h-full relative z-10"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{
                        color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                      }}
                    >
                      <tab.icon className="w-5 h-5" />
                    </motion.div>
                    <motion.span
                      animate={{
                        color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                        fontWeight: isActive ? 600 : 400,
                      }}
                      className="text-[10px] mt-1"
                    >
                      {tab.label}
                    </motion.span>
                    {isActive && (
                      <motion.div
                        layoutId="activeDot"
                        className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </NavLink>
              );
            })}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};