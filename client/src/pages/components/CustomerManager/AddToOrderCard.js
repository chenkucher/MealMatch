import React, { useState, useEffect,useContext } from 'react';
import ShoppingCartContext from '../../../pages/components/CustomerManager/ShoppingCartContext'
import styles from '../../../styles/AddToCard.module.css';


function AddToOrderCard({ item}) {
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [alertMessage, setAlertMessage] = useState("");

    const { addToCart } = useContext(ShoppingCartContext);
  
    const handleIngredientChange = (ingredient, price, checked) => {
      setSelectedIngredients((prevSelected) =>
        checked
          ? [...prevSelected, { name: ingredient, price }]
          : prevSelected.filter((ing) => ing.name !== ingredient),
      );
    };
  
    const handleAddToOrder = (orderItem) => {
      addToCart({
        ...item,
        itemDescription: item.item_description,
        itemPrice: item.item_price,
        selectedIngredients: item.selectedAdditionalItems, 
        itemQuantity,
      });
      showAlertMessage(`Added ${item.item_name} to the Order Cart!`);
    };
    
    
    
  
    const totalPrice =
      item.item_price * itemQuantity +
      selectedIngredients.reduce((sum, ing) => sum + ing.price, 0) * itemQuantity;
  
    const hasOptionalIngredients = item.item_optional_ingredience && Object.keys(item.item_optional_ingredience).length > 0;
  


    const showAlertMessage = (message) => {
        setAlertMessage(message);
        setTimeout(() => {
          setAlertMessage("");
        }, 3000);
      };

      

    return (
    <>
      {alertMessage && <div className={styles.alertMessage}>{alertMessage}</div>}
      <div className={styles.addToOrderCard}>
        <div className={styles.top}>
          <img src={item.item_image} alt={item.item_name}/>
          <h2>{item.item_name}</h2>
          <p>{item.item_description}</p>
          <p>Price: ${item.item_price}</p>
        </div>
        
        {hasOptionalIngredients && (
          <>
          <div className={styles.middle}>
            <h3>Optional Ingredients:</h3>
              <ul>
                {Object.entries(item.item_optional_ingredience).map(([ingredient, price]) => (
                  <li key={ingredient}>
                    <label>
                      <input
                        type="checkbox"
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(ingredient, price, e.target.checked)}
                      />
                      {ingredient} (+${price})
                    </label>
                  </li>
                ))}
              </ul>
          </div>
  
          </>
        )}
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
          </div>
          <p>Total Price: ${totalPrice.toFixed(2)}</p>

          <div>
            <button onClick={handleAddToOrder}>Add To Order</button>
          </div>

        </div>
      </div>
      </>
    );
  }

  export default  AddToOrderCard;