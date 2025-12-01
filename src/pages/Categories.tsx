import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCategoryStore, Category } from "@/store/categoryStore";
import { toast } from "sonner";

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "📦",
    color: "#00A86B",
  });

  const defaultIcons = [
    "🍔", "🚗", "🏠", "📶", "🎉", "💼", "🎁", "🏥", 
    "💊", "🎓", "🌧", "➕", "✈️", "🎮", "📚", "🛒"
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
    setFormData({ name: "", icon: "📦", color: "#00A86B" });
  };

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
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
              <Button size="sm" className="btn-primary">
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Icône</label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {defaultIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                          formData.icon === icon
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
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
                    className="mt-1 h-12"
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full btn-primary">
                  {editingCategory ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <Card key={category.id} className="p-4 relative group">
              <div className="text-center space-y-2">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {category.name}
                </p>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-1 bg-background rounded-full shadow-md"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-1 bg-background rounded-full shadow-md text-danger"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {category.subcategories && category.subcategories.length > 0 && (
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  {category.subcategories.length} sous-catégories
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
