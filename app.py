from flask import Flask, request, jsonify
import os
import openai
import mysql.connector

app = Flask(__name__)

# Set the OpenAI API key
openai.api_key = "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"

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.get_json()
    options = data['options']
    prompt = (f"built for me lunch plan for the next week, from the {options}, 700 kalories per mea")
    completions = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.5,
    )
    message = completions.choices[0].text.strip()
    return jsonify({'response': message})



connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='password',
        database='mydatabase'
    )

cursor = connection.cursor()
@app.route('/orders')
def get_orders():
    
    cursor.execute('SELECT * FROM orders')
    orders = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(orders)



@app.route('/api/SellerLogin', methods=['POST'])
def sellerLogin():
    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        return jsonify({'message': 'Please provide both email and password.'}), 400

    cur = mysql.connection.cursor()
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

    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM users WHERE email = %s AND password = %s', (email, password))
    result = cur.fetchone()
    cur.close()

    if not result:
        return jsonify({'message': 'Incorrect email or password.'}), 401

    return jsonify({'message': 'Login successful.'})


@app.route('/api/SellerSignup', methods=['POST'])
def sellerSignup():
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm_password')

    if not email or not password or not confirm_password:
        return jsonify({'message': 'Please provide all required fields.'}), 400

    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match.'}), 400

    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM users WHERE email = %s', (email,))
    result = cur.fetchone()

    if result:
        return jsonify({'message': 'Email address already exists.'}), 409

    cur.execute('INSERT INTO users (email, password) VALUES (%s, %s)', (email, password))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Signup successful.'})



@app.route('/api/CustomerSignup', methods=['POST'])
def CustomerSignup():
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm_password')

    if not email or not password or not confirm_password:
        return jsonify({'message': 'Please provide all required fields.'}), 400

    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match.'}), 400

    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM users WHERE email = %s', (email,))
    result = cur.fetchone()

    if result:
        return jsonify({'message': 'Email address already exists.'}), 409

    cur.execute('INSERT INTO sellers (email, password) VALUES (%s, %s)', (email, password))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Signup successful.'})

if __name__ == '__main__':
    app.run(debug=True)
