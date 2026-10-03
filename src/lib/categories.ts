import {
  UtensilsCrossed, Car, Home, Repeat, Wrench, Megaphone, ShoppingBag, HeartPulse, Gamepad2, CircleDot, Tag,
  type LucideIcon,
} from "lucide-react";

export const DEFAULT_CATEGORIES: { name: string; icon: LucideIcon }[] = [
  { name: "Alimentação", icon: UtensilsCrossed },
  { name: "Transporte", icon: Car },
  { name: "Moradia", icon: Home },
  { name: "Assinaturas", icon: Repeat },
  { name: "Ferramentas e softwares", icon: Wrench },
  { name: "Publicidade e anúncios", icon: Megaphone },
  { name: "Compras", icon: ShoppingBag },
  { name: "Saúde", icon: HeartPulse },
  { name: "Lazer", icon: Gamepad2 },
  { name: "Outros", icon: CircleDot },
];

export function categoryIcon(name: string): LucideIcon {
  return DEFAULT_CATEGORIES.find((c) => c.name === name)?.icon ?? Tag;
}
