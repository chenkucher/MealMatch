import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import styles from '../../../styles/OrderTable.module.css';

function OrderTable(props) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { restaurantId } = useParams();

  const handleSelectItem = (itemId) => {
    setSelectedItem((prevItem) => (prevItem === itemId ? null : itemId));
  };

  const handleUpdateStatus = (newStatus) => {
    // Update the status of the selected item
    const updatedItems = items.map((item) =>
      item.order_id === selectedItem ? { ...item, order_status: newStatus } : item
    );
    setItems(updatedItems);
    setSelectedItem(null);

    // Send an update to the server
   // Update the order status in the database
    fetch(`http://vmedu265.mtacloud.co.il/api/restaurant/Orders/${selectedItem}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_status: newStatus }),
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err));

  };

  useEffect(() => {
    const socket = socketIOClient('http://vmedu265.mtacloud.co.il:5000');
    socket.on('newOrder', (data) => {
      setItems((prevItems) => [...prevItems, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch(`http://vmedu265.mtacloud.co.il/api/restaurant/Orders/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [restaurantId]);

  return (
    <div>
      <h1>Orders Management</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Name</th>
            <th>Details</th>
            <th>Price</th>
            <th>Status</th>
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
              {/* <td>{item.order_status}</td> */}
              <td>
                {selectedItem === item.order_id ? (
                  <div className={styles.dropdown_menu}>
                    <button className={styles.dropdown_item} onClick={() => handleUpdateStatus('Pending')}>
                      Pending
                    </button>
                    <button className={styles.dropdown_item} onClick={() => handleUpdateStatus('In Progress')}>
                      In Progress
                    </button>
                    <button className={styles.dropdown_item} onClick={() => handleUpdateStatus('Delivered')}>
                      Delivered
                    </button>
                  </div>
                ) : (
                  <div
                    className={item.order_status === 'Delivered' ? styles.status_complete : styles.status}
                    onClick={() => handleSelectItem(item.order_id)}
                  >
                    {item.order_status}
                  </div>
                )}
              </td>
              <td>
                <button className={styles.modify_button} onClick={() => handleSelectItem(item.order_id)}>
                  Modify Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;
