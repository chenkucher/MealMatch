import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/CustomerEmailCheckout.module.css';
import Swal from 'sweetalert2';


function CustomerEmailCheckout() {
  const { orderId } = useParams();
  const [paypalRef, setPaypalRef] = useState(React.createRef());
  const [orderAmount, setOrderAmount] = useState(0);
  const [orderDeliveryDatetime, setOrderDeliveryDatetime] = useState('');
  const [orderDetails, setOrderDetails] = useState([]);
  const [showPaypalButton, setShowPaypalButton] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [restaurantId, setOrderResturantId] = useState('');
  const [restaurantSettings, setRestaurantSettings] = useState({});
  const [isModified, setIsModified] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    // get order details
    axios.get(`/api/OrderDetails/${orderId}`)
      .then(response => {
        const orderTotal = JSON.parse(response.data.order_details).reduce(
          (sum, item) => sum + parseFloat(item.itemQuantity * item.itemPrice),
          0
        );
        setOrderAmount(orderTotal);
        setOrderDeliveryDatetime(response.data.order_delivery_datetime);
        setOrderDetails(JSON.parse(response.data.order_details));
        setDeliveryAddress(response.data.delivery_address);
        setOrderResturantId(response.data.restaurant_id);

      })
      .catch(error => {
        console.error(error);
      });

    // Update current time every minute
    const timer = setInterval(() => setCurrentTime(new Date().toISOString()), 60000);
    return () => clearInterval(timer);
  }, [orderId,showPaypalButton]);



  useEffect(() => {
    const fetchWorkingHours = async () => {
      if (!restaurantId) {
        console.log("restaurantId is not set yet!");
        return;
      }
      
      console.log(restaurantId);
      const response = await axios.get(`/api/getWorkingHours/${restaurantId}`);
      setRestaurantSettings(response.data);
    };
  
    fetchWorkingHours();
  }, [restaurantId]);
  

  const handlePayNow = () => {
    const orderTime = new Date(orderDeliveryDatetime);
    const currTime = new Date(currentTime);

    if (isModified) {
      Swal.fire(
        'Please Note!',
        'You have unsaved changes. Please save them before proceeding with payment.',
        'info'
      );    
      return;
    }


    // Calculate time difference in hours
    const timeDiff = Math.abs(currTime - orderTime) / 3600000;
    console.log(timeDiff);
    if (timeDiff <= 1) {
      setShowPaypalButton(true);
    } else {
      Swal.fire(
        'Please Note!',
        'Paying can only be done one hour before the order delivery time. A new email will be sent an hour before the order delivery time.',
        'info'
      );    
      setShowPaypalButton(false);
    }

  };


  const handleSaveChanges = () => {
    axios.put(`/api/OrderDetails/${orderId}`, { orderDeliveryDatetime, orderDetails: JSON.stringify(orderDetails), deliveryAddress })
      .then(response => {
        Swal.fire(
          'Success!',
          'Order has been successfully updated!',
          'success'
        );
        setIsModified(false);
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (window.paypal && showPaypalButton) {
      const onApprove = async function(data, actions) {
        const order = await actions.order.capture();

        // handle checkout here
        axios.post('/api/Checkout', { orderId })
          .then(response => {
            // show confirmation popup
            window.alert(response.data.message);
          })
          .catch(error => {
            console.error(error);
          });
      }

      window.paypal.Buttons({
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  // total order amount
                  value: orderAmount,
                },
                payee: {
                  account_id: 'Aap6RrtnUqXmNxEPKzVRW-4AghHqRIQ2Swx9EDwOeD4a5H6kEMBFkMU2nvVhYmi2jtFsQiPy10qGWnDX'
                }
              },
            ],
          });
        },
        onApprove: onApprove,
      }).render(paypalRef.current);
    }
  }, [orderAmount,showPaypalButton]);


  const handleQuantityChange = (index, newQuantity) => {
    let newOrderDetails = [...orderDetails];
    newOrderDetails[index].itemQuantity = newQuantity;
    setOrderDetails(newOrderDetails);

    // Update order amount
    const orderTotal = newOrderDetails.reduce(
      (sum, item) => sum + parseFloat(item.itemQuantity * item.itemPrice) +
        item.selectedAdditionalItems.reduce((subSum, subItem) => subSum + parseFloat(subItem.price), 0),
      0
    );
    setOrderAmount(orderTotal);
    setIsModified(true);

  };



  const handleAdditionalItemsChange = (index, selectedItem, isChecked) => {
    let newOrderDetails = [...orderDetails];
    const itemIndex = newOrderDetails[index].selectedAdditionalItems.findIndex(item => item.name === selectedItem.name);
  
    if (itemIndex !== -1) {
      // Item exists, update isSelected status
      newOrderDetails[index].selectedAdditionalItems[itemIndex].isSelected = isChecked;
    } else if (isChecked) {
      // Item doesn't exist, and the checkbox is being checked, so we add the item
      newOrderDetails[index].selectedAdditionalItems.push({ ...selectedItem, isSelected: true });
    }
  
    setOrderDetails(newOrderDetails);
  
    // Update order amount
    const orderTotal = newOrderDetails.reduce(
      (sum, item) => sum + (parseFloat(item.itemQuantity * item.itemPrice) +
        item.selectedAdditionalItems.reduce((subSum, subItem) => subItem.isSelected ? subSum + parseFloat(subItem.price) : subSum, 0)),
      0
    );
    setOrderAmount(orderTotal);
    setIsModified(true);

  };
  
  


  const handleCancelOrder = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to cancel this order!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`/api/OrderDetails/${orderId}`)
          .then(response => {
            navigate('/CustomerLogin');
          })
          .catch(error => {
            console.error(error);
          });
      }
    });
  };


  const handleDeliveryDatetimeChange = (value) => {
    let selectedDateTime = new Date(value);
  
    if (restaurantSettings) {
      let [startHours, startMinutes] = restaurantSettings.start_opening_time.split(':');
      let startOpeningTime = new Date(selectedDateTime);
      startOpeningTime.setHours(startHours, startMinutes);
  
      let [closeHours, closeMinutes] = restaurantSettings.close_opening_time.split(':');
      let closeOpeningTime = new Date(selectedDateTime);
      closeOpeningTime.setHours(closeHours, closeMinutes);
  
      if (selectedDateTime < startOpeningTime || selectedDateTime > closeOpeningTime) {
        Swal.fire(
          'Please Note!',
          `The selected delivery time must be between the opening and closing times of the restaurant. Working hours for the selected restaurant are from ${restaurantSettings.start_opening_time} to ${restaurantSettings.close_opening_time}.`,
          'info'
        );
        return;
      }
    }
  
    setOrderDeliveryDatetime(value);
  
    let nowPlusOneHour = new Date();
    nowPlusOneHour.setHours(nowPlusOneHour.getHours() + 1);
    setIsModified(true);

    // setShowPaypalButton(selectedDateTime <= nowPlusOneHour);
  };
  


  



  
  


  return (
    <div className={styles.modifyOrder}>
      <h2 className={styles.title}>Modify Order</h2>
      <p>Amount to pay: ${orderAmount.toFixed(2)}</p>
  
      <table className={styles.orderTable}>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Additional Items</th>
            <th>Delivery Time</th>
            <th>Delivery Address</th>

          </tr>
        </thead>
        <tbody>
          {orderDetails.map((item, index) => (
            <tr key={index}>
              <td>{item.item_name}</td>
              <td>
                <input 
                  type="number" 
                  value={item.itemQuantity} 
                  onChange={e => handleQuantityChange(index, parseInt(e.target.value))} 
                  min={0} />
              </td>
              <td>${parseFloat(item.itemPrice).toFixed(2)}</td>
              <td>
  {item.selectedAdditionalItems.map((additionalItem, additionalItemIndex) => (
    <div key={additionalItemIndex}>
      <input
        type="checkbox"
        id={`additionalItem${additionalItemIndex}`}
        name={additionalItem.name}
        value={additionalItem.name}
        data-price={additionalItem.price}
        checked={additionalItem.isSelected}
        onChange={e => handleAdditionalItemsChange(index, {name: e.target.value, price: e.target.dataset.price, isSelected: e.target.checked}, e.target.checked)}
      />
      <label htmlFor={`additionalItem${additionalItemIndex}`}> {additionalItem.name}</label>
    </div>
  ))}
</td>


              
<td>
  <input 
    type="datetime-local" 
    value={orderDeliveryDatetime} 
    onChange={e => handleDeliveryDatetimeChange(e.target.value)} 
  />
</td>

              <td>
              <input 
                type="text" 
                value={deliveryAddress} 
                onChange={e => setDeliveryAddress(e.target.value)}
              />
            </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      <div className={styles.buttonsContainer}>
        <button className={styles.orderButton} onClick={handleSaveChanges}>Save Changes</button>
        <button className={styles.orderButton} onClick={handleCancelOrder}>Cancel Order</button>
        <button className={styles.orderButton} onClick={handlePayNow} >Pay Now</button>

      </div>

      <div ref={paypalRef} style={{ display: showPaypalButton ? 'block' : 'none' }}></div>
      <div ref={paypalRef}></div>
    </div>
  );
}

export default CustomerEmailCheckout;