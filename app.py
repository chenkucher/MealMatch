from flask import Flask, request, jsonify
import os
import openai
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
##Set the OpenAI API key
# openai.api_key = "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"

# @app.route('/api/generate', methods=['POST'])
# def generate():
#     data = request.get_json()
#     options = data['options']
#     prompt = (f"built for me lunch plan for the next week, from the {options}, 700 kalories per mea")
#     completions = openai.Completion.create(
#         engine="text-davinci-002",
#         prompt=prompt,
#         max_tokens=1024,
#         n=1,
#         stop=None,
#         temperature=0.5,
#     )
#     message = completions.choices[0].text.strip()
#     return jsonify({'response': message})



# import mysql.connector

# cnx = mysql.connector.connect(user='username', password='password', host='hostname', database='databasename', auth_plugin='mysql_native_password')
# cnx = mysql.connector.connect(
#         host='mealmatchrds.cgfedb8xllw8.us-east-1.rds.amazonaws.com',
#         user='admin',
#         password='12345678',
#         database='mealmatch'
#     )
# cur = cnx.cursor()
# @app.route('/api/orders')
# def get_orders():
    
#     cur.execute('SELECT * FROM orders')
#     orders = cur.fetchall()
#     cur.close()
#     cur.close()

#     return jsonify(orders)



@app.route('/api/SellerLogin', methods=['POST'])
def sellerLogin():
    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        return jsonify({'message': 'Please provide both email and password.'}), 400

    cur = cnx.cursor()
    cur.execute('SELECT * FROM users WHERE email = %s AND password = %s', (email, password))
    result = cur.fetchone()
    cur.close()

    if not result:
        return jsonify({'message': 'Incorrect email or password.'}), 401

    return jsonify({'message': 'Login successful.'})


@app.route('/api/CustomerLogin', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        return jsonify({'message': 'Please provide both email and password.'}), 400

    cur = cnx.cursor()
    cur.execute('SELECT * FROM users WHERE clients = %s AND password = %s', (email, password))
    result = cur.fetchone()
    cur.close()

    if not result:
        return jsonify({'message': 'Incorrect email or password.'}), 401

    return jsonify({'message': 'Login successful.'})


@app.route('/api/SellerSignup', methods=['POST'])
def sellerSignup():
    cnx = mysql.connector.connect(
        host='vmedu265.mtacloud.co.il',
        user='chen2',
        password='Ck96963',
        database='MealMatch'
    )
    name = request.form.get('name')
    address = request.form.get('address')
    phone_number = request.form.get('phone')
    email = request.form.get('email')
    password = request.form.get('password')
    category =request.form.get('category')
    confirm_password = request.form.get('confirm_password')

    if not email or not password or not confirm_password:
        return jsonify({'message': 'Please provide all required fields.'}), 400

    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match.'}), 400

    cur = cnx.cursor()
    cur.execute('SELECT * FROM restaurants WHERE restaurants_email = %s', (email,))
    result = cur.fetchone()

    if result:
        return jsonify({'message': 'Email address already exists.'}), 409

    cur.execute('INSERT INTO restaurants (restaurant_name, restaurant_category, restaurant_address, restaurants_email, restaurant_phone_number, restaurant_password) VALUES (%s, %s, %s, %s, %s, %s)', (name, category, address, email, phone_number, password))
    cnx.commit()
    cur.close()

    return jsonify({'message': 'Signup successful.'})



@app.route('/api/CustomerSignup', methods=['POST'])
def CustomerSignup():
    first_name = request.form.get('fname')
    last_name = request.form.get('lname')
    address = request.form.get('address')
    phone_number = request.form.get('phone')
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm_password')



    if not email or not password or not confirm_password:
        return jsonify({'message': 'Please provide all required fields.'}), 400

    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match.'}), 400
    
    cnx = mysql.connector.connect(
        host='vmedu265.mtacloud.co.il',
        user='chen2',
        password='Ck96963',
        database='MealMatch'
    )

    cur = cnx.cursor()
    cur.execute('SELECT * FROM clients WHERE email = %s', (email,))
    result = cur.fetchone()

    if result:
        return jsonify({'message': 'Email address already exists.'}), 409
    # print(first_name, last_name, address, phone_number, email, password, '!!!!!!!!!!!!!!!!')




    cur = cnx.cursor()
    cur.execute('INSERT INTO clients (first_name, last_name, address, email, phone_number, password) VALUES (%s, %s, %s, %s, %s, %s)', (first_name, last_name, address, email, phone_number, password))
    cnx.commit()
    cur.close()
    cnx.close()

    return jsonify({'message': 'Signup successful.'})

# Fake menu data
@app.route('/api/orders')
def get_orders():
    orders = [
        {'id': 1, 'name': 'Burger', 'timestamp': '2022-04-01 10:30:00', 'price': 12.99, 'details': 'Burger, Fries, Coke'},
        {'id': 2, 'name': 'Pizza','timestamp': '2022-04-01 11:15:00', 'price': 8.99, 'details': 'Pizza, Salad, Water'},
        {'id': 3, 'name': 'Steak','timestamp': '2022-04-01 12:00:00', 'price': 20.99, 'details': 'Steak, Mashed Potatoes, Wine'},
        {'id': 4, 'name': 'Sandwich','timestamp': '2022-04-01 13:30:00', 'price': 5.99, 'details': 'Sandwich, Chips, Juice'}
    ]

    return jsonify(orders)


menu_items = [
    {'id': 1, 'name': 'Margherita Pizza', 'ingredients': 'Tomato, Mozzarella, Basil', 'price': 10.99, 'category': 'Pizza'},
    {'id': 2, 'name': 'Pepperoni Pizza', 'ingredients': 'Tomato, Mozzarella, Pepperoni', 'price': 12.99, 'category': 'Pizza'},
    {'id': 3, 'name': 'Pesto Pasta', 'ingredients': 'Pesto Sauce, Penne Pasta, Pine Nuts', 'price': 9.99, 'category': 'Pasta'},
    {'id': 4, 'name': 'Spaghetti Carbonara', 'ingredients': 'Bacon, Egg, Parmesan Cheese', 'price': 11.99, 'category': 'Pasta'},
    {'id': 5, 'name': 'Grilled Chicken Salad', 'ingredients': 'Lettuce, Grilled Chicken, Tomatoes, Cucumber', 'price': 8.99, 'category': 'Salad'},
    {'id': 6, 'name': 'Caesar Salad', 'ingredients': 'Lettuce, Croutons, Parmesan Cheese, Caesar Dressing', 'price': 7.99, 'category': 'Salad'},
]

@app.route('/api/menu')
def get_menu_items():
    return jsonify(menu_items)




# Fake data for best selling items
best_selling_items = [
    {
        "name": "Cheeseburger",
        "price": 8.99,
        "category": "Burgers"
    },
    {
        "name": "Margherita Pizza",
        "price": 10.99,
        "category": "Pizzas"
    },
    {
        "name": "Spaghetti Bolognese",
        "price": 12.99,
        "category": "Pasta"
    },
    {
        "name": "Grilled Salmon",
        "price": 15.99,
        "category": "Seafood"
    },
    {
        "name": "Caesar Salad",
        "price": 7.99,
        "category": "Salads"
    }
]

# Fake data for last hour orders
last_hour_orders = [
    {
        "time": "2022-03-15 12:05:00",
        "name": "Cheeseburger",
        "details": "No onions",
        "status": "Delivered"
    },
    {
        "time": "2022-03-15 12:12:00",
        "name": "Margherita Pizza",
        "details": "Extra cheese",
        "status": "In progress"
    },
    {
        "time": "2022-03-15 12:20:00",
        "name": "Grilled Salmon",
        "details": "Medium rare",
        "status": "Preparing"
    },
    {
        "time": "2022-03-15 12:25:00",
        "name": "Spaghetti Bolognese",
        "details": "Gluten-free pasta",
        "status": "Delivered"
    },
    {
        "time": "2022-03-15 12:40:00",
        "name": "Caesar Salad",
        "details": "No croutons",
        "status": "Preparing"
    }
]

# Flask function to fetch best selling items
@app.route('/api/best-selling-items')
def get_best_selling_items():
    return jsonify(best_selling_items)

# Flask function to fetch last hour orders
@app.route('/api/last-hour-orders')
def get_last_hour_orders():
    return jsonify(last_hour_orders)

@app.route('/api/future-orders')
def get_future_orders():
    orders = [
    {"id": 1, "details": "Pizza, Coke", "price": 23.5, "timestamp": "18:30:00"},
    {"id": 2, "details": "Burger, Fries, Pepsi", "price": 45.2, "timestamp": "18:30:00"},
    {"id": 3, "details": "Salad, Water", "price": 12.9, "timestamp": "19:00:00"},
    {"id": 3, "details": "Salad, Water", "price": 12.9, "timestamp": "19:00:00"},
    {"id": 4, "details": "Pasta, Wine", "price": 31.7, "timestamp": "19:00:00"},
    {"id": 5, "details": "Steak, Beer", "price": 52.0, "timestamp": "19:30:00"},
    {"id": 6, "details": "Chicken, Fanta", "price": 18.3, "timestamp": "19:30:00"},
    {"id": 7, "details": "Sushi, Sake", "price": 57.8, "timestamp": "20:00:00"},
    {"id": 8, "details": "Tacos, Margarita", "price": 24.9, "timestamp": "20:05:00"},
    {"id": 9, "details": "Hot dog, Coke", "price": 9.5, "timestamp": "20:30:00"},
    {"id": 10, "details": "Shrimp, Wine", "price": 39.2, "timestamp": "20:30:00"}
]

    counts = {}
    for order in orders:
        time = order['timestamp']  # Remove seconds and timezone offset
        if time in counts:
            counts[time] += 1
        else:
            counts[time] = 1
    data = [{'time': time, 'count': count} for time, count in counts.items()]
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
