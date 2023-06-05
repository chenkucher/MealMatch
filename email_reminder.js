const axios = require('axios');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const mysql = require('mysql');
require("dotenv").config();

// Configure nodemailer transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chenkuchiersky@gmail.com',
    pass: 'caauknmafaaglhhl'
  }
});

// Create a MySQL database connection
const dbConnection = mysql.createConnection({
  host: 'ec2-35-169-139-56.compute-1.amazonaws.com',
  user: 'meal',
  password: 'Ck96963',
  database: 'MealMatch'
});



axios.get('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurant/Orders/nextHour')
  .then((response) => {
    const orders = response.data;
    // console.error(orders);

    orders.forEach(order => {
      const now = moment().tz("Asia/Jerusalem");
      const orderDeliveryTime = moment.tz(order.order_delivery_datetime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Jerusalem');
      const diff = moment.duration(orderDeliveryTime.diff(now)).asMinutes();
      if (parseInt(diff) <= 120) {

        console.log("Order Delivery Time: ", orderDeliveryTime.format('YYYY-MM-DD HH:mm:ss'));
        console.log("Current Time: ", now);
        console.log("Difference in minutes: ", diff);
        // Get the customer's email address
        const getEmailQuery = 'SELECT email FROM customers WHERE customer_id = ?';
        dbConnection.query(getEmailQuery, [order.customer_id], (error, result) => {
          if (error) {
            console.error('Error occurred while executing query:', error);
            return;
          }
          if (result.length === 0) {
            console.error('Customer not found.');
            return;
          }
          const email = result[0].email;

          // If order delivery time is within 1 hour, send an email
          let mailOptions = {
            from:process.env.GMAIL_USER,
            to: email,
            subject: 'Order Confirmation',
            html: `<p>Order ID: ${order.order_id}</p>`
          };
          
          // If the order is already paid, the mail will be just a reminder
          if (order.isPaid) {
            mailOptions.html += `<p>Your order will arrive approximately at ${order.order_delivery_datetime}.</p>`;
          } else {
            mailOptions.html += `<p>See your order here:</p>
                                 <a href="http://ec2-35-169-139-56.compute-1.amazonaws.com/CustomerEmailCheckout/${order.order_id}" 
                                    style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">
                                    View Order
                                 </a>`;
          }
          
          
          
          transporter.sendMail(mailOptions, function(err, info){
            if (err) {
              console.log(err);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        });
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
  // console.error(allOrders);

  allOrders.forEach(order => {
    const now = moment().tz("Asia/Jerusalem").format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const orderDeliveryTime = moment.tz(order.order_delivery_datetime, 'YYYY-MM-DD HH:mm:ss');
    const diff = orderDeliveryTime.diff(now, 'minutes');
    // console.log(diff);
    // console.log(orderDeliveryTime);
    // console.log(now);

    
    if (diff == 35 && order.order_paid === '0')
    {
          // Get the customer's email address
          const getEmailQuery = 'SELECT email FROM customers WHERE customer_id = ?';
          dbConnection.query(getEmailQuery, [order.customer_id], (error, result) => {
            if (error) {
              console.error('Error occurred while executing query:', error);
              return;
            }
            if (result.length === 0) {
              console.error('Customer not found.');
              return;
            }
            const email = result[0].email;

            // Send email
            let mailOptions = {
              from:process.env.GMAIL_USER,
              to: email,
              subject: 'Order Reminder',
              html: 
              `<p>You have 10 minutes to pay for your order! Pay for you order:</p>
              <a href="http://ec2-35-169-139-56.compute-1.amazonaws.com/CustomerEmailCheckout/${order.order_id}" 
                style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">
                View Order
              </a>`
            };

            transporter.sendMail(mailOptions, function(err, info){
              if (err) {
                console.log(err);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          });

    }


    if (diff <= 25 && order.order_paid === '0') {
      // Delete the order

      axios.delete(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/OrderDetails/${order.order_id}`)
        .then(() => {
          console.log(`Order ID: ${order.order_id} deleted successfully.`);

          // Get the customer's email address
          const getEmailQuery = 'SELECT email FROM customers WHERE customer_id = ?';
          dbConnection.query(getEmailQuery, [order.customer_id], (error, result) => {
            if (error) {
              console.error('Error occurred while executing query:', error);
              return;
            }
            if (result.length === 0) {
              console.error('Customer not found.');
              return;
            }
            const email = result[0].email;

            // Send email
            let mailOptions = {
              from:process.env.GMAIL_USER,
              to: email,
              subject: 'Order Cancellation Notice',
              text: `Order ID: ${order.order_id} has been cancelled as it must be paid at least 25 minutes before the delivery time.`

            };

            transporter.sendMail(mailOptions, function(err, info){
              if (err) {
                console.log(err);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          });
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
