import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from '../../../styles/CustomerCalender.module.css';

const localizer = momentLocalizer(moment);

const OrderSummary = ({ order, onClose }) => {
  return (
    <div className={styles.orderSummary}>
      {/* Render your order summary here using order data */}
      <h2>Order Summary</h2>
      <p>Order Name: {order.order_name}</p>
      <p>Order Price: {order.order_price}</p>
      <p>Order Timestamp: {order.order_timestamp}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

const CustomerCalender = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);


  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await axios.get(`/api/CustomerOrders/${customerId}`);
        const calendarOrders = response.data.map((order) => ({
          title: `${order.order_name}`,
          start: new Date(order.order_timestamp),
          end: new Date(order.order_timestamp),
          allDay: false,
          resource: order,
        }));
        setOrders(calendarOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }
    fetchOrders();
  }, [customerId]);
 const handleEventClick = (event) => {
    setSelectedOrder(event.resource);
    setShowSummary(true);
  };

  const closeSummary = () => {
    setShowSummary(false);
  };

  return (
    
    <div style={{ height: '500px' }}>
      <h1>Calendar:</h1>
      <Calendar
        localizer={localizer}
        events={orders}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleEventClick}
      />
      {showSummary && selectedOrder && (
        <div className={styles.overlay}>
          <OrderSummary order={selectedOrder} onClose={closeSummary} />
        </div>
      )}
    </div>
  );
};

export default CustomerCalender;