import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomerSidebar from "../pages/components/CustomerManager/CustomerSidebar";
import CustomerNavBar from "./components/CustomerManager/CustomerNavBar";
import RestaurantSidebar from "../pages/components/RestaurantManager/Sidebar";
import RestaurantNavBar from "./components/NavBar";
import styles from '../styles/ContactUs.module.css';
import Swal from 'sweetalert2';


function ContactUs(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');


  
  useEffect(() => {
    axios
      .get("http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerLogin")
      .then((response) => {
        console.log(response);
        if (response.data.loggedIn === true) {
          setLoggedIn(response.data.loggedIn);
          setCustomerId(response.data.userId);
        } else {
          axios
            .get("http://ec2-35-169-139-56.compute-1.amazonaws.com/api/SellerLogin")
            .then((response) => {
              console.log(response);
              if (response.data.loggedIn === true) {
                setLoggedIn(response.data.loggedIn);
                setRestaurantId(response.data.userId);
              }
            });
        }
      });
  }, []);

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };
  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validation for empty inputs
    if (!text.trim() || !subject.trim() || !phoneNumber.trim()) {
      Swal.fire('Error', 'Subject, Text and Phone number fields cannot be empty!', 'error');
      return;
    }
    if (customerId !== null) {
      submitContact('api/ContactUsCustomer', customerId);
    } else if (restaurantId !== null) {
      submitContact('api/ContactUsRestaurant', restaurantId);
    } else {
      Swal.fire('Error', 'You must log in to send a mail!', 'error');
    }
  };

  const submitContact = (api, userId) => {
    fetch(`/${api}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, subject,phoneNumber, userId }),
    })
      .then((response) => {
        if (response.ok) {
          setText('');
          setSubject('');
          Swal.fire('Success', 'Your message has been sent!', 'success');
        } else {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Response:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
        Swal.fire('Error', 'There was a problem sending your message.', 'error');
      });
  };
  


  let NavBar = CustomerNavBar;
  let Sidebar = CustomerSidebar;

  if (customerId) {
    NavBar = CustomerNavBar;
    Sidebar = CustomerSidebar;
  } else if (restaurantId) {
    NavBar = RestaurantNavBar;
    Sidebar = RestaurantSidebar;
  }

  return (
    <div className={styles.container}>
      <header>
        <NavBar loggedIn={loggedIn} customerId={customerId} restaurantId={restaurantId} />
      </header>

      <main className={styles.main}>
      {loggedIn ? (
          <section className={styles.section_side}>
            <Sidebar loggedIn={loggedIn} customerId={customerId} restaurantId={restaurantId} />
          </section>
        ) : null}

        <section className={styles.section_middle}>
          <div className={styles.container}>
          <h1>Contact Us</h1>
            <p>
              For any inquiries or feedback, please contact us using the form below. We are here to assist you 24/7.
            </p>
            <p><b>Please be aware that contacting us using this form must be after logging into your account!</b></p>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="phone">Phone:</label>
                <input type="tel" id="phone" value={phoneNumber} onChange={handlePhoneNumberChange} />
              </div>
              <div>
                <label htmlFor="subject">Subject:</label>
                <input type="text" id="subject" value={subject} onChange={handleSubjectChange} />
              </div>
              <div>
                <label htmlFor="text">Text:</label>
                <textarea id="text" value={text} onChange={handleTextChange} rows={10}/>
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ContactUs;


