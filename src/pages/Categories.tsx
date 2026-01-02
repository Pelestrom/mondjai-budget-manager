import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Edit, Trash2, ShoppingBag, Car, Home, Wifi, PartyPopper, Briefcase, 
  Gift, Heart, Pill, GraduationCap, CloudRain, Wrench, MoreHorizontal, Plane, 
  Gamepad, Book, ShoppingCart, ArrowLeft, UtensilsCrossed, AlertTriangle,
  Coffee, Music, Tv, Phone, CreditCard, Wallet, Banknote, PiggyBank,
  Building, Hotel, Fuel, Bus, Train, Bike, Ship, Trophy, Dumbbell,
  Camera, Palette, Scissors, Sparkles, Star, Zap, Flame, Leaf,
  Apple, Pizza, Salad, Wine, Beer, ShoppingBasket, Package, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCategories, Category } from "@/hooks/useCategories";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  ShoppingBag, Car, Home, Wifi, PartyPopper, Briefcase, Gift, Heart, Pill,
  GraduationCap, CloudRain, Wrench, MoreHorizontal, Plane, Gamepad, Book,
  ShoppingCart, UtensilsCrossed, AlertTriangle, Coffee, Music, Tv, Phone,
  CreditCard, Wallet, Banknote, PiggyBank, Building, Hotel, Fuel, Bus,
  Train, Bike, Ship, Trophy, Dumbbell, Camera, Palette, Scissors, Sparkles,
  Star, Zap, Flame, Leaf, Apple, Pizza, Salad, Wine, Beer, ShoppingBasket,
  Package, Truck
};

const Categories = () => {
  const navigate = useNavigate();
  const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "ShoppingBag",
    color: "#00A86B",
  });

  const defaultIcons = [
    "UtensilsCrossed", "ShoppingBag", "Car", "Home", "Wifi", "PartyPopper", 
    "Briefcase", "Gift", "Heart", "Pill", "GraduationCap", "AlertTriangle",
    "CloudRain", "Wrench", "Plane", "Gamepad", "Book", "ShoppingCart",
    "Coffee", "Music", "Tv", "Phone", "CreditCard", "Wallet", "Banknote",
    "PiggyBank", "Building", "Hotel", "Fuel", "Bus", "Train", "Bike",
    "Ship", "Trophy", "Dumbbell", "Camera", "Palette", "Scissors", "Sparkles",
    "Star", "Zap", "Flame", "Leaf", "Apple", "Pizza", "Salad", "Wine",
    "Beer", "ShoppingBasket", "Package", "Truck"
  ];

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Veuillez entrer un nom");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, updates: formData });
        toast.success("Catégorie modifiée");
      } else {
        await addCategory(formData);
        toast.success("Catégorie ajoutée");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color || "#00A86B",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie?")) {
      try {
        await deleteCategory(id);
        toast.success("Catégorie supprimée");
      } catch (error) {
        toast.error("Une erreur est survenue");
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", icon: "ShoppingBag", color: "#00A86B" });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 pt-20 bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-20 bg-gradient-to-br from-background via-accent/5 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
            <p className="text-sm text-muted-foreground">
              {categories.length} catégories
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="btn-primary shadow-lg">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="glassmorphism">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Modifier" : "Nouvelle"} catégorie
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Restaurant"
                    className="mt-1 input-field"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Icône</label>
                  <div className="grid grid-cols-6 gap-2 mt-2 max-h-48 overflow-y-auto p-1">
                    {defaultIcons.map((iconName) => {
                      const Icon = iconMap[iconName as keyof typeof iconMap];
                      return (
                        <motion.button
                          key={iconName}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`aspect-square p-2 rounded-xl border-2 transition-all flex items-center justify-center ${
                            formData.icon === iconName
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Couleur (optionnel)</label>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="mt-1 h-12 input-field"
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full btn-primary">
                  {editingCategory ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-4"
        >
          {categories.map((category) => {
            const CategoryIcon = iconMap[category.icon as keyof typeof iconMap] || ShoppingBag;
            return (
              <motion.div key={category.id} variants={item}>
                <Card className="floating-card p-4 relative group hover:shadow-xl transition-all duration-300">
                  <div className="text-center space-y-2">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-md"
                      style={{ 
                        backgroundColor: `${category.color}20`,
                        color: category.color 
                      }}
                    >
                      <CategoryIcon className="w-8 h-8" />
                    </motion.div>
                    <p className="text-xs font-medium text-foreground truncate">
                      {category.name}
                    </p>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(category)}
                      className="p-1.5 bg-card glassmorphism rounded-full shadow-md"
                    >
                      <Edit className="w-3 h-3" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 bg-card glassmorphism rounded-full shadow-md text-danger"
                    >
                      <Trash2 className="w-3 h-3" />
                    </motion.button>
                  </div>

                  {category.subcategories && category.subcategories.length > 0 && (
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      {category.subcategories.length} sous-catégories
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Categories;
