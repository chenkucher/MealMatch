import React, { useEffect, useState } from 'react';
import ShoppingCartContext from '../../components/CustomerManager/ShoppingCartContext';
import CustomerShoppingCart from '../../components/CustomerManager/CustomerShoppingCart';
import Matched from './Matched';
import logo from '../../helpers/logo.jpg';
import styles from '../../../styles/NavBar.module.css';

function NavBar(props) {
  const isLoggedIn = props.loggedIn;
  // const customerId = props.customerId;
  // console.log(customerId);
  const [showShoppingCart, setShowShoppingCart] = useState(false);
  const [showMatched, setShowMatched] = useState(false);
  const matchedItems = props.matchedItems || [];
  const [matchedCount, setMatchedCount] = useState(0);
  const [animationClass, setAnimationClass] = useState('');

  const toggleShoppingCart = () => {
    setShowShoppingCart(!showShoppingCart);
  };
  const toggleMatched = () => {
    setShowMatched(!showMatched);
  };
  useEffect(() => {
    setMatchedCount(matchedItems.length);

    if (matchedItems.length > 0) {
      setAnimationClass(styles.animate);
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [matchedItems]);
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
        
        {isLoggedIn ? (
          <>
            <button onClick={toggleMatched} className={animationClass}>
              {/* Matched ({matchedCount}) */}
              Matched

            </button>
          </>
        ) : null}
        {isLoggedIn ? <button onClick={toggleShoppingCart}>Order Cart</button> : null}
      </div>
      {showShoppingCart && (
      <CustomerShoppingCart onClose={toggleShoppingCart} customerId={50}/>
      )}
      {showMatched && (
        <Matched onClose={toggleMatched} matchedItems={props.matchedItems} />
      )}
    </div>
  );
}

export default NavBar;
