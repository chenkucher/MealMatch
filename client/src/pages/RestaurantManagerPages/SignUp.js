import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/SignupPage.css';
import NavBar from '../components/NavBar';

function SellerSignupPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (isSubmitted) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleResend = async () => {
    try {
      const response = await axios.post(
        `http://vmedu265.mtacloud.co.il/api/SellerResendEmail/${email}`
      );
      if (response.data.message === 'Email sent') {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert');
        alertDiv.textContent = 'Email sent!';
        document.body.appendChild(alertDiv);
      } else {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alrtError');
        const messageSpan = document.createElement('span');
        messageSpan.textContent = 'An error occurred while sending email';
        const closeButton = document.createElement('button');
        closeButton.classList.add('close');
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
          alertDiv.remove();
        });
        alertDiv.appendChild(messageSpan);
        alertDiv.appendChild(closeButton);
        document.body.appendChild(alertDiv);
      }
    } catch (error) {
      console.error(error);
      const alertDiv = document.createElement('div');
      alertDiv.classList.add('alert', 'alrtError');
      const messageSpan = document.createElement('span');
      messageSpan.textContent = 'An error occurred while sending email';
      const closeButton = document.createElement('button');
      closeButton.classList.add('close');
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => {
        alertDiv.remove();
      });
      alertDiv.appendChild(messageSpan);
      alertDiv.appendChild(closeButton);
      document.body.appendChild(alertDiv);
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const requestData = {
        name,
        category,
        address,
        phone: phoneNumber,
        email,
        password,
        confirm_password: confirmPassword,
      };

      const response = await axios.post('http://vmedu265.mtacloud.co.il/api/SellerSignup', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);

      if (response.data.message === 'Signup successful. Please check your email for a confirmation link.') {
        setIsSubmitted(true);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <div className={`signup-page${isSubmitted && seconds < 60 ? ' disabled' : ''}`}>
      {isSubmitted ? (
        <div className="signup-success">
          <h2>Signup successful!</h2>
          <p>Please check your email for a confirmation link.</p>
          {seconds <= 0 ? (
            <p>
              Didn't receive an email?{' '}
              <button onClick={handleResend} className="resend-link">
                Resend
              </button>
            </p>
          ) : (
            <p className="timer">You can try again in {seconds} seconds.</p>
          )}
        </div>
      ) : (
        <>
          <header>
            <NavBar />
          </header>
          <div className="signup-form">
            <h1>Seller Signup</h1>
            <form onSubmit={handleSubmit}>
              <label>Name:</label>
              <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              <label>Address:</label>
              <input type="text" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <label>Category:</label>
              <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">-- Select a category --</option>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Indian">Indian</option>
                <option value="Greek">Greek</option>
              </select>
              <label>Phone Number:</label>
              <input type="tel" name="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
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
        </>
      )}
    </div>
  );
}


export default SellerSignupPage;
