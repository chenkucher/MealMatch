import React from "react";
import AddToOrderCard from "../CustomerManager/AddToOrderCard";
import styles from "../../../styles/Matched.module.css";

function Matched({ matchedItems = [], onClose }) {

  const [items, setItems] = React.useState(matchedItems);

  const removeItem = (itemToRemove) => {
    setItems(items.filter(item => item !== itemToRemove));
  }

  return (
    <div className={styles.matchedOverlay}>
      <div className={styles.matchedContainer}>
        <h1>Matched!</h1>
        {console.log(items)}
        {items.length === 0 ? (
          <div>
            <p>You Have No Matched Items!</p>
            <p>Visit Matcher to find the best meal for you!</p>
          </div>

          
        ) : (
          items.map((item, index) => (
            <AddToOrderCard
              key={index}
              item={{ ...item, additionalProperties: item.item_additional }}
              onClose={onClose}
              onAddToOrder={() => removeItem(item)}
            />
          ))
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}


export default Matched;