import React  , { useState}from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';

import NavBar from './components/NavBar';

function CustomerLogin(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const response = await axios.post('http://localhost:5000/api/CustomerLogin', { email, password });
        console.log(response.data.message);
      } catch (error) {
        setError(error.response.data.message);
      }
    };
  
    return (
      <div className="login-page">
        <header>
            <NavBar/>
        </header>
        <div className="login-form">
          <h1>Customer Login</h1>
          <form onSubmit={handleSubmit}>
            <label>Email:</label>
            <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Password:</label>
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
}

export default CustomerLogin;