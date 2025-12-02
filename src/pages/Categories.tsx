import { useState } from "react";
import { Plus, Edit, Trash2, ShoppingBag, Car, Home, Wifi, PartyPopper, Briefcase, Gift, Heart, Pill, GraduationCap, CloudRain, Wrench, MoreHorizontal, Plane, Gamepad, Book, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCategoryStore, Category } from "@/store/categoryStore";
import { toast } from "sonner";
import { motion } from "framer-motion";

const iconMap = {
  ShoppingBag,
  Car,
  Home,
  Wifi,
  PartyPopper,
  Briefcase,
  Gift,
  Heart,
  Pill,
  GraduationCap,
  CloudRain,
  Wrench,
  MoreHorizontal,
  Plane,
  Gamepad,
  Book,
  ShoppingCart,
};

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "ShoppingBag",
    color: "#00A86B",
  });

  const defaultIcons = [
    "ShoppingBag", "Car", "Home", "Wifi", "PartyPopper", "Briefcase",
    "Gift", "Heart", "Pill", "GraduationCap", "CloudRain", "Wrench",
    "Plane", "Gamepad", "Book", "ShoppingCart",
  ];

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Veuillez entrer un nom");
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      toast.success("Catégorie modifiée");
    } else {
      addCategory(formData);
      toast.success("Catégorie ajoutée");
    }

    setIsDialogOpen(false);
    resetForm();
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

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie?")) {
      deleteCategory(id);
      toast.success("Catégorie supprimée");
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", icon: "ShoppingBag", color: "#00A86B" });
  };

  const IconComponent = iconMap[formData.icon as keyof typeof iconMap] || ShoppingBag;

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

  return (
    <div className="min-h-screen pb-24 pt-20 bg-gradient-to-br from-background via-accent/5 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
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
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {defaultIcons.map((iconName) => {
                      const Icon = iconMap[iconName as keyof typeof iconMap];
                      return (
                        <motion.button
                          key={iconName}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`p-3 rounded-xl border-2 transition-all ${
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
