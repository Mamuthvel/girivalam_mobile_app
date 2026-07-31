import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCategory } from "@/types/services";
import { 
  Bed, 
  Utensils, 
  User, 
  Car, 
  Crown,
  LayoutGrid
} from "lucide-react";

interface ServiceCategoryTabsProps {
  value: ServiceCategory | "all";
  onValueChange: (value: ServiceCategory | "all") => void;
  categories: ServiceCategory[];
}

const categoryLabels: Record<ServiceCategory | "all", { label: string; icon: typeof Bed }> = {
  all: { label: "All", icon: LayoutGrid },
  accommodation: { label: "Stay", icon: Bed },
  food: { label: "Food", icon: Utensils },
  guide: { label: "Guides", icon: User },
  transport: { label: "Transport", icon: Car },
  special: { label: "Special", icon: Crown },
  community: { label: "Community", icon: User },
  support: { label: "Support", icon: User }
};

export function ServiceCategoryTabs({ value, onValueChange, categories }: ServiceCategoryTabsProps) {
  // Build tabs: "all" + available categories
  const tabs: (ServiceCategory | "all")[] = ["all", ...categories];

  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as ServiceCategory | "all")}>
      <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
        {tabs.map((tab) => {
          const config = categoryLabels[tab];
          const Icon = config.icon;
          return (
            <TabsTrigger 
              key={tab} 
              value={tab}
              className="flex items-center gap-1.5 px-3 py-2 data-[state=active]:bg-background"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{config.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
