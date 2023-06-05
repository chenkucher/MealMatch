import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import styles from '../../../styles/StatisticsComponents.module.css';
import Table from 'react-bootstrap/Table';

function FutureOrdersChart() {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch initial data from the server
    fetch(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurant/Orders/futureOrders/${restaurantId}`)
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => console.error(error));
      
    const socket = socketIOClient('http://ec2-35-169-139-56.compute-1.amazonaws.com:5000');
    socket.on('newOrder', (data) => {
      setOrders((prevItems) => [...prevItems, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  return (
    <div className={styles.future_orders_chart}>
      <Table responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Delivery Time</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id}>
              <td>{order.order_id}</td>
              <td>{order.order_delivery_datetime}</td>
              <td>{order.order_price}$</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default FutureOrdersChart;
