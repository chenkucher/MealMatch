import React from "react";
import AddToOrderCard from "../CustomerManager/AddToOrderCard";
import styles from "../../../styles/Matched.module.css";

function Matched({ matchedItems, onClose }) {
  return (
    <div className={styles.matchedOverlay}>
      <div className={styles.matchedContainer}>
        <h1>Matched!</h1>
        {matchedItems.length === 0 ? (
          <p>You Have No Matched Items!</p>
        ) : (
          matchedItems.map((item, index) => (
            <AddToOrderCard
              key={index}
              item={item}
            //   onClose={() => setShowAddToOrderCard(false)}
            />
          ))
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Matched;
