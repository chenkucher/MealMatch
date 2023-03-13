import React, { useState, useEffect } from 'react';
import '../../../styles/StatisticsComponents.css'

function LastOrdersTable() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch data from the server
    fetch('http://127.0.0.1:5000/api/last-hour-orders')
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="last-orders-table">
      {/* <h2>Last Orders</h2> */}
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Item</th>
            <th>Details</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.time}</td>
              <td>{order.name}</td>
              <td>{order.details}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LastOrdersTable;
