const axios = require('axios');
const moment = require('moment-timezone');
require("dotenv").config();

// Fetch all orders that will be delivered within the next hour
axios.get('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurant/Orders/nextHour')
  .then((response) => {
    const orders = response.data;
    orders.forEach(order => {
      const now = moment().tz("Asia/Jerusalem");
      const orderDeliveryTime = moment.tz(order.order_delivery_datetime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Jerusalem');
      const diff = moment.duration(orderDeliveryTime.diff(now)).asMinutes();
      if (parseInt(diff) <= 120) {
        // Get the customer's email address
        const getEmailQuery = 'http://ec2-35-169-139-56.compute-1.amazonaws.com/api/Customers/Email/'+ order.customer_id;
        axios.get(getEmailQuery)
          .then(emailRes => {
            const email = emailRes.data.email;
            const payload = {
              order: order,
              email: email,
              isPaid: order.isPaid
            };
            axios.post('http://ec2-35-169-139-56.compute-1.amazonaws.com/sendConfirmationEmail', payload);
          })
          .catch(err => console.error(err));
      }
    });
  })
  .catch((error) => {
    console.error(error);
  });

// Fetch all orders
axios.get('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/AllOrders')
.then((response) => {
  const allOrders = response.data;
  allOrders.forEach(order => {
    const now = moment().tz("Asia/Jerusalem").format("YYYY-MM-DD HH:mm:ss");
    const orderDeliveryTime = moment.tz(order.order_delivery_datetime, 'YYYY-MM-DD HH:mm:ss');
    const diff = orderDeliveryTime.diff(now, 'minutes');
    console.log(diff);
    if (diff == 35 && order.order_paid === '0') {
      const getEmailQuery = 'http://ec2-35-169-139-56.compute-1.amazonaws.com/api/Customers/Email/'+ order.customer_id;
      axios.get(getEmailQuery)
        .then(emailRes => {
          const email = emailRes.data.email;
          const payload = {
            order: order,
            email: email,
          };
          axios.post('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/sendReminderEmail', payload);
        })
        .catch(err => console.error(err));
    }

    if (diff <= 25 && order.order_paid === '0') {
      // Delete the order
      axios.delete(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/OrderDetails/${order.order_id}`)
        .then(() => {
          console.log(`Order ID: ${order.order_id} deleted successfully.`);
          const getEmailQuery = 'http://ec2-35-169-139-56.compute-1.amazonaws.com/api/Customers/Email/'+ order.customer_id;
          axios.get(getEmailQuery)
            .then(emailRes => {
              const email = emailRes.data.email;
              const payload = {
                order: order,
                email: email,
              };
              axios.post('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/sendCancellationEmail', payload);
            })
            .catch(err => console.error(err));
        })
        .catch((deleteError) => {
          console.error(deleteError);
        });
    }
  });
})
.catch((error) => {
  console.error(error);
});
