import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import Table from 'react-bootstrap/Table';
import styles from '../../../styles/OrderTable.module.css';

function OrderTable() {
  const [items, setItems] = useState([]);
  const { restaurantId } = useParams();
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleOpenModal = (item) => {
    setCurrentItem(item);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItem((prevItem) => (prevItem === itemId ? null : itemId));
  };

  const handleUpdateStatus = (newStatus) => {
    const updatedItems = items.map((item) =>
      item.order_id === selectedItem ? { ...item, order_status: newStatus } : item
    );
    setItems(updatedItems);
    setSelectedItem(null);
  };

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
    fetch(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurant/Orders/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [restaurantId]);

  return (
    <div className={styles.container}>
      <h1>Orders Management</h1>
      <Table responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Item</th>
            <th>Details</th>
            <th>Price</th>
            <th>Status</th>
            <th>Modify Status</th>
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
                <td>{item.order_price}$</td>
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
                    <div className={item.order_status === 'Delivered' ? styles.status_complete : styles.status}>
                      {item.order_status}
                    </div>
                  )}
                </td>
                <td>
                  <button className={styles.button} onClick={() => handleSelectItem(item.order_id)}>
                    Modify Status
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {currentItem && (
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
                {JSON.parse(currentItem.order_details).map((detail, index) => (
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

export default OrderTable;
