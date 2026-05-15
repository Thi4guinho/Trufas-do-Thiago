export interface Truffle {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: "Classic" | "Gourmet" | "Dark" | "Special";
  rating: number;
  reviews: number;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface CartItem extends Truffle {
  quantity: number;
}

export interface Order {
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  savings: number;
}

export interface PricingResult {
  totalPrice: number;
  savings: number;
  totalQuantity: number;
  promoApplied: boolean;
  nextPromoIn: number;
}
