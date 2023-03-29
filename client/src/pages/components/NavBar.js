import React from 'react';
import logo from '../helpers/logo.jpg';
import styles from '../../styles/NavBar.module.css';

function NavBar(props) {
  const isLoggedIn = props.loggedIn;
  const handleLogout = async () => {
    try {
      const response = await fetch('http://ec2-52-90-146-52.compute-1.amazonaws.com/api/SellerLogout', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        // Redirect to homepage after successful logout
        window.location.href = '/';
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <div className={styles.navbar}>
      <img src={logo} alt="Logo" className={styles.logo} />
      <div className={styles.navbar_left}>
        <a href="/">Home</a>
        <a href="/OrderNow">Order Now</a>
        <a href="/Restaurants">Restaurants</a>
        <a href="/SuperMarket">Super Market</a>
        {isLoggedIn ? null : <a href="/CustomerLogin">Customer Login</a>}
        {isLoggedIn ? null : <a href="/Login">Seller Login</a>}
      </div>
      <div className={styles.navbar_right}>
        {isLoggedIn ? null : <a href="/CustomerSignUp">Customer Signup</a>}
        {isLoggedIn ? null : <a href="/SignUp">Seller Signup</a>}
      </div>
    </div>
  );
}

export default NavBar;
