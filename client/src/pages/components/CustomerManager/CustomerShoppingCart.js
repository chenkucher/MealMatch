import React, { useState, useContext } from 'react';
import ShoppingCartContext from '../../components/CustomerManager/ShoppingCartContext';
import ModifyItemModal from '../../components/CustomerManager/ModifyItemModal'; // Import the new component
import styles from '../../../styles/ShoppingCart.module.css';

function CustomerShoppingCart({ onClose }) {
  const { cartItems, removeFromCart, updateCartItem } = useContext(ShoppingCartContext);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const totalPrice = cartItems.reduce(
    (sum, item) => {
      const ingredientCost = item.selectedIngredients.reduce(
        (total, ingredient) => total + parseFloat(ingredient.price),
        0
      );
      return sum + parseFloat(item.itemQuantity * (parseFloat(item.itemPrice) + parseFloat(ingredientCost))) ;
    },
    0
  );

  const handleModifyItem = (item) => {
    console.log(item);
    setSelectedItem(item);
    setShowModifyModal(true);
  };

  const handleCloseModifyModal = () => {
    setSelectedItem(null);
    setShowModifyModal(false);
  };

  return (
    <>
      <div className={styles.backgroundOverlay} onClick={onClose}></div>
        <div className={styles.shoppingCart}>
          <h1>Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <p>Your shopping cart is empty.</p>
          ) : (
            <ul className={styles.cartItems}>
              {cartItems.map((item) => (
                <li key={item.item_id} className={styles.cartItem}>
                  <div>
                    <span className={styles.itemName}>{item.itemName}</span>
                    <span className={styles.itemDescription}>{item.itemDescription}</span>
                    <ul className={styles.selectedIngredients}>
                      {item.selectedIngredients.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.name} (+${ingredient.price})
                        </li>
                      ))}
                    </ul>
                    <span className={styles.itemPrice}>
                      Price: ${(item.itemPrice * item.itemQuantity).toFixed(2)}
                    </span>
                    <span className={styles.itemQuantity}>
                      Quantity: {item.itemQuantity}
                    </span>
                    <button className={styles.modifyButton} onClick={() => handleModifyItem(item)}>
                      Modify
                    </button>
                  </div>
                  <div>
                    {selectedItem === item && (
                    <ModifyItemModal
                      item={selectedItem}
                      onClose={handleCloseModifyModal}
                      removeFromCart={removeFromCart}
                      updateCartItem={updateCartItem}
                    />
                  )}
                  </div>

                </li>
              ))}
              <li className={styles.totalPrice}>
                Total Price: ${totalPrice.toFixed(2)}
              </li>
            </ul>
          )}
          <button onClick={onClose}>Close</button>
        </div>
        {/* {showModifyModal && (
        <ModifyItemModal
          item={selectedItem}
          onClose={handleCloseModifyModal}
          removeFromCart={removeFromCart}
          updateCartItem={updateCartItem}
        />
      )} */}
    </>
  );
}

export default CustomerShoppingCart;
