import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import styles from '../../../styles/StatisticsComponents.module.css';
import Table from 'react-bootstrap/Table';

function LastOrdersTable() {
  const [orders, setOrders] = useState([]);
  const { restaurantId } = useParams();
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    const socket = socketIOClient('http://ec2-35-169-139-56.compute-1.amazonaws.com:5000');
    socket.on('newOrder', (data) => {
      setOrders((prevItems) => [...prevItems, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurant/Orders/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, [restaurantId]);

  const handleOpenModal = (order) => {
    setCurrentOrder(order);
  };

  const handleCloseModal = () => {
    setCurrentOrder(null);
  };

  return (
    <div className={styles.future_orders_chart}>
      <Table responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Delivery Time</th>
            <th>Details</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.order_id}</td>
              <td>{order.order_delivery_datetime}</td>
              <td>
                <button className={styles.button} onClick={() => handleOpenModal(order)}>View Details</button>
              </td>
              <td>{order.order_price}$</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {currentOrder && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Order Details</h2>
              <Table className={styles.detailsTable} responsive>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Item Quantity</th>
                    <th>Item Price</th>
                    <th>Additional Items</th>
                  </tr>
                </thead>
                <tbody>
                  {JSON.parse(currentOrder.order_details).map((detail, index) => (
                    <tr key={index}>
                      <td>{detail.item_name}</td>
                      <td>{detail.itemQuantity}</td>
                      <td>{detail.itemPrice}$</td>
                      <td>
                        {detail.selectedAdditionalItems.map((additionalItem, aiIndex) => (
                          <div key={aiIndex} className={styles.additionalItem}>
                            {additionalItem.name} : {additionalItem.price}$
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <button className={styles.closeButton} onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        )}
    </div>
  );
}

export default LastOrdersTable;
