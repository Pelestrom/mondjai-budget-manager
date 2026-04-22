import { Bell, Check, X, Trash2, ArrowLeft, AlertTriangle, Lightbulb, Info, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notificationStore";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAsUnread, deleteNotification } =
    useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-warning/20 text-warning";
      case "success":
        return "bg-success/20 text-success";
      case "error":
        return "bg-danger/20 text-danger";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "warning":
        return "Alerte";
      case "success":
        return "Succès";
      case "error":
        return "Attention";
      default:
        return "Info";
    }
  };

  return (
    <div className="min-h-screen pb-8 pt-20">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {notifications.filter((n) => !n.read).length} non lues
            </p>
          </div>
          <Bell className="w-6 h-6 text-primary" />
        </motion.div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune notification</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`p-4 ${
                    !notif.read ? "border-l-4 border-l-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${getBgColor(
                          notif.type
                        )} flex items-center justify-center flex-shrink-0`}
                      >
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getBgColor(notif.type)}`}>
                            {getTypeLabel(notif.type)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground">
                          {notif.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(notif.date), "PPp", { locale: fr })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!notif.read ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notif.id)}
                          className="text-xs"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Marquer lu
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsUnread(notif.id)}
                          className="text-xs"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Marquer non lu
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notif.id)}
                        className="text-xs text-danger"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
