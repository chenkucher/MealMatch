const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const http = require("http");
const moment = require("moment-timezone");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const axios = require("axios");
const bcrypt = require("bcrypt");
const multer = require('multer');
const { listObjects, uploadFileToS3, deleteFileFromS3, getImageUrl } = require('./s3bucket_control');
const fs = require('fs');

require("dotenv").config();

// create Express application
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// enable cors for all routes
const corsOptions = {
  origin: "http://ec2-35-169-139-56.compute-1.amazonaws.com:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));// allow to get requests from outside


// configure session
app.use(
  session({
    key: "user-id",
    secret: crypto.randomBytes(64).toString("hex"),
    resave: true,
    saveUninitialized: true,
    cookie: {
      expires: 24 * 60 * 60 * 1000,
    },
  })
);

// Create a MySQL database connection
const dbConnection = mysql.createConnection({
  host: process.env.MYSQL_ADDRESS,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

// Connect to the MySQL database
dbConnection.connect((error) => {
  if (error) {
    console.error("Error connecting to database:", error);
  } else {
    console.log("Connected to database");
  }
});

// Create an HTTP server using the Express application
const server = http.createServer(app);

// Create a Socket.IO instance and attach it to the HTTP server
const io = require("socket.io")(server, {
  cors: {
    origin: "http://ec2-35-169-139-56.compute-1.amazonaws.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

//for uploaading to S3
const upload = multer({ dest: '/home/ubuntu/MealMatch/uploads/' }); // temporarily store file  directory
app.post('/api/upload', upload.single('imageFile'), async (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const fileName = `${req.body.type}_${req.body.itemId}.png`;

  try {
    // upload the file to S3
    const imageUrl = await uploadFileToS3(fileName, fileContent);
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// for deleting a image from S3
app.delete('/api/delete/:key', async (req, res) => {
  try {
    const fileKey = req.params.key;
    await deleteFileFromS3(fileKey);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
});

// for getting a image from S3
app.get('/api/url/:key', async (req, res) => {
  try {
    const fileKey = req.params.key;
    const url = await getImageUrl(fileKey);

    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving file URL' });
  }
});



//---------ROUTS FOR RESTAURANT-------------

// handle seller signup
app.post("/api/SellerSignup", async (req, res) => {
  const name = req.body.name;
  const address = req.body.address;
  const phone = req.body.phone;
  const email = req.body.email;
  const password = req.body.password;
  const restaurantDetails = req.body.restaurantDetails;
  const confirm_password = req.body.confirm_password;
  const openingHoursStart = req.body.openingHoursStart;
  const openingHoursEnd = req.body.openingHoursEnd;
  const paypal_api_key = req.body.paypal_api_key;


  //validations
  if (
    !email ||
    !password ||
    !confirm_password ||
    !name ||
    !address ||
    !phone ||
    !restaurantDetails ||
    !paypal_api_key
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  if (!openingHoursStart || !openingHoursEnd) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
      //for hashing passwords
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    //checking email availability
    const checkEmailQuery =
      "SELECT * FROM restaurants WHERE restaurant_email = ?";
    dbConnection.query(checkEmailQuery, [email], (error, result) => {
      if (error) {
        console.error("Error occurred while executing query:", error);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      if (result.length !== 0) {
        return res
          .status(409)
          .json({ message: "Email address already exists." });
      }
      //checking phone availability
      const checkPhoneQuery =
        "SELECT * FROM restaurants WHERE restaurant_phone_number = ?";
      dbConnection.query(checkPhoneQuery, [phone], (error, result) => {
        if (error) {
          console.error("Error occurred while executing query:", error);
          return res
            .status(500)
            .json({
              message: "An error occurred while processing your request.",
            });
        }

        if (result.length !== 0) {
          return res
            .status(409)
            .json({ message: "Phone number already exists." });
        }

        

        const addUserQuery =
          "INSERT INTO restaurants (restaurant_name, restaurant_details, restaurant_address, restaurant_email, restaurant_phone_number, restaurant_password, confirmation_token, start_opening_time, close_opening_time, paypal_api_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        dbConnection.query(
          addUserQuery,
          [
            name,
            restaurantDetails,
            address,
            email,
            phone,
            hashedPassword,
            token,
            openingHoursStart,
            openingHoursEnd,
            paypal_api_key,
          ],
          (error) => {
            if (error) {
              console.error("Error occurred while executing query:", error);
              return res
                .status(500)
                .json({
                  message: "An error occurred while processing your request.",
                });
            }
            //sending confirmation mail
            const token = crypto.randomBytes(64).toString("hex");
            const confirmationLink = `http://ec2-35-169-139-56.compute-1.amazonaws.com/api/confirm-email/${token}`;
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
              },
            });

            const mailOptions = {
              from: process.env.GMAIL_USER,
              to: email,
              subject: "Confirm Your Email Address",
              html: `<p>Please click on the following button to confirm your email address:</p>
            <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">Confirm Email Address</a>`,
            };

            transporter.sendMail(mailOptions, (error) => {
              if (error) {
                console.error("Error sending email:", error);
              } else {
                console.log("Email sent");
              }
            });
            res.json({
              message:
                "Signup successful. Please check your email for a confirmation link.",
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error occurred while hashing password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});



// check if user logged in
app.get("/api/SellerLogin", (req, res) => {
  if (req.session.restaurantId) {
    res.send({ loggedIn: true, userId: req.session.restaurantId });
  } else {
    res.send({ loggedIn: false });
  }
});



// updating an order status
app.put("/api/restaurant/Orders/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { order_status } = req.body;

  const query = `UPDATE restaurants_orders SET order_status = '${order_status}' WHERE order_id = ${orderId}`;

  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    return res.json({ message: "Order status updated!" });
  });
});



// delete the menu item
app.delete("/api/restaurant/MenuItemDelete/:itemId", (req, res) => {
  const itemId = req.params.itemId;

  // delete the menu item from the database
  const sql = "DELETE FROM `restaurant_menu_items` WHERE item_id = ?";
  dbConnection.query(sql, [itemId], (error, results, fields) => {
    if (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).send("Error deleting menu item");
    } else {
      io.emit("menu-item-deleted", results);
      console.log(`Menu item ${itemId} deleted successfully`);
      res.status(200).send("Menu item deleted successfully");
    }
  });
});



//log out the user and clear the session
app.get("/api/SellerLogout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});




// getting most ordered items-only paid orders
app.get("/api/restaurant/Orders/mostOrderedItems/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;
  const query = `
    SELECT 
      order_details
    FROM 
      restaurants_orders
    WHERE
      restaurant_id = ? AND order_paid = 1`;

  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const orderedItems = result.map((row) => JSON.parse(row.order_details));

    const allItems = [].concat(...orderedItems);

    // count each item
    const itemCounts = allItems.reduce((counts, item) => {
      counts[item.item_name] = (counts[item.item_name] || 0) + 1;
      return counts;
    }, {});

    // cConvert the itemCounts into an array of { name, count } 
    const itemsArray = Object.entries(itemCounts).map(([name, count]) => ({
      name,
      count,
    }));

    res.json(itemsArray);
  });
});




// login of sellers
app.post("/api/SellerLogin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password." });
  }

  const query =
    "SELECT restaurant_id, restaurant_password, email_confirmed FROM restaurants WHERE restaurant_email = ?";
  dbConnection.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    bcrypt.compare(password, result[0].restaurant_password, (err, isMatch) => {
      if (err) {
        console.error("Error occurred while comparing password:", err);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Incorrect email or password." });
      }

      const { restaurant_id, email_confirmed } = result[0];

      if (!email_confirmed) {
        return res
          .status(401)
          .json({ message: "Please confirm your email to login." });
      }

      // Set session variables for seller
      req.session.restaurantId = restaurant_id;
      console.log(req.session.restaurantId);
      return res.json({
        message: "Login successful.",
        restaurantId: restaurant_id,
      });
    });
  });
});


// getting next hours orders
app.get("/api/restaurant/Orders/nextHour", (req, res) => {
  const query = `SELECT order_id, restaurant_id, order_price, order_timestamp, order_details, customer_id, order_status, order_delivery_datetime, order_paid FROM restaurants_orders WHERE reminder_sent = 0 AND order_delivery_datetime BETWEEN CONVERT_TZ(NOW(), '+00:00', '+03:00') AND DATE_ADD(CONVERT_TZ(NOW(), '+00:00', '+03:00'), INTERVAL 3 HOUR)`;

  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    // convert the timestamp to local timezone
    const localResult = result.map((row) => {
      const timestamp = moment(row.order_delivery_datetime).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      // console.log("timestamp", timestamp);
      return {
        ...row,
        order_delivery_datetime: timestamp,
        isPaid: row.order_paid === "1",
      };
    });
    // console.log(localResult);
    if (localResult.length > 0) {
      // update the retrieved rows, setting reminder_sent to 1
      const updateQuery = `UPDATE restaurants_orders SET reminder_sent = 1 WHERE order_id IN (${localResult
        .map((row) => row.order_id)
        .join(",")})`;
      dbConnection.query(updateQuery, (updateErr) => {
        if (updateErr) throw updateErr;
      });
    }

    return res.json(localResult);
  });
});





// Inserting new order to the db
app.post("/api/restaurant/NewOrder", (req, res) => {
  const {
    order_price,
    order_details,
    restaurant_id,
    customer_id,
    delivery_datetime,
    delivery_address,
    order_paid,
    reminder_sent,
  } = req.body;

  const order_delivery_datetime = delivery_datetime
    ? moment(delivery_datetime).format("YYYY-MM-DD HH:mm:ss")
    : null;
  console.log(delivery_datetime);
  console.log(order_delivery_datetime);

  const query = `INSERT INTO restaurants_orders (order_price, order_details, restaurant_id, customer_id, order_delivery_datetime, delivery_address, order_paid, reminder_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  dbConnection.query(
    query,
    [
      order_price,
      order_details,
      restaurant_id,
      customer_id,
      order_delivery_datetime,
      delivery_address,
      order_paid,
      reminder_sent,
    ],
    (err, result) => {
      if (err) throw err;

      dbConnection.query(
        "SELECT LAST_INSERT_ID() as order_id",
        (err, result) => {
          if (err) throw err;

          const orderId = result[0].order_id;

          io.emit("newOrder", { ...result, order_id: orderId });

          return res.json({ message: "Order Added!", order_id: orderId });
        }
      );
    }
  );
});



//uploding image url to db
app.post("/api/restaurant/MenuImageUpload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("bad:", err.message);
      res.status(500).send("bad");
    } else {
      console.log("Image uploaded successfully");
      const imageUrl = req.file.filename;
      const itemId = req.body.item_id;

      const sql =
        "UPDATE `restaurant_menu_items` SET item_image = ? WHERE item_id = ?";
      dbConnection.query(sql, [imageUrl, itemId], (error, results, fields) => {
        if (error) {
          console.error("Error updating item image:", error);
          res.status(500).send("Error updating item image");
        } else {
          console.log(`Item image updated successfully for item ID ${itemId}`);
          res.status(200).send({ url: imageUrl });
        }
      });
    }
  });
});


//check if user confirmed his mail
app.get("/api/check-email-confirmation", (req, res) => {
  const restaurantId = req.session.restaurantId;
  console.log(restaurantId);

  if (!restaurantId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const query =
    "SELECT email_confirmed FROM restaurants WHERE restaurant_id = ?";
  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const emailConfirmed = result[0].email_confirmed;
    return res.json({ emailConfirmed });
  });
});


//updating that the user confirmed his mail
app.get("/api/confirm-email/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // check if the token is valid
    const checkTokenQuery =
      "SELECT * FROM restaurants WHERE confirmation_token = ?";
    dbConnection.query(checkTokenQuery, [token], (tokenErr, tokenResult) => {
      if (tokenErr) {
        console.error("Error occurred while executing query:", tokenErr);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      console.log(tokenResult);
      if (tokenResult.length === 0) {
        return res.redirect(`/InvalidTokenPage`);
      }

      // update the user record in the database to mark their email as confirmed
      const userId = tokenResult[0].restaurant_id;

      const updateQuery =
        "UPDATE restaurants SET email_confirmed = 1, confirmation_token = NULL WHERE restaurant_id = ?";
      dbConnection.query(updateQuery, [userId], (updateErr) => {
        if (updateErr) {
          console.error("Error occurred while executing query:", updateErr);
          return res
            .status(500)
            .json({
              message: "An error occurred while processing your request.",
            });
        }

        // redirect the user to the home page and start a user session
        req.session.restaurantId = userId;
        return res.redirect(`/RestaurantManage/${userId}`);
      });
    });
  } catch (error) {
    console.error("Error occurred while confirming email:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while confirming your email." });
  }
});

//send contact us mail for resturants admins
app.post("/api/ContactUsRestaurant", (req, res) => {
  const { text, subject, phoneNumber, userId } = req.body;

  if (!text || !subject) {
    return res
      .status(400)
      .json({ message: "Please provide text and subject." });
  }

  const getEmailQuery =
    "SELECT restaurant_email FROM restaurants WHERE restaurant_id = ?";
  dbConnection.query(getEmailQuery, [userId], (error, result) => {
    if (error) {
      console.error("Error occurred while executing query:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "restaurant not found." });
    }

    const email = result[0].email;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: subject,
      html: `<p>Message from user (Restaurant ID: ${userId}, Phone: ${phoneNumber}):</p><p>${text}</p>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      } else {
        console.log("Email sent");
        res.json({ message: "Email sent successfully." });
      }
    });
  });
});


//reseding confiramtion mail
app.post("/api/RestaurantResendConfirmation", async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const restaurantQuery =
    "SELECT * FROM restaurants WHERE restaurant_email = ?";
  dbConnection.query(restaurantQuery, [email], (error, results) => {
    if (error) {
      console.error("Error occurred while executing query:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const restaurant = results[0];
    const token = restaurant.confirmation_token;
    const confirmationLink = `http://ec2-35-169-139-56.compute-1.amazonaws.com/api/confirm-email/${token}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Confirm Your Email Address",
      html: `<p>Please click on the following button to confirm your email address:</p>
      <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">Confirm Email Address</a>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "An error occurred while sending email." });
      } else {
        console.log("Email sent");
        res.json({ message: "Confirmation email sent." });
      }
    });
  });
});

// update restaurant settings
app.post("/api/SellerSettings", async (req, res) => {
  const restaurantId = req.session.restaurantId;

  if (!restaurantId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const {
    restaurantName,
    address,
    phone,
    logoUrl,
    openingHours,
    deliveryFee,
    email,
    password,
    confirmPassword,
    restaurantDetails,
    openingHoursStart,
    openingHoursEnd,
    paypalApiKey,
    logoUpdated,
  } = req.body;

  console.log(req.body);
  let hashedPassword;
  if (password) {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    hashedPassword = await bcrypt.hash(password, saltRounds);
  }

  const updateValues = {};

  if (restaurantName) updateValues.restaurant_name = restaurantName;
  if (restaurantDetails) updateValues.restaurant_details = restaurantDetails;
  if (address) updateValues.restaurant_address = address;
  if (phone) updateValues.restaurant_phone_number = phone;

  if (openingHours) updateValues.opening_hours = openingHours;
  if (email) updateValues.restaurant_email = email;
  if (hashedPassword) updateValues.restaurant_password = hashedPassword;
  if (openingHoursStart) updateValues.start_opening_time = openingHoursStart;
  if (openingHoursEnd) updateValues.close_opening_time = openingHoursEnd;
  if (paypalApiKey) updateValues.paypal_api_key = paypalApiKey;

  if (req.body.logoUpdated === false && Object.keys(updateValues).length === 0) {
    return res.status(400).json({ message: "No fields to update." });
  }
  
  const checkDuplicateEmailPhoneQuery = `SELECT restaurant_email, restaurant_phone_number FROM restaurants WHERE restaurant_id != ?`;
  dbConnection.query(
    checkDuplicateEmailPhoneQuery,
    [restaurantId],
    (err, rows) => {
      if (err) {
        console.error("Error occurred while executing query:", err);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      const existingEmails = rows.map((row) => row.restaurant_email);
      const existingPhoneNumbers = rows.map(
        (row) => row.restaurant_phone_number
      );

      // check for duplicates
      if (email && existingEmails.includes(email)) {
        return res.status(400).json({ message: "Email already exists." });
      }

      if (phone && existingPhoneNumbers.includes(phone)) {
        return res
          .status(400)
          .json({ message: "Phone number already exists." });
      }

      // check if any fields have been updated
      const checkIfFieldsUpdatedQuery = `SELECT * FROM restaurants WHERE restaurant_id = ?`;
      dbConnection.query(
        checkIfFieldsUpdatedQuery,
        [restaurantId],
        (err, rows) => {
          if (err) {
            console.error("Error occurred while executing query:", err);
            return res
              .status(500)
              .json({
                message: "An error occurred while processing your request.",
              });
          }

          const currentRestaurant = rows[0];

          let fieldsUpdated = false;
          for (const [key, value] of Object.entries(updateValues)) {
            if (currentRestaurant[key] !== value) {
              fieldsUpdated = true;
              break;
            }
          }

          if (!fieldsUpdated && logoUpdated == false) {
            return res.json({ message: "No fields updated." });
          }

          // update the data in the database
          const query = "UPDATE restaurants SET ? WHERE restaurant_id = ?";
          dbConnection.query(
            query,
            [updateValues, restaurantId],
            (err, result) => {
              if (err) {
                console.error("Error occurred while executing query:", err);
                return res
                  .status(500)
                  .json({
                    message: "An error occurred while processing your request.",
                  });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found." });
              }

              return res.json({ message: "Settings updated successfully." });
            }
          );
        }
      );
    }
  );
});

//getting restaurant details
app.get("/api/RestaurantSettings", (req, res) => {
  const restaurantId = req.session.restaurantId;
  console.log(restaurantId);
  if (!restaurantId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const query = `SELECT 
      restaurant_id, 
      restaurant_name, 
      restaurant_details, 
      restaurant_address, 
      restaurant_phone_number, 
      restaurant_password, 
      restaurant_email, 
      email_confirmed, 
      confirmation_token, 
      restaurant_logo_url, 
      start_opening_time,
      close_opening_time,
      paypal_api_key
    FROM restaurants 
    WHERE restaurant_id = ?`;

  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const restaurant = result[0];
    return res.json(restaurant);
  });
});

//getting  working hours of restaurant
app.get("/api/getWorkingHours/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;
  const query = `SELECT 
      start_opening_time,
      close_opening_time
    FROM restaurants 
    WHERE restaurant_id = ?`;

  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const restaurant = result[0];
    return res.json(restaurant);
  });
});



// create a new item in the menu
app.post("/api/restaurant/MenuAdd/:restaurantId", (req, res) => {
  const restaurantId = req.params.restaurantId;
  const {
    item_name,
    item_description,
    item_price,
    item_status,
    item_category,
    item_image,
    item_additional,
    item_type,
  } = req.body;
  // unsert the new item into the database
  const insertItemSql =
    "INSERT INTO `restaurant_menu_items` (restaurant_id, item_name, item_description, item_price, item_status, item_category, item_image, item_type, item_additional) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  dbConnection.query(
    insertItemSql,
    [
      restaurantId,
      item_name,
      item_description,
      item_price,
      item_status,
      item_category,
      item_image,
      item_type,
      JSON.stringify(item_additional),
    ],
    (error, results, fields) => {
      if (error) {
        console.error("Error creating menu item:", error);
        res.status(500).send("Error creating menu item");
      } else {
        io.emit("menu-item-added", results);
        console.log(`Menu item ${results.insertId} created successfully`);
        res
          .status(200)
          .json({
            message: "Menu item created successfully",
            insertId: results.insertId,
          });
      }
    }
  );
});

// update an existing item in the menu
app.put("/api/restaurant/MenuSet/:id", (req, res) => {
  const itemId = req.params.id;
  const {
    item_name,
    item_description,
    item_price,
    item_status,
    item_category,
    item_image,
    item_additional,
    item_type,
  } = req.body;

  // update the menu item in the database
  const sql =
    "UPDATE `restaurant_menu_items` SET item_name = ?, item_description = ?, item_price = ?, item_status = ?, item_category = ?, item_image = ?,item_type = ?, item_additional = ? WHERE item_id = ?";
  dbConnection.query(
    sql,
    [
      item_name,
      item_description,
      item_price,
      item_status,
      item_category,
      item_image,
      item_type,
      JSON.stringify(item_additional),
      itemId,
    ],
    (error, results, fields) => {
      if (error) {
        console.error("Error updating menu item:", error);
        res.status(500).send("Error updating menu item");
      } else {
        io.emit("menu-item-added", results);
        console.log(`Menu item ${itemId} updated successfully`);
        return res.json({ message: "Menu item updated successfully." });
      }
    }
  );
});

//update image as a part of MenuAdd
app.put("/api/restaurant/ImageSet/:itemId", (req, res) => {
  const newItemId = req.params.itemId;
  const imageUrl = req.body.item_image;

  const sql =
    "UPDATE `restaurant_menu_items` SET item_image = ? WHERE item_id = ?";
  dbConnection.query(sql, [imageUrl, newItemId], (error, results, fields) => {
    if (error) {
      console.error("Error updating item image:", error);
      res.status(500).send("Error updating item image");
    } else {
      console.log(`Item image updated successfully for item ID ${newItemId}`);
      res.status(200).send("Item image updated successfully");
    }
  });
});

// Define a route for getting a restaurant's menu
app.get("/api/restaurant/MenuGet/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;

  const query = `     
  SELECT rmi.item_id,rmi.restaurant_id, rmi.item_name, rmi.item_description, rmi.item_price, 
  rmi.item_category, rmi.item_status, rmi.item_image,rmi.item_additional,rmi.item_type
  FROM 
    restaurants AS rm
  INNER JOIN 
  restaurant_menu_items AS rmi ON rm.restaurant_id = rmi.restaurant_id
  WHERE 
    rm.restaurant_id = ${restaurantId}
  ORDER BY
    rmi.restaurant_id;`;
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    return res.json(result);
  });
});



//route for getting a restaurant's orders
app.get("/api/restaurant/Orders/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;
  const query = `SELECT order_id,  order_price, order_timestamp, order_details,order_status,order_delivery_datetime FROM restaurants_orders WHERE restaurant_id = ${restaurantId}`;
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    // Convert the timestamp to local timezone
    const localResult = result.map((row) => {
      const timestamp = moment(row.order_timestamp).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const delivertTime = moment(row.order_delivery_datetime).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      return {
        ...row,
        order_timestamp: timestamp,
        order_delivery_datetime: delivertTime,
      };
    });

    return res.json(localResult);
  });
});

// route for getting a restaurant's orders within the next 3 hours
app.get("/api/restaurant/Orders/futureOrders/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;
  const query = `  SELECT order_id, order_price, order_delivery_datetime, order_details FROM restaurants_orders WHERE restaurant_id = ${restaurantId} AND order_delivery_datetime > DATE_ADD(CONVERT_TZ(NOW(), '+00:00', '+03:00'), INTERVAL 30 MINUTE) ORDER BY order_delivery_datetime `;
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    // Convert the timestamp to local timezone
    const localResult = result.map((row) => {
      const timestamp = moment(row.order_timestamp).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const deliveryTime = moment(row.order_delivery_datetime).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      return {
        ...row,
        order_timestamp: timestamp,
        order_delivery_datetime: deliveryTime,
      };
    });

    return res.json(localResult);
  });
});


//getting restaurant name
app.get("/api/restaurant/name/:restaurantId", (req, res) => {
  const restaurantId = req.params.restaurantId;

  const query =
    "SELECT restaurant_name FROM restaurants WHERE restaurant_id = ?";
  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const restaurantName = result[0].restaurant_name;
    return res.json({ name: restaurantName });
  });
});

// get restaurant_id of restaurants with at least one item of a given category
app.get("/api/restaurants-by-category/:category", (req, res) => {
  const category = req.params.category;

  const query = `
  SELECT DISTINCT r.restaurant_id,r.restaurant_details,r.restaurant_logo_url,r.restaurant_name
  FROM restaurants r
  JOIN restaurants rm ON r.restaurant_id = rm.restaurant_id
  JOIN restaurant_menu_items rmi ON rm.restaurant_id = rmi.restaurant_id
  WHERE rmi.item_category = ? and rmi.item_status = 'available';
  `;

  dbConnection.query(query, [category], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    return res.json(result);
  });
});


//handiling forget passowrd 
app.post("/api/forgot-password-restaurant", (req, res) => {
  const email = req.body.email;

  const query =
    "SELECT restaurant_id FROM restaurants WHERE restaurant_email = ?";
  dbConnection.query(query, [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "Email not found." });
    }

    const token = crypto.randomBytes(64).toString("hex");

    const updateQuery =
      "UPDATE restaurants SET reset_token = ? WHERE restaurant_id = ?";
    dbConnection.query(
      updateQuery,
      [token, result[0].restaurant_id],
      (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({
              message: "An error occurred while processing your request.",
            });
        }

        const resetLink = `http://ec2-35-169-139-56.compute-1.amazonaws.com/RestaurantResetPasswordPage/${token}`;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: "Reset Your Password",
          html: `<p>Please click on the following button to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">Reset Password</a>`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error("Error sending email:", error);
            return res
              .status(500)
              .json({ message: "An error occurred while sending reset link." });
          }

          res.json({ message: "Reset link sent." });
        });
      }
    );
  });
});


//resending  reset password request
app.post("/api/reset-password-restaurant/:token", async (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.password;

  const selectQuery =
    "SELECT restaurant_id FROM restaurants WHERE reset_token = ?";
  dbConnection.query(selectQuery, [token], async (error, result) => {
    if (error || result.length === 0) {
      return res.status(400).json({ message: "Invalid reset link." });
    }

    // Hash the new password before updating it in the database
    const saltRounds = 10;
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      const updateQuery =
        "UPDATE restaurants SET restaurant_password = ?, reset_token = NULL WHERE restaurant_id = ?";
      dbConnection.query(
        updateQuery,
        [hashedNewPassword, result[0].restaurant_id],
        (error, result) => {
          if (error) {
            return res
              .status(500)
              .json({
                message: "An error occurred while updating your password.",
              });
          }

          res.json({ message: "Password updated successfully." });
        }
      );
    } catch (error) {
      console.error("Error occurred while hashing password:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  });
});

//get papyl api key of restaurant
app.get("/api/getPaypalApiKey/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;

  const query = `SELECT paypal_api_key FROM restaurants WHERE restaurant_id = ?`;

  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length == 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json({ paypal_api_key: result[0].paypal_api_key });
  });
});

//---------ROUTS FOR CUSTOMER-------------
app.post("/api/forgot-password-customer", (req, res) => {
  const email = req.body.email;

  const query = "SELECT customer_id FROM customers WHERE email = ?";
  dbConnection.query(query, [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "Email not found." });
    }

    const token = crypto.randomBytes(64).toString("hex");

    const updateQuery =
      "UPDATE customers SET reset_token = ? WHERE customer_id = ?";
    dbConnection.query(
      updateQuery,
      [token, result[0].customer_id],
      (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({
              message: "An error occurred while processing your request.",
            });
        }

        const resetLink = `http://ec2-35-169-139-56.compute-1.amazonaws.com/CustomerResetPasswordPage/${token}`;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: "Reset Your Password",
          html: `<p>Please click on the following button to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">Reset Password</a>`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error("Error sending email:", error);
            return res
              .status(500)
              .json({ message: "An error occurred while sending reset link." });
          }

          res.json({ message: "Reset link sent." });
        });
      }
    );
  });
});

// route to get restaurant_id of restaurants with at least one item in customer preferences
app.get("/api/restaurants-by-preferences/:customerId", (req, res) => {
  const customerId = req.params.customerId;

  const query = `
      SELECT DISTINCT r.restaurant_id,r.restaurant_details,r.restaurant_logo_url,r.restaurant_name
      FROM restaurants r
      JOIN restaurants rm ON r.restaurant_id = rm.restaurant_id
      JOIN restaurant_menu_items rmi ON rm.restaurant_id = rmi.restaurant_id
      JOIN customers c ON c.customer_id = ?
      WHERE FIND_IN_SET(rmi.item_category, c.customer_preferences) > 0;
    `;

  dbConnection.query(query, [customerId], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    return res.json(result);
  });
});

app.post("/api/reset-password-customer/:token", async (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.password;

  const selectQuery = "SELECT customer_id FROM customers WHERE reset_token = ?";
  dbConnection.query(selectQuery, [token], async (error, result) => {
    if (error || result.length === 0) {
      return res.status(400).json({ message: "Invalid reset link." });
    }

    // hash the new password before updating it in the database
    const saltRounds = 10;
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      const updateQuery =
        "UPDATE customers SET password = ?, reset_token = NULL WHERE customer_id = ?";
      dbConnection.query(
        updateQuery,
        [hashedNewPassword, result[0].customer_id],
        (error, result) => {
          if (error) {
            return res
              .status(500)
              .json({
                message: "An error occurred while updating your password.",
              });
          }

          res.json({ message: "Password updated successfully." });
        }
      );
    } catch (error) {
      console.error("Error occurred while hashing password:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  });
});

// a route for getting a restaurant's orders
app.get("/api/CustomerOrders/:customerId", (req, res) => {
  const { customerId } = req.params;
  const query = `SELECT order_id, order_price, order_timestamp, order_details,order_status,order_delivery_datetime FROM restaurants_orders WHERE customer_id = ${customerId}`;
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    // Convert the timestamp to local timezone
    const localResult = result.map((row) => {
      const timestamp = moment(row.order_timestamp).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const deliveryTime = moment(row.order_delivery_datetime).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      return {
        ...row,
        order_timestamp: timestamp,
        order_delivery_datetime: deliveryTime,
      };
    });

    return res.json(localResult);
  });
});

// handle customer login
app.post("/api/CustomerLogin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password." });
  }

  const query =
    "SELECT customer_id, email_confirmed, password FROM customers WHERE email = ?";
  dbConnection.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const {
      customer_id,
      email_confirmed,
      password: hashedPassword,
    } = result[0];

    bcrypt.compare(password, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error("Error occurred while comparing password:", err);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Incorrect email or password." });
      }

      if (!email_confirmed) {
        return res
          .status(401)
          .json({ message: "Please confirm your email to login." });
      }

      // set session variables for customer
      req.session.customerId = customer_id;
      console.log(req.session.customerId);
      return res.json({
        message: "Login successful.",
        customerId: customer_id,
      });
    });
  });
});

// andle customer signup
app.post("/api/CustomerSignup", async (req, res) => {
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const address = req.body.address;
  const phone = req.body.phone;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;

  if (
    !email ||
    !password ||
    !confirmPassword ||
    !firstName ||
    !lastName ||
    !address ||
    !phone
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const saltRounds = 10;

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const checkEmailQuery = "SELECT * FROM customers WHERE email = ?";
    dbConnection.query(checkEmailQuery, [email], (error, result) => {
      if (error) {
        console.error("Error occurred while executing query:", error);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      if (result.length !== 0) {
        return res
          .status(409)
          .json({ message: "Email address already exists." });
      }

      const checkPhoneQuery = "SELECT * FROM customers WHERE phone_number = ?";
      dbConnection.query(checkPhoneQuery, [phone], (error, result) => {
        if (error) {
          console.error("Error occurred while executing query:", error);
          return res
            .status(500)
            .json({
              message: "An error occurred while processing your request.",
            });
        }

        if (result.length !== 0) {
          return res
            .status(409)
            .json({ message: "Phone number already exists." });
        }

        const token = crypto.randomBytes(64).toString("hex");

        const addUserQuery =
          "INSERT INTO customers (first_name, last_name, address, email, phone_number, password, confirmation_token) VALUES (?, ?, ?, ?, ?, ?, ?)";
        dbConnection.query(
          addUserQuery,
          [firstName, lastName, address, email, phone, hashedPassword, token],
          (error) => {
            if (error) {
              console.error("Error occurred while executing query:", error);
              return res
                .status(500)
                .json({
                  message: "An error occurred while processing your request.",
                });
            }

            const confirmationLink = `http://ec2-35-169-139-56.compute-1.amazonaws.com/api/confirm-email-customer/${token}`;
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
              },
            });

            const mailOptions = {
              from: process.env.GMAIL_USER,
              to: email,
              subject: "Confirm Your Email Address",
              html: `<p>Please click on the following button to confirm your email address:</p>
            <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">Confirm Email Address</a>`,
            };

            transporter.sendMail(mailOptions, (error) => {
              if (error) {
                console.error("Error sending email:", error);
              } else {
                console.log("Email sent");
              }
            });
            res.json({
              message:
                "Signup successful. Please check your email for a confirmation link.",
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error occurred while hashing password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});

app.post("/api/CustomerResendConfirmation", async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const userQuery = "SELECT * FROM customers WHERE email = ?";
  dbConnection.query(userQuery, [email], (error, results) => {
    if (error) {
      console.error("Error occurred while executing query:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = results[0];
    const token = user.confirmation_token;
    const confirmationLink = `http://ec2-35-169-139-56.compute-1.amazonaws.com/api/confirm-email-customer/${token}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Confirm Your Email Address",
      html: `<p>Please click on the following button to confirm your email address:</p>
      <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">Confirm Email Address</a>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "An error occurred while sending email." });
      } else {
        console.log("Email sent");
        res.json({ message: "Confirmation email sent." });
      }
    });
  });
});

// route for getting a restaurant's menu
app.get("/api/customer/MenuGet/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;

  const query = `     
  SELECT rmi.item_id,rmi.restaurant_id, rmi.item_name, rmi.item_description, rmi.item_price, 
  rmi.item_category, rmi.item_status, rmi.item_image,rmi.item_additional,rmi.item_type
  FROM 
    restaurants AS rm
  INNER JOIN 
  restaurant_menu_items AS rmi ON rm.restaurant_id = rmi.restaurant_id
  WHERE 
    rm.restaurant_id = ${restaurantId} and rmi.item_status = 'available'
  ORDER BY
    rmi.restaurant_id;`;
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    return res.json(result);
  });
});

//  handle MealMatcher, getting item by the preferences
app.get("/api/MealMatcher/:customerId", (req, res) => {
  const customerId = parseInt(req.params.customerId);

  if (!customerId) {
    return res.status(400).json({ message: "Customer ID is required." });
  }

  const query = `
  SELECT r.restaurant_name,r.restaurant_id,rmi.item_id,rmi.restaurant_id, rmi.item_name, rmi.item_description, rmi.item_price, 
  rmi.item_category, rmi.item_status, rmi.item_image,rmi.item_additional
  FROM restaurant_menu_items AS rmi
  JOIN restaurants AS rm ON rmi.restaurant_id = rm.restaurant_id
  JOIN restaurants AS r ON rm.restaurant_id = r.restaurant_id
  JOIN customers AS c ON FIND_IN_SET(rmi.item_category, REPLACE(c.customer_preferences, ' ', '')) > 0
    WHERE c.customer_id = ? and rmi.item_status = 'available';
  `;

  dbConnection.query(query, [customerId], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    return res.json({ items: result });
  });
});



//updating if user confiremed his mail
app.get("/api/confirm-email-customer/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // check if the token is valid
    const checkTokenQuery =
      "SELECT * FROM customers WHERE confirmation_token = ?";
    dbConnection.query(checkTokenQuery, [token], (tokenErr, tokenResult) => {
      if (tokenErr) {
        console.error("Error occurred while executing query:", tokenErr);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      console.log(tokenResult);
      if (tokenResult.length === 0) {
        return res.redirect(`/InvalidTokenPage`);
      }

      // update the user record in the database to mark their email as confirmed
      const userId = tokenResult[0].customer_id;

      const updateQuery =
        "UPDATE customers SET email_confirmed = 1, confirmation_token = NULL WHERE customer_id = ?";
      dbConnection.query(updateQuery, [userId], (updateErr) => {
        if (updateErr) {
          console.error("Error occurred while executing query:", updateErr);
          return res
            .status(500)
            .json({
              message: "An error occurred while processing your request.",
            });
        }

        // redirect the user to the CustomerPreferences page and start a user session
        req.session.customerId = userId;
        return res.redirect(`/CustomerPreferences/${userId}`);
      });
    });
  } catch (error) {
    console.error("Error occurred while confirming email:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while confirming your email." });
  }
});

// handle customer preferences
app.post("/api/CustomerPreferences", (req, res) => {
  const customerId = req.body.customerId;
  const preferences = req.body.preferences;

  if (!customerId || !preferences) {
    return res
      .status(400)
      .json({ message: "Please provide user ID and preferences." });
  }

  const updatePreferencesQuery =
    "UPDATE customers SET customer_preferences = ? WHERE customer_id = ?";
  dbConnection.query(
    updatePreferencesQuery,
    [preferences.join(","), customerId],
    (error, result) => {
      if (error) {
        console.error("Error occurred while executing query:", error);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json({ message: "Preferences saved successfully." });
    }
  );
});

//for validating login
app.get("/api/CustomerLogin", (req, res) => {
  if (req.session.customerId) {
    res.send({ loggedIn: true, userId: req.session.customerId });
  } else {
    res.send({ loggedIn: false });
  }
});

// Endpoint to log out the user and clear the session
app.get("/api/CustomerLogout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//get the attributes for customers data
app.get("/api/CustomerSettings", (req, res) => {
  const customerId = req.session.customerId;
  console.log(customerId);
  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const query = `SELECT 
      customer_id, 
      first_name, 
      last_name, 
      address, 
      email, 
      phone_number, 
      password, 
      customer_preferences
    FROM customers 
    WHERE customer_id = ?`;

  dbConnection.query(query, [customerId], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const customer = result[0];
    return res.json(customer);
  });
});

// update customer attributes
app.post("/api/CustomerSettings", async (req, res) => {
  const customerId = req.session.customerId;
  const saltRounds = 10;

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const {
    firstName,
    lastName,
    address,
    email,
    phoneNumber,
    password,
    confirmPassword,
    customerPreferences,
  } = req.body;

  let hashedPassword;
  if (password) {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    hashedPassword = await bcrypt.hash(password, saltRounds);
  }

  const updateValues = {};

  if (firstName) updateValues.first_name = firstName;
  if (lastName) updateValues.last_name = lastName;
  if (address) updateValues.address = address;
  if (email) updateValues.email = email;
  if (phoneNumber) updateValues.phone_number = phoneNumber;
  if (hashedPassword) updateValues.password = hashedPassword;
  if (customerPreferences)
    updateValues.customer_preferences = customerPreferences;

  if (Object.keys(updateValues).length === 0) {
    return res.status(400).json({ message: "No fields to update." });
  }

  const checkDuplicateEmailPhoneQuery = `SELECT email, phone_number FROM customers WHERE customer_id != ?`;
  dbConnection.query(
    checkDuplicateEmailPhoneQuery,
    [customerId],
    (err, rows) => {
      if (err) {
        console.error("Error occurred while executing query:", err);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      const existingEmails = rows.map((row) => row.email);
      const existingPhoneNumbers = rows.map((row) => row.phone_number);

      // check for duplicates
      if (email && existingEmails.includes(email)) {
        return res.status(400).json({ message: "Email already exists." });
      }

      if (phoneNumber && existingPhoneNumbers.includes(phoneNumber)) {
        return res
          .status(400)
          .json({ message: "Phone number already exists." });
      }

      // check if any fields have been updated
      const checkIfFieldsUpdatedQuery = `SELECT * FROM customers WHERE customer_id = ?`;
      dbConnection.query(
        checkIfFieldsUpdatedQuery,
        [customerId],
        (err, rows) => {
          if (err) {
            console.error("Error occurred while executing query:", err);
            return res
              .status(500)
              .json({
                message: "An error occurred while processing your request.",
              });
          }

          const currentCustomer = rows[0];

          let fieldsUpdated = false;
          for (const [key, value] of Object.entries(updateValues)) {
            if (currentCustomer[key] !== value) {
              fieldsUpdated = true;
              break;
            }
          }

          if (!fieldsUpdated) {
            return res.json({ message: "No fields updated." });
          }

          // update the data in the database
          const query = "UPDATE customers SET ? WHERE customer_id = ?";
          dbConnection.query(
            query,
            [updateValues, customerId],
            (err, result) => {
              if (err) {
                console.error("Error occurred while executing query:", err);
                return res
                  .status(500)
                  .json({
                    message: "An error occurred while processing your request.",
                  });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found." });
              }

              return res.json({ message: "Settings updated successfully." });
            }
          );
        }
      );
    }
  );
});

//send contact us mail for customers
app.post("/api/ContactUsCustomer", (req, res) => {
  const { text, subject, phoneNumber, userId } = req.body;

  if (!text || !subject) {
    return res
      .status(400)
      .json({ message: "Please provide text and subject." });
  }

  const getEmailQuery = "SELECT email FROM customers WHERE customer_id = ?";
  dbConnection.query(getEmailQuery, [userId], (error, result) => {
    if (error) {
      console.error("Error occurred while executing query:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const email = result[0].email;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: subject,
      html: `<p>Message from user (Customer ID: ${userId}, Phone: ${phoneNumber}):</p><p>${text}</p>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      } else {
        console.log("Email sent");
        res.json({ message: "Email sent successfully." });
      }
    });
  });
});


//sedning confiramtion mail of order
app.post("/api/SendOrderConfirmation", (req, res) => {
  const { customerId, orderDetails, total, additionalOrderDetails } = req.body;

  if (!customerId || !orderDetails) {
    return res
      .status(400)
      .json({ message: "Please provide a customerId and order details." });
  }

  const getEmailQuery = "SELECT email FROM customers WHERE customer_id = ?";
  dbConnection.query(getEmailQuery, [customerId], (error, result) => {
    if (error) {
      console.error("Error occurred while executing query:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const email = result[0].email;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Order Confirmation",
      html: `
      <table style="border-collapse: collapse;">
        <tbody>
          ${orderDetails}
        </tbody>
      </table>
      <p><strong>Total Amount: ${total}$</strong></p>
      <p>${additionalOrderDetails}</p>  <!-- added this line -->
      `,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      } else {
        console.log("Email sent");
        res.json({ message: "Order confirmation email sent successfully." });
      }
    });
  });
});



//geting restaurant details
app.get("/api/RestaurantDetails/:restaurantId", (req, res) => {
  const restaurantId = req.params.restaurantId;
  console.log(restaurantId);


  const query = `SELECT 
      restaurant_name, 
      restaurant_details, 
      restaurant_address, 
      restaurant_phone_number, 
      restaurant_email, 
      start_opening_time,
      close_opening_time
    FROM restaurants 
    WHERE restaurant_id = ?`;

  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error("Error occurred while executing query:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const restaurant = result[0];
    return res.json(restaurant);
  });
});





//---------ROUTS FOR GENERAL-------------

//getting orders
app.get("/api/OrderDetails/:orderId", (req, res) => {
  const { orderId } = req.params;

  const query = `SELECT * FROM restaurants_orders WHERE order_id = ?`;

  dbConnection.query(query, [orderId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!result.length) {
      return res.status(404).json({ error: "Order Not Found" });
    }

    const order = result[0];

    // Convert the timestamp to local timezone
    const timestamp = moment(order.order_delivery_datetime).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    order.order_delivery_datetime = timestamp;

    res.json(order);
  });
});


//setting orders
app.put("/api/OrderDetails/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { orderDeliveryDatetime, orderDetails, deliveryAddress } = req.body;

  const fetchQuery = `SELECT order_delivery_datetime FROM restaurants_orders WHERE order_id = ?`;

  dbConnection.query(fetchQuery, [orderId], (fetchErr, fetchResult) => {
    if (fetchErr) {
      // console.error(fetchErr);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Assume fetchResult[0] is the existing order
    const existingOrderDatetime = fetchResult[0].order_delivery_datetime;

    if (orderDeliveryDatetime !== existingOrderDatetime) {
      const resetReminderQuery = `UPDATE restaurants_orders SET reminder_sent = 0 WHERE order_id = ?`;

      dbConnection.query(resetReminderQuery, [orderId], (resetErr) => {
        if (resetErr) {
          console.error(resetErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }
      });
    }

    const updateQuery = `UPDATE restaurants_orders SET order_delivery_datetime = ?, order_details = ?, delivery_address = ? WHERE order_id = ?`;

    dbConnection.query(
      updateQuery,
      [orderDeliveryDatetime, orderDetails, deliveryAddress, orderId],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        res.json({ message: "Order updated successfully." });
      }
    );
  });
});


//deleting orders
app.delete("/api/OrderDetails/:orderId", (req, res) => {
  const { orderId } = req.params;

  const query = `DELETE FROM restaurants_orders WHERE order_id = ?`;

  dbConnection.query(query, [orderId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ message: "Order deleted successfully." });
  });
});



//updating checkout of item
app.post("/api/Checkout", (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Please provide order id." });
  }

  // updating the 'restaurants_orders' table.
  const updateOrderQuery =
    "UPDATE restaurants_orders SET order_paid = 1 WHERE order_id = ?";
  dbConnection.query(updateOrderQuery, [orderId], (error, result) => {
    if (error) {
      console.error("Error occurred while executing query:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while updating your order." });
    }

    // Retrieving customer's email address.
    const getEmailQuery =
      "SELECT email FROM customers INNER JOIN restaurants_orders ON customers.customer_id = restaurants_orders.customer_id WHERE order_id = ?";
    dbConnection.query(getEmailQuery, [orderId], (error, result) => {
      if (error) {
        console.error("Error occurred while executing query:", error);
        return res
          .status(500)
          .json({
            message: "An error occurred while processing your request.",
          });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Customer not found." });
      }

      const email = result[0].email;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your order has been paid",
        html: "<h1>Thank you for your order</h1><p>Your order has been successfully paid and is now being processed.</p>",
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending email:", error);
          return res
            .status(500)
            .json({
              message: "An error occurred while processing your request.",
            });
        } else {
          console.log("Email sent");
          res.json({ message: "Order processed successfully and email sent." });
        }
      });
    });
  });
});


//getting all orders
app.get("/api/AllOrders", (req, res) => {
  const query = `SELECT * FROM restaurants_orders`;

  dbConnection.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(result);
  });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


//sedning confirmation mail (reminder)
app.post('/api/sendConfirmationEmail', (req, res) => {
  const { order, email, isPaid } = req.body;

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Order Confirmation',
    html: `<p>Order ID: ${order.order_id}</p>`
  };

  // If order is already paid, mail will be just a reminder
  if (isPaid) {
    mailOptions.html += `<p>Your order will arrive approximately at ${order.order_delivery_datetime}.</p>`;
  } else {
    mailOptions.html += `<p>See your order here:</p>
                         <a href="http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerEmailCheckout/${order.order_id}" 
                            style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">
                            View Order
                         </a>`;
  }

  transporter.sendMail(mailOptions, function(err, info){
    if (err) {
      res.status(500).send({ error: err.message });
    } else {
      res.send({ message: 'Email sent: ' + info.response });
    }
  });
});


//seding remnider
app.post('/api/sendReminderEmail', (req, res) => {
  const { order, email } = req.body;

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Order Reminder',
    html: 
    `<p>You have 10 minutes to pay for your order! Pay for your order:</p>
    <a href="http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerEmailCheckout/${order.order_id}" 
      style="display: inline-block; padding: 10px 20px; color: #FFF; background-color: #007BFF; text-decoration: none;">
      View Order
    </a>`
  };
  transporter.sendMail(mailOptions, function(err, info){
    if (err) {
      res.status(500).send({ error: err.message });
    } else {
      res.send({ message: 'Email sent: ' + info.response });
    }
  });
});


//canceling order (after reminder)
app.post('/api/sendCancellationEmail', (req, res) => {
  const { order, email } = req.body;

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Order Cancellation Notice',
    text: `Order ID: ${order.order_id} has been cancelled as it must be paid at least 25 minutes before the delivery time.`
  };

  transporter.sendMail(mailOptions, function(err, info){
    if (err) {
      res.status(500).send({ error: err.message });
    } else {
      res.send({ message: 'Email sent: ' + info.response });
    }
  });
});


//geting mail of customer
app.get("/api/Customers/Email/:customerId", (req, res) => {
  const { customerId } = req.params;

  const query = `SELECT email FROM customers WHERE customer_id = ?`;

  dbConnection.query(query, [customerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!result.length) {
      return res.status(404).json({ error: "Customer Not Found" });
    }

    const email = result[0].email;

    res.json({ email: email });
  });
});

server.listen(5000, () => {
  console.log(`Server listening at http://localhost:5000`);
});
