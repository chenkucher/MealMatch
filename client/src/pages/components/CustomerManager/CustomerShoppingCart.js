import React, { useState, useContext } from 'react';
import ShoppingCartContext from '../../components/CustomerManager/ShoppingCartContext';
import ModifyItemModal from '../../components/CustomerManager/ModifyItemModal';
import styles from '../../../styles/ShoppingCart.module.css';
import tableStyles from '../../../styles/ShoppingCartTable.module.css';
import { useNavigate } from 'react-router-dom';

function CustomerShoppingCart({ onClose, customerId }) {
  console.log(customerId);
  const { cartItems, removeFromCart, updateCartItem } = useContext(ShoppingCartContext);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (sum, item) => {
      const ingredientCost = (item.selectedIngredients || []).reduce(
        (total, ingredient) => total + parseFloat(ingredient.price),
        0
      );
      const additionalItemCost = (item.selectedAdditionalItems || []).reduce(
        (total, additionalItem) => total + parseFloat(additionalItem.price),
        0
      );
      return (
        sum +
        parseFloat(
          item.itemQuantity *
            (parseFloat(item.itemPrice) + parseFloat(ingredientCost) + parseFloat(additionalItemCost))
        )
      );
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
                <th>Selected Additional Items</th>
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
                      {item.selectedAdditionalItems &&
                        item.selectedAdditionalItems.map((ingredient, index) => (
                          <li key={index}>
                            {ingredient.name} (+${ingredient.price})
                          </li>
                        ))}
                    </ul>
                  </td>
                  <td>${(item.itemPrice * item.itemQuantity).toFixed(2)}</td>
                  <td>{item.itemQuantity}</td>
                  <td>
                    <div className={tableStyles.actionContainer}>
                      <button className={tableStyles.modifyButton} onClick={() => handleModifyItem(item)}>
                        Modify
                      </button>
                      {selectedItem === item && (
                        <ModifyItemModal
                          item={selectedItem}
                          onClose={handleCloseModifyModal}
                          removeFromCart={removeFromCart}
                          updateCartItem={updateCartItem}
                          additionalItems={selectedItem.selectedAdditionalItems}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" className={tableStyles.totalPriceCell}>
                  Total Price: ${totalPrice.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <button onClick={onClose}>Close</button>
        <button onClick={() => navigate(`/CustomerCheckOut/${customerId}`)}>Checkout</button>
      </div>
    </>
  );
}

export default CustomerShoppingCart;
