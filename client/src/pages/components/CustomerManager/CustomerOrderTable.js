import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import styles from '../../../styles/CustomerOrderTable.module.css';

function CustomerOrderTable(props) {
  const [items, setItems] = useState([]);
  const { customerId } = useParams();



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

  return (
    <div>
      <h1>My Orders</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Name</th>
            <th>Details</th>
            <th>Price</th>

          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.order_id}>
              <td>{item.order_id}</td>
              <td>{item.order_timestamp}</td>
              <td>{item.order_name}</td>
              <td>{item.order_details}</td>
              <td>{item.order_price}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerOrderTable;
