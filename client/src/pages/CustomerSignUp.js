import React, { useState } from 'react';
import axios from 'axios';
import '../styles/SignupPage.css';

import NavBar from './components/NavBar';

function CustomerSignUp() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/CustomerSignUp', {fname,lname,address,phoneNumber, email, password, confirm_password: confirmPassword });
      console.log(response.data.message);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <div className="signup-page">
    <header>
        <NavBar/>
    </header>
      <div className="signup-form">
        <h1>Customer Signup</h1>
        <form onSubmit={handleSubmit}>
          <label>First Name:</label>
          <input type="text" name="fname" value={fname} onChange={(e) => setFname(e.target.value)} />
          <label>Last Name:</label>
          <input type="text" name="lname" value={lname} onChange={(e) => setLname(e.target.value)} />
          <label>Address:</label>
          <input type="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <label>Email:</label>
          <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Phone Number:</label>
          <input type="text" name="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <label>Password:</label>
          <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label>Confirm Password:</label>
          <input type="password" name="confirm_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="submit">Signup</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default CustomerSignUp;
