import { Truffle, PricingResult } from "./types";

export const FLAVORS: Truffle[] = [
  {
    id: "ferrero",
    name: "Ferrero",
    description: "Chocolate nobre com pedaços de avelã e recheio cremoso tipo Ferrero.",
    image: "https://images.unsplash.com/photo-1549007994-cb92cd87dd36?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Gourmet",
    rating: 5.0,
    reviews: 124,
    isBestSeller: true
  },
  {
    id: "70-cacau",
    name: "70% Cacau",
    description: "Intensidade e pureza do chocolate amargo 70% cacau.",
    image: "https://images.unsplash.com/photo-1541783245831-57d690705267?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Dark",
    rating: 4.8,
    reviews: 89
  },
  {
    id: "galak",
    name: "Galak",
    description: "O autêntico recheio cremoso de chocolate branco Galak.",
    image: "https://images.unsplash.com/photo-1594910413528-9430d8bbec9d?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Classic",
    rating: 4.7,
    reviews: 56
  },
  {
    id: "nutella",
    name: "Nutella",
    description: "Recheio generoso e aveludado de creme de avelã Nutella.",
    image: "https://images.unsplash.com/photo-1553530666-ca0c452f4842?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Gourmet",
    rating: 4.9,
    reviews: 210,
    isBestSeller: true
  },
  {
    id: "beijinho",
    name: "Beijinho",
    description: "Doce de coco ralado fresco com textura macia e sabor suave.",
    image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Classic",
    rating: 4.6,
    reviews: 45
  },
  {
    id: "brigadeiro",
    name: "Brigadeiro",
    description: "O clássico recheio de brigadeiro gourmet com chocolate intenso.",
    image: "https://images.unsplash.com/photo-1623157523133-72216441ea65?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Classic",
    rating: 5.0,
    reviews: 320,
    isBestSeller: true
  },
  {
    id: "kit-kat",
    name: "Kit Kat",
    description: "Recheio crocante de wafer com chocolate ao leite Nestlé.",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Special",
    rating: 4.8,
    reviews: 67,
    isNew: true
  },
  {
    id: "morango",
    name: "Morango",
    description: "Delicioso recheio de bicho-de-pé ou geleia cremosa de morango.",
    image: "https://images.unsplash.com/photo-1499195333224-3ce974eecb47?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Classic",
    rating: 4.7,
    reviews: 82
  },
  {
    id: "leite-ninho",
    name: "Leite Ninho",
    description: "Creme aveludado feito com o puro Leite Ninho original.",
    image: "https://images.unsplash.com/photo-1548332062-8e7c10b27e69?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Gourmet",
    rating: 4.9,
    reviews: 156,
    isBestSeller: true
  },
  {
    id: "limao",
    name: "Limão",
    description: "Mousse refrescante de limão com o toque cítrico perfeito.",
    image: "https://images.unsplash.com/photo-1582294157159-994334336c84?auto=format&fit=crop&q=80&w=600",
    price: 4,
    category: "Special",
    rating: 4.5,
    reviews: 34
  }
];

export const CATEGORIES = [
  { id: "all", name: "Todos", icon: "Sparkles" },
  { id: "Classic", name: "Clássicos", icon: "Heart" },
  { id: "Gourmet", name: "Gourmet", icon: "Flame" },
  { id: "Dark", name: "Intensos", icon: "CheckCircle2" },
  { id: "Special", name: "Especiais", icon: "Plus" }
];

export const calculatePricing = (totalCount: number): PricingResult => {
  const groupsOfThree = Math.floor(totalCount / 3);
  const remainder = totalCount % 3;
  
  let priceFromGroups = groupsOfThree * 10;
  let priceFromRemainder = 0;
  
  if (remainder === 1) priceFromRemainder = 4;
  if (remainder === 2) priceFromRemainder = 7;
  
  const totalPrice = priceFromGroups + priceFromRemainder;
  const originalPrice = totalCount * 4;
  const savings = originalPrice - totalPrice;
  const promoApplied = savings > 0;
  
  const nextPromoIn = 3 - remainder; 

  return {
    totalPrice,
    savings,
    totalQuantity: totalCount,
    promoApplied,
    nextPromoIn: remainder === 0 ? 3 : nextPromoIn
  };
};
