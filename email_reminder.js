const axios = require('axios');
// const moment = require('moment');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const mysql = require('mysql');
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
// Assume restaurantId is 1 for example
axios.get('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurant/Orders/nextHour')
  .then((response) => {
    const orders = response.data;
    console.error(orders);
    orders.forEach(order => {
      const now = moment().tz("Asia/Jerusalem");
      const orderDeliveryTime = moment.tz(order.order_delivery_datetime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Jerusalem');
      const diff = orderDeliveryTime.diff(now, 'minutes');
      // console.log(orderDeliveryTime);
      // console.log(now);      
      // console.log(diff);
      if (diff <= 60) {
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
            from: 'chenkuchiersky@gmail.com',
            to: email,
            subject: 'Order Confirmation',
            text: `Order ID: ${order.order_id} - Delivery Time: ${order.order_delivery_datetime}\n\nSee your order here: http://ec2-35-169-139-56.compute-1.amazonaws.com/CustomerEmailCheckout/${order.order_id}`
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
    });
  })
  .catch((error) => {
    console.error(error);
  });
