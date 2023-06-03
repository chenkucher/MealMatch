import React from 'react';
import { Link, useParams } from 'react-router-dom';
import logo from '../helpers/logo.jpg';
import styles from '../../styles/NavBar.module.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

function NavBar(props) {
  const isLoggedIn = props.loggedIn;
  const restaurantId=props.restaurantId;
  return (
    <Navbar expand="lg" className={styles.navbar}>
      <Container>
        <div className={styles.logoToggleContainer}>
        <Navbar.Brand className={styles.navbarBrand}>
            <Link to={`/RestaurantManage/${restaurantId}`} >
              <img src={logo} alt="Logo" className={styles.logo} />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarNav" className={styles.navbarToggle} />
        </div>

        <Navbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            <Nav.Link href="/ContactUs">Contact Us</Nav.Link>
            <Nav.Link href="/TermsOfUse">Terms of Use</Nav.Link>
            <Nav.Link href="/PrivacyPolicy">Privacy Policy</Nav.Link>
            {isLoggedIn ? null : <Nav.Link href="/CustomerLogin">Customer Login</Nav.Link>}
            {isLoggedIn ? null : <Nav.Link href="/Login">Seller Login</Nav.Link>}
          </Nav>
          <Nav className="ms-auto">
            {isLoggedIn ? null : <Nav.Link href="/CustomerSignUp">Customer Signup</Nav.Link>}
            {isLoggedIn ? null : <Nav.Link href="/SignUp">Seller Signup</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
