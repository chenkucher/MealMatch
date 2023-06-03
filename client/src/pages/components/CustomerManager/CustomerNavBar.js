import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from 'react-router-dom';
import ShoppingCartContext from "../../components/CustomerManager/ShoppingCartContext";
import CustomerShoppingCart from "../../components/CustomerManager/CustomerShoppingCart";
import Matched from "./Matched";
import logo from "../../helpers/logo.jpg";
import styles from "../../../styles/NavBar.module.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { FaShoppingCart } from "react-icons/fa";
import { BsFillArrowRightCircleFill } from "react-icons/bs";

function NavBar(props) {
  const isLoggedIn = props.loggedIn;
  const customerId = props.customerId;
  const [showShoppingCart, setShowShoppingCart] = useState(false);
  const [showMatched, setShowMatched] = useState(false);
  const matchedItems = props.matchedItems || [];
  const [matchedCount, setMatchedCount] = useState(0);
  const [animationClass, setAnimationClass] = useState("");

  const { cartItems } = useContext(ShoppingCartContext);

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
        setAnimationClass("");
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [matchedItems]);


  return (
    <Navbar expand="lg" className={styles.navbar}>
      <Container>
        <div className={styles.logoToggleContainer}>
          <Navbar.Brand className={styles.navbarBrand}>
            <Link to={`/CustomerManage/${customerId}`} >
              <img src={logo} alt="Logo" className={styles.logo} />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="navbar-nav"
            className={styles.navbarToggle}
          />
        </div>
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/ContactUs">Contact Us</Nav.Link>
            <Nav.Link href="/TermsOfUse">Terms of Use</Nav.Link>
            <Nav.Link href="/PrivacyPolicy">Privacy Policy</Nav.Link>
            {isLoggedIn ? null : (
              <Nav.Link href="/CustomerLogin">Customer Login</Nav.Link>
            )}
            {isLoggedIn ? null : (
              <Nav.Link href="/Login">Seller Login</Nav.Link>
            )}
          </Nav>
          <Nav className="ms-auto">
            {isLoggedIn ? null : (
              <Nav.Link href="/CustomerSignUp">Customer Signup</Nav.Link>
            )}
            {isLoggedIn ? null : (
              <Nav.Link href="/SignUp">Seller Signup</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
        <Nav className="ms-auto d-flex flex-row">
          {isLoggedIn ? (
            <Nav.Link
              onClick={toggleMatched}
              className={styles.matchedLink}
            >
              Matched {matchedCount}
            </Nav.Link>
          ) : null}

          {isLoggedIn ? (
            <Nav.Link onClick={toggleShoppingCart}>
              <FaShoppingCart /> {cartItems.length}
            </Nav.Link>
          ) : null}
        </Nav>
      </Container>
      {showShoppingCart && (
        <CustomerShoppingCart
          onClose={toggleShoppingCart}
          customerId={customerId}
        />
      )}
      {showMatched && (
        <Matched onClose={toggleMatched} matchedItems={props.matchedItems} />
      )}
    </Navbar>
  );
}

export default NavBar;