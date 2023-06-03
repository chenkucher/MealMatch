

import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/ResetPasswordPage.css';


function CustomerResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const customerId = window.location.pathname.split('/')[2];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/reset-password-customer/${customerId}`, { password });

      if (response.data.message === 'Password updated successfully.') {
        window.location.href = '/CustomerLogin';
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };


  return (
    <div className="reset-password-page">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} className="reset-password-form">
        <label>New Password:</label>
        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Confirm New Password:</label>
        <input type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button type="submit">Reset Password</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );

}

export default CustomerResetPasswordPage;
