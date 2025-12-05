import { Bell, Menu, User, Clock, Settings, LogOut, Grid3X3, HelpCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import mondjaiLogo from "@/assets/mondjai-logo.png";

export const TopBar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const firstLetter = user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30 safe-area-top"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center"
        >
          <img src={mondjaiLogo} alt="MonDjai" className="h-8" />
        </motion.div>

        {/* Right side: Notifications & Menu */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NavLink to="/notifications" className="relative">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </NavLink>

          {/* Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="w-5 h-5" />
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-popover shadow-xl border-border/50">
              {/* User Profile */}
              <DropdownMenuItem 
                onClick={() => navigate("/settings")} 
                className="flex items-center gap-3 py-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-sm flex items-center justify-center">
                  {firstLetter}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.isStudent ? "Étudiant" : "Utilisateur"}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/history")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Historique</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/categories")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <span>Catégories</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Réglages</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/help")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span>Aide & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 py-2.5 cursor-pointer text-danger">
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};
