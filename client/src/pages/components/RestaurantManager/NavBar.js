import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import logo from '../helpers/logo.jpg';
import styles from '../../styles/NavBar.module.css';

function NavBar(props) {
  const isLoggedIn = props.loggedIn;
  return (
    <>
      {[false, 'sm', 'md', 'lg', 'xl', 'xxl'].map((expand) => (
        <Navbar key={expand} bg="light" expand={expand} className="mb-3">
          <Container fluid>
            <Navbar.Brand href="#">Navbar Offcanvas</Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement="end"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  <img src={logo} alt="Logo" className={styles.logo} />
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3">
                  <Nav.Link href="/ContactUs">Contact Us</Nav.Link>
                  <Nav.Link href="#/TermsOfUse">Terms of Use</Nav.Link>
                  {isLoggedIn ? null : <Nav.Link href="/CustomerLogin">Customer Login</Nav.Link>}
                  {isLoggedIn ? null : <Nav.Link href="/Login">Seller Login</Nav.Link>}
                  {isLoggedIn ? null : <Nav.Link href="/Login">Customer Signup</Nav.Link>}
                  {isLoggedIn ? null : <Nav.Link href="/Login">Seller Signup</Nav.Link>} 
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </>
  );
}

export default NavBar;