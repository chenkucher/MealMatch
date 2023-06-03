import React, { useContext, useEffect, useState } from "react";
import ShoppingCartContext from "../../components/CustomerManager/ShoppingCartContext";
import styles from "../../../styles/Checkout.module.css";
import axios from "axios";
import Swal from "sweetalert2";

function Checkout({ customerId }) {
  const { cartItems, removeFromCart, updateCartItem } =
    useContext(ShoppingCartContext);
  const [paypalRefs, setPaypalRefs] = useState({});
  const [totals, setTotals] = useState({});
  const [checkedOutItems, setCheckedOutItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [deliveryDates, setDeliveryDates] = useState({});
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isInNextHour, setIsInNextHour] = useState({});
  const [deliveryAddresses, setDeliveryAddresses] = useState({});
  const [restaurantSettings, setRestaurantSettings] = useState({});
  const [showPaypalButton, setShowPaypalButton] = useState(false);
  const dateInputRef = React.createRef();

  useEffect(() => {
    let newRefs = {};
    let newTotals = {};

    const groups = cartItems.reduce((groups, item) => {
      const group = groups[item.restaurantId] || [];
      group.push(item);
      // console.log(group);
      groups[item.restaurantId] = group;
      return groups;
    }, {});

    for (const restaurantId in groups) {
      newRefs[restaurantId] = React.createRef();
      newTotals[restaurantId] = groups[restaurantId].reduce((sum, item) => {
        const ingredientCost = (item.selectedAdditionalItems || []).reduce(
          (total, additionalItem) => total + parseFloat(additionalItem.price),
          0
        );
        return (
          sum +
          parseFloat(
            item.itemQuantity *
              (parseFloat(item.itemPrice) + parseFloat(ingredientCost))
          )
        );
      }, 0);
    }

    setPaypalRefs(newRefs);
    setTotals(newTotals);
  }, [cartItems]);

  useEffect(() => {
    const getPaypalApiKey = async (restaurantId) => {
      try {
        const response = await axios.get(
          `/api/getPaypalApiKey/${restaurantId}`
        );
        return response.data.paypal_api_key;
      } catch (error) {
        console.error("Failed to get Paypal API Key:", error);
      }
    };

    if (window.paypal) {
      for (const restaurantId in paypalRefs) {
        if (paypalRefs[restaurantId].current && totals[restaurantId]) {
          getPaypalApiKey(restaurantId).then((paypalApiKey) => {
            if (paypalApiKey) {
              const onApprove = (restaurantId) =>
                async function (data, actions) {
                  const order = await actions.order.capture();

                  setDeliveryDates((currentDeliveryDates) => {
                    const deliveryDate = currentDeliveryDates[restaurantId];

                    if (!deliveryDate) {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Delivery date not set for!",
                      });
                      return;
                    } else {
                      setDeliveryAddresses((currentDeliveryAddresses) => {
                        const deliveryAddress =
                          currentDeliveryAddresses[restaurantId];

                        if (!deliveryAddress) {
                          Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Delivery address not set",
                          });
                          return;
                        } else {
                          handleCheckout(
                            order,
                            restaurantId,
                            deliveryDate,
                            deliveryAddress
                          );
                        }
                        return currentDeliveryAddresses;
                      });
                    }
                    return currentDeliveryDates;
                  });
                };

              window.paypal
                .Buttons({
                  createOrder: function (data, actions) {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: totals[restaurantId].toFixed(2),
                          },
                          payee: {
                            account_id: paypalApiKey,
                          },
                        },
                      ],
                    });
                  },
                  onApprove: onApprove(restaurantId),
                })
                .render(paypalRefs[restaurantId].current);
            }
          });
        }
      }
    }
  }, [paypalRefs, totals, showPaypalButton]);

  const checkDateTime = (
    order,
    restaurantId,
    selectedDeliveryDate,
    deliveryAddress
  ) => {
    let selectedDateTime = new Date(selectedDeliveryDate);

    if (!deliveryAddress) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Delivery address not set",
      });
      return false;
    }

    if (!selectedDeliveryDate) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Delivery date not set",
      });
      return false;
    }

    let now = new Date();
    let nowPlusOneHour = new Date(now.getTime() + 30 * 60 * 1000);

    if (selectedDateTime < now) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "The selected delivery time cannot be in the past.",
      });
      return false;
    }

    if (selectedDateTime < nowPlusOneHour) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "The selected delivery time must be at least half an hour from now.",
      });
      return false;
    }

    let [startHours, startMinutes] =
      restaurantSettings[restaurantId].start_opening_time.split(":");
    let startOpeningTime = new Date(selectedDateTime);
    startOpeningTime.setHours(startHours, startMinutes);

    let [closeHours, closeMinutes] =
      restaurantSettings[restaurantId].close_opening_time.split(":");
    let closeOpeningTime = new Date(selectedDateTime);
    closeOpeningTime.setHours(closeHours, closeMinutes);

    if (
      selectedDateTime < startOpeningTime ||
      selectedDateTime > closeOpeningTime
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `The selected delivery time must be between the opening and closing times of the restaurant. Working hours for the selected restaurant are from ${restaurantSettings[restaurantId].start_opening_time} to ${restaurantSettings[restaurantId].close_opening_time}.`,
      });
      return false;
    }
    return true;
  };

  const handleCheckout = async (
    order,
    restaurantId,
    selectedDeliveryDate,
    deliveryAddress
  ) => {
    try {
      const dateTimeCheck = checkDateTime(
        order,
        restaurantId,
        selectedDeliveryDate,
        deliveryAddress
      );
      if (!dateTimeCheck) {
        return;
      }
      const group = cartItems.filter(
        (item) => parseInt(item.restaurantId, 10) === parseInt(restaurantId, 10)
      );

      if (!deliveryAddress) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Delivery address not set",
        });
        return;
      }

      if (!selectedDeliveryDate) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Delivery date not set",
        });
        return;
      }

      const orderItems = group.map((item) => ({
        item_name: item.item_name,
        itemQuantity: item.itemQuantity,
        itemPrice: item.itemPrice,
        selectedAdditionalItems: item.selectedAdditionalItems,
        restaurant_id: item.restaurantId,
      }));
      // Function to calculate the total price for a single item (including additional items)
      const calculateTotalItemPrice = (item) => {
        const additionalItemsPrice = (
          item.selectedAdditionalItems || []
        ).reduce(
          (sum, additionalItem) => sum + parseFloat(additionalItem.price),
          0
        );
        return (
          parseFloat(item.itemQuantity) *
          (parseFloat(item.itemPrice) + additionalItemsPrice)
        );
      };

      const total = parseFloat(
        orderItems
          .reduce((sum, item) => sum + calculateTotalItemPrice(item), 0)
          .toFixed(2)
      );

      const orderData = {
        order_price: total,
        order_details: JSON.stringify(orderItems),
        restaurant_id: restaurantId,
        customer_id: customerId,
        delivery_datetime: selectedDeliveryDate,
        delivery_address: deliveryAddress,
        order_paid: order ? "1" : "0",
        reminder_sent: "0",
      };

      const response = await axios.post("/api/restaurant/NewOrder", orderData);

      // Update the checkedOutItems state
      setCheckedOutItems([...checkedOutItems, ...group]);

      // Remove items from cart

      group.forEach(
        (item) => removeFromCart(item.item_id) && console.log(item.item_id)
      );

      // Format orderDetails as an HTML table
      let orderDetailsHTML = `
        <table>
          <thead>
            <tr>
              <th style="border: 1px solid black; padding: 5px;">Item</th>
              <th style="border: 1px solid black; padding: 5px;">Quantity</th>
              <th style="border: 1px solid black; padding: 5px;">Price</th>
              <th style="border: 1px solid black; padding: 5px;">Additional Items</th>
            </tr>
          </thead>
          <tbody>
      `;
      orderItems.forEach((item) => {
        let additionalItems = (item.selectedAdditionalItems || [])
          .map(
            (additionalItem) =>
              `${additionalItem.name}: $${parseFloat(
                additionalItem.price
              ).toFixed(2)}`
          )
          .join(", ");
        orderDetailsHTML += `<tr><td style="border: 1px solid black; padding: 5px;">${item.item_name}</td><td style="border: 1px solid black; padding: 5px;">${item.itemQuantity}</td><td style="border: 1px solid black; padding: 5px;">${item.itemPrice}</td><td style="border: 1px solid black; padding: 5px;">${additionalItems}</td></tr>`;
      });

      orderDetailsHTML += "</tbody></table>";

      // Prepare additional order details
      let additionalOrderDetails = "";
      if (order) {
        additionalOrderDetails =
          "The order has been paid, and a reminder will be sent close to the delivery time.<br></br>";
      } else {
        additionalOrderDetails =
          "NOTICE! You did not pay for the order. You must pay for it at least half an hour before the delivery time<br></br> If you want to pay now, you can do it from your dashboard in your account, or you can wait for a reminder email 2 hours before the delivery time and pay there!<br></br>";
      }

      // Send order confirmation email
      const emailResponse = await axios.post("/api/SendOrderConfirmation", {
        customerId: customerId,
        orderDetails: orderDetailsHTML,
        total: total,
        additionalOrderDetails: additionalOrderDetails,
      });

      // Show the Swal.fire popup instead of the custom one
      Swal.fire({
        icon: "success",
        title: "Order Confirmation",
        text: "Your order has been placed successfully! Order details will be sent to your email.",
      }).then(() => {
        window.location.reload();
      });
    } catch (err) {
      console.error(err);
    }
  };

  //get restaurant opening hours
  useEffect(() => {
    const fetchWorkingHours = async (restaurantId) => {
      const response = await axios.get(`/api/getWorkingHours/${restaurantId}`);
      setRestaurantSettings((prevSettings) => ({
        ...prevSettings,
        [restaurantId]: response.data,
      }));
    };

    // Extract the restaurant IDs from the cart items
    const restaurantIds = cartItems.map((item) => item.restaurantId);

    // Fetch the working hours for each restaurant
    restaurantIds.forEach(fetchWorkingHours);
  }, [cartItems]);

  //handilng change is date picker
  const handleDateTimeChange = (value, restaurantId) => {
    setDeliveryDates((prevDates) => ({ ...prevDates, [restaurantId]: value }));

    let selectedDateTime = new Date(value);
    setIsInNextHour((prevState) => {
      const newIsInNextHour = {
        ...prevState,
        [restaurantId]:
          selectedDateTime <= new Date(new Date().getTime() + 720 * 60 * 1000),
      };
      return newIsInNextHour;
    });
  };

  const handleAddressChange = (value, restaurantId) => {
    setDeliveryAddresses((prevAddresses) => ({
      ...prevAddresses,
      [restaurantId]: value,
    }));
  };

  useEffect(() => {
    console.log("Delivery dates state:", deliveryDates);
  }, [deliveryDates]);

  return (
    <div className={styles.checkout}>
      {showErrorPopup && (
        <div className={styles.errorPopup}>
          <h2>Error</h2>
          <p>{errorPopupMessage}</p>
          <button onClick={() => setShowErrorPopup(false)}>Close</button>
        </div>
      )}


      {Object.keys(totals).map((restaurantId) => (
        <div key={restaurantId}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Selected Additional Items</th>
                <th>Delivery Time</th>
                <th>Delivery Address</th>
              </tr>
            </thead>
            <tbody>
              {cartItems
                .filter(
                  (item) =>
                    parseInt(item.restaurantId, 10) ===
                      parseInt(restaurantId, 10) &&
                    !checkedOutItems.some(
                      (checkedOutItem) =>
                        checkedOutItem.item_id === item.item_id
                    )
                )
                .map((item, index) => (
                  <tr key={index}>
                    <td>{item.item_name}</td>
                    <td>{item.itemQuantity}</td>
                    <td>${parseFloat(item.itemPrice).toFixed(2)}</td>
                    <td>
                      {(item.selectedAdditionalItems || []).map(
                        (additionalItem, additionalItemIndex) => (
                          <div key={additionalItemIndex}>
                            {additionalItem.name}: $
                            {parseFloat(additionalItem.price).toFixed(2)}
                          </div>
                        )
                      )}
                    </td>
                    <td>
                      <div className={styles.datePickerContainer}>
                        <input
                          type="datetime-local"
                          ref={dateInputRef}
                          value={deliveryDates[restaurantId] || ""}
                          onChange={(e) =>
                            handleDateTimeChange(e.target.value, restaurantId)
                          }
                        />
                      </div>
                    </td>

                    <td>
                      <input
                        type="text"
                        placeholder="Delivery address"
                        value={deliveryAddresses[restaurantId] || ""}
                        onChange={(e) =>
                          handleAddressChange(e.target.value, restaurantId)
                        }
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p>Total: ${totals[restaurantId].toFixed(2)}</p>
          <div className={styles.buttons}>
            {showPaypalButton ? (
              isInNextHour[restaurantId] && deliveryAddresses[restaurantId] ? (
                <div ref={paypalRefs[restaurantId]}></div>
              ) : (
                <p>
                  Please select a delivery time at least an hour from now and
                  provide a delivery address.
                </p>
              )
            ) : (
              <button
                onClick={() => {
                  if (
                    isInNextHour[restaurantId] &&
                    deliveryAddresses[restaurantId]
                  ) {
                    const dateTimeCheck = checkDateTime(
                      null,
                      restaurantId,
                      deliveryDates[restaurantId],
                      deliveryAddresses[restaurantId]
                    );
                    if (!dateTimeCheck) {
                      return;
                    } else {
                      setShowPaypalButton(true);
                    }
                  } else {
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Please select a delivery time at least an hour from now and provide a delivery address.",
                    });
                  }
                }}
              >
                Pay Now
              </button>
            )}

            {isInNextHour[restaurantId] && showPaypalButton ? (
              <div ref={paypalRefs[restaurantId]}></div>
            ) : (
              <button
                onClick={() =>
                  handleCheckout(
                    null,
                    restaurantId,
                    deliveryDates[restaurantId],
                    deliveryAddresses[restaurantId]
                  )
                }
              >
                Save Order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Checkout;
