// Import necessary packages
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const http = require('http');
const moment = require('moment-timezone');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');

// Create Express application
const app = express();

// Use JSON middleware to parse request body
app.use(express.json());

// Enable CORS for all routes
const corsOptions = {
  origin: 'http://vmedu265.mtacloud.co.il:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
  key: "user-id",
  secret: crypto.randomBytes(64).toString('hex'),
  resave: true,
  saveUninitialized: true,
  cookie: {
    expires: 24 * 60 * 60 * 1000
  }
}));

// Create a MySQL database connection
const dbConnection = mysql.createConnection({
  host: 'vmedu265.mtacloud.co.il',
  user: 'chen2',
  password: 'Ck96963',
  database: 'MealMatch'
});

// Connect to the MySQL database
dbConnection.connect(error => {
  if (error) {
    console.error('Error connecting to database:', error);
  } else {
    console.log('Connected to database');
  }
});

// Create an HTTP server using the Express application
const server = http.createServer(app);

// Create a Socket.IO instance and attach it to the HTTP server
const io = require("socket.io")(server, {
  cors: {
    origin: "http://vmedu265.mtacloud.co.il",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Set up the multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/home/chenkc/mealmatch/client/public/restaurants_menu_img/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Set up the multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
}).single('item_image');

app.post('/api/restaurant/MenuImageUpload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('bad:', err.message);
      res.status(500).send('bad');
    } else {
      console.log('Image uploaded successfully');
      const imageUrl = req.file.filename;
      const itemId = req.body.item_id;

      // Update the item_image column in the restaurant_menu_items table
      const sql = 'UPDATE `restaurant_menu_items` SET item_image = ? WHERE item_id = ?';
      dbConnection.query(sql, [imageUrl, itemId], (error, results, fields) => {
        if (error) {
          console.error('Error updating item image:', error);
          res.status(500).send('Error updating item image');
        } else {
          console.log(`Item image updated successfully for item ID ${itemId}`);
          res.status(200).send({ url: imageUrl });
        }
      });
    }
  });
});




app.get('/api/check-email-confirmation', (req, res) => {
  const restaurantId = req.session.restaurantId;
  console.log(restaurantId);

  if (!restaurantId) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  const query = 'SELECT email_confirmed FROM restaurants WHERE restaurant_id = ?';
  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error('Error occurred while executing query:', err);
      return res.status(500).json({ message: 'An error occurred while processing your request.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const emailConfirmed = result[0].email_confirmed;
    return res.json({ emailConfirmed });
  });
});







app.post('/api/SellerLogin', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  const query = 'SELECT restaurant_id, email_confirmed FROM restaurants WHERE restaurant_email = ? AND restaurant_password = ?';
  dbConnection.query(query, [email, password], (err, result) => {
    if (err) {
      console.error('Error occurred while executing query:', err);
      return res.status(500).json({ message: 'An error occurred while processing your request.' });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const { restaurant_id, email_confirmed } = result[0];
    
    if (!email_confirmed) {
      return res.status(401).json({ message: 'Please confirm your email to login.' });
    }

    // Set session variables for seller
    req.session.restaurantId = restaurant_id;
    console.log(req.session.restaurantId);
    return res.json({ message: 'Login successful.', restaurantId: restaurant_id });
  });
});



app.get('/api/confirm-email/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    // Check if the token is valid
    const checkTokenQuery = 'SELECT * FROM restaurants WHERE confirmation_token = ?';
    dbConnection.query(checkTokenQuery, [token], (tokenErr, tokenResult) => {
      if (tokenErr) {
        console.error('Error occurred while executing query:', tokenErr);
        return res.status(500).json({ message: 'An error occurred while processing your request.' });
      }

      console.log(tokenResult);
      if (tokenResult.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
      }

      // Update the user record in the database to mark their email as confirmed
      const userId = tokenResult[0].restaurant_id;

      const updateQuery = 'UPDATE restaurants SET email_confirmed = 1, confirmation_token = NULL WHERE restaurant_id = ?';
      dbConnection.query(updateQuery, [userId], (updateErr) => {
        if (updateErr) {
          console.error('Error occurred while executing query:', updateErr);
          return res.status(500).json({ message: 'An error occurred while processing your request.' });
        }

        // Redirect the user to the home page and start a user session
        req.session.restaurantId = userId;
        return res.redirect('/');
      });
    });
  } catch (error) {
    console.error('Error occurred while confirming email:', error);
    return res.status(500).json({ message: 'An error occurred while confirming your email.' });
  }
});




app.get('/api/SellerLogin', (req, res) => {
  if (req.session.restaurantId) {
    res.send({loggedIn:true,userId:req.session.restaurantId})
  }else{
    res.send({loggedIn:false})
  }
});


// Endpoint to log out the user and clear the session
app.get('/api/SellerLogout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});



// Endpoint to handle seller signup
app.post('/api/SellerSignup', (req, res) => {
  const name = req.body.name;
  const address = req.body.address;
  const phone = req.body.phone;
  const email = req.body.email;
  const password = req.body.password;
  const category = req.body.category;
  const confirm_password = req.body.confirm_password;

  if (!email || !password || !confirm_password || !name || !address || !phone || !category) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const checkEmailQuery = 'SELECT * FROM restaurants WHERE restaurant_email = ?';
  dbConnection.query(checkEmailQuery, [email], (error, result) => {
    if (error) {
      console.error('Error occurred while executing query:', error);
      return res.status(500).json({ message: 'An error occurred while processing your request.' });
    }

    if (result.length !== 0) {
      return res.status(409).json({ message: 'Email address already exists.' });
    }

    const checkPhoneQuery = 'SELECT * FROM restaurants WHERE restaurant_phone_number = ?';
    dbConnection.query(checkPhoneQuery, [phone], (error, result) => {
      if (error) {
        console.error('Error occurred while executing query:', error);
        return res.status(500).json({ message: 'An error occurred while processing your request.' });
      }

      if (result.length !== 0) {
        return res.status(409).json({ message: 'Phone number already exists.' });
      }

      const token = crypto.randomBytes(64).toString('hex');

      const addUserQuery = 'INSERT INTO restaurants (restaurant_name, restaurant_category, restaurant_address, restaurant_email, restaurant_phone_number, restaurant_password, confirmation_token) VALUES (?, ?, ?, ?, ?, ?, ?)';
      dbConnection.query(addUserQuery, [name, category, address, email, phone, password, token], (error) => {
        if (error) {
          console.error('Error occurred while executing query:', error);
          return res.status(500).json({ message: 'An error occurred while processing your request.' });
        }

        const confirmationLink = `http://vmedu265.mtacloud.co.il/api/confirm-email/${token}`;
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'chenkuchiersky@gmail.com',
            pass: 'caauknmafaaglhhl'
          }
        });

        const mailOptions = {
          from: 'chenkuchiersky@gmail.com',
          to: email,
          subject: 'Confirm Your Email Address',
          text: `Please click on the following link to confirm your email address: ${confirmationLink}`
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent');
          }
        });
        res.json({ message: 'Signup successful. Please check your email for a confirmation link.' });
      });
    });
  });
});


// Update restaurant settings
app.post('/api/SellerSettings', (req, res) => {
  const restaurantId = req.session.restaurantId;

  if (!restaurantId) {
    return res.status(401).json({ message: 'Unauthorized.' });
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
    confirmPassword 
  } = req.body;

  const updateValues = {};

  if (restaurantName) updateValues.restaurant_name = restaurantName;
  if (address) updateValues.restaurant_address = address;
  if (phone) updateValues.restaurant_phone_number = phone;
  if (logoUrl) updateValues.restaurant_logo_url = logoUrl;
  if (openingHours) updateValues.opening_hours = openingHours;
  if (deliveryFee) updateValues.delivery_fee = deliveryFee;
  if (email) updateValues.restaurant_email = email;
  if (password) updateValues.restaurant_password = password;

  if (Object.keys(updateValues).length === 0) {
    return res.status(400).json({ message: 'No fields to update.' });
  }

  const checkDuplicateEmailPhoneQuery = `SELECT restaurant_email, restaurant_phone_number FROM restaurants WHERE restaurant_id != ?`;
  dbConnection.query(checkDuplicateEmailPhoneQuery, [restaurantId], (err, rows) => {
    if (err) {
      console.error('Error occurred while executing query:', err);
      return res.status(500).json({ message: 'An error occurred while processing your request.' });
    }

    const existingEmails = rows.map((row) => row.restaurant_email);
    const existingPhoneNumbers = rows.map((row) => row.restaurant_phone_number);

    // Check for duplicates
    if (email && existingEmails.includes(email)) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    if (phone && existingPhoneNumbers.includes(phone)) {
      return res.status(400).json({ message: 'Phone number already exists.' });
    }

    // Check if any fields have been updated
    const checkIfFieldsUpdatedQuery = `SELECT * FROM restaurants WHERE restaurant_id = ?`;
    dbConnection.query(checkIfFieldsUpdatedQuery, [restaurantId], (err, rows) => {
      if (err) {
        console.error('Error occurred while executing query:', err);
        return res.status(500).json({ message: 'An error occurred while processing your request.' });
      }

      const currentRestaurant = rows[0];

      let fieldsUpdated = false;
      for (const [key, value] of Object.entries(updateValues)) {
        if (currentRestaurant[key] !== value) {
          fieldsUpdated = true;
          break;
        }
      }

      if (!fieldsUpdated) {
        return res.json({ message: 'No fields updated.' });
      }

      // Update the data in the database
      const query = 'UPDATE restaurants SET ? WHERE restaurant_id = ?';
      dbConnection.query(query, [updateValues, restaurantId], (err, result) => {
        if (err) {
          console.error('Error occurred while executing query:', err);
          return res.status(500).json({ message: 'An error occurred while processing your request.' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found.' });
        }

        return res.json({ message: 'Settings updated successfully.' });
      });
    });
  });
});





app.get('/api/RestaurantSettings', (req, res) => {
  const restaurantId = req.session.restaurantId;
  console.log(restaurantId);
  if (!restaurantId) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  const query = `SELECT 
      restaurant_id, 
      restaurant_name, 
      restaurant_category, 
      restaurant_address, 
      restaurant_phone_number, 
      restaurant_password, 
      restaurant_email, 
      email_confirmed, 
      confirmation_token, 
      opening_hours, 
      restaurant_logo_url, 
      delivery_fee 
    FROM restaurants 
    WHERE restaurant_id = ?`;

  dbConnection.query(query, [restaurantId], (err, result) => {
    if (err) {
      console.error('Error occurred while executing query:', err);
      return res.status(500).json({ message: 'An error occurred while processing your request.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    const restaurant = result[0];
    return res.json(restaurant);
  });
});






app.post('/api/CustomerLogin', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const query = 'SELECT * FROM users WHERE clients = ? AND password = ?';
    dbConnection.query(query, [email, password], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }

        return res.json({ message: 'Login successful.' });
    });
});



app.post('/api/CustomerSignup', function(req, res) {
    const first_name = req.body.fname;
    const last_name = req.body.lname;
    const address = req.body.address;
    const phone_number = req.body.phone;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
  
    if (!email || !password || !confirm_password) {
      return res.status(400).json({'message': 'Please provide all required fields.'});
    }
  
    if (password !== confirm_password) {
      return res.status(400).json({'message': 'Passwords do not match.'});
    }
  
    const dbConnection = mysql.createConnection({
      host: 'vmedu265.mtacloud.co.il',
      user: 'chen2',
      password: 'Ck96963',
      database: 'MealMatch'
    });
  
    dbConnection.connect(function(err) {
      if (err) throw err;
      console.log('Connected!');
      
      const query = 'SELECT * FROM clients WHERE email = ?';
      dbConnection.query(query, [email], function(error, result, fields) {
        if (error) throw error;
  
        if (result.length > 0) {
          return res.status(409).json({'message': 'Email address already exists.'});
        }
  
        const insertQuery = 'INSERT INTO clients (first_name, last_name, address, email, phone_number, password) VALUES (?, ?, ?, ?, ?, ?)';
        dbConnection.query(insertQuery, [first_name, last_name, address, email, phone_number, password], function(insertError, insertResult, insertFields) {
          if (insertError) throw insertError;
          console.log('1 record inserted');
          return res.json({'message': 'Signup successful.'});
        });
      });
    });
  });







// Delete the menu item 
app.delete('/api/restaurant/MenuItemDelete/:itemId', (req, res) => {
  const itemId = req.params.itemId;

  // Delete the menu item from the database
  const sql = 'DELETE FROM `restaurant_menu_items` WHERE item_id = ?';
  dbConnection.query(sql, [itemId], (error, results, fields) => {
    if (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).send('Error deleting menu item');
    } else {
      io.emit('menu-item-deleted', results);
      console.log(`Menu item ${itemId} deleted successfully`);
      res.status(200).send('Menu item deleted successfully');
    }
  });
});






// Create a new item in the menu
app.post('/api/restaurant/MenuAdd/:restaurantId', (req, res) => {
  const restaurantId = req.params.restaurantId;
  const { item_name, item_description, item_price, item_status, item_category, item_image } = req.body;

  // Get the menu_id from the restaurants_menu table
  const getMenuIdSql = 'SELECT menu_id FROM restaurants_menu WHERE restaurant_id = ?';
  dbConnection.query(getMenuIdSql, [restaurantId], (error, results, fields) => {
    if (error) {
      console.error('Error getting menu id:', error);
      res.status(500).send('Error getting menu id');
    } else {
      const menuId = results[0].menu_id;

      // Insert the new item into the database
      const insertItemSql = 'INSERT INTO `restaurant_menu_items` (menu_id, item_name, item_description, item_price, item_status, item_category, item_image) VALUES (?, ?, ?, ?, ?, ?, ?)';
      dbConnection.query(insertItemSql, [menuId, item_name, item_description, item_price, item_status, item_category, item_image], (error, results, fields) => {
        if (error) {
          console.error('Error creating menu item:', error);
          res.status(500).send('Error creating menu item');
        } else {
          io.emit('menu-item-added', results);
          console.log(`Menu item ${results.insertId} created successfully`);
          res.status(200).json({ message: 'Menu item created successfully', insertId: results.insertId });
        }
      });
    }
  });
});


// Update an existing item in the menu
app.put('/api/restaurant/MenuSet/:id', (req, res) => {
  const itemId = req.params.id;
  const { item_name, item_description, item_price, item_status, item_category } = req.body;

  // Update the menu item in the database
  const sql = 'UPDATE `restaurant_menu_items` SET item_name = ?, item_description = ?, item_price = ?, item_status = ?, item_category = ? WHERE item_id = ?';
  dbConnection.query(sql, [item_name, item_description, item_price, item_status, item_category, itemId], (error, results, fields) => {
    if (error) {
      console.error('Error updating menu item:', error);
      res.status(500).send('Error updating menu item');
    } else {
      io.emit('menu-item-added', results);
      console.log(`Menu item ${itemId} updated successfully`);
      res.status(200).send('Menu item updated successfully');
    }
  });
});





// Define a route for getting a restaurant's menu
app.get('/api/restaurant/MenuGet/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  
  const query = `     
  SELECT rmi.item_id,rmi.menu_id, rmi.item_name, rmi.item_description, rmi.item_price, 
  rmi.item_category, rmi.item_status, rmi.item_image
  FROM 
    restaurants_menu AS rm
  INNER JOIN 
    restaurant_menu_items AS rmi ON rm.menu_id = rmi.menu_id
  WHERE 
    rm.restaurant_id = ${restaurantId}
  ORDER BY
    rmi.menu_id;`;
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    return res.json(result);
  });
});

// Define a route for updating an order's status
app.put('/api/restaurant/Orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { order_status } = req.body;

  const query = `UPDATE restaurants_orders SET order_status = '${order_status}' WHERE order_id = ${orderId}`;

  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    return res.json({ message: 'Order status updated!' });
  });
});

// Define a route for getting a restaurant's orders
app.get('/api/restaurant/Orders/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const query = `SELECT order_id, order_name, order_price, order_category, order_timestamp, order_details,order_status FROM restaurants_orders WHERE restaurant_id = ${restaurantId}`;
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    // Convert the timestamp to local timezone
    const localResult = result.map(row => {
      const timestamp = moment(row.order_timestamp).tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm:ss');
      return {
        ...row,
        order_timestamp: timestamp
      };
    });

    return res.json(localResult);
  });
});

// Define a route for getting a restaurant's orders within the next 3 hours
app.get('/api/restaurant/Orders/next3hours/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  const query = `SELECT order_id, order_name, order_price, order_category, order_timestamp, order_details FROM restaurants_orders WHERE restaurant_id = ${restaurantId} AND order_timestamp BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 HOUR)`;
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    // Convert the timestamp to local timezone
    const localResult = result.map(row => {
      const timestamp = moment(row.order_timestamp).tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm:ss');
      return {
        ...row,
        order_timestamp: timestamp
      };
    });

    return res.json(localResult);
  });
});


app.post('/api/restaurant/NewOrder', (req, res) => {
  // Extracting the necessary data from the request body
  const { order_name, order_price, order_category, order_timestamp, order_details, restaurant_id } = req.body;
  // Creating the query to insert the order data into the database
  const query = `INSERT INTO restaurants_orders (order_name, order_price, order_category, order_timestamp, order_details, restaurant_id) VALUES ('${order_name}', '${order_price}', '${order_category}', '${order_timestamp}', '${order_details}', ${restaurant_id})`;
  // Executing the query and emitting a new order event with Socket.IO
  dbConnection.query(query, (err, result) => {
    if (err) throw err;

    io.emit('newOrder', result);
    // Returning a success response
    return res.json({ message: 'Order Added!' });
  });
});



  app.get('/api/restaurant/name/:restaurantId', (req, res) => {
    const restaurantId = req.params.restaurantId;
  
    const query = 'SELECT restaurant_name FROM restaurants WHERE restaurant_id = ?';
    dbConnection.query(query, [restaurantId], (err, result) => {
      if (err) {
        console.error('Error occurred while executing query:', err);
        return res.status(500).json({ message: 'An error occurred while processing your request.' });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'Restaurant not found.' });
      }
  
      const restaurantName = result[0].restaurant_name;
      return res.json({ name: restaurantName });
    });
  });
  
  server.listen(5000, () => {
    console.log(`Server listening at http://localhost:5000`);
  });
  
