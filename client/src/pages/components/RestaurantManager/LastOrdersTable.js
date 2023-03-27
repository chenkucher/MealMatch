import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import styles from '../../../styles/StatisticsComponents.module.css';

function LastOrdersTable() {
  const [orders, setOrders] = useState([]);
  const { restaurantId } = useParams();

  useEffect(() => {
    const socket = socketIOClient('http://vmedu265.mtacloud.co.il:5000');
    socket.on('newOrder', (data) => {
      setOrders((prevItems) => [...prevItems, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch(`http://vmedu265.mtacloud.co.il/api/restaurant/Orders/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, [restaurantId]);

  useEffect(() => {
    fetch(`http://vmedu265.mtacloud.co.il/api/restaurant/Orders/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, [orders]);

  return (
    <div className={styles.last_orders_table}>
      {/* <h2>Last Orders</h2> */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Name</th>
            <th>Details</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.order_id}</td>
              <td>{order.order_timestamp}</td>
              <td>{order.order_name}</td>
              <td>{order.order_details}</td>
              <td>{order.order_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LastOrdersTable;
