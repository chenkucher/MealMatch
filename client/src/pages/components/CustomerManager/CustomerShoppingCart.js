import React, { useState, useContext } from 'react';
import ShoppingCartContext from '../../components/CustomerManager/ShoppingCartContext';
import ModifyItemModal from '../../components/CustomerManager/ModifyItemModal';
import styles from '../../../styles/ShoppingCart.module.css';
import tableStyles from '../../../styles/ShoppingCartTable.module.css';


function CustomerShoppingCart({ onClose }) {
  const { cartItems, removeFromCart, updateCartItem } = useContext(ShoppingCartContext);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const totalPrice = cartItems.reduce(
    (sum, item) => {
      const ingredientCost = (item.selectedIngredients || []).reduce(
        (total, ingredient) => total + parseFloat(ingredient.price),
        0
      );
      return sum + parseFloat(item.itemQuantity * (parseFloat(item.itemPrice) + parseFloat(ingredientCost)));
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
  console.log("Cart items:", cartItems);
  return (
    <>
      <div className={styles.backgroundOverlay} onClick={onClose}></div>
      <div className={styles.shoppingCart}>
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your shopping cart is empty.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Ingredients</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.item_id}>
                  <td>{item.item_name}</td>
                  <td>{item.itemDescription}</td>
                  <td>
                    <ul className={tableStyles.ingredientsList}>
                      {item.selectedAdditionalItems.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.name} (+${ingredient.price})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${(item.itemPrice * item.itemQuantity).toFixed(2)}</td>
                  <td>{item.itemQuantity}</td>
                  <td>
                    <button className={tableStyles.modifyButton} onClick={() => handleModifyItem(item)}>
                      Modify
                    </button>
                    {selectedItem === item && (
                      <ModifyItemModal
                        item={selectedItem}
                        onClose={handleCloseModifyModal}
                        removeFromCart={removeFromCart}
                        updateCartItem={updateCartItem}
                      />
                    )}
                  </td>
                </tr>
              ))}


                <p className={tableStyles.totalPriceCell}>Total Price: ${totalPrice.toFixed(2)}</p>

            </tbody>
          </table>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </>
  );
}

export default CustomerShoppingCart;
