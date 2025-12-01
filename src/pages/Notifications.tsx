import { Bell, Check, X, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notificationStore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Notifications = () => {
  const { notifications, markAsRead, markAsUnread, deleteNotification } =
    useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-warning/10";
      case "success":
        return "bg-success/10";
      case "error":
        return "bg-danger/10";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {notifications.filter((n) => !n.read).length} non lues
            </p>
          </div>
          <Bell className="w-6 h-6 text-primary" />
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune notification</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-4 ${
                  !notif.read ? "border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${getBgColor(
                        notif.type
                      )} flex items-center justify-center text-xl flex-shrink-0`}
                    >
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
