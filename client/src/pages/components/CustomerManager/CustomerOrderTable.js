import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import styles from '../../../styles/CustomerOrderTable.module.css';

function CustomerOrderTable(props) {
  const [items, setItems] = useState([]);
  const { customerId } = useParams();
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    const socket = socketIOClient('http://ec2-35-169-139-56.compute-1.amazonaws.com:5000');
    socket.on('newOrder', (data) => {
      setItems((prevItems) => [...prevItems, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerOrders/${customerId}`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [customerId]);

  const handleOpenModal = (item) => {
    const parsedDetails = JSON.parse(item.order_details);
    setCurrentItem({...item, order_details: parsedDetails});
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
  };

  return (
    <div className={styles.container}>
      <h1>My Orders</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Item</th>
            <th>Details</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const orderDetails = JSON.parse(item.order_details);
            const itemNames = orderDetails.map(detail => detail.item_name).join(', ');

            return (
              <tr key={item.order_id}>
                <td>{item.order_id}</td>
                <td>{item.order_timestamp}</td>
                <td>{itemNames}</td>
                <td>
                  <button className={styles.button} onClick={() => handleOpenModal(item)}>View Details</button>
                </td>
                <td>{item.order_price}</td>
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
                      <td>{detail.itemPrice}</td>
                      <td>
                        {detail.selectedAdditionalItems.map((additionalItem, aiIndex) => (
                          <div key={aiIndex} className={styles.additionalItem}>
                            {additionalItem.name} : {additionalItem.price}$
                          </div>
                        ))}
                      </td>
                      <td>{detail.restaurant_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className={styles.closeButton} onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        )}




    </div>
  );
}

export default CustomerOrderTable;
