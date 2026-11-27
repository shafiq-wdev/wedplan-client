import {
  Camera,
  ChefHat,
  Flower2,
  Landmark,
  Shirt,
  Sparkles,
} from "lucide-react";

const ICONS = {
  "Photography & Videography": Camera,
  "Wedding Venues": Landmark,
  "Decoration & Florist": Flower2,
  "Catering Services": ChefHat,
  "Makeup & Styling": Sparkles,
  "Wedding Fashion": Shirt,
};

export default function CategoryIcon({ category, className = "h-5 w-5" }) {
  const Icon = ICONS[category] ?? Sparkles;

  return <Icon className={className} aria-hidden="true" />;
}
