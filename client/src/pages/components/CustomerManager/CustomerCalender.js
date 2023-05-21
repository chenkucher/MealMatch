import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from '../../../styles/CustomerCalendar.module.css';

const localizer = momentLocalizer(moment);

const OrderSummary = ({ order, onClose }) => {
  // Parse order_details if it is a string
  const orderDetails = typeof order.order_details === 'string' ? JSON.parse(order.order_details) : order.order_details;
  // Extract item names from order_details and join them into a string
  const itemNames = Array.isArray(orderDetails) ? orderDetails.map(detail => detail.item_name).join(', ') : '';

  return (
    <div className={styles.orderSummary}>
      {/* Render your order summary here using order data */}
      <h2>Order Summary</h2>
      <p>Item Names: {itemNames}</p>
      <p>Order Price: {order.order_price}$</p>
      <p>Order Timestamp: {order.order_timestamp}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};


const CustomerCalender = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/CustomerOrders/${customerId}`);
      const calendarOrders = response.data.map((order) => {
        // Check if order_details is a string and parse it
        const orderDetails = typeof order.order_details === 'string' ? JSON.parse(order.order_details) : order.order_details;
        // Extract item names from order_details and join them into a string
        const itemNames = Array.isArray(orderDetails) ? orderDetails.map(detail => detail.item_name).join(', ') : '';

        return {
          title: `${itemNames}`,
          start: new Date(order.order_timestamp),
          end: new Date(order.order_timestamp),
          allDay: false,
          resource: order,
        };
      });

      setOrders(calendarOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
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
