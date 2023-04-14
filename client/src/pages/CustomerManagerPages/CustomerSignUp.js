import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/SignupPage.css'

import NavBar from '../components/NavBar';

function CustomerSignUp() {
  const [first_name, setFname] = useState('');
  const [last_name, setLname] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://ec2-50-17-11-178.compute-1.amazonaws.com/api/CustomerSignup', {first_name,last_name,address,phone, email, password, confirm_password: confirmPassword });
      console.log(response.data.message);
      if (response.data.message === 'Signup successful. Please check your email for a confirmation link.') {
        setIsSubmitted(true);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <div className="signup-page">
    <header>
        <NavBar/>
    </header>
    {isSubmitted ? (
        <div className="signup-success">
          <h2>Signup successful!</h2>
          <p>Please check your email for a confirmation link.</p>
        </div>
      ) : (
        <div className="signup-form">
          <h1>Customer Signup</h1>
          <form onSubmit={handleSubmit}>
            <label>First Name:</label>
            <input type="text" name="fname" value={first_name} onChange={(e) => setFname(e.target.value)} />
            <label>Last Name:</label>
            <input type="text" name="lname" value={last_name} onChange={(e) => setLname(e.target.value)} />
            <label>Address:</label>
            <input type="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <label>Email:</label>
            <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Phone Number:</label>
            <input type="text" name="phone" value={phone} onChange={(e) => setPhoneNumber(e.target.value)} />
            <label>Password:</label>
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <label>Confirm Password:</label>
            <input type="password" name="confirm_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button type="submit">Signup</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default CustomerSignUp;
