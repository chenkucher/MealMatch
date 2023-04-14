import React, { useState } from 'react';
import ShoppingCartContext from './ShoppingCartContext.js';

const ShoppingCartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = window.localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });

  const addToCart = (item) => {
    setCartItems((prevCartItems) => {
      const newCartItems = [...prevCartItems];
      const existingItemIndex = newCartItems.findIndex(
        (cartItem) => cartItem.item_id === item.item_id
      );

      if (existingItemIndex > -1) {
        newCartItems[existingItemIndex].itemQuantity += item.itemQuantity;
      } else {
        newCartItems.push(item);
      }

      window.localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      return newCartItems;
    });
  };

  const removeFromCart = (item_id) => {
    setCartItems((prevCartItems) => {
      const newCartItems = prevCartItems.filter((item) => item.item_id !== item_id);
      window.localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      return newCartItems;
    });
  };

  const updateCartItem = (item_id, newQuantity, selectedIngredients) => {
    setCartItems((prevCartItems) => {
      const newCartItems = prevCartItems.map((item) =>
        item.item_id === item_id
          ? { ...item, itemQuantity: newQuantity, selectedIngredients: selectedIngredients }
          : item
      );
      window.localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      return newCartItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    window.localStorage.removeItem('cartItems');
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
};

export default ShoppingCartProvider;
