import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import styles from '../../../styles/StatisticsComponents.module.css';

function FutureOrdersChart() {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch initial data from the server
    fetch(`http://vmedu265.mtacloud.co.il/api/restaurant/Orders/next3hours/${restaurantId}`)
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error(error));
  }, []);

  if (orders.length === 0) {
    return <div>Loading...</div>;
  }

  const orderCounts = orders.reduce((acc, order) => {
    const timestamp = new Date(order.order_timestamp);
    const index = Math.floor((timestamp.getTime() - orders[0].order_timestamp) / 600000);
    acc[index] = (acc[index] || 0) + order.count;
    return acc;
  }, []);

  const rows = [...Array(10)].map((_, index) => {
    const timestamp = new Date(orders[0].order_timestamp);
    timestamp.setMinutes(index * 15);
    return {
      timestamp: timestamp.toLocaleTimeString(),
      count: orderCounts[index] || 0,
    };
  });
  console.log(orders);
  return (
    <div  className={styles.future_orders_chart}>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.timestamp}>
              <td >{row.timestamp}</td>
              <td >{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FutureOrdersChart;
