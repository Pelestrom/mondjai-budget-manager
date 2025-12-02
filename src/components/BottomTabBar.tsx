import { NavLink } from "@/components/NavLink";
import { Home, Grid3x3, TrendingUp, Wallet, Plus } from "lucide-react";
import { motion } from "framer-motion";

export const BottomTabBar = () => {
  const tabs = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/categories", icon: Grid3x3, label: "Catégories" },
    { path: "/add-transaction", icon: Plus, label: "Ajouter", isSpecial: true },
    { path: "/budgets", icon: Wallet, label: "Budgets" },
    { path: "/stats", icon: TrendingUp, label: "Stats" },
  ];

  return (
    <nav className="tab-bar-mobile glassmorphism">
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
                {tab.isSpecial ? (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center"
                  >
                    <tab.icon className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <tab.icon
                      className={`w-5 h-5 transition-all duration-200 ${
                        isActive ? "scale-110" : ""
                      }`}
                    />
                  </motion.div>
                )}
                {!tab.isSpecial && (
                  <span
                    className={`text-[10px] mt-1 transition-all duration-200 ${
                      isActive ? "font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
