
import React, { useState,useContext } from 'react';
import styles from '../../../styles/AddToCard.module.css';
import ShoppingCartContext from '../../../pages/components/CustomerManager/ShoppingCartContext'
function AddToOrderCard({ item: initialItem, onAddToOrder}) {
  const item = {
    ...initialItem,
    additionalProperties: JSON.parse(initialItem.additionalProperties),
  };

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState([]);
  const { addToCart } = useContext(ShoppingCartContext);

  const handleIngredientChange = (ingredient, price, checked) => {
    setSelectedIngredients((prevSelected) =>
      checked
        ? [...prevSelected, { name: ingredient, price }]
        : prevSelected.filter((ing) => ing.name !== ingredient),
    );
  };

  const handleAdditionalItemChange = (additionalItem, price, checked) => {
    setSelectedAdditionalItems((prevSelected) =>
      checked
        ? [...prevSelected, { name: additionalItem, price }]
        : prevSelected.filter((item) => item.name !== additionalItem),
    );
  };

  const handleAddToOrder = () => {
    console.log(item);
    addToCart({
      ...item,
      itemDescription: item.item_description,
      itemPrice: item.item_price,
      selectedIngredients,
      selectedAdditionalItems, 
      itemQuantity,
      restaurantId: item.restaurant_id,
    });


    if (onAddToOrder) {
      onAddToOrder();
    }
  };

  const totalPrice =
    item.item_price * itemQuantity +
    selectedIngredients.reduce((sum, ing) => sum + ing.price, 0) * itemQuantity +
    selectedAdditionalItems.reduce((sum, item) => sum + item.price, 0) * itemQuantity;

  return (
    <div className={styles.addToOrderCard}>
      {console.log(item)}
      <div className={styles.top}>
        <img src={item.item_image} alt={item.item_name} />
        <h2>{item.item_name}</h2>
        <p>{item.item_description}</p>
        <p>Price: ${item.item_price}</p>
      </div>

      <div className={styles.bottom}>
        <div>
          <label>
            Quantity:
            <input
              type="number"
              min="1"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value, 10))}
            />
          </label>
          {Array.isArray(item.additionalProperties) && item.additionalProperties.length > 0 && (
            <div className={styles.additionalItems}>
              <h3>Additional Items:</h3>
              <ul>
                {item.additionalProperties.map((additionalItem) => (
                  <li key={additionalItem.name}>
                    <label>
                      <input
                        type="checkbox"
                        value={additionalItem.name}
                        onChange={(e) =>
                          handleAdditionalItemChange(
                            additionalItem.name,
                            additionalItem.price,
                            e.target.checked
                          )
                        }
                      />
                      {additionalItem.name} (+${additionalItem.price})
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p>Total Price: ${totalPrice.toFixed(2)}</p>
        <div>
          <button onClick={handleAddToOrder}>Add To Order</button>
        </div>
      </div>
    </div>
  );
}

export default AddToOrderCard;