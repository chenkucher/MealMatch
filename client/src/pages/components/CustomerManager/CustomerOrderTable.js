import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import styles from "../../../styles/CustomerOrderTable.module.css";
import ShoppingCartContext from "../../../pages/components/CustomerManager/ShoppingCartContext";
import Swal from 'sweetalert2';

function CustomerOrderTable(props) {
  const [items, setItems] = useState([]);
  const { customerId } = useParams();
  const [currentItem, setCurrentItem] = useState(null);
  const { addToCart } = useContext(ShoppingCartContext);

  useEffect(() => {
    const socket = socketIOClient(
      "http://ec2-35-169-139-56.compute-1.amazonaws.com:5000"
    );
    socket.on("newOrder", (data) => {
      setItems((prevItems) => [...prevItems, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch(
      `http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerOrders/${customerId}`
    )
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [customerId]);

  const handleOpenModal = (item) => {
    const parsedDetails = JSON.parse(item.order_details);
    setCurrentItem({ ...item, order_details: parsedDetails });
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
  };

  const handleReorder = (item) => {
    const orderDetails = JSON.parse(item.order_details);
    
    // change foreach into map to create an array of promises
    const promises = orderDetails.map((detail, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const cartItem = {
            item_id: detail.item_id,
            item_name: detail.item_name,
            itemQuantity: detail.itemQuantity,
            itemDescription: detail.item_description,
            itemPrice: detail.itemPrice,
            restaurantId: detail.restaurant_id,
            selectedIngredients: [],
            selectedAdditionalItems: detail.selectedAdditionalItems,
          };
          console.log(cartItem);
          addToCart(cartItem);
          resolve();
        }, index * 500); 
      });
    });
  
    Promise.all(promises)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Items have been successfully added to your cart',
        });
      })
      .catch((error) => {
        // Add error handling here if needed
        console.error(error);
      });
  };
  

  return (
    <div className={styles.container}>
      <h1>My Orders</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Details</th>
            <th>Time Of Delivery</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const orderDetails = JSON.parse(item.order_details);
            const itemNames = orderDetails
              .map((detail) => detail.item_name)
              .join(", ");

            return (
              <tr key={item.order_id}>
                <td>{item.order_id}</td>
                <td>{itemNames}</td>
                <td>
                  <button
                    className={styles.button}
                    onClick={() => handleOpenModal(item)}
                  >
                    View Details
                  </button>
                </td>
                <td>{item.order_delivery_datetime}</td>
                <td>{item.order_price}$</td>
                <td>
                  <button
                    className={styles.button}
                    onClick={() => handleReorder(item)}
                  >
                    Reorder
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {currentItem && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Order Details</h2>
            <table className={styles.detailsTable}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Item Quantity</th>
                  <th>Item Price</th>
                  <th>Additional Items</th>
                  <th>Restaurant ID</th>
                </tr>
              </thead>
              <tbody>
                {currentItem.order_details.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.item_name}</td>
                    <td>{detail.itemQuantity}</td>
                    <td>{detail.itemPrice}$</td>
                    <td>
                      {detail.selectedAdditionalItems.map(
                        (additionalItem, aiIndex) => (
                          <div key={aiIndex} className={styles.additionalItem}>
                            {additionalItem.name} : {additionalItem.price}$
                          </div>
                        )
                      )}
                    </td>
                    <td>{detail.restaurant_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerOrderTable;
