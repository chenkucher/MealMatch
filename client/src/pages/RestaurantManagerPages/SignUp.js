import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/SignupPage.css';
import NavBar from '../components/NavBar';

function SellerSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/SellerSignup', { email, password, confirm_password: confirmPassword });
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
        <h1>Seller Signup</h1>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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

export default SellerSignupPage;
