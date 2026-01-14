import { useState } from "react";
import { Bell, Check, X, Trash2, ArrowLeft, AlertTriangle, Lightbulb, CheckCircle, XCircle, Square, CheckSquare, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAsUnread, deleteNotification, isLoading } = useNotifications();
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteSelectedDialog, setShowDeleteSelectedDialog] = useState(false);

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

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    setSelectedIds(new Set(notifications.map(n => n.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteNotification(id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
    setShowDeleteSelectedDialog(false);
  };

  const handleResetAll = async () => {
    try {
      await Promise.all(notifications.map(n => deleteNotification(n.id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error("Error resetting notifications:", error);
    }
    setShowResetDialog(false);
  };

  const handleMarkSelectedAsRead = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => markAsRead(id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-8 pt-20">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

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

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-2"
        >
          <Button
            variant={selectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedIds(new Set());
            }}
          >
            {selectionMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
            {selectionMode ? "Annuler" : "Sélectionner"}
          </Button>
          
          {selectionMode && (
            <>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Tout sélectionner
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Désélectionner
              </Button>
              {selectedIds.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSelectedAsRead}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marquer lu ({selectedIds.size})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteSelectedDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer ({selectedIds.size})
                  </Button>
                </>
              )}
            </>
          )}
          
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-danger border-danger hover:bg-danger/10"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser tout
            </Button>
          )}
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
                  } ${selectedIds.has(notif.id) ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => selectionMode && toggleSelection(notif.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {selectionMode && (
                        <Checkbox
                          checked={selectedIds.has(notif.id)}
                          onCheckedChange={() => toggleSelection(notif.id)}
                          className="shrink-0 mt-2"
                        />
                      )}
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
                          {format(new Date(notif.created_at), "PPp", { locale: fr })}
                        </p>
                      </div>
                    </div>

                    {!selectionMode && (
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
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Selected Dialog */}
      <AlertDialog open={showDeleteSelectedDialog} onOpenChange={setShowDeleteSelectedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les notifications sélectionnées?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez supprimer {selectedIds.size} notification(s). Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-danger hover:bg-danger/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset All Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser toutes les notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes vos notifications ({notifications.length}) seront définitivement supprimées. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-danger hover:bg-danger/90">
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notifications;
