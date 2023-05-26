import React from 'react';
import logo from '../helpers/logo.jpg';
import styles from '../../styles/NavBar.module.css';

function NavBar(props) {
  const isLoggedIn = props.loggedIn;

  return (
    <div className={styles.navbar}>
      <img src={logo} alt="Logo" className={styles.logo} />
      <div className={styles.navbar_left}>
      <a href="/ContactUs">Contact Us</a>
        <a href="/TermsOfUse">Terms of Use</a>
        <a href="/PrivacyPolicy">Privacy Policy</a>
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
