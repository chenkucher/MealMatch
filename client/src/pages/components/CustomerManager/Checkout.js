import React, { useContext, useEffect, useState } from 'react';
import ShoppingCartContext from '../../components/CustomerManager/ShoppingCartContext';
import styles from '../../../styles/Checkout.module.css';
import axios from 'axios';

function Checkout({ customerId }) {
  const { cartItems, removeFromCart, updateCartItem } = useContext(ShoppingCartContext);
  const [paypalRefs, setPaypalRefs] = useState({});
  const [totals, setTotals] = useState({});
  const [checkedOutItems, setCheckedOutItems] = useState([]);

  useEffect(() => {
    let newRefs = {};
    let newTotals = {};

    const groups = cartItems.reduce((groups, item) => {
      const group = groups[item.restaurantId] || [];
      group.push(item);
      groups[item.restaurantId] = group;
      return groups;
    }, {});

    for (const restaurantId in groups) {
      newRefs[restaurantId] = React.createRef();
      newTotals[restaurantId] = groups[restaurantId].reduce(
        (sum, item) => {
          const ingredientCost = (item.selectedAdditionalItems || []).reduce(
            (total, additionalItem) => total + parseFloat(additionalItem.price),
            0
          );
          return sum + parseFloat(item.itemQuantity * (parseFloat(item.itemPrice) + parseFloat(ingredientCost)));
        },
        0
      );
    }

    setPaypalRefs(newRefs);
    setTotals(newTotals);
  }, [cartItems]);

  useEffect(() => {
    if (window.paypal) {
      for (const restaurantId in paypalRefs) {
        if (paypalRefs[restaurantId].current && totals[restaurantId]) {
          window.paypal.Buttons({
            createOrder: function(data, actions) {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: totals[restaurantId].toFixed(2),
                    },
                    payee: {
                      account_id: 'Aap6RrtnUqXmNxEPKzVRW-4AghHqRIQ2Swx9EDwOeD4a5H6kEMBFkMU2nvVhYmi2jtFsQiPy10qGWnDX'
                    }
            
                  },
                ],
              });
            },
            onApprove: async function(data, actions) {
              const order = await actions.order.capture();
              handleCheckout(order, restaurantId);
            },
          }).render(paypalRefs[restaurantId].current);
        }
      }
    }
  }, [paypalRefs, totals]);

  const handleCheckout = async (order, restaurantId) => {
    try {
      const group = cartItems.filter(item => item.restaurantId === restaurantId);
      const orderItems = group.map(item => ({
        item_name: item.item_name,
        itemQuantity: item.itemQuantity,
        itemPrice: item.itemPrice,
        selectedAdditionalItems: item.selectedAdditionalItems,
        restaurant_id: item.restaurantId,
      }));

      const total = orderItems.reduce(
        (sum, item) => sum + item.itemQuantity * item.itemPrice,
        0
      );

      const orderData = {
        order_price: total,
        order_details: JSON.stringify(orderItems),
        restaurant_id: restaurantId,
        customer_id: customerId,
      };

      const response = await axios.post('/api/restaurant/NewOrder', orderData);
      console.log(orderData);

      // Remove the checked out items from the cart
      const updatedCartItems = cartItems.filter(item => !group.includes(item));
      removeFromCart(updatedCartItems);

      // Update the checkedOutItems state
      setCheckedOutItems([...checkedOutItems, ...group]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>

      {Object.keys(totals).map(restaurantId => (
        <div key={restaurantId}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Selected Additional Items</th>
              </tr>
            </thead>
            <tbody>
              {cartItems
                .filter(item => item.restaurantId === restaurantId && !checkedOutItems.includes(item))
                .map((item, index) => (
                  <tr key={index}>
                    <td>{item.item_name}</td>
                    <td>{item.itemQuantity}</td>
                    <td>${parseFloat(item.itemPrice).toFixed(2)}</td>
                    <td>
                      {(item.selectedAdditionalItems || []).map((additionalItem, additionalItemIndex) => (
                        <div key={additionalItemIndex}>
                          {additionalItem.name}: ${parseFloat(additionalItem.price).toFixed(2)}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p>Total: ${totals[restaurantId].toFixed(2)}</p>
          <div ref={paypalRefs[restaurantId]}></div>
        </div>
      ))}
    </div>
  );
}

export default Checkout;
