import React, { useState, useContext } from 'react';
import ShoppingCartContext from './ShoppingCartContext';
import styles from '../../../styles/ModifyItemModal.module.css';

function ModifyItemModal({ item, onClose }) {

  const { updateCartItem, removeFromCart } = useContext(ShoppingCartContext);
  const [newQuantity, setNewQuantity] = useState(item.itemQuantity);
  const [selectedIngredients, setSelectedIngredients] = useState(item.selectedIngredients);

  const handleUpdateItem = () => {
    // onUpdateItem(item.item_id, newQuantity);
    updateCartItem(item.item_id, newQuantity, selectedIngredients);
    onClose();
  };

  const handleDeleteItem = () => {
    // onDeleteItem(item.item_id);
    removeFromCart(item.item_id);
    onClose();
  };

  const updateIngredient = (index, updatedIngredient) => {
    setSelectedIngredients(prevIngredients =>
      prevIngredients.map((ingredient, i) =>
        i === index ? updatedIngredient : ingredient
      )
    );
  };

  return (
    <div className={styles.modifyItemModal}>
      <h2>Modify Item</h2>
      <h3>{item.itemName}</h3>
      <label>
        Quantity:
        <input
          type="number"
          min="1"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value, 10))}
        />
      </label>
      {selectedIngredients && selectedIngredients.map((ingredient, index) => (
        <div key={index} className={styles.ingredient}>
          <label>
            Ingredient name:
            <input
              type="text"
              value={ingredient.name}
              onChange={(e) =>
                updateIngredient(index, { ...ingredient, name: e.target.value })
              }
            />
          </label>
          <label>
            Ingredient price:
            <input
              type="number"
              min="0"
              value={ingredient.price}
              onChange={(e) =>
                updateIngredient(index, {
                  ...ingredient,
                  price: parseFloat(e.target.value),
                })
              }
            />
          </label>
        </div>
      ))}
      <div className={styles.buttons}>
        <button onClick={handleUpdateItem}>Update</button>
        <button onClick={handleDeleteItem}>Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default ModifyItemModal;
