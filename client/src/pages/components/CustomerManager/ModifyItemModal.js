import React, { useState, useContext } from 'react';
import ShoppingCartContext from './ShoppingCartContext';
import styles from '../../../styles/ModifyItemModal.module.css';

function ModifyItemModal({ item, onClose,additionalItems }) {

  const { updateCartItem, removeFromCart } = useContext(ShoppingCartContext);
  const [newQuantity, setNewQuantity] = useState(item.itemQuantity);
  const [selectedIngredients, setSelectedIngredients] = useState(item.selectedIngredients);
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState(item.selectedAdditionalItems || []);

  const handleUpdateItem = () => {
    updateCartItem(item.item_id, newQuantity, selectedIngredients, selectedAdditionalItems);
    onClose();
  };

  const handleDeleteItem = () => {
    removeFromCart(item.item_id);
    onClose();
  };

  const handleAdditionalItemChange = (additionalItem, isSelected) => {
    if (isSelected) {
      setSelectedAdditionalItems([...selectedAdditionalItems, additionalItem]);
    } else {
      setSelectedAdditionalItems(selectedAdditionalItems.filter(ai => ai.id !== additionalItem.id));
    }
  };
  return (
    <div className={styles.modifyItemModal}>
      <label>
        Quantity:
        <input
          type="number"
          min="1"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value, 10))}
        />
      </label>


      <div className={styles.buttons}>
        <button onClick={handleUpdateItem}>Update</button>
        <button onClick={handleDeleteItem}>Delete</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ModifyItemModal;
