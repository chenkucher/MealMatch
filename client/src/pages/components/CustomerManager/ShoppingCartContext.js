import { createContext } from 'react';

const ShoppingCartContext = createContext({
  cartItems: [],
  addToCart: (item) => {},
  removeFromCart: (item_id) => {},
  updateCartItem: (item_id, newQuantity, selectedIngredients) => {},
  clearCart: () => {},
});

export default ShoppingCartContext;
