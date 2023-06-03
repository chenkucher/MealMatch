import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/LoginPage.css';
import NavBar from '../components/NavBar';
import Modal from '../components/RestaurantManager/ResetPasswordModal.js';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/forgot-password', { email: resetEmail });
      if (response.data.message === 'Reset link sent.') {
        setShowModal(false);
        setResetEmail('');
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/SellerLogin', { email, password }, { withCredentials: true });

      if (response.data.message === 'Login successful.') {
        const restaurantId = response.data.restaurantId;
        // Redirect to the dashboard
        window.location.href = `/RestaurantManage/${restaurantId}`;
      } else if (response.data.message === 'Please confirm your email before logging in.') {
        setError(response.data.message);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  useEffect(() => {
    axios.get('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/SellerLogin').then((response) => {
      console.log(response);
    });
  });

  return (
    <div className="login-page">
      <header>
        <NavBar />
      </header>
      <div className="login-form">
        <h1>Seller Login</h1>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Password:</label>
          <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
        <button type="button" className="forgot-password-button" onClick={() => setShowModal(true)}>Forgot Password?</button>
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <h1>Reset Password</h1>
          <label>Email:</label>
          <input type="email" name="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
          <button type="button" onClick={handleForgotPassword}>Send Reset Link</button>
        </Modal>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
