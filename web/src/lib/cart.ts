// Shopping cart utilities (localStorage)

export interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
  stock: number;
}

const CART_KEY = 'handmade_cart';

// Сагс авах
export function getCart(): CartItem[] {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

// Сагс хадгалах
export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Сагсанд нэмэх
export function addToCart(item: CartItem) {
  const cart = getCart();
  const existingItem = cart.find((i) => i.productId === item.productId);

  if (existingItem) {
    existingItem.quantity += item.quantity;
    if (existingItem.quantity > existingItem.stock) {
      existingItem.quantity = existingItem.stock;
    }
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

// Сагсаас хасах
export function removeFromCart(productId: number) {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
}

// Тоо ширхэг өөрчлөх
export function updateCartQuantity(productId: number, quantity: number) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);

  if (item) {
    item.quantity = Math.min(quantity, item.stock);
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart(cart);
    }
  }
}

// Сагс цэвэрлэх
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// Нийт үнэ тооцоолох (cents)
export function calculateTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    return total + parseInt(item.price) * item.quantity;
  }, 0);
}

// Cents-ийг төгрөг болгох (format)
export function formatPrice(cents: string | number): string {
  const amount = typeof cents === 'string' ? parseInt(cents) : cents;
  return (amount / 100).toFixed(2);
}
